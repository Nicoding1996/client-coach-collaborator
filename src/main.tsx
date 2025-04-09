import React from 'react'; // Import React for StrictMode
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext'; // Import AuthProvider
import { WebSocketProvider } from './contexts/WebSocketContext'; // Import WebSocketProvider

// Correct Provider Nesting
createRoot(document.getElementById("root")!).render(
  <React.StrictMode> {/* Optional: Keep or remove StrictMode as needed */}
    <AuthProvider>
      <WebSocketProvider>
        <App />
      </WebSocketProvider>
    </AuthProvider>
  </React.StrictMode>
);
