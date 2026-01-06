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
  user: User; // Changed from currentUser to match App.tsx usually, or mapped
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
  onUpdateAdvertiser: (advertiser: Advertiser) => void;
  // onDeleteAdvertiser removed as it's not in AdvertisersTab
  onUpdateAdConfig: (config: AdPricingConfig) => void;
  onUpdateSystemSettings: (settings: SystemSettings) => void;
  onNavigateHome?: () => void;
  onLogout?: () => void;
  initialNewsToEdit?: NewsItem | null;
}

const Admin: React.FC<AdminPanelProps> = ({
  user, newsHistory, allUsers, advertisers, systemSettings, adConfig, jobs = [], auditLogs = [],
  onAddNews, onUpdateNews, onDeleteNews, onUpdateUser, onAddUser,
  onUpdateAdvertiser, onUpdateAdConfig, onUpdateSystemSettings,
  onLogout, onNavigateHome, initialNewsToEdit
}) => {
  const [currentView, setCurrentView] = useState('dashboard');

  // Deep Link Handling
  React.useEffect(() => {
    if (initialNewsToEdit) {
      setCurrentView('news');
    }
  }, [initialNewsToEdit]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView
        users={allUsers}
        news={newsHistory}
        advertisers={advertisers}
        jobs={jobs}
        auditLogs={auditLogs}
        onNavigate={setCurrentView}
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
        />
      );

      case 'users': return (
        <div className="bg-white rounded-2xl p-6 min-h-[500px]">
          <UsersTab
            allUsers={allUsers}
            newsHistory={newsHistory}
            onUpdateUser={onUpdateUser}
            onAddUser={onAddUser}
            currentUser={user}
          />
        </div>
      );

      case 'jobs': return (
        <div className="bg-white rounded-2xl p-6 min-h-[500px]">
          <JobsBoard isAdmin={true} onUpdateUser={onUpdateUser} currentUser={user} />
        </div>
      );

      case 'advertisers': return (
        <div className="bg-white rounded-2xl p-6 min-h-[500px]">
          <AdvertisersTab
            advertisers={advertisers}
            adConfig={adConfig}
            onUpdateAdvertiser={onUpdateAdvertiser}
            onUpdateAdConfig={onUpdateAdConfig}
            userPermissions={user}
          />
        </div>
      );

      case 'settings': return (
        <div className="bg-white rounded-2xl p-6 min-h-[500px]">
          <SettingsTab
            systemSettings={systemSettings}
            onUpdateSettings={onUpdateSystemSettings}
            currentUser={user}
            // Optional props to satisfy interface if needed
            onSave={() => { }}
          />
        </div>
      );

      default: return <DashboardView users={allUsers} news={newsHistory} advertisers={advertisers} jobs={jobs} auditLogs={auditLogs} onNavigate={setCurrentView} />;
    }
  };

  const handleNavigation = (view: string) => {
    if (view === 'home') {
      if (onNavigateHome) onNavigateHome();
    } else {
      setCurrentView(view);
    }
  };

  return (
    <AdminLayout
      user={user}
      currentView={currentView}
      onNavigate={handleNavigation}
      onLogout={onLogout || (() => { })}
    >
      {renderView()}
    </AdminLayout>
  );
};

export default Admin;
