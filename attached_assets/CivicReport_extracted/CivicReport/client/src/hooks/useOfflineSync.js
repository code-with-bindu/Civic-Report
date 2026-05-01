import { useEffect, useState } from 'react';
import api from '../utils/api';
import {
    deletePendingIssue,
    deletePendingVote,
    getPendingIssues,
    getPendingVotes,
} from '../utils/db';

/**
 * useOfflineSync — Custom hook for offline detection and data synchronization
 */
export const useOfflineSync = (userToken) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'syncing', 'completed', 'error'
  const [pendingCount, setPendingCount] = useState(0);

  // Detect online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Back online!');
      setIsOnline(true);
      setSyncStatus('idle');
      // Auto-sync when back online
      syncOfflineData();
    };

    const handleOffline = () => {
      console.log('📡 Went offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Get pending items count
  useEffect(() => {
    const updatePendingCount = async () => {
      try {
        const issues = await getPendingIssues();
        const votes = await getPendingVotes();
        setPendingCount(issues.length + votes.length);
      } catch (err) {
        console.error('Error getting pending count:', err);
      }
    };

    updatePendingCount();
  }, []);

  /**
   * Sync offline data when back online
   */
  const syncOfflineData = async () => {
    if (!isOnline || !userToken) return;

    try {
      setSyncStatus('syncing');

      // Sync pending issues
      const pendingIssues = await getPendingIssues();
      for (const issue of pendingIssues) {
        try {
          const formData = new FormData();
          formData.append('title', issue.title);
          formData.append('description', issue.description);
          formData.append('category', issue.category);
          formData.append('location', issue.location);
          formData.append('isUrgent', issue.isUrgent);

          if (issue.latitude && issue.longitude) {
            formData.append('latitude', issue.latitude);
            formData.append('longitude', issue.longitude);
          }

          // Handle media files if they exist
          if (issue.media && issue.media.length > 0) {
            issue.media.forEach((file, index) => {
              formData.append(`media`, file);
            });
          }

          await api.post('/tickets/create', formData, {
            headers: {
              Authorization: `Bearer ${userToken}`,
              'Content-Type': 'multipart/form-data',
            },
          });

          // Delete from offline queue after successful sync
          await deletePendingIssue(issue.id);
          console.log('✅ Synced issue:', issue.title);
        } catch (err) {
          console.error('❌ Failed to sync issue:', err);
        }
      }

      // Sync pending votes
      const pendingVotes = await getPendingVotes();
      for (const vote of pendingVotes) {
        try {
          await api.post(
            `/tickets/${vote.ticketId}/verify`,
            { isHelpful: vote.isHelpful },
            {
              headers: {
                Authorization: `Bearer ${userToken}`,
              },
            }
          );

          // Delete from offline queue after successful sync
          await deletePendingVote(vote.id);
          console.log('✅ Synced vote for issue:', vote.ticketId);
        } catch (err) {
          console.error('❌ Failed to sync vote:', err);
        }
      }

      // Update pending count
      const remainingIssues = await getPendingIssues();
      const remainingVotes = await getPendingVotes();
      setPendingCount(remainingIssues.length + remainingVotes.length);

      setSyncStatus('completed');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (err) {
      console.error('Sync error:', err);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  return {
    isOnline,
    syncStatus,
    pendingCount,
    syncOfflineData,
  };
};
