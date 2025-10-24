class AppConstants {
  // Colors
  static const primaryColor = Color(0xFF25D366);
  static const secondaryColor = Color(0xFF128C7E);
  static const backgroundColor = Color(0xFFF0F0F0);
  static const surfaceColor = Color(0xFFFFFFFF);
  static const errorColor = Color(0xFFE53E3E);
  static const successColor = Color(0xFF38A169);
  static const warningColor = Color(0xFFED8936);
  
  // Text Colors
  static const textPrimaryColor = Color(0xFF1A202C);
  static const textSecondaryColor = Color(0xFF718096);
  static const textLightColor = Color(0xFFA0AEC0);
  
  // API
  static const baseUrl = 'http://localhost:3000/api';
  static const socketUrl = 'http://localhost:3000';
  
  // Storage Keys
  static const tokenKey = 'auth_token';
  static const userKey = 'user_data';
  static const settingsKey = 'app_settings';
  
  // Message Types
  static const messageTypeText = 'text';
  static const messageTypeImage = 'image';
  static const messageTypeVideo = 'video';
  static const messageTypeAudio = 'audio';
  static const messageTypeDocument = 'document';
  static const messageTypeLocation = 'location';
  static const messageTypeContact = 'contact';
  static const messageTypeSticker = 'sticker';
  
  // Message Status
  static const messageStatusSending = 'sending';
  static const messageStatusSent = 'sent';
  static const messageStatusDelivered = 'delivered';
  static const messageStatusRead = 'read';
  static const messageStatusFailed = 'failed';
  
  // Chat Types
  static const chatTypePrivate = 'private';
  static const chatTypeGroup = 'group';
  static const chatTypeBroadcast = 'broadcast';
  
  // Call Types
  static const callTypeVoice = 'voice';
  static const callTypeVideo = 'video';
  
  // Notification Types
  static const notificationTypeMessage = 'message';
  static const notificationTypeCall = 'call';
  static const notificationTypeGroupInvite = 'group_invite';
  static const notificationTypeGroupUpdate = 'group_update';
  static const notificationTypeStatusView = 'status_view';
  static const notificationTypeSystem = 'system';
  
  // File Limits
  static const maxImageSize = 10 * 1024 * 1024; // 10MB
  static const maxVideoSize = 100 * 1024 * 1024; // 100MB
  static const maxAudioSize = 20 * 1024 * 1024; // 20MB
  static const maxDocumentSize = 50 * 1024 * 1024; // 50MB
  
  // Pagination
  static const defaultPageSize = 20;
  static const maxPageSize = 100;
  
  // Timeouts
  static const connectionTimeout = 30000; // 30 seconds
  static const receiveTimeout = 30000; // 30 seconds
  
  // Encryption
  static const encryptionKeyLength = 32;
  static const ivLength = 16;
  static const tagLength = 16;
}

class Color {
  final int value;
  const Color(this.value);
  
  static const Color primaryColor = Color(0xFF25D366);
  static const Color secondaryColor = Color(0xFF128C7E);
  static const Color backgroundColor = Color(0xFFF0F0F0);
  static const Color surfaceColor = Color(0xFFFFFFFF);
  static const Color errorColor = Color(0xFFE53E3E);
  static const Color successColor = Color(0xFF38A169);
  static const Color warningColor = Color(0xFFED8936);
  static const Color textPrimaryColor = Color(0xFF1A202C);
  static const Color textSecondaryColor = Color(0xFF718096);
  static const Color textLightColor = Color(0xFFA0AEC0);
}