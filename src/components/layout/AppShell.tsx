'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

interface AppShellProps {
    children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
    const [sidebarWidth, setSidebarWidth] = useState(260);

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar onWidthChange={setSidebarWidth} />
            <div style={{
                flex: 1,
                marginLeft: sidebarWidth,
                minHeight: '100vh',
                background: 'var(--bg-primary)',
                transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)',
                display: 'flex',
                flexDirection: 'column',
            }}>
                <Navbar />
                <main style={{ flex: 1, padding: '32px' }}>
                    <div className="animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
