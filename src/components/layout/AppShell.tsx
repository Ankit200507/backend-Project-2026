'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

interface AppShellProps {
  children: React.ReactNode;
}

const PUBLIC_NO_SHELL = ['/', '/login', '/signup', '/forbidden'];

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [sidebarWidth, setSidebarWidth] = useState(260);

  if (PUBLIC_NO_SHELL.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#0a0c10] text-[#f0f4ff]">
      <Sidebar onWidthChange={setSidebarWidth} />
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ marginLeft: sidebarWidth }}
      >
        <Navbar />
        <main className="flex-1 p-8 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

