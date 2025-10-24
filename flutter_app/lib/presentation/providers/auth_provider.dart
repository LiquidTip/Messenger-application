import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/constants/app_constants.dart';
import '../../domain/entities/user.dart';
import '../../data/repositories/auth_repository_impl.dart';

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(authRepositoryProvider));
});

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepositoryImpl _authRepository;

  AuthNotifier(this._authRepository) : super(const AuthState.initial());

  Future<void> login(String phoneNumber, String password) async {
    state = const AuthState.loading();
    
    try {
      final result = await _authRepository.login(phoneNumber, password);
      
      if (result.isSuccess) {
        final user = result.data!;
        state = AuthState.authenticated(user);
        
        // Save token and user data
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(AppConstants.tokenKey, user.id);
        await prefs.setString(AppConstants.userKey, user.toJson().toString());
      } else {
        state = AuthState.error(result.message);
      }
    } catch (e) {
      state = AuthState.error(e.toString());
    }
  }

  Future<void> register(String phoneNumber, String password, String username) async {
    state = const AuthState.loading();
    
    try {
      final result = await _authRepository.register(phoneNumber, password, username);
      
      if (result.isSuccess) {
        final user = result.data!;
        state = AuthState.authenticated(user);
        
        // Save token and user data
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(AppConstants.tokenKey, user.id);
        await prefs.setString(AppConstants.userKey, user.toJson().toString());
      } else {
        state = AuthState.error(result.message);
      }
    } catch (e) {
      state = AuthState.error(e.toString());
    }
  }

  Future<void> sendOtp(String phoneNumber) async {
    try {
      await _authRepository.sendOtp(phoneNumber);
    } catch (e) {
      state = AuthState.error(e.toString());
    }
  }

  Future<void> verifyOtp(String phoneNumber, String otp) async {
    try {
      await _authRepository.verifyOtp(phoneNumber, otp);
    } catch (e) {
      state = AuthState.error(e.toString());
    }
  }

  Future<void> logout() async {
    state = const AuthState.initial();
    
    // Clear stored data
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.tokenKey);
    await prefs.remove(AppConstants.userKey);
  }

  Future<void> checkAuthStatus() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(AppConstants.tokenKey);
    final userData = prefs.getString(AppConstants.userKey);
    
    if (token != null && userData != null) {
      try {
        final user = User.fromJson(userData as Map<String, dynamic>);
        state = AuthState.authenticated(user);
      } catch (e) {
        state = const AuthState.initial();
      }
    } else {
      state = const AuthState.initial();
    }
  }
}

class AuthState {
  final bool isLoading;
  final bool isAuthenticated;
  final User? user;
  final String? error;

  const AuthState._({
    required this.isLoading,
    required this.isAuthenticated,
    this.user,
    this.error,
  });

  const AuthState.initial() : this._(
    isLoading: false,
    isAuthenticated: false,
  );

  const AuthState.loading() : this._(
    isLoading: true,
    isAuthenticated: false,
  );

  const AuthState.authenticated(User user) : this._(
    isLoading: false,
    isAuthenticated: true,
    user: user,
  );

  const AuthState.error(String error) : this._(
    isLoading: false,
    isAuthenticated: false,
    error: error,
  );
}