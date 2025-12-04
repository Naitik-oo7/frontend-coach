# Frontend Coach

A real-time chat application frontend built with React, TypeScript, and Vite.

## Features

- User authentication (login, signup)
- Real-time messaging with Socket.IO
- Conversation list and message history
- Message status indicators
- Typing indicators
- Toast notifications
- Firebase Cloud Messaging (FCM) push notifications
- Responsive design with Tailwind CSS

## Technologies Used

- React with TypeScript
- Vite for build tooling
- Socket.IO client for real-time communication
- Axios for HTTP requests
- Tailwind CSS for styling
- Firebase client SDK for push notifications
- React Router for navigation
- React Hot Toast for notifications

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Backend server running (see backend README)
- Firebase project for FCM notifications

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Start the development server: `npm run dev`

### Environment Variables

Copy `.env.example` to `.env` and configure the required variables:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
VITE_FIREBASE_VAPID_KEY=your-vapid-key

VITE_API_BASE_URL=http://localhost:3005
```

## Project Structure

```
src/
├── App.tsx           # Main application component
├── main.tsx          # Application entry point
├── api/              # API clients
├── components/       # Reusable UI components
├── context/          # React context providers
├── hooks/            # Custom React hooks
├── pages/            # Page components
├── services/         # Business logic services
├── styles/           # Global styles
└── utils/            # Utility functions
```

## Firebase Cloud Messaging

This application includes Firebase Cloud Messaging (FCM) integration for push notifications.

See [../backend-coach/FCM_SETUP.md](../backend-coach/FCM_SETUP.md) for detailed setup instructions.

For testing instructions, see [../backend-coach/TESTING_FCM.md](../backend-coach/TESTING_FCM.md).

## Development

### Running the Development Server

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

### Previewing Production Build

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Components

### Authentication

- LoginPage: User login form
- SignUpPage: User registration form

### Chat

- ChatPage: Main chat interface
- ConversationList: List of user conversations
- MessageList: Display of chat messages
- MessageInput: Message composition input

### Utilities

- Toast notifications for user feedback
- Authentication context for managing user state

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License.
