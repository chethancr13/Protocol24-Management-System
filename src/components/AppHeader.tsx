import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, LogOut, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { Participant } from '@/types/hackathon';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useSharedState } from '@/lib/shared-storage';
import { TEAM_ACCOUNTS } from '@/config/team';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';

const pageTitles: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/register': 'Register Participant',
  '/admin/participants': 'Participants',
  '/admin/teams': 'Team Management',
  '/admin/project-submissions': 'Project Submissions',
  '/admin/seating': 'Seating Chart',
  '/admin/team-checkin': 'Team Check-In',
  '/admin/expenses': 'Expenses',
  '/admin/logistics': 'Goods & Logistics',
  '/admin/volunteers': 'Volunteers',
  '/admin/logs': 'Audit Logs',
};

const pages = [
  { name: 'Dashboard', path: '/admin/dashboard' },
  { name: 'Register Participant', path: '/admin/register' },
  { name: 'Participants', path: '/admin/participants' },
  { name: 'Team Management', path: '/admin/teams' },
  { name: 'Project Submissions', path: '/admin/project-submissions' },
  { name: 'Seating Chart', path: '/admin/seating' },
  { name: 'Team Check-In', path: '/admin/team-checkin' },
  { name: 'Expenses', path: '/admin/expenses' },
  { name: 'Goods & Logistics', path: '/admin/logistics' },
  { name: 'Volunteers', path: '/admin/volunteers' },
  { name: 'Audit Logs', path: '/admin/logs' },
];

interface AppHeaderProps {
  onMenuToggle: () => void;
  isMobile: boolean;
  onActivityToggle?: () => void;
  activityVisible?: boolean;
}

const AppHeader = ({ onMenuToggle, isMobile, onActivityToggle, activityVisible }: AppHeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const title = pageTitles[location.pathname] || 'Dashboard';
  const [open, setOpen] = useState(false);
  const { state, updatePresence } = useSharedState();
  const participants = state.participants || [];
  const currentUser = JSON.parse(localStorage.getItem('protocol24-user') || '{}');

  useEffect(() => {
    updatePresence(title);
    const interval = setInterval(() => updatePresence(title), 5000);
    return () => clearInterval(interval);
  }, [title]);

  const activeUsers = Object.entries(state.presence || {})
    .filter(([name, data]) => name !== currentUser.name && (Date.now() - data.lastSeen < 10000))
    .slice(0, 3);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <>
      <header className="h-16 border-b border-border flex items-center justify-between px-4 md:px-8 glass">
        <div className="flex items-center gap-3">
          {isMobile && (
            <button onClick={onMenuToggle} className="p-2 rounded-xl hover:bg-muted/50 text-muted-foreground">
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            {!isMobile && <p className="text-xs text-muted-foreground">Hackathon Command Center</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          {!isMobile ? (
            <button
              onClick={() => setOpen(true)}
              className="relative flex items-center w-56 h-9 pl-9 pr-4 rounded-xl bg-muted/50 border border-border text-sm text-muted-foreground hover:bg-muted/80 transition-all cursor-pointer"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <span>Quick search...</span>
              <kbd className="ml-auto text-[10px] bg-muted/80 px-1.5 py-0.5 rounded border border-border">⌘K</kbd>
            </button>
          ) : (
            <button onClick={() => setOpen(true)} className="p-2 rounded-xl hover:bg-muted/50 text-muted-foreground">
              <Search className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-3">
            {/* Presence Indicators */}
            {activeUsers.length > 0 && (
              <div className="hidden lg:flex items-center -space-x-2 mr-2">
                {activeUsers.map(([name, data]) => (
                  <div 
                    key={name}
                    className="w-7 h-7 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-1 ring-border/10 transition-transform hover:translate-y-[-2px] cursor-help"
                    style={{ backgroundColor: (TEAM_ACCOUNTS[data.role as any] || {color: '#888'}).color }}
                    title={`${name} is editing ${data.currentModule}`}
                  >
                    {name.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
            )}

            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center ring-2 ring-background shadow-inner"
              style={{ backgroundColor: (TEAM_ACCOUNTS[currentUser.role as any] || {color: '#888'}).color + '33' }}
            >
              <span className="text-xs font-bold" style={{ color: (TEAM_ACCOUNTS[currentUser.role as any] || {color: '#888'}).color }}>
                {currentUser.name ? currentUser.name.split(' ').map((n: string) => n[0]).join('') : 'NP'}
              </span>
            </div>
            {!isMobile && (
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">{currentUser.name || 'NullPoint'}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider leading-none" style={{ color: (TEAM_ACCOUNTS[currentUser.role as any] || {color: '#888'}).color }}>
                  {currentUser.role || 'Super Admin'}
                </span>
              </div>
            )}
            {!isMobile && onActivityToggle && (
              <button
                onClick={onActivityToggle}
                className={`p-2 rounded-xl border transition-all ${
                  activityVisible 
                    ? 'bg-primary/10 border-primary/20 text-primary' 
                    : 'border-border text-muted-foreground hover:bg-muted/50'
                }`}
                title={activityVisible ? "Hide Activity Feed" : "Show Activity Feed"}
              >
                <Activity className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => {
                localStorage.removeItem('protocol24-auth');
                localStorage.removeItem('protocol24-user');
                localStorage.removeItem('hackathon_teams');
                localStorage.removeItem('hackathon_seats');
                navigate('/login');
                toast.success('Session Terminated');
              }}
              className="ml-2 p-2 rounded-xl border border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all text-muted-foreground"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages, participants..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            {pages.map(p => (
              <CommandItem
                key={p.path}
                onSelect={() => { navigate(p.path); setOpen(false); }}
              >
                {p.name}
              </CommandItem>
            ))}
          </CommandGroup>
          {participants.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Participants">
                {participants.map(p => (
                  <CommandItem
                    key={p.id}
                    onSelect={() => { navigate('/participants'); setOpen(false); }}
                  >
                    <span>{p.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{p.track}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default AppHeader;
