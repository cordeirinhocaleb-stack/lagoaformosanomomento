import React, { useState } from 'react';
import { User, NewsItem, Advertiser, SystemSettings, Job, AdPricingConfig } from '../../types';
import AdminLayout from '../../components/admin/AdminLayout';
import DashboardView from '../../components/admin/DashboardView';

import NewsManager from '../../components/admin/NewsManager';
import UsersTab from '../../components/admin/UsersTab';
import AdvertisersTab from '../../components/admin/AdvertisersTab';
import SettingsTab from '../../components/admin/SettingsTab';
import JobsBoard from '../../components/JobsBoard';

interface AdminPanelProps {
  user: User;
  newsHistory: NewsItem[];
  allUsers: User[];
  advertisers: Advertiser[];
  adConfig: AdPricingConfig;
  systemSettings: SystemSettings;
  jobs: Job[];
  auditLogs: any[];
  onAddNews: (news: NewsItem) => void;
  onUpdateNews: (news: NewsItem) => void;
  onDeleteNews: (id: string) => void;
  onUpdateUser: (user: User) => void;
  onAddUser?: (user: User) => void;
  onDeleteUser?: (id: string) => void;
  onUpdateAdvertiser: (advertiser: Advertiser) => Promise<Advertiser | null>;
  onDeleteAdvertiser?: (id: string) => void;
  onUpdateAdConfig: (config: AdPricingConfig) => Promise<void> | void;
  onUpdateSystemSettings: (settings: SystemSettings) => Promise<void> | void;
  onNavigateHome?: () => void;
  onLogout?: () => void;
  initialNewsToEdit?: NewsItem | null;
}

const Admin: React.FC<AdminPanelProps> = ({
  user, newsHistory, allUsers, advertisers, systemSettings, adConfig, jobs = [], auditLogs = [],
  onAddNews, onUpdateNews, onDeleteNews, onUpdateUser, onAddUser,
  onUpdateAdvertiser, onDeleteAdvertiser, onUpdateAdConfig, onUpdateSystemSettings,
  onDeleteUser, onLogout, onNavigateHome, initialNewsToEdit
}) => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [newsFilter, setNewsFilter] = useState<string | undefined>(undefined);
  const [isEditorToolsOpen, setIsEditorToolsOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(true);

  // Deep Link Handling
  React.useEffect(() => {
    if (initialNewsToEdit) {
      setCurrentView('news');
    }
  }, [initialNewsToEdit]);

  const handleNavigation = (view: string, filter?: string) => {
    if (view === 'home') {
      if (onNavigateHome) { onNavigateHome(); }
    } else {
      if (view === 'news' && filter) {
        setNewsFilter(filter);
      } else {
        setNewsFilter(undefined);
      }
      setCurrentView(view);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView
        currentUser={user}
        users={allUsers}
        news={newsHistory}
        advertisers={advertisers}
        jobs={jobs}
        auditLogs={auditLogs}
        onNavigate={handleNavigation}
        darkMode={isDarkMode}
      />;

      case 'news': return (
        <NewsManager
          user={user}
          news={newsHistory}
          onAddNews={onAddNews}
          onUpdateNews={onUpdateNews}
          onDeleteNews={onDeleteNews}
          systemSettings={systemSettings}
          initialNewsToEdit={initialNewsToEdit}
          initialFilter={newsFilter}
          darkMode={isDarkMode}
          onEditorToolsChange={setIsEditorToolsOpen}
        />
      );

      case 'users': return (
        <div className={`${isDarkMode ? 'bg-[#0F0F0F]' : 'bg-white'} rounded-2xl p-4 md:p-6 min-h-[500px]`}>
          <UsersTab
            allUsers={allUsers}
            newsHistory={newsHistory}
            onUpdateUser={onUpdateUser}
            onAddUser={onAddUser}
            onDeleteUser={onDeleteUser}
            currentUser={user}
            adConfig={adConfig}
            systemSettings={systemSettings}
            darkMode={isDarkMode}
          />
        </div>
      );

      case 'jobs': return (
        <div className={`${isDarkMode ? 'bg-[#0F0F0F]' : 'bg-white'} rounded-2xl p-4 md:p-6 min-h-[500px]`}>
          <JobsBoard isAdmin={true} onUpdateUser={onUpdateUser} currentUser={user} darkMode={isDarkMode} />
        </div>
      );

      case 'advertisers': return (
        <div className={`${isDarkMode ? 'bg-[#0F0F0F]' : 'bg-white'} rounded-2xl p-4 md:p-6 min-h-[500px]`}>
          <AdvertisersTab
            advertisers={advertisers}
            adConfig={adConfig}
            onUpdateAdvertiser={onUpdateAdvertiser}
            onDeleteAdvertiser={onDeleteAdvertiser}
            onUpdateAdConfig={onUpdateAdConfig}
            userPermissions={user}
            darkMode={isDarkMode}
          />
        </div>
      );

      case 'settings': return (
        <div className={`${isDarkMode ? 'bg-[#0F0F0F]' : 'bg-white'} rounded-2xl p-6 min-h-[500px]`}>
          <SettingsTab
            systemSettings={systemSettings}
            onUpdateSettings={onUpdateSystemSettings}
            currentUser={user}
            onSave={() => { }}
            darkMode={isDarkMode}
          />
        </div>
      );

      default: return <DashboardView currentUser={user} users={allUsers} news={newsHistory} advertisers={advertisers} jobs={jobs} auditLogs={auditLogs} onNavigate={handleNavigation} />;
    }
  };

  return (
    <AdminLayout
      user={user}
      currentView={currentView}
      onNavigate={(view) => handleNavigation(view)}
      onLogout={onLogout || (() => { })}
      darkMode={isDarkMode}
      onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      forceMinimized={isEditorToolsOpen}
    >
      {renderView()}
    </AdminLayout>
  );
};

export default Admin;
