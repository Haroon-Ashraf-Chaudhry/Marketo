import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuthStore();
  const socketRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (!token || !user) return;

    socketRef.current = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
    });

    const socket = socketRef.current;

    socket.on('user:online', ({ userId }) => {
      setOnlineUsers(prev => new Set([...prev, userId]));
    });

    socket.on('user:offline', ({ userId }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    socket.on('notification', (notif) => {
      setNotifications(prev => [notif, ...prev].slice(0, 20));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, user]);

  const joinConversation = (convId) => socketRef.current?.emit('conversation:join', convId);
  const leaveConversation = (convId) => socketRef.current?.emit('conversation:leave', convId);
  const sendSocketMessage = (convId, message) => socketRef.current?.emit('message:send', { conversationId: convId, message });
  const emitTyping = (convId, isTyping) => socketRef.current?.emit(isTyping ? 'typing:start' : 'typing:stop', { conversationId: convId });
  const clearNotifications = () => setNotifications([]);

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      notifications,
      onlineUsers,
      clearNotifications,
      joinConversation,
      leaveConversation,
      sendSocketMessage,
      emitTyping,
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
