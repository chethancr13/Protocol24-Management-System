import { NavLink as RouterNavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UserPlus, Users, Layers, Zap, X, FileCode2, Grid2X2, ClipboardCheck, Wallet, Package, LogOut, ShieldCheck, ScrollText } from 'lucide-react';

const navItems = [
  { title: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Register', path: '/admin/register', icon: UserPlus },
  { title: 'Participants', path: '/admin/participants', icon: Users },
  { title: 'Teams', path: '/admin/teams', icon: Layers },
  { title: 'Project Submissions', path: '/admin/project-submissions', icon: FileCode2 },
  { title: 'Seating Chart', path: '/admin/seating', icon: Grid2X2 },
  { title: 'Team Check-In', path: '/admin/team-checkin', icon: ClipboardCheck },
  { title: 'Expenses', path: '/admin/expenses', icon: Wallet },
  { title: 'Goods & Logistics', path: '/admin/logistics', icon: Package },
  { title: 'Volunteers', path: '/admin/volunteers', icon: ShieldCheck },
  { title: 'Audit Logs', path: '/admin/logs', icon: ScrollText },
];

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
}

const AppSidebar = ({ open, onClose, isMobile }: AppSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen w-[260px] flex flex-col bg-[#F8FAFC] border-r border-[#E2E8F0] z-50 transition-transform duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-[22px] border-b border-[#E2E8F0]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[#106292] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#1B2533] tracking-tight">PROTOCOL 24</h1>
          </div>
        </div>
        {isMobile && (
          <button onClick={onClose} className="p-1 rounded-md hover:bg-[#F1F5F9] text-[#64748B]">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-[2px] overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <RouterNavLink
              key={item.path}
              to={item.path}
              onClick={() => isMobile && onClose()}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors group ${
                isActive
                  ? 'bg-white text-[#106292] shadow-sm ring-1 ring-[#106292]/10'
                  : 'text-[#475569] hover:text-[#1B2533] hover:bg-[#F1F5F9]'
              }`}
            >
              <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-[#106292]' : 'text-[#94A3B8] group-hover:text-[#64748B]'}`} />
              <span>{item.title}</span>
              {isActive && (
                <div className="ml-auto w-1 h-3 rounded-full bg-[#106292]" />
              )}
            </RouterNavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-6 border-t border-[#E2E8F0] bg-white">
        <button
          onClick={() => {
            localStorage.removeItem('protocol24-auth');
            localStorage.removeItem('protocol24-user');
            navigate('/login');
          }}
          className="w-full h-10 flex items-center justify-center gap-2 px-4 rounded-md border border-[#E2E8F0] text-[#64748B] text-xs font-semibold hover:bg-[#F8FAFC] hover:text-[#EF4444] hover:border-[#FEE2E2] transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
