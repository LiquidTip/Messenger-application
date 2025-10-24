import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../../core/constants/app_constants.dart';
import '../../domain/entities/message.dart';
import '../../domain/entities/user.dart';

final websocketProvider = StateNotifierProvider<WebSocketNotifier, WebSocketState>((ref) {
  return WebSocketNotifier();
});

class WebSocketNotifier extends StateNotifier<WebSocketState> {
  IO.Socket? _socket;
  String? _token;

  WebSocketNotifier() : super(const WebSocketState.initial());

  void connect(String token) {
    _token = token;
    
    _socket = IO.io(AppConstants.socketUrl, IO.OptionBuilder()
      .setTransports(['websocket'])
      .setAuth({'token': token})
      .build());

    _socket!.onConnect((_) {
      state = const WebSocketState.connected();
    });

    _socket!.onDisconnect((_) {
      state = const WebSocketState.disconnected();
    });

    _socket!.onConnectError((error) {
      state = WebSocketState.error(error.toString());
    });

    // Listen for incoming messages
    _socket!.on('new_message', (data) {
      final message = Message.fromJson(data);
      state = state.copyWith(
        lastMessage: message,
        hasNewMessage: true,
      );
    });

    _socket!.on('message_updated', (data) {
      final message = Message.fromJson(data);
      state = state.copyWith(
        lastUpdatedMessage: message,
        hasMessageUpdate: true,
      );
    });

    _socket!.on('message_deleted', (data) {
      final messageId = data['messageId'];
      state = state.copyWith(
        deletedMessageId: messageId,
        hasMessageDeletion: true,
      );
    });

    _socket!.on('message_read', (data) {
      final messageId = data['messageId'];
      final userId = data['userId'];
      state = state.copyWith(
        readMessageId: messageId,
        readByUserId: userId,
        hasReadReceipt: true,
      );
    });

    _socket!.on('user_typing', (data) {
      final userId = data['userId'];
      final chatId = data['chatId'];
      final isTyping = data['isTyping'];
      state = state.copyWith(
        typingUserId: userId,
        typingChatId: chatId,
        isTyping: isTyping,
        hasTypingUpdate: true,
      );
    });

    _socket!.on('contact_status', (data) {
      final userId = data['userId'];
      final isOnline = data['isOnline'];
      final lastSeen = data['lastSeen'];
      state = state.copyWith(
        contactStatusUserId: userId,
        contactIsOnline: isOnline,
        contactLastSeen: lastSeen,
        hasContactStatusUpdate: true,
      );
    });

    _socket!.on('incoming_call', (data) {
      state = state.copyWith(
        incomingCallData: data,
        hasIncomingCall: true,
      );
    });

    _socket!.on('call_answered', (data) {
      state = state.copyWith(
        callAnsweredData: data,
        hasCallAnswer: true,
      );
    });

    _socket!.on('call_rejected', (data) {
      state = state.copyWith(
        callRejectedData: data,
        hasCallRejection: true,
      );
    });

    _socket!.on('call_ended', (data) {
      state = state.copyWith(
        callEndedData: data,
        hasCallEnd: true,
      );
    });
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
    state = const WebSocketState.disconnected();
  }

  void joinChat(String chatId) {
    _socket?.emit('join_chat', {'chatId': chatId});
  }

  void leaveChat(String chatId) {
    _socket?.emit('leave_chat', {'chatId': chatId});
  }

  void startTyping(String chatId) {
    _socket?.emit('typing_start', {'chatId': chatId});
  }

  void stopTyping(String chatId) {
    _socket?.emit('typing_stop', {'chatId': chatId});
  }

  void clearNewMessage() {
    state = state.copyWith(hasNewMessage: false);
  }

  void clearMessageUpdate() {
    state = state.copyWith(hasMessageUpdate: false);
  }

  void clearMessageDeletion() {
    state = state.copyWith(hasMessageDeletion: false);
  }

  void clearReadReceipt() {
    state = state.copyWith(hasReadReceipt: false);
  }

  void clearTypingUpdate() {
    state = state.copyWith(hasTypingUpdate: false);
  }

  void clearContactStatusUpdate() {
    state = state.copyWith(hasContactStatusUpdate: false);
  }

  void clearIncomingCall() {
    state = state.copyWith(hasIncomingCall: false);
  }

  void clearCallAnswer() {
    state = state.copyWith(hasCallAnswer: false);
  }

  void clearCallRejection() {
    state = state.copyWith(hasCallRejection: false);
  }

  void clearCallEnd() {
    state = state.copyWith(hasCallEnd: false);
  }
}

class WebSocketState {
  final bool isConnected;
  final bool isConnecting;
  final String? error;
  final Message? lastMessage;
  final Message? lastUpdatedMessage;
  final String? deletedMessageId;
  final String? readMessageId;
  final String? readByUserId;
  final String? typingUserId;
  final String? typingChatId;
  final bool isTyping;
  final String? contactStatusUserId;
  final bool? contactIsOnline;
  final String? contactLastSeen;
  final Map<String, dynamic>? incomingCallData;
  final Map<String, dynamic>? callAnsweredData;
  final Map<String, dynamic>? callRejectedData;
  final Map<String, dynamic>? callEndedData;
  final bool hasNewMessage;
  final bool hasMessageUpdate;
  final bool hasMessageDeletion;
  final bool hasReadReceipt;
  final bool hasTypingUpdate;
  final bool hasContactStatusUpdate;
  final bool hasIncomingCall;
  final bool hasCallAnswer;
  final bool hasCallRejection;
  final bool hasCallEnd;

