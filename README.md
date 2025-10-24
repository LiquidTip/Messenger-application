# Secure Messaging Application

A comprehensive, secure, real-time messaging application similar to WhatsApp with end-to-end encryption, voice/video calls, and cross-platform support.

## Features

### Core Messaging
- **Real-time messaging** with WebSocket support
- **End-to-end encryption** using Signal Protocol
- **Group chats** with up to 1024 participants
- **Media sharing** (images, videos, audio, documents, location)
- **Message status** (sent, delivered, read indicators)
- **Message editing and deletion** with time limits
- **Typing indicators** and read receipts

### Voice & Video Calls
- **1-to-1 voice and video calls** using WebRTC
- **Group calls** with up to 32 participants
- **Call history** and logs
- **Real-time call notifications**

### Security & Privacy
- **End-to-end encryption** for all messages
- **Phone number verification** via OTP
- **Privacy settings** for profile visibility and last seen
- **Contact blocking** and reporting
- **Secure key exchange** and management

### Cross-Platform
- **Flutter mobile app** (iOS & Android)
- **Web application** with QR code authentication
- **Desktop support** via Flutter web
- **Responsive design** for all screen sizes

### Additional Features
- **Status/Stories** (24-hour posts)
- **Push notifications** via FCM/APNs
- **Contact synchronization**
- **Message search** and filtering
- **Chat backup** and restore
- **Dark mode** support

## Tech Stack

### Backend
- **NestJS** with TypeScript
- **MongoDB** for data storage
- **Socket.io** for real-time communication
- **JWT** for authentication
- **AWS S3** for media storage
- **Twilio** for SMS/OTP
- **Firebase** for push notifications

### Frontend
- **Flutter** for mobile and web
- **Riverpod** for state management
- **WebRTC** for voice/video calls
- **Socket.io** client for real-time features
- **Hive** for local storage

### Security
- **Signal Protocol** for end-to-end encryption
- **AES-256-GCM** for message encryption
- **RSA-2048** for key exchange
- **bcrypt** for password hashing

## Project Structure

```
├── src/                          # Backend source code
│   ├── auth/                     # Authentication module
│   ├── users/                    # User management
│   ├── messages/                 # Messaging system
│   ├── groups/                   # Group chat functionality
│   ├── calls/                    # Voice/video calls
│   ├── media/                    # Media handling
│   ├── notifications/            # Push notifications
│   ├── websocket/                # Real-time communication
│   └── encryption/               # End-to-end encryption
├── flutter_app/                  # Flutter frontend
│   ├── lib/
│   │   ├── core/                 # Core utilities and constants
│   │   ├── data/                 # Data layer (repositories, models)
│   │   ├── domain/               # Domain layer (entities, use cases)
│   │   └── presentation/         # UI layer (pages, widgets, providers)
│   └── assets/                   # Images, icons, sounds
└── docs/                         # Documentation
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- Flutter SDK (v3.0 or higher)
- Android Studio / Xcode (for mobile development)

### Backend Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB**
   ```bash
   mongod
   ```

4. **Run the backend**
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3000`

### Frontend Setup

1. **Navigate to Flutter app**
   ```bash
   cd flutter_app
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Run the app**
   ```bash
   flutter run
   ```

## API Documentation

The API documentation is available at `http://localhost:3000/api` when the backend is running.

### Key Endpoints

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/send-otp` - Send OTP verification
- `GET /messages/chat/:chatId` - Get chat messages
- `POST /messages` - Send message
- `GET /groups` - Get user groups
- `POST /calls` - Initiate call

## Security Features

### End-to-End Encryption
- All messages are encrypted using AES-256-GCM
- Unique encryption keys for each message
- Signal Protocol for key exchange
- Perfect forward secrecy

### Authentication
- JWT-based authentication
- Phone number verification via OTP
- Secure password hashing with bcrypt
- Session management

### Privacy
- User-controlled privacy settings
- Contact blocking and reporting
- Message deletion and editing
- Read receipt controls

## Deployment

### Backend Deployment
- Deploy to AWS ECS or Kubernetes
- Use MongoDB Atlas for database
- Configure environment variables
- Set up SSL certificates

### Frontend Deployment
- Build Flutter web app for web deployment
- Deploy mobile apps to app stores
- Configure push notification certificates
- Set up CDN for media files

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.