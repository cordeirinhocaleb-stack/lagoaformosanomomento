
import React, { useState, useEffect } from 'react';
import { User, NewsItem, Advertiser, AdPricingConfig, SystemSettings } from '../../types';
import Logo from '../../components/common/Logo';
import { checkConnection } from '../../services/supabaseService';

// Sub-components (Tabs)
import DashboardTab from '../../components/admin/DashboardTab';
import EditorTab from '../../components/admin/EditorTab';
import WorkflowTab from '../../components/admin/WorkflowTab';
import AdvertisersTab from '../../components/admin/AdvertisersTab';
import UsersTab from '../../components/admin/UsersTab';
import SettingsTab from '../../components/admin/SettingsTab';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

interface AdminPanelProps {
  user: User;
  newsHistory: NewsItem[];
  allUsers: User[];
  advertisers: Advertiser[];
  adConfig: AdPricingConfig;
  systemSettings: SystemSettings;
  onAddNews: (news: NewsItem) => void;
  onUpdateNews: (news: NewsItem) => void;
  onDeleteNews: (id: string) => void;
  onUpdateUser: (user: User) => void;
  onAddUser?: (user: User) => void; 
  onUpdateAdvertiser?: (advertiser: Advertiser) => void;
  onUpdateAdConfig?: (config: AdPricingConfig) => void;
  onUpdateSystemSettings: (settings: SystemSettings) => void;
  dataSource?: 'database' | 'mock' | 'missing_tables'; 
  onNavigateHome?: () => void;
}

