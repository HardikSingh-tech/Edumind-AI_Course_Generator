import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';

export const MainLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-mesh-texture text-slate-800 dark:text-slate-100 relative overflow-x-hidden">
      {/* Ambient Fluid Orbs */}
      <div className="liquid-orb top-[-8%] left-[-5%] w-[550px] h-[550px] bg-slate-300/40 dark:bg-slate-600/10 pointer-events-none" />
      <div className="liquid-orb top-[30%] right-[-10%] w-[600px] h-[600px] bg-sky-200/35 dark:bg-blue-900/10 pointer-events-none" />
      <div className="liquid-orb bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-indigo-100/35 dark:bg-slate-700/10 pointer-events-none" />

      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 z-10 w-full">
        <Navbar onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
