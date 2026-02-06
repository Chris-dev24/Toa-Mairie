import { useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import useAuthStore from '../store/auth';

/**
 * Custom hook for Socket.io real-time communication
 * Handles authentication, reconnection, and event subscriptions
 * 
 * Usage:
 * const socket = useSocket();
 * socket.emit('join_conversation', conversationId);
 * socket.on('message_received', (message) => {...});
 */
const useSocket = () => {
  const socketRef = useRef(null);
  const { token, user } = useAuthStore();
  const reconnectTimeoutRef = useRef(null);

  // Initialize Socket.io connection
  useEffect(() => {
    if (!token || !user) return;

    try {
      const socketURL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
      
      // Create socket with authentication
      socketRef.current = io(socketURL, {
        auth: {
          token: token
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 10,
        transports: ['websocket', 'polling'],
        withCredentials: true
      });

      // Connection events
      socketRef.current.on('connect', () => {
        console.log('Socket connected:', socketRef.current.id);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      socketRef.current.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts');
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    } catch (error) {
      console.error('Failed to initialize socket:', error);
    }
  }, [token, user]);

  // Get socket instance or null if not ready
  const socket = socketRef.current;

  return socket;
};

/**
 * Hook to subscribe to a conversation in real-time
 */
export const useConversationSocket = (conversationId) => {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit('join_conversation', conversationId);

    return () => {
      socket.emit('leave_conversation', conversationId);
    };
  }, [socket, conversationId]);

  return socket;
};

/**
 * Hook to subscribe to project updates in real-time
 */
export const useProjectSocket = (projectId) => {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !projectId) return;

    socket.emit('subscribe_project', projectId);

    return () => {
      socket.emit('unsubscribe_project', projectId);
    };
  }, [socket, projectId]);

  return socket;
};

/**
 * Hook to subscribe to task updates in real-time
 */
export const useTaskSocket = (taskId) => {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !taskId) return;

    socket.emit('subscribe_task', taskId);

    return () => {
      socket.emit('unsubscribe_task', taskId);
    };
  }, [socket, taskId]);

  return socket;
};

/**
 * Hook for typing indicators
 */
export const useTypingIndicator = (conversationId) => {
  const socket = useSocket();
  const typingTimeoutRef = useRef(null);

  const setTyping = useCallback((isTyping) => {
    if (!socket || !conversationId) return;

    if (isTyping) {
      socket.emit('typing', { conversationId, isTyping: true });
      
      // Auto-stop typing after 5 seconds of inactivity
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { conversationId, isTyping: false });
      }, 5000);
    } else {
      socket.emit('typing', { conversationId, isTyping: false });
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  }, [socket, conversationId]);

  return { setTyping, socket };
};

export default useSocket;
