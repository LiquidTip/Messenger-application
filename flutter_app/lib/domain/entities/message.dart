import 'package:equatable/equatable.dart';

class Message extends Equatable {
  final String id;
  final String chatId;
  final String senderId;
  final String type;
  final String? content;
  final String? mediaUrl;
  final String? mediaType;
  final String? fileName;
  final int? fileSize;
  final LocationData? location;
  final ContactData? contact;
  final String status;
  final DateTime? readAt;
  final List<String> readBy;
  final String? replyTo;
  final List<String> mentions;
  final bool isEdited;
  final DateTime? editedAt;
  final bool isDeleted;
  final DateTime? deletedAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Message({
    required this.id,
    required this.chatId,
    required this.senderId,
    required this.type,
    this.content,
    this.mediaUrl,
    this.mediaType,
    this.fileName,
    this.fileSize,
    this.location,
    this.contact,
    required this.status,
    this.readAt,
    required this.readBy,
    this.replyTo,
    required this.mentions,
    required this.isEdited,
    this.editedAt,
    required this.isDeleted,
    this.deletedAt,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      id: json['id'] ?? json['_id'],
      chatId: json['chatId'],
      senderId: json['senderId'],
      type: json['type'],
      content: json['content'],
      mediaUrl: json['mediaUrl'],
      mediaType: json['mediaType'],
      fileName: json['fileName'],
      fileSize: json['fileSize'],
      location: json['location'] != null ? LocationData.fromJson(json['location']) : null,
      contact: json['contact'] != null ? ContactData.fromJson(json['contact']) : null,
      status: json['status'],
      readAt: json['readAt'] != null ? DateTime.parse(json['readAt']) : null,
      readBy: List<String>.from(json['readBy'] ?? []),
      replyTo: json['replyTo'],
      mentions: List<String>.from(json['mentions'] ?? []),
      isEdited: json['isEdited'] ?? false,
      editedAt: json['editedAt'] != null ? DateTime.parse(json['editedAt']) : null,
      isDeleted: json['isDeleted'] ?? false,
      deletedAt: json['deletedAt'] != null ? DateTime.parse(json['deletedAt']) : null,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'chatId': chatId,
      'senderId': senderId,
      'type': type,
      'content': content,
      'mediaUrl': mediaUrl,
      'mediaType': mediaType,
      'fileName': fileName,
      'fileSize': fileSize,
      'location': location?.toJson(),
      'contact': contact?.toJson(),
      'status': status,
      'readAt': readAt?.toIso8601String(),
      'readBy': readBy,
      'replyTo': replyTo,
      'mentions': mentions,
      'isEdited': isEdited,
      'editedAt': editedAt?.toIso8601String(),
      'isDeleted': isDeleted,
      'deletedAt': deletedAt?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  Message copyWith({
    String? id,
    String? chatId,
    String? senderId,
    String? type,
    String? content,
    String? mediaUrl,
    String? mediaType,
    String? fileName,
    int? fileSize,
    LocationData? location,
    ContactData? contact,
    String? status,
    DateTime? readAt,
    List<String>? readBy,
    String? replyTo,
    List<String>? mentions,
    bool? isEdited,
    DateTime? editedAt,
    bool? isDeleted,
    DateTime? deletedAt,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Message(
      id: id ?? this.id,
      chatId: chatId ?? this.chatId,
      senderId: senderId ?? this.senderId,
      type: type ?? this.type,
      content: content ?? this.content,
      mediaUrl: mediaUrl ?? this.mediaUrl,
      mediaType: mediaType ?? this.mediaType,
      fileName: fileName ?? this.fileName,
      fileSize: fileSize ?? this.fileSize,
      location: location ?? this.location,
      contact: contact ?? this.contact,
      status: status ?? this.status,
      readAt: readAt ?? this.readAt,
      readBy: readBy ?? this.readBy,
      replyTo: replyTo ?? this.replyTo,
      mentions: mentions ?? this.mentions,
      isEdited: isEdited ?? this.isEdited,
      editedAt: editedAt ?? this.editedAt,
      isDeleted: isDeleted ?? this.isDeleted,
      deletedAt: deletedAt ?? this.deletedAt,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        chatId,
        senderId,
        type,
        content,
        mediaUrl,
        mediaType,
        fileName,
        fileSize,
        location,
        contact,
        status,
        readAt,
        readBy,
        replyTo,
        mentions,
        isEdited,
        editedAt,
        isDeleted,
        deletedAt,
        createdAt,
        updatedAt,
      ];
}

class LocationData {
  final double latitude;
  final double longitude;
  final String? address;

  const LocationData({
    required this.latitude,
    required this.longitude,
    this.address,
  });

  factory LocationData.fromJson(Map<String, dynamic> json) {
    return LocationData(
      latitude: json['latitude'].toDouble(),
      longitude: json['longitude'].toDouble(),
      address: json['address'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'latitude': latitude,
      'longitude': longitude,
      'address': address,
    };
  }
}

class ContactData {
  final String name;
  final String phoneNumber;

  const ContactData({
    required this.name,
    required this.phoneNumber,
  });

  factory ContactData.fromJson(Map<String, dynamic> json) {
    return ContactData(
      name: json['name'],
      phoneNumber: json['phoneNumber'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'phoneNumber': phoneNumber,
    };
  }
}