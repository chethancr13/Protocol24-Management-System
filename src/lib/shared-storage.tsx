import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

// Define the shape of our global activity feed
export interface ActivityLog {
  id: string;
  userName: string;
  role: string;
  action: string;
  timestamp: number;
}

export interface SharedHackathonState {
  participants: any[];
  teams: any[];
  submissions: any[];
  expenses: any[];
  logistics: any[];
  seating: any[];
  activityFeed: ActivityLog[];
  presence: Record<string, { lastSeen: number; currentModule: string; role: string }>;
  volunteers: any[];
}

const DEFAULT_STATE: SharedHackathonState = {
  participants: [],
  teams: [],
  submissions: [],
  expenses: [],
  logistics: [],
  seating: [],
  activityFeed: [],
  presence: {},
  volunteers: []
};

const LOCAL_STORAGE_KEY = 'protocol24_local_state';

interface SharedStateContextType {
  state: SharedHackathonState;
  updateState: (updater: (prev: SharedHackathonState) => SharedHackathonState, actionDescription?: string) => Promise<void>;
  updatePresence: (module: string) => void;
  refresh: () => Promise<void>;
  loading: boolean;
  syncStatus: 'connected' | 'error' | 'syncing';
}

const SharedStateContext = createContext<SharedStateContextType | undefined>(undefined);

export const SharedStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SharedHackathonState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'connected' | 'error' | 'syncing'>('connected');
  const isLoadedRef = useRef(false);
  const stateRef = useRef<SharedHackathonState>(DEFAULT_STATE);

  // Sync ref with state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const loadFromLocal = useCallback(() => {
    setLoading(true);
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState(parsed);
        stateRef.current = parsed;
      } else {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_STATE));
      }
    } catch (err) {
      console.error('Error loading state:', err);
      toast.error('Failed to load local state');
    } finally {
      setLoading(false);
      isLoadedRef.current = true;
    }
  }, []);

  useEffect(() => {
    loadFromLocal();
  }, [loadFromLocal]);

  const updateState = async (updater: (prev: SharedHackathonState) => SharedHackathonState, actionDescription?: string) => {
    if (!isLoadedRef.current) return;

    const currentUser = JSON.parse(localStorage.getItem('protocol24-user') || '{}');
    const nextState = updater(stateRef.current);
    
    // Inject activity log
    if (actionDescription && currentUser.name) {
      const newLog: ActivityLog = {
        id: Math.random().toString(36).substr(2, 9),
        userName: currentUser.name,
        role: currentUser.role,
        action: actionDescription,
        timestamp: Date.now()
      };
      nextState.activityFeed = [newLog, ...nextState.activityFeed].slice(0, 100);
    }

    // Persist to Local Storage
    try {
      setState(nextState);
      stateRef.current = nextState;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextState));
    } catch (err) {
      console.error('Local save error:', err);
      toast.error('Failed to save changes');
    }
  };

  const updatePresence = (module: string) => {
    const user = JSON.parse(localStorage.getItem('protocol24-user') || '{}');
    if (!user.name) return;

    updateState(prev => ({
        ...prev,
        presence: {
            ...prev.presence,
            [user.name]: {
                lastSeen: Date.now(),
                currentModule: module,
                role: user.role
            }
        }
    }));
  };

  return (
    <SharedStateContext.Provider value={{ state, updateState, updatePresence, refresh: () => Promise.resolve(loadFromLocal()), loading, syncStatus }}>
      {children}
    </SharedStateContext.Provider>
  );
};

export const useSharedState = () => {
  const context = useContext(SharedStateContext);
  if (context === undefined) {
    throw new Error('useSharedState must be used within a SharedStateProvider');
  }
  return context;
};
