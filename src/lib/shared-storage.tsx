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

const STATE_ID = 'global_hackathon_state';

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
  const [syncStatus, setSyncStatus] = useState<'connected' | 'error' | 'syncing'>('syncing');
  const isLoadedRef = useRef(false);
  const stateRef = useRef<SharedHackathonState>(DEFAULT_STATE);

  // Sync ref with state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const fetchInitialState = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setSyncStatus('syncing');
    
    try {
      const { data, error } = await supabase
        .from('shared_data')
        .select('data')
        .eq('id', STATE_ID)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          await supabase.from('shared_data').insert({ id: STATE_ID, data: DEFAULT_STATE });
          setSyncStatus('connected');
        } else {
          console.error('Error fetching initial state:', error);
          setSyncStatus('error');
        }
      } else if (data) {
        setState(data.data);
        stateRef.current = data.data;
        setSyncStatus('connected');
      }
    } catch (err) {
      console.error('Supabase fetch error:', err);
      setSyncStatus('error');
    } finally {
      if (!isSilent) setLoading(false);
      isLoadedRef.current = true;
    }
  }, []);

  // Initial load and Realtime setup
  useEffect(() => {
    fetchInitialState();

    const channel = supabase
      .channel('shared-state-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shared_data',
          filter: `id=eq.${STATE_ID}`
        },
        (payload) => {
          if (payload.new && (payload.new as any).data) {
            const newData = (payload.new as any).data;
            if (JSON.stringify(newData) !== JSON.stringify(stateRef.current)) {
              setState(newData);
              stateRef.current = newData;
              setSyncStatus('connected');
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setSyncStatus('connected');
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') setSyncStatus('error');
      });

    // Re-sync on tab focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchInitialState(true);
      }
    };
    
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [fetchInitialState]);

  const updateState = async (updater: (prev: SharedHackathonState) => SharedHackathonState, actionDescription?: string) => {
    // CRITICAL: Don't allow updates until we've loaded the current state from Supabase
    if (!isLoadedRef.current) {
        console.warn('Update ignored: State not loaded yet');
        return;
    }

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

    // Optimistic local update
    setState(nextState);
    stateRef.current = nextState;

    // Persist to Supabase
    try {
      const { error } = await supabase
        .from('shared_data')
        .upsert({ 
          id: STATE_ID, 
          data: nextState
        });

      if (error) {
        console.error('Error updating Supabase state:', error);
        toast.error(`Sync error: ${error.message}`);
      }
    } catch (err: any) {
      console.error('Supabase update exception:', err);
      toast.error(`Connection error: ${err.message}`);
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
    <SharedStateContext.Provider value={{ state, updateState, updatePresence, refresh: () => fetchInitialState(), loading, syncStatus }}>
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
