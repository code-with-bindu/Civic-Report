import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

/**
 * useRealtimeUpdates — Hook to listen and respond to real-time updates
 */
export const useRealtimeUpdates = (callbacks = {}) => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for issue verification updates
    if (callbacks.onIssueVerified) {
      socket.on('issueVerificationUpdated', (data) => {
        console.log('🔴 Real-time: Issue verified', data);
        callbacks.onIssueVerified(data);
      });
    }

    // Listen for issue assignment updates
    if (callbacks.onIssueAssigned) {
      socket.on('issueAssignmentUpdated', (data) => {
        console.log('📋 Real-time: Issue assigned', data);
        callbacks.onIssueAssigned(data);
      });
    }

    // Listen for issue status changes
    if (callbacks.onStatusChange) {
      socket.on('issueStatusChange', (data) => {
        console.log('🔧 Real-time: Status changed', data);
        callbacks.onStatusChange(data);
      });
    }

    // Listen for new issues
    if (callbacks.onNewIssue) {
      socket.on('newIssueAlert', (data) => {
        console.log('🆕 Real-time: New issue created', data);
        callbacks.onNewIssue(data);
      });
    }

    // Listen for assignment notifications
    if (callbacks.onAssignmentNotification) {
      socket.on('issueAssignmentNotification', (data) => {
        console.log('📌 Real-time: Assignment notification', data);
        callbacks.onAssignmentNotification(data);
      });
    }

    // Cleanup
    return () => {
      if (callbacks.onIssueVerified) {
        socket.off('issueVerificationUpdated');
      }
      if (callbacks.onIssueAssigned) {
        socket.off('issueAssignmentUpdated');
      }
      if (callbacks.onStatusChange) {
        socket.off('issueStatusChange');
      }
      if (callbacks.onNewIssue) {
        socket.off('newIssueAlert');
      }
      if (callbacks.onAssignmentNotification) {
        socket.off('issueAssignmentNotification');
      }
    };
  }, [socket, isConnected, callbacks]);

  return { socket, isConnected };
};