  const WebSocketState._({
    required this.isConnected,
    required this.isConnecting,
    this.error,
    this.lastMessage,
    this.lastUpdatedMessage,
    this.deletedMessageId,
    this.readMessageId,
    this.readByUserId,
    this.typingUserId,
    this.typingChatId,
    required this.isTyping,
    this.contactStatusUserId,
    this.contactIsOnline,
    this.contactLastSeen,
    this.incomingCallData,
    this.callAnsweredData,
    this.callRejectedData,
    this.callEndedData,
    required this.hasNewMessage,
    required this.hasMessageUpdate,
    required this.hasMessageDeletion,
    required this.hasReadReceipt,
    required this.hasTypingUpdate,
    required this.hasContactStatusUpdate,
    required this.hasIncomingCall,
    required this.hasCallAnswer,
    required this.hasCallRejection,
    required this.hasCallEnd,
  });

  const WebSocketState.initial() : this._(
    isConnected: false,
    isConnecting: false,
    isTyping: false,
    hasNewMessage: false,
    hasMessageUpdate: false,
    hasMessageDeletion: false,
    hasReadReceipt: false,
    hasTypingUpdate: false,
    hasContactStatusUpdate: false,
    hasIncomingCall: false,
    hasCallAnswer: false,
    hasCallRejection: false,
    hasCallEnd: false,
  );

  const WebSocketState.connected() : this._(
    isConnected: true,
    isConnecting: false,
    isTyping: false,
    hasNewMessage: false,
    hasMessageUpdate: false,
    hasMessageDeletion: false,
    hasReadReceipt: false,
    hasTypingUpdate: false,
    hasContactStatusUpdate: false,
    hasIncomingCall: false,
    hasCallAnswer: false,
    hasCallRejection: false,
    hasCallEnd: false,
  );

  const WebSocketState.disconnected() : this._(
    isConnected: false,
    isConnecting: false,
    isTyping: false,
    hasNewMessage: false,
    hasMessageUpdate: false,
    hasMessageDeletion: false,
    hasReadReceipt: false,
    hasTypingUpdate: false,
    hasContactStatusUpdate: false,
    hasIncomingCall: false,
    hasCallAnswer: false,
    hasCallRejection: false,
    hasCallEnd: false,
  );

  WebSocketState.error(String error) : this._(
    isConnected: false,
    isConnecting: false,
    error: error,
    isTyping: false,
    hasNewMessage: false,
    hasMessageUpdate: false,
    hasMessageDeletion: false,
    hasReadReceipt: false,
    hasTypingUpdate: false,
    hasContactStatusUpdate: false,
    hasIncomingCall: false,
    hasCallAnswer: false,
    hasCallRejection: false,
    hasCallEnd: false,
  );

  WebSocketState copyWith({
    bool? isConnected,
    bool? isConnecting,
    String? error,
    Message? lastMessage,
    Message? lastUpdatedMessage,
    String? deletedMessageId,
    String? readMessageId,
    String? readByUserId,
    String? typingUserId,
    String? typingChatId,
    bool? isTyping,
    String? contactStatusUserId,
    bool? contactIsOnline,
    String? contactLastSeen,
    Map<String, dynamic>? incomingCallData,
    Map<String, dynamic>? callAnsweredData,
    Map<String, dynamic>? callRejectedData,
    Map<String, dynamic>? callEndedData,
    bool? hasNewMessage,
    bool? hasMessageUpdate,
    bool? hasMessageDeletion,
    bool? hasReadReceipt,
    bool? hasTypingUpdate,
    bool? hasContactStatusUpdate,
    bool? hasIncomingCall,
    bool? hasCallAnswer,
    bool? hasCallRejection,
    bool? hasCallEnd,
  }) {
    return WebSocketState._(
      isConnected: isConnected ?? this.isConnected,
      isConnecting: isConnecting ?? this.isConnecting,
      error: error ?? this.error,
      lastMessage: lastMessage ?? this.lastMessage,
      lastUpdatedMessage: lastUpdatedMessage ?? this.lastUpdatedMessage,
      deletedMessageId: deletedMessageId ?? this.deletedMessageId,
      readMessageId: readMessageId ?? this.readMessageId,
      readByUserId: readByUserId ?? this.readByUserId,
      typingUserId: typingUserId ?? this.typingUserId,
      typingChatId: typingChatId ?? this.typingChatId,
      isTyping: isTyping ?? this.isTyping,
      contactStatusUserId: contactStatusUserId ?? this.contactStatusUserId,
      contactIsOnline: contactIsOnline ?? this.contactIsOnline,
      contactLastSeen: contactLastSeen ?? this.contactLastSeen,
      incomingCallData: incomingCallData ?? this.incomingCallData,
      callAnsweredData: callAnsweredData ?? this.callAnsweredData,
      callRejectedData: callRejectedData ?? this.callRejectedData,
      callEndedData: callEndedData ?? this.callEndedData,
      hasNewMessage: hasNewMessage ?? this.hasNewMessage,
      hasMessageUpdate: hasMessageUpdate ?? this.hasMessageUpdate,
      hasMessageDeletion: hasMessageDeletion ?? this.hasMessageDeletion,
      hasReadReceipt: hasReadReceipt ?? this.hasReadReceipt,
      hasTypingUpdate: hasTypingUpdate ?? this.hasTypingUpdate,
      hasContactStatusUpdate: hasContactStatusUpdate ?? this.hasContactStatusUpdate,
      hasIncomingCall: hasIncomingCall ?? this.hasIncomingCall,
      hasCallAnswer: hasCallAnswer ?? this.hasCallAnswer,
      hasCallRejection: hasCallRejection ?? this.hasCallRejection,
      hasCallEnd: hasCallEnd ?? this.hasCallEnd,
    );
  }
}