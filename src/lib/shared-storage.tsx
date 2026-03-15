import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from './supabase';

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
const PROJECT_ID = 'main-project';

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

  const loadFromCloud = useCallback(async () => {
    setLoading(true);
    setSyncStatus('syncing');
    try {
      // 1. Try cloud first
      const { data, error } = await supabase
        .from('shared_data')
        .select('data')
        .eq('project_id', PROJECT_ID)
        .single();

      if (error) {
        console.error('Supabase Load Error:', error);
        throw error;
      }

      if (data && data.data && Object.keys(data.data).length > 0) {
        setState(data.data as SharedHackathonState);
        stateRef.current = data.data as SharedHackathonState;
        // Keep local storage updated as a backup
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.data));
        setSyncStatus('connected');
      } else {
        // 2. If cloud is empty, fallback to local and push to cloud
        console.log('Cloud state empty, attempting local migration...');
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setState(parsed);
          stateRef.current = parsed;
          const { error: upsertError } = await supabase
            .from('shared_data')
            .upsert(
                { project_id: PROJECT_ID, data: parsed }, 
                { onConflict: 'project_id' }
            );
          if (upsertError) console.error('Initial migration failed:', upsertError);
        } else {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_STATE));
        }
      }
    } catch (err: any) {
      console.error('Detailed Load Error:', err);
      // Fallback to local
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setState(JSON.parse(saved));
      }
      setSyncStatus('error');
    } finally {
      setLoading(false);
      isLoadedRef.current = true;
    }
  }, []);

  useEffect(() => {
    loadFromCloud();

    // Set up Realtime Subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'shared_data',
          filter: `project_id=eq.${PROJECT_ID}`
        },
        (payload) => {
          if (payload.new && payload.new.data) {
            const newState = payload.new.data as SharedHackathonState;
            setState(newState);
            stateRef.current = newState;
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadFromCloud]);

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

    // Persist to Cloud & Local Storage
    try {
      setState(nextState);
      stateRef.current = nextState;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextState));
      
      const { error } = await supabase
        .from('shared_data')
        .upsert(
            { project_id: PROJECT_ID, data: nextState }, 
            { onConflict: 'project_id' }
        );

      if (error) {
        console.error('Supabase Upsert Error:', error);
        throw error;
      }
    } catch (err: any) {
      console.error('Save error details:', err);
      toast.error(`Sync failure: ${err.message || 'working locally'}`);
      setSyncStatus('error');
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
    <SharedStateContext.Provider value={{ state, updateState, updatePresence, refresh: loadFromCloud, loading, syncStatus }}>
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
