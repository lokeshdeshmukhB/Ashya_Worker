import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
      
      newSocket.on('connect', () => {
        console.log('Socket connected');
        newSocket.emit('join', user.id);
      });

      // Listen for new patient assignments (for doctors)
      newSocket.on('new_patient', (data) => {
        toast.info(`New patient assigned: ${data.patient.fullName}`);
      });

      // Listen for diagnosis updates (for Asha workers)
      newSocket.on('diagnosis_completed', (data) => {
        toast.success(`Diagnosis completed for ${data.patient.fullName}`);
      });

      newSocket.on('diagnosis_updated', (data) => {
        toast.info('Diagnosis has been updated');
      });

      // Listen for status updates (for Asha workers)
      newSocket.on('patient_status_updated', (data) => {
        toast.info('Patient status updated');
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
