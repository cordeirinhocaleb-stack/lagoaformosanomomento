'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAppController } from '@/hooks/useAppController';

// Criamos o contexto com um valor inicial indefinido
const AppControllerContext = createContext<ReturnType<typeof useAppController> | undefined>(undefined);

export const AppControllerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const controller = useAppController();

    return (
        <AppControllerContext.Provider value={controller}>
            {children}
        </AppControllerContext.Provider>
    );
};

export const useAppControllerContext = () => {
    const context = useContext(AppControllerContext);
    if (context === undefined) {
        throw new Error('useAppControllerContext must be used within an AppControllerProvider');
    }
    return context;
};
