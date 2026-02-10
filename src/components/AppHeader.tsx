import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu } from 'lucide-react';
import { Participant } from '@/types/hackathon';
import { useLocalStorage } from '@/hooks/useLocalStorage';
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
  '/': 'Dashboard',
  '/register': 'Register Participant',
  '/participants': 'Participants',
  '/teams': 'Team Management',
};

const pages = [
  { name: 'Dashboard', path: '/' },
  { name: 'Register Participant', path: '/register' },
  { name: 'Participants', path: '/participants' },
  { name: 'Team Management', path: '/teams' },
];

interface AppHeaderProps {
  onMenuToggle: () => void;
  isMobile: boolean;
}

const AppHeader = ({ onMenuToggle, isMobile }: AppHeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const title = pageTitles[location.pathname] || 'Dashboard';
  const [open, setOpen] = useState(false);
  const [participants] = useLocalStorage<Participant[]>('hackathon-participants', []);

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
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">AD</span>
            </div>
            {!isMobile && <span className="text-sm font-medium text-foreground">Vaishnavi Deshpande</span>}
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
