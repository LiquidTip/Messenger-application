import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';

import 'package:secure_messaging_app/domain/entities/user.dart';
import 'package:secure_messaging_app/data/repositories/auth_repository_impl.dart';
import 'package:secure_messaging_app/presentation/providers/auth_provider.dart';
import 'package:secure_messaging_app/data/models/api_response.dart';

import 'auth_provider_test.mocks.dart';

@GenerateMocks([AuthRepositoryImpl])
void main() {
  group('AuthNotifier', () {
    late MockAuthRepositoryImpl mockAuthRepository;
    late ProviderContainer container;

    setUp(() {
      mockAuthRepository = MockAuthRepositoryImpl();
      container = ProviderContainer(
        overrides: [
          authRepositoryProvider.overrideWithValue(mockAuthRepository),
        ],
      );
    });

    tearDown(() {
      container.dispose();
    });

    test('initial state should be initial', () {
      final authNotifier = container.read(authProvider.notifier);
      expect(authNotifier.state, isA<AuthState>());
      expect(authNotifier.state.isLoading, false);
      expect(authNotifier.state.isAuthenticated, false);
      expect(authNotifier.state.user, null);
      expect(authNotifier.state.error, null);
    });

    group('login', () {
      test('should set loading state and then authenticated state on successful login', () async {
        // Arrange
        const phoneNumber = '+1234567890';
        const password = 'password123';
        final user = User(
          id: 'user123',
          phoneNumber: phoneNumber,
          username: 'testuser',
          profilePicture: 'profile.jpg',
          lastSeen: DateTime.now(),
        );
        final apiResponse = ApiResponse.success(user);

        when(mockAuthRepository.login(phoneNumber, password))
            .thenAnswer((_) async => apiResponse);

        // Act
        final authNotifier = container.read(authProvider.notifier);
        await authNotifier.login(phoneNumber, password);

        // Assert
        expect(authNotifier.state.isLoading, false);
        expect(authNotifier.state.isAuthenticated, true);
        expect(authNotifier.state.user, user);
        expect(authNotifier.state.error, null);
        verify(mockAuthRepository.login(phoneNumber, password)).called(1);
      });

      test('should set error state on failed login', () async {
        // Arrange
        const phoneNumber = '+1234567890';
        const password = 'wrongpassword';
        const errorMessage = 'Invalid credentials';
        final apiResponse = ApiResponse.error(errorMessage);

        when(mockAuthRepository.login(phoneNumber, password))
            .thenAnswer((_) async => apiResponse);

        // Act
        final authNotifier = container.read(authProvider.notifier);
        await authNotifier.login(phoneNumber, password);

        // Assert
        expect(authNotifier.state.isLoading, false);
        expect(authNotifier.state.isAuthenticated, false);
        expect(authNotifier.state.user, null);
        expect(authNotifier.state.error, errorMessage);
        verify(mockAuthRepository.login(phoneNumber, password)).called(1);
      });

      test('should set error state on exception', () async {
        // Arrange
        const phoneNumber = '+1234567890';
        const password = 'password123';
        const errorMessage = 'Network error';

        when(mockAuthRepository.login(phoneNumber, password))
            .thenThrow(Exception(errorMessage));

        // Act
        final authNotifier = container.read(authProvider.notifier);
        await authNotifier.login(phoneNumber, password);

        // Assert
        expect(authNotifier.state.isLoading, false);
        expect(authNotifier.state.isAuthenticated, false);
        expect(authNotifier.state.user, null);
        expect(authNotifier.state.error, 'Exception: $errorMessage');
        verify(mockAuthRepository.login(phoneNumber, password)).called(1);
      });
    });

    group('register', () {
      test('should set loading state and then authenticated state on successful registration', () async {
        // Arrange
        const phoneNumber = '+1234567890';
        const password = 'password123';
        const username = 'testuser';
        final user = User(
          id: 'user123',
          phoneNumber: phoneNumber,
          username: username,
          profilePicture: 'profile.jpg',
          lastSeen: DateTime.now(),
        );
        final apiResponse = ApiResponse.success(user);

        when(mockAuthRepository.register(phoneNumber, password, username))
            .thenAnswer((_) async => apiResponse);

        // Act
        final authNotifier = container.read(authProvider.notifier);
        await authNotifier.register(phoneNumber, password, username);

        // Assert
        expect(authNotifier.state.isLoading, false);
        expect(authNotifier.state.isAuthenticated, true);
        expect(authNotifier.state.user, user);
        expect(authNotifier.state.error, null);
        verify(mockAuthRepository.register(phoneNumber, password, username)).called(1);
      });

      test('should set error state on failed registration', () async {
        // Arrange
        const phoneNumber = '+1234567890';
        const password = 'password123';
        const username = 'testuser';
        const errorMessage = 'User already exists';
        final apiResponse = ApiResponse.error(errorMessage);

        when(mockAuthRepository.register(phoneNumber, password, username))
            .thenAnswer((_) async => apiResponse);

        // Act
        final authNotifier = container.read(authProvider.notifier);
        await authNotifier.register(phoneNumber, password, username);

        // Assert
        expect(authNotifier.state.isLoading, false);
        expect(authNotifier.state.isAuthenticated, false);
        expect(authNotifier.state.user, null);
        expect(authNotifier.state.error, errorMessage);
        verify(mockAuthRepository.register(phoneNumber, password, username)).called(1);
      });
    });

    group('sendOtp', () {
      test('should call repository sendOtp method', () async {
        // Arrange
        const phoneNumber = '+1234567890';

        when(mockAuthRepository.sendOtp(phoneNumber))
            .thenAnswer((_) async {});

        // Act
        final authNotifier = container.read(authProvider.notifier);
        await authNotifier.sendOtp(phoneNumber);

        // Assert
        verify(mockAuthRepository.sendOtp(phoneNumber)).called(1);
      });

      test('should set error state on exception', () async {
        // Arrange
        const phoneNumber = '+1234567890';
        const errorMessage = 'Network error';

        when(mockAuthRepository.sendOtp(phoneNumber))
            .thenThrow(Exception(errorMessage));

        // Act
        final authNotifier = container.read(authProvider.notifier);
        await authNotifier.sendOtp(phoneNumber);

        // Assert
        expect(authNotifier.state.error, 'Exception: $errorMessage');
        verify(mockAuthRepository.sendOtp(phoneNumber)).called(1);
      });
    });

    group('verifyOtp', () {
      test('should call repository verifyOtp method', () async {
        // Arrange
        const phoneNumber = '+1234567890';
        const otp = '123456';

        when(mockAuthRepository.verifyOtp(phoneNumber, otp))
            .thenAnswer((_) async {});

        // Act
        final authNotifier = container.read(authProvider.notifier);
        await authNotifier.verifyOtp(phoneNumber, otp);

        // Assert
        verify(mockAuthRepository.verifyOtp(phoneNumber, otp)).called(1);
      });

      test('should set error state on exception', () async {
        // Arrange
        const phoneNumber = '+1234567890';
        const otp = '123456';
        const errorMessage = 'Invalid OTP';

        when(mockAuthRepository.verifyOtp(phoneNumber, otp))
            .thenThrow(Exception(errorMessage));

        // Act
        final authNotifier = container.read(authProvider.notifier);
        await authNotifier.verifyOtp(phoneNumber, otp);

        // Assert
        expect(authNotifier.state.error, 'Exception: $errorMessage');
        verify(mockAuthRepository.verifyOtp(phoneNumber, otp)).called(1);
      });
    });

    group('logout', () {
      test('should reset state to initial', () async {
        // Arrange
        final authNotifier = container.read(authProvider.notifier);
        // Set some state first
        authNotifier.state = AuthState.authenticated(User(
          id: 'user123',
          phoneNumber: '+1234567890',
          username: 'testuser',
          profilePicture: 'profile.jpg',
          lastSeen: DateTime.now(),
        ));

        // Act
        await authNotifier.logout();

        // Assert
        expect(authNotifier.state.isLoading, false);
        expect(authNotifier.state.isAuthenticated, false);
        expect(authNotifier.state.user, null);
        expect(authNotifier.state.error, null);
      });
    });

    group('checkAuthStatus', () {
      test('should set authenticated state when valid token and user data exist', () async {
        // Arrange
        SharedPreferences.setMockInitialValues({
          'token': 'valid-token',
          'user': '{"id":"user123","phoneNumber":"+1234567890","username":"testuser","profilePicture":"profile.jpg","lastSeen":"2023-01-01T00:00:00.000Z"}',
        });

        // Act
        final authNotifier = container.read(authProvider.notifier);
        await authNotifier.checkAuthStatus();

        // Assert
        expect(authNotifier.state.isAuthenticated, true);
        expect(authNotifier.state.user, isNotNull);
        expect(authNotifier.state.user!.id, 'user123');
      });

      test('should set initial state when no token or user data', () async {
        // Arrange
        SharedPreferences.setMockInitialValues({});

        // Act
        final authNotifier = container.read(authProvider.notifier);
        await authNotifier.checkAuthStatus();

        // Assert
        expect(authNotifier.state.isAuthenticated, false);
        expect(authNotifier.state.user, null);
      });
    });
  });

  group('AuthState', () {
    test('initial state should have correct values', () {
      const state = AuthState.initial();
      expect(state.isLoading, false);
      expect(state.isAuthenticated, false);
      expect(state.user, null);
      expect(state.error, null);
    });

    test('loading state should have correct values', () {
      const state = AuthState.loading();
      expect(state.isLoading, true);
      expect(state.isAuthenticated, false);
      expect(state.user, null);
      expect(state.error, null);
    });

    test('authenticated state should have correct values', () {
      final user = User(
        id: 'user123',
        phoneNumber: '+1234567890',
        username: 'testuser',
        profilePicture: 'profile.jpg',
        lastSeen: DateTime.now(),
      );
      const state = AuthState.authenticated(user);
      expect(state.isLoading, false);
      expect(state.isAuthenticated, true);
      expect(state.user, user);
      expect(state.error, null);
    });

    test('error state should have correct values', () {
      const error = 'Test error';
      const state = AuthState.error(error);
      expect(state.isLoading, false);
      expect(state.isAuthenticated, false);
      expect(state.user, null);
      expect(state.error, error);
    });
  });
}
