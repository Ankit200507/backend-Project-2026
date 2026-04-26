'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { MOCK_USERS } from '@/lib/mockData';

interface AuthContextType {
    currentUser: User;
    setCurrentUser: (user: User) => void;
    switchRole: (role: UserRole) => void;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]); // default admin

    const switchRole = (role: UserRole) => {
        if (role === 'admin') setCurrentUser(MOCK_USERS[0]);
        else setCurrentUser(MOCK_USERS[1]);
    };

    return (
        <AuthContext.Provider value={{
            currentUser,
            setCurrentUser,
            switchRole,
            isAdmin: currentUser.role === 'admin',
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