const Admin: React.FC<AdminPanelProps> = ({ 
  user, newsHistory, allUsers, advertisers, adConfig, systemSettings,
  onAddNews, onUpdateNews, onDeleteNews, onUpdateUser, onAddUser, 
  onUpdateAdvertiser, onUpdateAdConfig, onUpdateSystemSettings,
  dataSource = 'mock', onNavigateHome
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'editor' | 'workflow' | 'users' | 'advertisers' | 'settings'>('dashboard');
  const [editingPost, setEditingPost] = useState<NewsItem | null>(null);
  const [dbStatus, setDbStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const isAdmin = user.role === 'Desenvolvedor' || user.role === 'Editor-Chefe';

  useEffect(() => {
    const verifyDbConnection = async () => {
        if (systemSettings.supabase?.url && systemSettings.supabase?.anonKey) {
            const isConnected = await checkConnection(systemSettings.supabase.url, systemSettings.supabase.anonKey);
            setDbStatus(isConnected ? 'connected' : 'disconnected');
        } else setDbStatus('disconnected');
    };
    verifyDbConnection();
  }, [systemSettings.supabase?.url, systemSettings.supabase?.anonKey]);

  const NavButton = ({ id, icon, label, isActive, onClick }: { id: string, icon: string, label: string, isActive: boolean, onClick: () => void }) => (
    <button 
      onClick={onClick} 
      className={`group relative w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-2xl transition-all duration-500 mb-2 md:mb-4 ${
        isActive 
          ? 'bg-red-600 text-white shadow-xl scale-105' 
          : 'bg-white/5 text-gray-500 border border-white/5 hover:bg-white/10 hover:text-white'
      }`}
    >
      <i className={`fas ${icon} text-lg md:text-xl`}></i>
      <span className="hidden lg:block absolute left-full ml-5 bg-gray-900 text-white text-[9px] font-black uppercase px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-2xl z-[200] pointer-events-none translate-x-[-10px] group-hover:translate-x-0">
        {label}
      </span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-100 font-sans flex-col md:flex-row overflow-hidden w-full relative">
       
       {/* MOBILE TOP NAV */}
       <nav className="md:hidden flex-none bg-[#050505] text-white shadow-2xl border-b border-white/10 w-full z-[200] relative">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="w-8 h-8" onClick={() => onNavigateHome?.()}><Logo /></div>
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1 mx-4">
            {['dashboard', 'editor', 'workflow', 'advertisers', 'settings'].map(t => (
               <button key={t} onClick={() => setActiveTab(t as any)} className={`p-3 rounded-xl transition-all ${activeTab === t ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500'}`}>
                  <i className={`fas fa-${t === 'dashboard' ? 'chart-pie' : t === 'editor' ? 'file-pen' : t === 'workflow' ? 'clipboard-check' : t === 'advertisers' ? 'store' : 'cog'} text-sm`}></i>
               </button>
            ))}
          </div>
        </div>
      </nav>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-24 bg-[#050505] flex-col items-center py-8 flex-none z-[160] border-r border-white/5 shadow-2xl relative">
        <div className="mb-10 cursor-pointer" onClick={() => onNavigateHome?.()}>
           <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-2 relative z-10 shadow-2xl">
              <Logo />
           </div>
        </div>
        <nav className="flex flex-col w-full px-4 items-center flex-1 space-y-1">
          <NavButton id="dashboard" icon="fa-chart-pie" label="Resumo" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavButton id="editor" icon="fa-file-pen" label="Escrever" isActive={activeTab === 'editor'} onClick={() => { setEditingPost(null); setActiveTab('editor'); }} />
          <NavButton id="workflow" icon="fa-clipboard-check" label="Matérias" isActive={activeTab === 'workflow'} onClick={() => setActiveTab('workflow')} />
          <NavButton id="advertisers" icon="fa-store" label="Anunciantes" isActive={activeTab === 'advertisers'} onClick={() => setActiveTab('advertisers')} />
          {isAdmin && <NavButton id="users" icon="fa-user-shield" label="Equipe" isActive={activeTab === 'users'} onClick={() => setActiveTab('users')} />}
          <div className="h-px w-6 bg-white/10 my-4"></div>
          <NavButton id="settings" icon="fa-cog" label="Sistema" isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto bg-slate-100 p-0 md:p-4 lg:p-8 scroll-smooth custom-scrollbar relative z-10 h-full">
        <div className="max-w-[1600px] mx-auto min-h-full pb-10">
            {/* Status Floating (Canto superior direito) */}
            <div className="fixed top-2 right-4 md:top-6 md:right-10 z-[180] flex items-center gap-3">
                <div className={`hidden sm:flex px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest backdrop-blur-md ${dataSource === 'database' ? 'bg-green-50/90 border-green-200 text-green-700' : 'bg-orange-50/90 border-orange-200 text-orange-700'}`}>
                    {dataSource === 'database' ? 'Supabase' : 'Offline'}
                </div>
                <div className={`rounded-full px-4 py-2 border backdrop-blur-md flex items-center gap-2 transition-all shadow-lg ${dbStatus === 'connected' ? 'bg-green-50/90 border-green-200 text-green-700' : 'bg-red-50/90 border-red-200 text-red-700'}`}>
                    <div className={`w-2 h-2 rounded-full ${dbStatus === 'connected' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`}></div>
                    <span className="text-[9px] font-black uppercase tracking-widest hidden lg:inline">{dbStatus === 'connected' ? 'Online' : 'Erro DB'}</span>
                </div>
            </div>

            <div className="p-4 md:p-0">
                {activeTab === 'dashboard' && <DashboardTab user={user} newsHistory={newsHistory} advertisers={advertisers} onEditPost={(post) => { setEditingPost(post); setActiveTab('editor'); }} onDeletePost={onDeleteNews} onNewPost={() => { setEditingPost(null); setActiveTab('editor'); }} onManageAds={() => setActiveTab('advertisers')} />}
                {activeTab === 'editor' && <EditorTab user={user} initialData={editingPost} onSave={(newsItem, isUpdate) => { if(isUpdate) onUpdateNews(newsItem); else onAddNews(newsItem); setActiveTab('dashboard'); setEditingPost(null); }} onCancel={() => { setActiveTab('dashboard'); setEditingPost(null); }} newsHistory={newsHistory} driveConfig={{ clientId: '', apiKey: '', appId: '' }} accessToken={accessToken} tokenClient={null} setAccessToken={setAccessToken} systemSettings={systemSettings} />}
                {activeTab === 'workflow' && <WorkflowTab newsHistory={newsHistory} isAdmin={isAdmin} onEdit={(post) => { setEditingPost(post); setActiveTab('editor'); }} onDelete={onDeleteNews} onStatusUpdate={(updatedPost) => onUpdateNews(updatedPost)} />}
                {activeTab === 'advertisers' && <AdvertisersTab advertisers={advertisers} adConfig={adConfig} onUpdateAdvertiser={onUpdateAdvertiser || console.log} onUpdateAdConfig={onUpdateAdConfig || console.log} />}
                {activeTab === 'users' && isAdmin && <UsersTab allUsers={allUsers} newsHistory={newsHistory} currentUser={user} onUpdateUser={onUpdateUser} onAddUser={onAddUser} adConfig={adConfig} />}
                {activeTab === 'settings' && <SettingsTab driveConfig={{ clientId: '', apiKey: '', appId: '' }} systemSettings={systemSettings} onSave={(d, s) => onUpdateSystemSettings(s)} onExportDB={() => {}} onExportSchema={() => {}} gapiInited={false} gisInited={false} />}
            </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
