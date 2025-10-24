import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_constants.dart';
import '../../domain/entities/chat.dart';
import '../../domain/entities/message.dart';
import '../../data/repositories/chat_repository_impl.dart';

final chatProvider = StateNotifierProvider<ChatNotifier, ChatState>((ref) {
  return ChatNotifier(ref.read(chatRepositoryProvider));
});

class ChatNotifier extends StateNotifier<ChatState> {
  final ChatRepositoryImpl _chatRepository;

  ChatNotifier(this._chatRepository) : super(const ChatState.initial());

  Future<void> loadChats() async {
    state = state.copyWith(isLoading: true);
    
    try {
      final chats = await _chatRepository.getChats();
      state = state.copyWith(
        isLoading: false,
        chats: chats,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> loadMessages(String chatId) async {
    state = state.copyWith(isLoadingMessages: true);
    
    try {
      final messages = await _chatRepository.getMessages(chatId);
      state = state.copyWith(
        isLoadingMessages: false,
        messages: messages,
      );
    } catch (e) {
      state = state.copyWith(
        isLoadingMessages: false,
        error: e.toString(),
      );
    }
  }

  Future<void> sendMessage(String chatId, String content, String type) async {
    try {
      final message = await _chatRepository.sendMessage(chatId, content, type);
      state = state.copyWith(
        messages: [...state.messages, message],
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  Future<void> sendMediaMessage(String chatId, String mediaUrl, String type) async {
    try {
      final message = await _chatRepository.sendMediaMessage(chatId, mediaUrl, type);
      state = state.copyWith(
        messages: [...state.messages, message],
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  Future<void> markAsRead(String messageId) async {
    try {
      await _chatRepository.markAsRead(messageId);
      state = state.copyWith(
        messages: state.messages.map((msg) {
          if (msg.id == messageId) {
            return msg.copyWith(
              status: AppConstants.messageStatusRead,
              readAt: DateTime.now(),
            );
          }
          return msg;
        }).toList(),
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  Future<void> deleteMessage(String messageId) async {
    try {
      await _chatRepository.deleteMessage(messageId);
      state = state.copyWith(
        messages: state.messages.where((msg) => msg.id != messageId).toList(),
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  void addMessage(Message message) {
    state = state.copyWith(
      messages: [...state.messages, message],
    );
  }

  void updateMessage(Message message) {
    state = state.copyWith(
      messages: state.messages.map((msg) {
        if (msg.id == message.id) {
          return message;
        }
        return msg;
      }).toList(),
    );
  }

  void removeMessage(String messageId) {
    state = state.copyWith(
      messages: state.messages.where((msg) => msg.id != messageId).toList(),
    );
  }

  void clearError() {
    state = state.copyWith(error: null);
  }
}

class ChatState {
  final bool isLoading;
  final bool isLoadingMessages;
  final List<Chat> chats;
  final List<Message> messages;
  final String? error;

  const ChatState._({
    required this.isLoading,
    required this.isLoadingMessages,
    required this.chats,
    required this.messages,
    this.error,
  });

  const ChatState.initial() : this._(
    isLoading: false,
    isLoadingMessages: false,
    chats: const [],
    messages: const [],
  );

  ChatState copyWith({
    bool? isLoading,
    bool? isLoadingMessages,
    List<Chat>? chats,
    List<Message>? messages,
    String? error,
  }) {
    return ChatState._(
      isLoading: isLoading ?? this.isLoading,
      isLoadingMessages: isLoadingMessages ?? this.isLoadingMessages,
      chats: chats ?? this.chats,
      messages: messages ?? this.messages,
      error: error ?? this.error,
    );
  }
}