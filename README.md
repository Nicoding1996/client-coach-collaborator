# Coaching Portal 2.0

A modern coaching platform for coaches and clients to manage their coaching relationships, sessions, and resources.

## Features

- User authentication (coach and client roles)
- Profile management with avatar upload
- Dashboard for coaches and clients
- Session scheduling and management
- Client management for coaches
- Resource sharing
- Messaging system
- Invoicing and payment tracking

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- MongoDB Atlas account (or local MongoDB instance)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Edit the `.env` file and update your MongoDB connection string:

```
MONGODB_URI=mongodb+srv://CoachingPortal:<YOUR_PASSWORD>@coachportallogin.ewzgoxe.mongodb.net/?retryWrites=true&w=majority&appName=CoachPortalLogin
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
NODE_ENV=development
```

Replace `<YOUR_PASSWORD>` with your actual MongoDB password.

### Running the Application

Run both frontend and backend concurrently:

```bash
npm run dev:full
```

Or run them separately:

- Frontend only: `npm run dev`
- Backend only: `npm run dev:server`

### Building for Production

```bash
npm run build
npm run server
```

## Project Structure

- `/src` - Frontend React application
  - `/components` - UI components
  - `/contexts` - Context providers including authentication
  - `/hooks` - Custom React hooks
  - `/lib` - Utilities and API services
  - `/pages` - Page components

- `/server` - Backend Node.js API
  - `/config` - Configuration files
  - `/controllers` - Request handlers
  - `/middleware` - Express middleware
  - `/models` - MongoDB schema models
  - `/routes` - API routes

## Technologies

- Frontend:
  - React
  - TypeScript
  - Shadcn UI
  - React Router
  - React Query
  - Axios

- Backend:
  - Node.js
  - Express
  - MongoDB
  - Mongoose
  - JWT Authentication

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Project info

**URL**: https://lovable.dev/projects/7b20c0bb-0484-4c1a-b54f-6c073b454cc4

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/7b20c0bb-0484-4c1a-b54f-6c073b454cc4) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/7b20c0bb-0484-4c1a-b54f-6c073b454cc4) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
