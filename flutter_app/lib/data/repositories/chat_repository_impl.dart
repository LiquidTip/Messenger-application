import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/network/dio_client.dart';
import '../../domain/entities/chat.dart';
import '../../domain/entities/message.dart';
import '../models/api_response.dart';

class ChatRepositoryImpl {
  final Dio _dio = DioClient.instance;

  Future<List<Chat>> getChats() async {
    try {
      final response = await _dio.get('/chats');
      if (response.statusCode == 200) {
        return (response.data as List)
            .map((json) => Chat.fromJson(json))
            .toList();
      }
      throw Exception('Failed to load chats');
    } on DioException catch (e) {
      throw Exception(_handleDioError(e));
    } catch (e) {
      throw Exception('An unexpected error occurred');
    }
  }

  Future<List<Message>> getMessages(String chatId) async {
    try {
      final response = await _dio.get('/messages/chat/$chatId');
      if (response.statusCode == 200) {
        return (response.data as List)
            .map((json) => Message.fromJson(json))
            .toList();
      }
      throw Exception('Failed to load messages');
    } on DioException catch (e) {
      throw Exception(_handleDioError(e));
    } catch (e) {
      throw Exception('An unexpected error occurred');
    }
  }

  Future<Message> sendMessage(String chatId, String content, String type) async {
    try {
      final response = await _dio.post('/messages', data: {
        'chatId': chatId,
        'content': content,
        'type': type,
      });
      if (response.statusCode == 200) {
        return Message.fromJson(response.data);
      }
      throw Exception('Failed to send message');
    } on DioException catch (e) {
      throw Exception(_handleDioError(e));
    } catch (e) {
      throw Exception('An unexpected error occurred');
    }
  }

  Future<Message> sendMediaMessage(String chatId, String mediaUrl, String type) async {
    try {
      final response = await _dio.post('/messages', data: {
        'chatId': chatId,
        'mediaUrl': mediaUrl,
        'type': type,
      });
      if (response.statusCode == 200) {
        return Message.fromJson(response.data);
      }
      throw Exception('Failed to send media message');
    } on DioException catch (e) {
      throw Exception(_handleDioError(e));
    } catch (e) {
      throw Exception('An unexpected error occurred');
    }
  }

  Future<void> markAsRead(String messageId) async {
    try {
      await _dio.post('/messages/$messageId/read');
    } on DioException catch (e) {
      throw Exception(_handleDioError(e));
    } catch (e) {
      throw Exception('An unexpected error occurred');
    }
  }

  Future<void> deleteMessage(String messageId) async {
    try {
      await _dio.delete('/messages/$messageId');
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
          return 'Unauthorized. Please login again.';
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

final chatRepositoryProvider = Provider<ChatRepositoryImpl>((ref) {
  return ChatRepositoryImpl();
});