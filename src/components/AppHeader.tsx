import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, LogOut, Activity } from 'lucide-react';
import { toast } from 'sonner';
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
  const { state, updatePresence, refresh, syncStatus } = useSharedState();
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
      <header className="h-16 border-b border-[#E2E8F0] flex items-center justify-between px-4 md:px-8 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3">
          {isMobile && (
            <button onClick={onMenuToggle} className="p-2 rounded-md hover:bg-[#F1F5F9] text-[#64748B]">
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-[17px] font-semibold text-[#1B2533]">{title}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          {!isMobile ? (
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] transition-colors group-focus-within:text-[#106292]" />
              <input 
                onClick={() => setOpen(true)}
                readOnly
                placeholder="Search everything..."
                className="w-64 h-9 pl-9 pr-4 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#475569] cursor-pointer hover:bg-white hover:border-[#CBD5E1] transition-all focus:outline-none"
              />
              <kbd className="absolute right-3 top-1.5 text-[10px] text-[#94A3B8] font-bold">⌘K</kbd>
            </div>
          ) : (
            <button onClick={() => setOpen(true)} className="p-2 rounded-md hover:bg-[#F1F5F9] text-[#64748B]">
              <Search className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-4">
            {/* Presence Indicators */}
            {activeUsers.length > 0 && (
              <div className="hidden lg:flex items-center -space-x-1.5 mr-1">
                {activeUsers.map(([name, data]) => (
                  <div 
                    key={name}
                    className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                    style={{ backgroundColor: (TEAM_ACCOUNTS[data.role as any] || {color: '#888'}).color }}
                    title={`${name} is editing ${data.currentModule}`}
                  >
                    {name.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 pr-2">
              <div 
                className="w-8 h-8 rounded-md flex items-center justify-center border border-[#E2E8F0] bg-[#F8FAFC]"
              >
                <span className="text-[11px] font-bold text-[#106292]">
                  {currentUser.name ? currentUser.name.split(' ').map((n: string) => n[0]).join('') : 'NP'}
                </span>
              </div>
              {!isMobile && (
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#1B2533] leading-tight">{currentUser.name || 'NullPoint User'}</span>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wide">
                    {currentUser.role || 'Member'}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                localStorage.removeItem('protocol24-auth');
                localStorage.removeItem('protocol24-user');
                navigate('/login');
                toast.success('Signed out safely');
              }}
              className="p-2 rounded-md text-[#64748B] hover:text-[#EF4444] hover:bg-[#FEE2E2]/30 transition-colors"
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
