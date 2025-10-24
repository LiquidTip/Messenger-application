import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';

import 'package:secure_messaging_app/domain/entities/chat.dart';
import 'package:secure_messaging_app/domain/entities/message.dart';
import 'package:secure_messaging_app/data/repositories/chat_repository_impl.dart';
import 'package:secure_messaging_app/presentation/providers/chat_provider.dart';
import 'package:secure_messaging_app/core/constants/app_constants.dart';

import 'chat_provider_test.mocks.dart';

@GenerateMocks([ChatRepositoryImpl])
void main() {
  group('ChatNotifier', () {
    late MockChatRepositoryImpl mockChatRepository;
    late ProviderContainer container;

    setUp(() {
      mockChatRepository = MockChatRepositoryImpl();
      container = ProviderContainer(
        overrides: [
          chatRepositoryProvider.overrideWithValue(mockChatRepository),
        ],
      );
    });

    tearDown(() {
      container.dispose();
    });

    test('initial state should be initial', () {
      final chatNotifier = container.read(chatProvider.notifier);
      expect(chatNotifier.state, isA<ChatState>());
      expect(chatNotifier.state.isLoading, false);
      expect(chatNotifier.state.isLoadingMessages, false);
      expect(chatNotifier.state.chats, isEmpty);
      expect(chatNotifier.state.messages, isEmpty);
      expect(chatNotifier.state.error, null);
    });

    group('loadChats', () {
      test('should set loading state and then load chats successfully', () async {
        // Arrange
        final chats = [
          Chat(
            id: 'chat1',
            name: 'Chat 1',
            type: 'private',
            participants: ['user1', 'user2'],
            lastMessage: 'Hello',
            lastMessageAt: DateTime.now(),
            createdAt: DateTime.now(),
          ),
          Chat(
            id: 'chat2',
            name: 'Chat 2',
            type: 'group',
            participants: ['user1', 'user2', 'user3'],
            lastMessage: 'Hi there',
            lastMessageAt: DateTime.now(),
            createdAt: DateTime.now(),
          ),
        ];

        when(mockChatRepository.getChats())
            .thenAnswer((_) async => chats);

        // Act
        final chatNotifier = container.read(chatProvider.notifier);
        await chatNotifier.loadChats();

        // Assert
        expect(chatNotifier.state.isLoading, false);
        expect(chatNotifier.state.chats, chats);
        expect(chatNotifier.state.error, null);
        verify(mockChatRepository.getChats()).called(1);
      });

      test('should set error state on exception', () async {
        // Arrange
        const errorMessage = 'Network error';

        when(mockChatRepository.getChats())
            .thenThrow(Exception(errorMessage));

        // Act
        final chatNotifier = container.read(chatProvider.notifier);
        await chatNotifier.loadChats();

        // Assert
        expect(chatNotifier.state.isLoading, false);
        expect(chatNotifier.state.chats, isEmpty);
        expect(chatNotifier.state.error, 'Exception: $errorMessage');
        verify(mockChatRepository.getChats()).called(1);
      });
    });

    group('loadMessages', () {
      test('should set loading state and then load messages successfully', () async {
        // Arrange
        const chatId = 'chat1';
        final messages = [
          Message(
            id: 'msg1',
            chatId: chatId,
            senderId: 'user1',
            content: 'Hello',
            type: 'text',
            status: 'sent',
            createdAt: DateTime.now(),
          ),
          Message(
            id: 'msg2',
            chatId: chatId,
            senderId: 'user2',
            content: 'Hi there',
            type: 'text',
            status: 'read',
            createdAt: DateTime.now(),
          ),
        ];

        when(mockChatRepository.getMessages(chatId))
            .thenAnswer((_) async => messages);

        // Act
        final chatNotifier = container.read(chatProvider.notifier);
        await chatNotifier.loadMessages(chatId);

        // Assert
        expect(chatNotifier.state.isLoadingMessages, false);
        expect(chatNotifier.state.messages, messages);
        expect(chatNotifier.state.error, null);
        verify(mockChatRepository.getMessages(chatId)).called(1);
      });

      test('should set error state on exception', () async {
        // Arrange
        const chatId = 'chat1';
        const errorMessage = 'Network error';

        when(mockChatRepository.getMessages(chatId))
            .thenThrow(Exception(errorMessage));

        // Act
        final chatNotifier = container.read(chatProvider.notifier);
        await chatNotifier.loadMessages(chatId);

        // Assert
        expect(chatNotifier.state.isLoadingMessages, false);
        expect(chatNotifier.state.messages, isEmpty);
        expect(chatNotifier.state.error, 'Exception: $errorMessage');
        verify(mockChatRepository.getMessages(chatId)).called(1);
      });
    });

    group('sendMessage', () {
      test('should send message and add to messages list', () async {
        // Arrange
        const chatId = 'chat1';
        const content = 'Hello world';
        const type = 'text';
        final message = Message(
          id: 'msg1',
          chatId: chatId,
          senderId: 'user1',
          content: content,
          type: type,
          status: 'sent',
          createdAt: DateTime.now(),
        );

        when(mockChatRepository.sendMessage(chatId, content, type))
            .thenAnswer((_) async => message);

        // Act
        final chatNotifier = container.read(chatProvider.notifier);
        await chatNotifier.sendMessage(chatId, content, type);

        // Assert
        expect(chatNotifier.state.messages, contains(message));
        verify(mockChatRepository.sendMessage(chatId, content, type)).called(1);
      });

      test('should set error state on exception', () async {
        // Arrange
        const chatId = 'chat1';
        const content = 'Hello world';
        const type = 'text';
        const errorMessage = 'Network error';

        when(mockChatRepository.sendMessage(chatId, content, type))
            .thenThrow(Exception(errorMessage));

        // Act
        final chatNotifier = container.read(chatProvider.notifier);
        await chatNotifier.sendMessage(chatId, content, type);

        // Assert
        expect(chatNotifier.state.error, 'Exception: $errorMessage');
        verify(mockChatRepository.sendMessage(chatId, content, type)).called(1);
      });
    });

    group('sendMediaMessage', () {
      test('should send media message and add to messages list', () async {
        // Arrange
        const chatId = 'chat1';
        const mediaUrl = 'https://example.com/image.jpg';
        const type = 'image';
        final message = Message(
          id: 'msg1',
          chatId: chatId,
          senderId: 'user1',
          content: '',
          type: type,
          mediaUrl: mediaUrl,
          status: 'sent',
          createdAt: DateTime.now(),
        );

        when(mockChatRepository.sendMediaMessage(chatId, mediaUrl, type))
            .thenAnswer((_) async => message);

        // Act
        final chatNotifier = container.read(chatProvider.notifier);
        await chatNotifier.sendMediaMessage(chatId, mediaUrl, type);

        // Assert
        expect(chatNotifier.state.messages, contains(message));
        verify(mockChatRepository.sendMediaMessage(chatId, mediaUrl, type)).called(1);
      });

      test('should set error state on exception', () async {
        // Arrange
        const chatId = 'chat1';
        const mediaUrl = 'https://example.com/image.jpg';
        const type = 'image';
        const errorMessage = 'Network error';

        when(mockChatRepository.sendMediaMessage(chatId, mediaUrl, type))
            .thenThrow(Exception(errorMessage));

        // Act
        final chatNotifier = container.read(chatProvider.notifier);
        await chatNotifier.sendMediaMessage(chatId, mediaUrl, type);

        // Assert
        expect(chatNotifier.state.error, 'Exception: $errorMessage');
        verify(mockChatRepository.sendMediaMessage(chatId, mediaUrl, type)).called(1);
      });
    });

    group('markAsRead', () {
      test('should mark message as read and update status', () async {
        // Arrange
        const messageId = 'msg1';
        final existingMessage = Message(
          id: messageId,
          chatId: 'chat1',
          senderId: 'user1',
          content: 'Hello',
          type: 'text',
          status: 'sent',
          createdAt: DateTime.now(),
        );

        when(mockChatRepository.markAsRead(messageId))
            .thenAnswer((_) async {});

        // Set up initial state with a message
        final chatNotifier = container.read(chatProvider.notifier);
        chatNotifier.state = chatNotifier.state.copyWith(messages: [existingMessage]);

        // Act
        await chatNotifier.markAsRead(messageId);

        // Assert
        final updatedMessage = chatNotifier.state.messages.firstWhere((msg) => msg.id == messageId);
        expect(updatedMessage.status, AppConstants.messageStatusRead);
        expect(updatedMessage.readAt, isNotNull);
        verify(mockChatRepository.markAsRead(messageId)).called(1);
      });

      test('should set error state on exception', () async {
        // Arrange
        const messageId = 'msg1';
        const errorMessage = 'Network error';

        when(mockChatRepository.markAsRead(messageId))
            .thenThrow(Exception(errorMessage));

        // Act
        final chatNotifier = container.read(chatProvider.notifier);
        await chatNotifier.markAsRead(messageId);

        // Assert
        expect(chatNotifier.state.error, 'Exception: $errorMessage');
        verify(mockChatRepository.markAsRead(messageId)).called(1);
      });
    });

    group('deleteMessage', () {
      test('should delete message and remove from messages list', () async {
        // Arrange
        const messageId = 'msg1';
        final existingMessage = Message(
          id: messageId,
          chatId: 'chat1',
          senderId: 'user1',
          content: 'Hello',
          type: 'text',
          status: 'sent',
          createdAt: DateTime.now(),
        );

        when(mockChatRepository.deleteMessage(messageId))
            .thenAnswer((_) async {});

        // Set up initial state with a message
        final chatNotifier = container.read(chatProvider.notifier);
        chatNotifier.state = chatNotifier.state.copyWith(messages: [existingMessage]);

        // Act
        await chatNotifier.deleteMessage(messageId);

        // Assert
        expect(chatNotifier.state.messages, isNot(contains(existingMessage)));
        verify(mockChatRepository.deleteMessage(messageId)).called(1);
      });

      test('should set error state on exception', () async {
        // Arrange
        const messageId = 'msg1';
        const errorMessage = 'Network error';

        when(mockChatRepository.deleteMessage(messageId))
            .thenThrow(Exception(errorMessage));

        // Act
        final chatNotifier = container.read(chatProvider.notifier);
        await chatNotifier.deleteMessage(messageId);

        // Assert
        expect(chatNotifier.state.error, 'Exception: $errorMessage');
        verify(mockChatRepository.deleteMessage(messageId)).called(1);
      });
    });

    group('addMessage', () {
      test('should add message to messages list', () {
        // Arrange
        final message = Message(
          id: 'msg1',
          chatId: 'chat1',
          senderId: 'user1',
          content: 'Hello',
          type: 'text',
          status: 'sent',
          createdAt: DateTime.now(),
        );

        // Act
        final chatNotifier = container.read(chatProvider.notifier);
        chatNotifier.addMessage(message);

        // Assert
        expect(chatNotifier.state.messages, contains(message));
      });
    });

    group('updateMessage', () {
      test('should update existing message in messages list', () {
        // Arrange
        final originalMessage = Message(
          id: 'msg1',
          chatId: 'chat1',
          senderId: 'user1',
          content: 'Hello',
          type: 'text',
          status: 'sent',
          createdAt: DateTime.now(),
        );
        final updatedMessage = Message(
          id: 'msg1',
          chatId: 'chat1',
          senderId: 'user1',
          content: 'Hello updated',
          type: 'text',
          status: 'sent',
          createdAt: DateTime.now(),
        );

        // Set up initial state with a message
        final chatNotifier = container.read(chatProvider.notifier);
        chatNotifier.state = chatNotifier.state.copyWith(messages: [originalMessage]);

        // Act
        chatNotifier.updateMessage(updatedMessage);

        // Assert
        expect(chatNotifier.state.messages, contains(updatedMessage));
        expect(chatNotifier.state.messages, isNot(contains(originalMessage)));
      });
    });

    group('removeMessage', () {
      test('should remove message from messages list', () {
        // Arrange
        final message1 = Message(
          id: 'msg1',
          chatId: 'chat1',
          senderId: 'user1',
          content: 'Hello',
          type: 'text',
          status: 'sent',
          createdAt: DateTime.now(),
        );
        final message2 = Message(
          id: 'msg2',
          chatId: 'chat1',
          senderId: 'user2',
          content: 'Hi',
          type: 'text',
          status: 'sent',
          createdAt: DateTime.now(),
        );

        // Set up initial state with messages
        final chatNotifier = container.read(chatProvider.notifier);
        chatNotifier.state = chatNotifier.state.copyWith(messages: [message1, message2]);

        // Act
        chatNotifier.removeMessage('msg1');

        // Assert
        expect(chatNotifier.state.messages, contains(message2));
        expect(chatNotifier.state.messages, isNot(contains(message1)));
      });
    });

    group('clearError', () {
      test('should clear error from state', () {
        // Arrange
        final chatNotifier = container.read(chatProvider.notifier);
        chatNotifier.state = chatNotifier.state.copyWith(error: 'Test error');

        // Act
        chatNotifier.clearError();

        // Assert
        expect(chatNotifier.state.error, null);
      });
    });
  });

  group('ChatState', () {
    test('initial state should have correct values', () {
      const state = ChatState.initial();
      expect(state.isLoading, false);
      expect(state.isLoadingMessages, false);
      expect(state.chats, isEmpty);
      expect(state.messages, isEmpty);
      expect(state.error, null);
    });

    test('copyWith should update specified fields', () {
      const originalState = ChatState.initial();
      final chats = [
        Chat(
          id: 'chat1',
          name: 'Chat 1',
          type: 'private',
          participants: ['user1', 'user2'],
          lastMessage: 'Hello',
          lastMessageAt: DateTime.now(),
          createdAt: DateTime.now(),
        ),
      ];

      final updatedState = originalState.copyWith(
        isLoading: true,
        chats: chats,
        error: 'Test error',
      );

      expect(updatedState.isLoading, true);
      expect(updatedState.isLoadingMessages, false);
      expect(updatedState.chats, chats);
      expect(updatedState.messages, isEmpty);
      expect(updatedState.error, 'Test error');
    });
  });
}
