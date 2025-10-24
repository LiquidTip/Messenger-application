class User {
  final String id;
  final String phoneNumber;
  final String username;
  final String? profilePicture;
  final String? about;
  final DateTime lastSeen;
  final bool isOnline;
  final bool showLastSeen;
  final bool showReadReceipts;
  final List<String> contacts;
  final List<String> blockedUsers;
  final UserPrivacySettings privacySettings;

  const User({
    required this.id,
    required this.phoneNumber,
    required this.username,
    this.profilePicture,
    this.about,
    required this.lastSeen,
    required this.isOnline,
    required this.showLastSeen,
    required this.showReadReceipts,
    required this.contacts,
    required this.blockedUsers,
    required this.privacySettings,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? json['_id'],
      phoneNumber: json['phoneNumber'],
      username: json['username'],
      profilePicture: json['profilePicture'],
      about: json['about'],
      lastSeen: DateTime.parse(json['lastSeen']),
      isOnline: json['isOnline'] ?? false,
      showLastSeen: json['showLastSeen'] ?? true,
      showReadReceipts: json['showReadReceipts'] ?? true,
      contacts: List<String>.from(json['contacts'] ?? []),
      blockedUsers: List<String>.from(json['blockedUsers'] ?? []),
      privacySettings: UserPrivacySettings.fromJson(json['privacySettings'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'phoneNumber': phoneNumber,
      'username': username,
      'profilePicture': profilePicture,
      'about': about,
      'lastSeen': lastSeen.toIso8601String(),
      'isOnline': isOnline,
      'showLastSeen': showLastSeen,
      'showReadReceipts': showReadReceipts,
      'contacts': contacts,
      'blockedUsers': blockedUsers,
      'privacySettings': privacySettings.toJson(),
    };
  }

  User copyWith({
    String? id,
    String? phoneNumber,
    String? username,
    String? profilePicture,
    String? about,
    DateTime? lastSeen,
    bool? isOnline,
    bool? showLastSeen,
    bool? showReadReceipts,
    List<String>? contacts,
    List<String>? blockedUsers,
    UserPrivacySettings? privacySettings,
  }) {
    return User(
      id: id ?? this.id,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      username: username ?? this.username,
      profilePicture: profilePicture ?? this.profilePicture,
      about: about ?? this.about,
      lastSeen: lastSeen ?? this.lastSeen,
      isOnline: isOnline ?? this.isOnline,
      showLastSeen: showLastSeen ?? this.showLastSeen,
      showReadReceipts: showReadReceipts ?? this.showReadReceipts,
      contacts: contacts ?? this.contacts,
      blockedUsers: blockedUsers ?? this.blockedUsers,
      privacySettings: privacySettings ?? this.privacySettings,
    );
  }
}

class UserPrivacySettings {
  final String profileVisibility;
  final String lastSeenVisibility;
  final bool readReceipts;

  const UserPrivacySettings({
    required this.profileVisibility,
    required this.lastSeenVisibility,
    required this.readReceipts,
  });

  factory UserPrivacySettings.fromJson(Map<String, dynamic> json) {
    return UserPrivacySettings(
      profileVisibility: json['profileVisibility'] ?? 'everyone',
      lastSeenVisibility: json['lastSeenVisibility'] ?? 'everyone',
      readReceipts: json['readReceipts'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'profileVisibility': profileVisibility,
      'lastSeenVisibility': lastSeenVisibility,
      'readReceipts': readReceipts,
    };
  }

  UserPrivacySettings copyWith({
    String? profileVisibility,
    String? lastSeenVisibility,
    bool? readReceipts,
  }) {
    return UserPrivacySettings(
      profileVisibility: profileVisibility ?? this.profileVisibility,
      lastSeenVisibility: lastSeenVisibility ?? this.lastSeenVisibility,
      readReceipts: readReceipts ?? this.readReceipts,
    );
  }
}