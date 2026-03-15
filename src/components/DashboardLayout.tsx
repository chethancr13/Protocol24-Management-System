import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import ActivityFeed from './ActivityFeed';
import GlobalAlerts from './GlobalAlerts';
import { useIsMobile } from '@/hooks/use-mobile';

const DashboardLayout = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showActivity, setShowActivity] = useState(true);

  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AppSidebar open={!isMobile || sidebarOpen} onClose={() => setSidebarOpen(false)} isMobile={isMobile} />

      <div className={`${isMobile ? 'ml-0' : `ml-[260px] ${showActivity ? 'mr-[300px]' : 'mr-0'}`} flex flex-col min-h-screen transition-all duration-300`}>
        <AppHeader 
            onMenuToggle={() => setSidebarOpen(prev => !prev)} 
            isMobile={isMobile} 
            onActivityToggle={() => setShowActivity(prev => !prev)}
            activityVisible={showActivity}
        />
        <main className="flex-1 p-4 md:p-8 overflow-auto bg-[#F9FAFB]">
          <Outlet />
        </main>
        <GlobalAlerts />
      </div>

      {/* Activity Sidebar (Desktop only) */}
      {!isMobile && showActivity && (
        <aside className="fixed right-0 top-0 h-screen w-[300px] bg-white border-l border-[#E2E8F0] z-40 animate-in slide-in-from-right duration-300 shadow-[-4px_0_12px_rgba(0,0,0,0.02)]">
          <ActivityFeed onClose={() => setShowActivity(false)} />
        </aside>
      )}
    </div>
  );
};

export default DashboardLayout;
