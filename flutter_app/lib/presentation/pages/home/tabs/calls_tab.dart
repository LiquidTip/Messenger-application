import 'package:flutter/material.dart';
import '../../core/constants/app_constants.dart';

class CallsTab extends StatelessWidget {
  const CallsTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Calls'),
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
              Icons.call,
              size: 80,
              color: AppConstants.textLightColor,
            ),
            SizedBox(height: 20),
            Text(
              'No call history',
              style: TextStyle(
                fontSize: 20,
                color: AppConstants.textSecondaryColor,
                fontWeight: FontWeight.w500,
              ),
            ),
            SizedBox(height: 10),
            Text(
              'Tap the + button to make a call',
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
              title: const Text('Call Settings'),
              onTap: () {
                Navigator.pop(context);
                // Navigate to call settings
              },
            ),
            ListTile(
              leading: const Icon(Icons.history),
              title: const Text('Call History'),
              onTap: () {
                Navigator.pop(context);
                // Navigate to call history
              },
            ),
          ],
        ),
      ),
    );
  }
}