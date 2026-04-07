import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const NotificationHandler = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:5000');

      socket.on(`notification-${user._id}`, (notification) => {
        toast.info(notification.message, {
          description: 'Recruitment System Update',
        });
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  return null;
};

export default NotificationHandler;
