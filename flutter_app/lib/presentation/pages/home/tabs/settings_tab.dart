import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_constants.dart';
import '../providers/auth_provider.dart';
import '../../auth/login_page.dart';

class SettingsTab extends ConsumerWidget {
  const SettingsTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        backgroundColor: AppConstants.primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: ListView(
        children: [
          // Profile Section
          Container(
            color: Colors.white,
            child: ListTile(
              leading: CircleAvatar(
                radius: 25,
                backgroundColor: AppConstants.primaryColor,
                backgroundImage: authState.user?.profilePicture != null
                    ? NetworkImage(authState.user!.profilePicture!)
                    : null,
                child: authState.user?.profilePicture == null
                    ? Text(
                        authState.user?.username.substring(0, 1).toUpperCase() ?? 'U',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      )
                    : null,
              ),
              title: Text(
                authState.user?.username ?? 'Unknown',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w500,
                ),
              ),
              subtitle: Text(
                authState.user?.phoneNumber ?? '',
                style: TextStyle(
                  color: AppConstants.textSecondaryColor,
                ),
              ),
              trailing: const Icon(Icons.arrow_forward_ios),
              onTap: () {
                // Navigate to profile settings
              },
            ),
          ),
          const SizedBox(height: 20),
          
          // Account Section
          _buildSectionTitle('Account'),
          _buildSettingsItem(
            icon: Icons.person,
            title: 'Profile',
            onTap: () {
              // Navigate to profile
            },
          ),
          _buildSettingsItem(
            icon: Icons.privacy_tip,
            title: 'Privacy',
            onTap: () {
              // Navigate to privacy settings
            },
          ),
          _buildSettingsItem(
            icon: Icons.security,
            title: 'Security',
            onTap: () {
              // Navigate to security settings
            },
          ),
          _buildSettingsItem(
            icon: Icons.notifications,
            title: 'Notifications',
            onTap: () {
              // Navigate to notification settings
            },
          ),
          
          const SizedBox(height: 20),
          
          // Chat Section
          _buildSectionTitle('Chats'),
          _buildSettingsItem(
            icon: Icons.chat,
            title: 'Chat Settings',
            onTap: () {
              // Navigate to chat settings
            },
          ),
          _buildSettingsItem(
            icon: Icons.storage,
            title: 'Storage and Data',
            onTap: () {
              // Navigate to storage settings
            },
          ),
          _buildSettingsItem(
            icon: Icons.backup,
            title: 'Chat Backup',
            onTap: () {
              // Navigate to backup settings
            },
          ),
          
          const SizedBox(height: 20),
          
          // Help Section
          _buildSectionTitle('Help'),
          _buildSettingsItem(
            icon: Icons.help,
            title: 'Help Center',
            onTap: () {
              // Navigate to help center
            },
          ),
          _buildSettingsItem(
            icon: Icons.info,
            title: 'About',
            onTap: () {
              // Navigate to about page
            },
          ),
          
          const SizedBox(height: 20),
          
          // Logout
          _buildSettingsItem(
            icon: Icons.logout,
            title: 'Logout',
            textColor: AppConstants.errorColor,
            onTap: () {
              _showLogoutDialog(context, ref);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 8),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: AppConstants.textSecondaryColor,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  Widget _buildSettingsItem({
    required IconData icon,
    required String title,
    VoidCallback? onTap,
    Color? textColor,
  }) {
    return Container(
      color: Colors.white,
      child: ListTile(
        leading: Icon(
          icon,
          color: textColor ?? AppConstants.primaryColor,
        ),
        title: Text(
          title,
          style: TextStyle(
            color: textColor ?? AppConstants.textPrimaryColor,
            fontSize: 16,
          ),
        ),
        trailing: const Icon(
          Icons.arrow_forward_ios,
          size: 16,
          color: AppConstants.textLightColor,
        ),
        onTap: onTap,
      ),
    );
  }

  void _showLogoutDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
            },
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              ref.read(authProvider.notifier).logout();
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(builder: (context) => const LoginPage()),
                (route) => false,
              );
            },
            child: const Text(
              'Logout',
              style: TextStyle(color: AppConstants.errorColor),
            ),
          ),
        ],
      ),
    );
  }
}