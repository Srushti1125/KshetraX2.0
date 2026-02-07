import React, { createContext, useState, useEffect, useContext } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { OfflineService } from '@/services/offline.service';

interface OfflineContextType {
  isOnline: boolean;
  pendingSyncCount: number;
  syncOfflineData: () => Promise<void>;
  refreshPendingCount: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected ?? false;
      setIsOnline(online);

      if (online) {
        syncOfflineData();
      }
    });

    refreshPendingCount();

    return () => unsubscribe();
  }, []);

  const refreshPendingCount = async () => {
    const count = await OfflineService.getPendingSyncCount();
    setPendingSyncCount(count);
  };

  const syncOfflineData = async () => {
    try {
      const result = await OfflineService.syncOfflineRecords();
      await refreshPendingCount();
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        pendingSyncCount,
        syncOfflineData,
        refreshPendingCount,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}
