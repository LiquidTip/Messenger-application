import 'package:flutter/material.dart';
import '../../core/constants/app_constants.dart';

class StatusTab extends StatelessWidget {
  const StatusTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Status'),
        backgroundColor: AppConstants.primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.more_vert),
            onPressed: () {
              _showMoreOptions(context);
            },
          ),
        ],
      ),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.camera_alt,
              size: 80,
              color: AppConstants.textLightColor,
            ),
            SizedBox(height: 20),
            Text(
              'No status updates',
              style: TextStyle(
                fontSize: 20,
                color: AppConstants.textSecondaryColor,
                fontWeight: FontWeight.w500,
              ),
            ),
            SizedBox(height: 10),
            Text(
              'Tap the + button to share a status',
              style: TextStyle(
                fontSize: 16,
                color: AppConstants.textLightColor,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showMoreOptions(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.settings),
              title: const Text('Status Privacy'),
              onTap: () {
                Navigator.pop(context);
                // Navigate to status privacy settings
              },
            ),
            ListTile(
              leading: const Icon(Icons.history),
              title: const Text('Status History'),
              onTap: () {
                Navigator.pop(context);
                // Navigate to status history
              },
            ),
          ],
        ),
      ),
    );
  }
}