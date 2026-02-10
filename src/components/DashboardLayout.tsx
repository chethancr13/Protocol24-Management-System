import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import { useIsMobile } from '@/hooks/use-mobile';

const DashboardLayout = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

      <div className={`${isMobile ? 'ml-0' : 'ml-64'} flex flex-col min-h-screen`}>
        <AppHeader onMenuToggle={() => setSidebarOpen(prev => !prev)} isMobile={isMobile} />
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
