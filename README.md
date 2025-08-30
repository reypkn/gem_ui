# Gem UI - Chat with Gemini

A minimalist, modern chat interface for Google's Gemini AI, built with Next.js and shadcn/ui components.

## Give it a try

Gem UI is available at [gem-ui.vercel.app](https://gem-ui.vercel.app).

## Why This Project Exists

This project started as a personal adaptation of a school assignment, reimagined using technologies I'm passionate about. While the original project focused on basic chat functionality, I wanted to explore modern web development practices and create something more polished and user-friendly.

The goal was to build a clean, professional chat interface that showcases:
- Modern React patterns with Next.js 14
- Beautiful, accessible UI components with shadcn/ui
- Proper state management and data persistence
- Integration with Google's Gemini AI API
- Responsive design principles

It's both a learning exercise and a practical tool for interacting with Gemini AI in a more pleasant environment than basic API calls.

## Features

- **Clean, Minimalist Interface** - Focus on the conversation without distractions
- **Sidebar Navigation** - Manage multiple conversations easily with toggle functionality
- **Persistent Storage** - Conversations and settings saved locally
- **Secure Token Management** - API keys stored securely in browser storage
- **Real-time Chat** - Smooth messaging experience with loading indicators
- **Auto-generated Titles** - Conversations automatically titled from first message
- **Responsive Design** - Works beautifully on desktop and mobile
- **Keyboard Shortcuts** - Press Enter to send messages
- **Dark/Light Mode** - Toggle between themes with persistent preference
- **Conversation Management** - Edit titles inline, delete conversations
- **Sidebar Toggle** - Hide/show sidebar for more screen space

## How It Works

The application is built with a modern Next.js architecture:

### Frontend
- **React 18** with TypeScript for type safety
- **shadcn/ui** components for consistent, accessible UI
- **Tailwind CSS** for utility-first styling
- **Lucide React** for beautiful icons
- **Local state management** with React hooks

### Backend
- **Next.js API Routes** handle communication with Gemini
- **Google Generative AI SDK** for seamless API integration
- **Conversation history** maintained for context-aware responses

### Data Flow
1. User enters message in the chat input
2. Message is sent to `/api/chat` endpoint
3. API route forwards request to Gemini AI with conversation history
4. Response is streamed back and displayed in the chat
5. Conversation is automatically saved to browser storage

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- A Google AI Studio API key (free at [ai.google.dev](https://ai.google.dev))

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/reypkn/gem_ui.git
   cd gem_ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

5. **Configure your API key**
   - Click the settings icon in the sidebar
   - Enter your Gemini API token
   - Start chatting!

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://ai.google.dev)
2. Sign in with your Google account
3. Click "Get API key" 
4. Create a new API key
5. Copy the key and paste it into the app's settings

## Usage

### Starting a New Chat
- Click the "New Chat" button in the sidebar
- Or simply start typing in the message input

### Managing Conversations
- **Edit Titles**: Click the edit button (pencil icon) next to any conversation
- **Delete Conversations**: Click the trash icon to remove unwanted chats
- **Sidebar Toggle**: Use the panel button to hide/show the sidebar
- **Theme Switch**: Toggle between dark/light modes with the sun/moon button

### Keyboard Shortcuts
- **Enter**: Send message
- **Shift+Enter**: New line in message
- **Escape**: Cancel title editing
- **Enter**: Save title when editing

### API Configuration
- Click the settings button (⚙️) to configure your Gemini API token
- Your token is stored locally in your browser
- You only need to enter it once

## Project Structure

```
gem_ui/
├── src/
│   ├── app/
│   │   ├── api/chat/
│   │   │   └── route.ts          # Gemini API integration
│   │   ├── globals.css           # Global styles and CSS variables
│   │   ├── layout.tsx            # Root layout component
│   │   └── page.tsx              # Main chat interface
│   ├── components/ui/            # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── label.tsx
│   │   ├── scroll-area.tsx
│   │   └── separator.tsx
│   └── lib/
│       └── utils.ts              # Utility functions
├── package.json
├── tailwind.config.js
└── README.md
```

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **shadcn/ui** - High-quality, accessible React components
- **Tailwind CSS** - Utility-first CSS framework
- **Google Generative AI** - Official Gemini SDK
- **Lucide React** - Beautiful, consistent icons
- **Radix UI** - Accessible component primitives

## Environment Variables

No environment variables are required. The application stores the Gemini API token locally in the browser.
