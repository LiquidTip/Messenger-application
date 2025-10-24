import 'package:flutter_test/flutter_test.dart';
import 'package:dio/dio.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';

import 'package:secure_messaging_app/data/repositories/auth_repository_impl.dart';
import 'package:secure_messaging_app/domain/entities/user.dart';
import 'package:secure_messaging_app/data/models/api_response.dart';

import 'auth_repository_test.mocks.dart';

@GenerateMocks([Dio])
void main() {
  group('AuthRepositoryImpl', () {
    late AuthRepositoryImpl authRepository;
    late MockDio mockDio;

    setUp(() {
      mockDio = MockDio();
      authRepository = AuthRepositoryImpl();
      // Note: In a real implementation, you would need to inject the Dio instance
      // For this test, we'll assume the repository uses a static Dio instance
    });

    group('login', () {
      test('should return success response when login is successful', () async {
        // Arrange
        const phoneNumber = '+1234567890';
        const password = 'password123';
        final userData = {
          'id': 'user123',
          'phoneNumber': phoneNumber,
          'username': 'testuser',
          'profilePicture': 'profile.jpg',
          'lastSeen': '2023-01-01T00:00:00.000Z',
        };
        final responseData = {
          'user': userData,
        };

        final response = Response(
          data: responseData,
          statusCode: 200,
          requestOptions: RequestOptions(path: '/auth/login'),
        );

        when(mockDio.post('/auth/login', data: anyNamed('data')))
            .thenAnswer((_) async => response);

        // Act
        final result = await authRepository.login(phoneNumber, password);

        // Assert
        expect(result.isSuccess, true);
        expect(result.data, isA<User>());
        expect(result.data!.id, 'user123');
        expect(result.data!.phoneNumber, phoneNumber);
        expect(result.data!.username, 'testuser');
        expect(result.message, null);
      });

      test('should return error response when login fails', () async {
        // Arrange
        const phoneNumber = '+1234567890';
        const password = 'wrongpassword';
        final responseData = {
          'message': 'Invalid credentials',
        };

        final response = Response(
          data: responseData,
          statusCode: 401,
          requestOptions: RequestOptions(path: '/auth/login'),
        );

        when(mockDio.post('/auth/login', data: anyNamed('data')))
            .thenAnswer((_) async => response);

        // Act
        final result = await authRepository.login(phoneNumber, password);

        // Assert
        expect(result.isSuccess, false);
        expect(result.data, null);
        expect(result.message, 'Invalid credentials');
      });

      test('should handle DioException with connection timeout', () async {
        // Arrange
        const phoneNumber = '+1234567890';
        const password = 'password123';

        when(mockDio.post('/auth/login', data: anyNamed('data')))
            .thenThrow(DioException(
              type: DioExceptionType.connectionTimeout,
              requestOptions: RequestOptions(path: '/auth/login'),
            ));

        // Act
        final result = await authRepository.login(phoneNumber, password);

        // Assert
        expect(result.isSuccess, false);
        expect(result.data, null);
        expect(result.message, 'Connection timeout. Please check your internet connection.');
      });

      test('should handle DioException with bad response 401', () async {
        // Arrange
        const phoneNumber = '+1234567890';
        const password = 'password123';

        when(mockDio.post('/auth/login', data: anyNamed('data')))
            .thenThrow(DioException(
              type: DioExceptionType.badResponse,
              response: Response(
                statusCode: 401,
                requestOptions: RequestOptions(path: '/auth/login'),
              ),
              requestOptions: RequestOptions(path: '/auth/login'),
            ));

        // Act
        final result = await authRepository.login(phoneNumber, password);

        // Assert
        expect(result.isSuccess, false);
        expect(result.data, null);
        expect(result.message, 'Invalid credentials. Please try again.');
      });

      test('should handle DioException with bad response 400', () async {
        // Arrange
        const phoneNumber = '+1234567890';
        const password = 'password123';
        const errorMessage = 'Bad request';

        when(mockDio.post('/auth/login', data: anyNamed('data')))
            .thenThrow(DioException(
              type: DioExceptionType.badResponse,
              response: Response(
                statusCode: 400,
                data: {'message': errorMessage},
                requestOptions: RequestOptions(path: '/auth/login'),
              ),
              requestOptions: RequestOptions(path: '/auth/login'),
            ));

        // Act
        final result = await authRepository.login(phoneNumber, password);

        // Assert
        expect(result.isSuccess, false);
        expect(result.data, null);
        expect(result.message, errorMessage);
      });

      test('should handle DioException with bad response 500', () async {
        // Arrange
        const phoneNumber = '+1234567890';
        const password = 'password123';

        when(mockDio.post('/auth/login', data: anyNamed('data')))
            .thenThrow(DioException(
              type: DioExceptionType.badResponse,
              response: Response(
                statusCode: 500,
                requestOptions: RequestOptions(path: '/auth/login'),
              ),
              requestOptions: RequestOptions(path: '/auth/login'),
            ));

        // Act
        final result = await authRepository.login(phoneNumber, password);

        // Assert
        expect(result.isSuccess, false);
        expect(result.data, null);
        expect(result.message, 'Server error. Please try again later.');
      });

      test('should handle DioException with unknown error', () async {
        // Arrange
        const phoneNumber = '+1234567890';
        const password = 'password123';

        when(mockDio.post('/auth/login', data: anyNamed('data')))
            .thenThrow(DioException(
              type: DioExceptionType.unknown,
              requestOptions: RequestOptions(path: '/auth/login'),
            ));

        // Act
        final result = await authRepository.login(phoneNumber, password);

        // Assert
        expect(result.isSuccess, false);
        expect(result.data, null);
        expect(result.message, 'Network error. Please check your internet connection.');
      });

      test('should handle general exception', () async {
        // Arrange
        const phoneNumber = '+1234567890';
        const password = 'password123';

        when(mockDio.post('/auth/login', data: anyNamed('data')))
            .thenThrow(Exception('Unexpected error'));

        // Act
        final result = await authRepository.login(phoneNumber, password);

        // Assert
        expect(result.isSuccess, false);
        expect(result.data, null);
        expect(result.message, 'An unexpected error occurred');
      });
    });

    group('register', () => {
      test('should return success response when registration is successful', () async {
        // Arrange
        const phoneNumber = '+1234567890';
        const password = 'password123';
        const username = 'testuser';
        final userData = {
          'id': 'user123',
          'phoneNumber': phoneNumber,
          'username': username,
          'profilePicture': 'profile.jpg',
          'lastSeen': '2023-01-01T00:00:00.000Z',
        };

        final response = Response(
          data: userData,
          statusCode: 200,
          requestOptions: RequestOptions(path: '/auth/register'),
        );

        when(mockDio.post('/auth/register', data: anyNamed('data')))
            .thenAnswer((_) async => response);

        // Act
        final result = await authRepository.register(phoneNumber, password, username);

        // Assert
        expect(result.isSuccess, true);
        expect(result.data, isA<User>());
        expect(result.data!.id, 'user123');
        expect(result.data!.phoneNumber, phoneNumber);
        expect(result.data!.username, username);
        expect(result.message, null);
      });

      test('should return error response when registration fails', () async {
        // Arrange
        const phoneNumber = '+1234567890';
        const password = 'password123';
        const username = 'testuser';
        final responseData = {
          'message': 'User already exists',
        };

        final response = Response(
          data: responseData,
          statusCode: 400,
          requestOptions: RequestOptions(path: '/auth/register'),
        );

        when(mockDio.post('/auth/register', data: anyNamed('data')))
            .thenAnswer((_) async => response);

        // Act
        final result = await authRepository.register(phoneNumber, password, username);

        // Assert
        expect(result.isSuccess, false);
        expect(result.data, null);
        expect(result.message, 'User already exists');
      });
    });

    group('sendOtp', () => {
      test('should complete successfully when OTP is sent', () async {
        // Arrange
        const phoneNumber = '+1234567890';

        when(mockDio.post('/auth/send-otp', data: anyNamed('data')))
            .thenAnswer((_) async => Response(
              statusCode: 200,
              requestOptions: RequestOptions(path: '/auth/send-otp'),
            ));

        // Act & Assert
        expect(() => authRepository.sendOtp(phoneNumber), returnsNormally);
        verify(mockDio.post('/auth/send-otp', data: anyNamed('data'))).called(1);
      });

      test('should throw exception when OTP sending fails', () async {
        // Arrange
        const phoneNumber = '+1234567890';

        when(mockDio.post('/auth/send-otp', data: anyNamed('data')))
            .thenThrow(DioException(
              type: DioExceptionType.badResponse,
              response: Response(
                statusCode: 400,
                data: {'message': 'Invalid phone number'},
                requestOptions: RequestOptions(path: '/auth/send-otp'),
              ),
              requestOptions: RequestOptions(path: '/auth/send-otp'),
            ));

        // Act & Assert
        expect(() => authRepository.sendOtp(phoneNumber), throwsException);
      });
    });

    group('verifyOtp', () => {
      test('should complete successfully when OTP is verified', () async {
        // Arrange
        const phoneNumber = '+1234567890';
        const otp = '123456';

        when(mockDio.post('/auth/verify-otp', data: anyNamed('data')))
            .thenAnswer((_) async => Response(
              statusCode: 200,
              requestOptions: RequestOptions(path: '/auth/verify-otp'),
            ));

        // Act & Assert
        expect(() => authRepository.verifyOtp(phoneNumber, otp), returnsNormally);
        verify(mockDio.post('/auth/verify-otp', data: anyNamed('data'))).called(1);
      });

      test('should throw exception when OTP verification fails', () async {
        // Arrange
        const phoneNumber = '+1234567890';
        const otp = 'wrongotp';

        when(mockDio.post('/auth/verify-otp', data: anyNamed('data')))
            .thenThrow(DioException(
              type: DioExceptionType.badResponse,
              response: Response(
                statusCode: 400,
                data: {'message': 'Invalid OTP'},
                requestOptions: RequestOptions(path: '/auth/verify-otp'),
              ),
              requestOptions: RequestOptions(path: '/auth/verify-otp'),
            ));

        // Act & Assert
        expect(() => authRepository.verifyOtp(phoneNumber, otp), throwsException);
      });
    });
  });
}
