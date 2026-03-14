import { useState, useEffect, useCallback } from 'react';
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

// Mocking window.storage since we're in a regular browser/node env, 
// but wrapping it for the USER'S target environment compatibility.
const getGlobalStorage = () => {
    // @ts-ignore
    return (window.storage as any) || {
        get: (key: string, shared: boolean) => {
            const val = localStorage.getItem(key);
            return val ? JSON.parse(val) : null;
        },
        set: (key: string, value: any, shared: boolean) => {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        }
    };
};

export const useSharedState = () => {
  const [state, setState] = useState<SharedHackathonState>(() => {
    const saved = getGlobalStorage().get('hackathon_state', true);
    return saved || DEFAULT_STATE;
  });

  const poll = useCallback(() => {
    const remote = getGlobalStorage().get('hackathon_state', true);
    if (remote) {
        const parsed = remote;
        // Only update if timestamps or content actually differ to avoid unnecessary re-renders
        if (JSON.stringify(parsed) !== JSON.stringify(state)) {
            setState(parsed);
        }
    }
  }, [state]);

  useEffect(() => {
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [poll]);

  const updateState = (updater: (prev: SharedHackathonState) => SharedHackathonState, actionDescription?: string) => {
    const currentUser = JSON.parse(localStorage.getItem('protocol24-user') || '{}');
    
    setState(prev => {
      const next = updater(prev);
      
      // Inject activity log if provided
      if (actionDescription && currentUser.name) {
        const newLog: ActivityLog = {
          id: Math.random().toString(36).substr(2, 9),
          userName: currentUser.name,
          role: currentUser.role,
          action: actionDescription,
          timestamp: Date.now()
        };
        next.activityFeed = [newLog, ...next.activityFeed].slice(0, 20);
      }
      
      getGlobalStorage().set('hackathon_state', next, true);
      return next;
    });
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

  return { state, updateState, updatePresence };
};
