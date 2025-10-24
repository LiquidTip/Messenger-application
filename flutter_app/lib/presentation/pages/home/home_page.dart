import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_constants.dart';
import '../providers/auth_provider.dart';
import '../providers/chat_provider.dart';
import '../providers/websocket_provider.dart';
import 'tabs/chats_tab.dart';
import 'tabs/calls_tab.dart';
import 'tabs/status_tab.dart';
import 'tabs/settings_tab.dart';

class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key});

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage> with TickerProviderStateMixin {
  late TabController _tabController;
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _tabController.addListener(() {
      setState(() {
        _currentIndex = _tabController.index;
      });
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final websocketState = ref.watch(websocketProvider);

    // Connect to WebSocket when user is authenticated
    if (authState.isAuthenticated && !websocketState.isConnected) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(websocketProvider.notifier).connect(authState.user!.id);
      });
    }

    return Scaffold(
      body: TabBarView(
        controller: _tabController,
        children: const [
          ChatsTab(),
          StatusTab(),
          CallsTab(),
          SettingsTab(),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: _currentIndex,
        onTap: (index) {
          _tabController.animateTo(index);
        },
        selectedItemColor: AppConstants.primaryColor,
        unselectedItemColor: AppConstants.textSecondaryColor,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.chat),
            label: 'Chats',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.camera_alt),
            label: 'Status',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.call),
            label: 'Calls',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.settings),
            label: 'Settings',
          ),
        ],
      ),
      floatingActionButton: _getFloatingActionButton(),
    );
  }

  Widget? _getFloatingActionButton() {
    switch (_currentIndex) {
      case 0: // Chats
        return FloatingActionButton(
          onPressed: () {
            // Navigate to new chat
            _showNewChatOptions();
          },
          backgroundColor: AppConstants.primaryColor,
          child: const Icon(Icons.chat, color: Colors.white),
        );
      case 1: // Status
        return FloatingActionButton(
          onPressed: () {
            // Navigate to camera for status
            _showStatusOptions();
          },
          backgroundColor: AppConstants.primaryColor,
          child: const Icon(Icons.camera_alt, color: Colors.white),
        );
      case 2: // Calls
        return FloatingActionButton(
          onPressed: () {
            // Navigate to contacts for call
            _showCallOptions();
          },
          backgroundColor: AppConstants.primaryColor,
          child: const Icon(Icons.call, color: Colors.white),
        );
      default:
        return null;
    }
  }

  void _showNewChatOptions() {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.person_add),
              title: const Text('New Chat'),
              onTap: () {
                Navigator.pop(context);
                // Navigate to contacts
              },
            ),
            ListTile(
              leading: const Icon(Icons.group_add),
              title: const Text('New Group'),
              onTap: () {
                Navigator.pop(context);
                // Navigate to create group
              },
            ),
            ListTile(
              leading: const Icon(Icons.broadcast_on_personal),
              title: const Text('New Broadcast'),
              onTap: () {
                Navigator.pop(context);
                // Navigate to create broadcast
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showStatusOptions() {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('Camera'),
              onTap: () {
                Navigator.pop(context);
                // Open camera
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Gallery'),
              onTap: () {
                Navigator.pop(context);
                // Open gallery
              },
            ),
            ListTile(
              leading: const Icon(Icons.text_fields),
              title: const Text('Text'),
              onTap: () {
                Navigator.pop(context);
                // Create text status
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showCallOptions() {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.phone),
              title: const Text('Voice Call'),
              onTap: () {
                Navigator.pop(context);
                // Navigate to contacts for voice call
              },
            ),
            ListTile(
              leading: const Icon(Icons.videocam),
              title: const Text('Video Call'),
              onTap: () {
                Navigator.pop(context);
                // Navigate to contacts for video call
              },
            ),
          ],
        ),
      ),
    );
  }
}