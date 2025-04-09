import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext'; // Assuming AuthContext provides user and token

// Define the shape of the context value
interface WebSocketContextType {
  socket: Socket | null;
}

// Create the context with a default value
const WebSocketContext = createContext<WebSocketContextType>({ socket: null });

// Define the WebSocket server URL
// Use Vite's env variables: https://vitejs.dev/guide/env-and-mode.html
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuth(); // Get user from AuthContext

  useEffect(() => {
    let newSocket: Socket | null = null;
    // Retrieve token directly from localStorage
    const token = localStorage.getItem('authToken'); // Assuming token is stored with key 'authToken'

    if (token && user?._id) {
      // Only connect if token and user ID exist
      console.log('WebSocket: Attempting to connect...');
      newSocket = io(SOCKET_URL, {
        // Removed auth.token as socket.io v4+ uses extraHeaders or query for auth
        // If your backend specifically expects `auth: { token }`, uncomment it
        // auth: { token }
        // Consider using query for simple token passing if not sensitive
        query: { token } // Example: pass token via query
      });

      newSocket.on('connect', () => {
        console.log(`WebSocket: Connected with socket ID: ${newSocket?.id}`);
        // Register user with backend upon connection
        console.log(`WebSocket: Emitting 'register_user' for user ID: ${user._id}`);
        newSocket?.emit('register_user', user._id);
      });

      newSocket.on('disconnect', (reason) => {
        console.log(`WebSocket: Disconnected. Reason: ${reason}`);
        // Optional: handle specific disconnection reasons like 'io server disconnect'
      });

      newSocket.on('connect_error', (error) => {
        // Removed error.cause due to TS lib compatibility
        console.error('WebSocket: Connection Error:', error.message);
        // Optional: attempt reconnection or notify user
      });

      // Add listeners for your custom events here if needed globally
      // newSocket.on('some_event', (data) => { ... });

      setSocket(newSocket);

    } else {
      // If no token/user, ensure any existing socket is disconnected
      if (socket) {
        console.log('WebSocket: Disconnecting due to missing token/user.');
        socket.disconnect();
        setSocket(null);
      }
    }

    // Cleanup function
    return () => {
      if (newSocket) {
        console.log('WebSocket: Cleaning up - disconnecting socket.');
        newSocket.disconnect();
      }
       // Set socket to null on cleanup only if it wasn't already nullified by logout
       // This prevents issues if the effect runs again quickly
       // setSocket(null); // Reconsider if this is needed or causes issues on fast re-renders
    };
    // Dependencies: Re-run effect if user ID changes (login/logout)
    // We don't depend on the token directly from localStorage in the dependency array
    // as changes to localStorage don't trigger re-renders automatically.
    // The login/logout flow updating the `user` state in AuthContext is sufficient.
  }, [user?._id]); // Add SOCKET_URL if it could change dynamically (unlikely)

  return (
    <WebSocketContext.Provider value={{ socket }}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Custom hook to use the WebSocket context
export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};