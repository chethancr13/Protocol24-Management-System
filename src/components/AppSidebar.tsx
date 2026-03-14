import { NavLink as RouterNavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UserPlus, Users, Layers, Zap, X, FileCode2, Grid2X2, ClipboardCheck, Wallet, Package, LogOut, ShieldCheck } from 'lucide-react';

const navItems = [
  { title: 'Dashboard', path: '/', icon: LayoutDashboard },
  { title: 'Register', path: '/register', icon: UserPlus },
  { title: 'Participants', path: '/participants', icon: Users },
  { title: 'Teams', path: '/teams', icon: Layers },
  { title: 'Project Submissions', path: '/project-submissions', icon: FileCode2 },
  { title: 'Seating Chart', path: '/seating', icon: Grid2X2 },
  { title: 'Team Check-In', path: '/team-checkin', icon: ClipboardCheck },
  { title: 'Expenses', path: '/expenses', icon: Wallet },
  { title: 'Goods & Logistics', path: '/logistics', icon: Package },
  { title: 'Volunteers', path: '/volunteers', icon: ShieldCheck },
];

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
}

const AppSidebar = ({ open, onClose, isMobile }: AppSidebarProps) => {
  const location = useLocation();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen w-64 flex flex-col bg-sidebar border-r border-border z-50 transition-transform duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground tracking-tight">PROTOCOL 24</h1>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase">by NullPoint</p>
          </div>
        </div>
        {isMobile && (
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted/50 text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <RouterNavLink
              key={item.path}
              to={item.path}
              onClick={() => isMobile && onClose()}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-primary/15 text-primary shadow-lg shadow-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/20'
                    : 'bg-muted group-hover:bg-muted/80'
                }`}
              >
                <item.icon className="w-4 h-4" />
              </div>
              <span>{item.title}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-glow-pulse" />
              )}
            </RouterNavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border">
        <div className="glass-card rounded-xl p-3 text-center mb-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Powered by</p>
          <p className="text-xs font-semibold gradient-text">PROTOCOL 24 Core</p>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('protocol24-auth');
            window.location.href = '/login';
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-sm font-semibold hover:bg-destructive/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout Session
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
