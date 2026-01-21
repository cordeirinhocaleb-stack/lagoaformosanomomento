'use client';

import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import DashboardTab from './DashboardTab';
import NewsManager from './NewsManager';
import UserManager from './UserManager';
import JobManager from './JobManager';
import AdvertisersTab from './AdvertisersTab';
import SettingsTab from './SettingsTab';
import { User, NewsItem, Advertiser, AdPricingConfig, SystemSettings, Job } from '@/types';

interface AdminMainProps {
    user: User;
    newsHistory: NewsItem[];
    allUsers: User[];
    advertisers: Advertiser[];
    adConfig: AdPricingConfig;
    systemSettings: SystemSettings;
    jobs: Job[];
    auditLogs: any[];
    onAddNews: (n: NewsItem) => void;
    onUpdateNews: (n: NewsItem) => void;
    onDeleteNews: (id: string) => void;
    onAddUser: (u: User) => void;
    onUpdateUser: (u: User) => void;
    onDeleteUser: (id: string) => void;
    onUpdateAdvertiser: (a: Advertiser) => Promise<Advertiser | null>;
    onDeleteAdvertiser: (id: string) => void;
    onUpdateAdConfig: (config: AdPricingConfig) => Promise<void> | void;
    onUpdateSystemSettings: (settings: SystemSettings) => Promise<void> | void;
    onLogout: () => void;
    onNavigateHome: () => void;
    initialNewsToEdit?: NewsItem | null;
}

const AdminMain: React.FC<AdminMainProps> = (props) => {
    const [currentView, setCurrentView] = useState('dashboard');
    const [darkMode, setDarkMode] = useState(true);

    const renderContent = () => {
        switch (currentView) {
            case 'dashboard':
                return (
                    <DashboardTab
                        user={props.user}
                        newsHistory={props.newsHistory}
                        advertisers={props.advertisers}
                        onEditPost={(post) => { /* Logic to open news editor */ }}
                        onNewPost={() => { setCurrentView('news'); }}
                        onManageAds={() => setCurrentView('advertisers')}
                        onDeletePost={props.onDeleteNews}
                        darkMode={darkMode}
                    />
                );
            case 'news':
                return (
                    <NewsManager
                        user={props.user}
                        news={props.newsHistory}
                        onAddNews={props.onAddNews}
                        onUpdateNews={props.onUpdateNews}
                        onDeleteNews={props.onDeleteNews}
                        systemSettings={props.systemSettings}
                        initialNewsToEdit={props.initialNewsToEdit}
                        darkMode={darkMode}
                    />
                );
            case 'users':
                return (
                    <UserManager
                        currentUser={props.user}
                        darkMode={darkMode}
                    />
                );
            case 'jobs':
                return (
                    <JobManager
                        currentUser={props.user}
                        darkMode={darkMode}
                    />
                );
            case 'advertisers':
                return (
                    <AdvertisersTab
                        advertisers={props.advertisers}
                        adConfig={props.adConfig}
                        onUpdateAdvertiser={props.onUpdateAdvertiser}
                        onDeleteAdvertiser={props.onDeleteAdvertiser}
                        onUpdateAdConfig={props.onUpdateAdConfig}
                        userPermissions={props.user}
                        darkMode={darkMode}
                    />
                );
            case 'settings':
                return (
                    <SettingsTab
                        systemSettings={props.systemSettings}
                        currentUser={props.user}
                        onSave={() => { }} // Not strictly used for core settings save here
                        onUpdateSettings={props.onUpdateSystemSettings}
                        darkMode={darkMode}
                    />
                );
            default:
                return (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <p className="text-gray-500 font-bold uppercase tracking-widest">Seção em Desenvolvimento</p>
                    </div>
                );
        }
    };

    return (
        <AdminLayout
            user={props.user}
            currentView={currentView}
            onNavigate={(view) => {
                if (view === 'home') {
                    props.onNavigateHome();
                } else {
                    setCurrentView(view);
                }
            }}
            onLogout={props.onLogout}
            darkMode={darkMode}
            onToggleTheme={() => setDarkMode(!darkMode)}
        >
            {renderContent()}
        </AdminLayout>
    );
};

export default AdminMain;
