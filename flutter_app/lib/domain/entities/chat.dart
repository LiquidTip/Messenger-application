import 'package:equatable/equatable.dart';

class Chat extends Equatable {
  final String id;
  final String type;
  final List<String> participants;
  final String? createdBy;
  final String? name;
  final String? description;
  final String? profilePicture;
  final String? lastMessage;
  final DateTime? lastMessageAt;
  final Map<String, ParticipantSettings> participantSettings;
  final bool isActive;
  final GroupSettings? groupSettings;

  const Chat({
    required this.id,
    required this.type,
    required this.participants,
    this.createdBy,
    this.name,
    this.description,
    this.profilePicture,
    this.lastMessage,
    this.lastMessageAt,
    required this.participantSettings,
    required this.isActive,
    this.groupSettings,
  });

  factory Chat.fromJson(Map<String, dynamic> json) {
    return Chat(
      id: json['id'] ?? json['_id'],
      type: json['type'],
      participants: List<String>.from(json['participants'] ?? []),
      createdBy: json['createdBy'],
      name: json['name'],
      description: json['description'],
      profilePicture: json['profilePicture'],
      lastMessage: json['lastMessage'],
      lastMessageAt: json['lastMessageAt'] != null ? DateTime.parse(json['lastMessageAt']) : null,
      participantSettings: Map<String, ParticipantSettings>.from(
        (json['participantSettings'] ?? {}).map(
          (key, value) => MapEntry(key, ParticipantSettings.fromJson(value)),
        ),
      ),
      isActive: json['isActive'] ?? true,
      groupSettings: json['groupSettings'] != null ? GroupSettings.fromJson(json['groupSettings']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'participants': participants,
      'createdBy': createdBy,
      'name': name,
      'description': description,
      'profilePicture': profilePicture,
      'lastMessage': lastMessage,
      'lastMessageAt': lastMessageAt?.toIso8601String(),
      'participantSettings': participantSettings.map(
        (key, value) => MapEntry(key, value.toJson()),
      ),
      'isActive': isActive,
      'groupSettings': groupSettings?.toJson(),
    };
  }

  Chat copyWith({
    String? id,
    String? type,
    List<String>? participants,
    String? createdBy,
    String? name,
    String? description,
    String? profilePicture,
    String? lastMessage,
    DateTime? lastMessageAt,
    Map<String, ParticipantSettings>? participantSettings,
    bool? isActive,
    GroupSettings? groupSettings,
  }) {
    return Chat(
      id: id ?? this.id,
      type: type ?? this.type,
      participants: participants ?? this.participants,
      createdBy: createdBy ?? this.createdBy,
      name: name ?? this.name,
      description: description ?? this.description,
      profilePicture: profilePicture ?? this.profilePicture,
      lastMessage: lastMessage ?? this.lastMessage,
      lastMessageAt: lastMessageAt ?? this.lastMessageAt,
      participantSettings: participantSettings ?? this.participantSettings,
      isActive: isActive ?? this.isActive,
      groupSettings: groupSettings ?? this.groupSettings,
    );
  }

  @override
  List<Object?> get props => [
        id,
        type,
        participants,
        createdBy,
        name,
        description,
        profilePicture,
        lastMessage,
        lastMessageAt,
        participantSettings,
        isActive,
        groupSettings,
      ];
}

class ParticipantSettings {
  final DateTime joinedAt;
  final bool isMuted;
  final bool isAdmin;
  final DateTime? leftAt;

  const ParticipantSettings({
    required this.joinedAt,
    required this.isMuted,
    required this.isAdmin,
    this.leftAt,
  });

  factory ParticipantSettings.fromJson(Map<String, dynamic> json) {
    return ParticipantSettings(
      joinedAt: DateTime.parse(json['joinedAt']),
      isMuted: json['isMuted'] ?? false,
      isAdmin: json['isAdmin'] ?? false,
      leftAt: json['leftAt'] != null ? DateTime.parse(json['leftAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'joinedAt': joinedAt.toIso8601String(),
      'isMuted': isMuted,
      'isAdmin': isAdmin,
      'leftAt': leftAt?.toIso8601String(),
    };
  }
}

class GroupSettings {
  final int maxParticipants;
  final bool allowInviteLinks;
  final bool allowMemberAdd;
  final bool allowMemberRemove;

  const GroupSettings({
    required this.maxParticipants,
    required this.allowInviteLinks,
    required this.allowMemberAdd,
    required this.allowMemberRemove,
  });

  factory GroupSettings.fromJson(Map<String, dynamic> json) {
    return GroupSettings(
      maxParticipants: json['maxParticipants'] ?? 1024,
      allowInviteLinks: json['allowInviteLinks'] ?? true,
      allowMemberAdd: json['allowMemberAdd'] ?? true,
      allowMemberRemove: json['allowMemberRemove'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'maxParticipants': maxParticipants,
      'allowInviteLinks': allowInviteLinks,
      'allowMemberAdd': allowMemberAdd,
      'allowMemberRemove': allowMemberRemove,
    };
  }
}