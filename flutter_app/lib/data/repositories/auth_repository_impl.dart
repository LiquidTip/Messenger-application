import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/network/dio_client.dart';
import '../../core/constants/app_constants.dart';
import '../../domain/entities/user.dart';
import '../models/api_response.dart';

class AuthRepositoryImpl {
  final Dio _dio = DioClient.instance;

  Future<ApiResponse<User>> login(String phoneNumber, String password) async {
    try {
      final response = await _dio.post('/auth/login', data: {
        'phoneNumber': phoneNumber,
        'password': password,
      });

      if (response.statusCode == 200) {
        final user = User.fromJson(response.data['user']);
        return ApiResponse.success(user);
      } else {
        return ApiResponse.error(response.data['message'] ?? 'Login failed');
      }
    } on DioException catch (e) {
      return ApiResponse.error(_handleDioError(e));
    } catch (e) {
      return ApiResponse.error('An unexpected error occurred');
    }
  }

  Future<ApiResponse<User>> register(String phoneNumber, String password, String username) async {
    try {
      final response = await _dio.post('/auth/register', data: {
        'phoneNumber': phoneNumber,
        'password': password,
        'username': username,
      });

      if (response.statusCode == 200) {
        final user = User.fromJson(response.data);
        return ApiResponse.success(user);
      } else {
        return ApiResponse.error(response.data['message'] ?? 'Registration failed');
      }
    } on DioException catch (e) {
      return ApiResponse.error(_handleDioError(e));
    } catch (e) {
      return ApiResponse.error('An unexpected error occurred');
    }
  }

  Future<void> sendOtp(String phoneNumber) async {
    try {
      await _dio.post('/auth/send-otp', data: {
        'phoneNumber': phoneNumber,
      });
    } on DioException catch (e) {
      throw Exception(_handleDioError(e));
    } catch (e) {
      throw Exception('An unexpected error occurred');
    }
  }

  Future<void> verifyOtp(String phoneNumber, String otp) async {
    try {
      await _dio.post('/auth/verify-otp', data: {
        'phoneNumber': phoneNumber,
        'otp': otp,
      });
    } on DioException catch (e) {
      throw Exception(_handleDioError(e));
    } catch (e) {
      throw Exception('An unexpected error occurred');
    }
  }

  String _handleDioError(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return 'Connection timeout. Please check your internet connection.';
      case DioExceptionType.badResponse:
        if (e.response?.statusCode == 401) {
          return 'Invalid credentials. Please try again.';
        } else if (e.response?.statusCode == 400) {
          return e.response?.data['message'] ?? 'Bad request. Please check your input.';
        } else if (e.response?.statusCode == 500) {
          return 'Server error. Please try again later.';
        }
        return 'An error occurred. Please try again.';
      case DioExceptionType.cancel:
        return 'Request cancelled.';
      case DioExceptionType.unknown:
        return 'Network error. Please check your internet connection.';
      default:
        return 'An unexpected error occurred.';
    }
  }
}

final authRepositoryProvider = Provider<AuthRepositoryImpl>((ref) {
  return AuthRepositoryImpl();
});