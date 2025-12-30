
import React, { useState, useEffect } from 'react';
import { User, NewsItem, Advertiser, AdPricingConfig, SystemSettings } from '../../types';
import Logo from '../../components/common/Logo';
import { checkConnection } from '../../services/supabaseService';

import DashboardTab from '../../components/admin/DashboardTab';
import EditorTab from '../../components/admin/EditorTab';
import WorkflowTab from '../../components/admin/WorkflowTab';
import AdvertisersTab from '../../components/admin/AdvertisersTab';
import UsersTab from '../../components/admin/UsersTab';
import SettingsTab from '../../components/admin/SettingsTab';

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
  onLogout?: () => void;
  onOpenProfile?: () => void;
}

const Admin: React.FC<AdminPanelProps> = ({ 
  user, newsHistory, allUsers, advertisers, adConfig, systemSettings,
  onAddNews, onUpdateNews, onDeleteNews, onUpdateUser, onAddUser, 
  onUpdateAdvertiser, onUpdateAdConfig, onUpdateSystemSettings,
  dataSource = 'mock', onNavigateHome, onLogout, onOpenProfile
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'editor' | 'workflow' | 'users' | 'advertisers' | 'settings'>('dashboard');
  const [editingPost, setEditingPost] = useState<NewsItem | null>(null);
  const [dbStatus, setDbStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  const isAdmin = user.role === 'Desenvolvedor' || user.role === 'Editor-Chefe';

  useEffect(() => {
    const verifyDb = async () => {
        if (systemSettings.supabase?.url && systemSettings.supabase?.anonKey) {
            const ok = await checkConnection(systemSettings.supabase.url, systemSettings.supabase.anonKey);
            setDbStatus(ok ? 'connected' : 'disconnected');
        }
    };
    verifyDb();
  }, [systemSettings.supabase]);

  const NavItem = ({ id, icon, label, isActive }: { id: any, icon: string, label: string, isActive: boolean }) => (
    <button 
      onClick={() => { setEditingPost(null); setActiveTab(id); }}
      className={`flex flex-col items-center gap-1 transition-all flex-none px-4 py-2 rounded-xl ${isActive ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white hover:bg-white/10'}`}
    >
      <i className={`fas ${icon} text-lg`}></i>
      <span className="text-[7px] font-black uppercase tracking-tighter">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-zinc-100 flex-col overflow-hidden w-full relative">
       
       <nav className="flex-none bg-[#0a0a0a] text-white shadow-2xl border-b border-white/5 w-full z-[3000]">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between px-4 py-3 md:py-4">
          
          {/* Identidade Unificada e Navegação para Home */}
          <div 
            className="flex items-center gap-4 cursor-pointer group active:scale-95 transition-all" 
            onClick={() => onNavigateHome?.()}
          >
             <div className="w-10 h-10 bg-white/5 rounded-xl p-2 group-hover:bg-red-600/20 transition-colors">
                <Logo />
             </div>
             <div className="flex flex-col">
                <span className="text-[11px] font-black uppercase text-white leading-none tracking-tight">PAINEL OPERACIONAL</span>
                <span className="text-[7px] font-bold text-red-600 uppercase tracking-widest mt-1">SISTEMA INTEGRADO LFNM</span>
             </div>
          </div>

          {/* Abas Administrativas */}
          <div className="flex items-center gap-1 md:gap-4 overflow-x-auto scrollbar-hide px-2">
            <NavItem id="dashboard" icon="fa-chart-pie" label="Status" isActive={activeTab === 'dashboard'} />
            <NavItem id="editor" icon="fa-file-pen" label="Escrever" isActive={activeTab === 'editor'} />
            <NavItem id="workflow" icon="fa-clipboard-check" label="Pautas" isActive={activeTab === 'workflow'} />
            <NavItem id="advertisers" icon="fa-store" label="Parceiros" isActive={activeTab === 'advertisers'} />
            {isAdmin && <NavItem id="users" icon="fa-user-shield" label="Equipe" isActive={activeTab === 'users'} />}
            <NavItem id="settings" icon="fa-cog" label="Ajustes" isActive={activeTab === 'settings'} />
          </div>

          {/* User Controls & Logout */}
          <div className="hidden md:flex items-center gap-3">
             <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors" onClick={onOpenProfile}>
                <div className={`w-2 h-2 rounded-full ${dbStatus === 'connected' ? 'bg-green-50 shadow-[0_0_8px_#22c55e]' : 'bg-red-50'}`}></div>
                <span className="text-[8px] font-black uppercase text-zinc-400">{user.name}</span>
             </div>
             <button 
                onClick={onLogout}
                className="bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-xl text-[8px] font-black uppercase border border-red-600/20 transition-all"
             >
                Sair
             </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-hidden relative z-10 h-full">
        <div className="w-full h-full overflow-y-auto custom-scrollbar">
            {activeTab === 'dashboard' && <div className="p-4 lg:p-10"><DashboardTab user={user} newsHistory={newsHistory} advertisers={advertisers} onEditPost={(p) => {setEditingPost(p); setActiveTab('editor');}} onDeletePost={onDeleteNews} onNewPost={() => {setEditingPost(null); setActiveTab('editor');}} onManageAds={() => setActiveTab('advertisers')} /></div>}
            {activeTab === 'editor' && <EditorTab user={user} initialData={editingPost} onSave={(n, u) => {if(u) onUpdateNews(n); else onAddNews(n); setActiveTab('dashboard');}} onCancel={() => onNavigateHome?.()} accessToken={null} systemSettings={systemSettings} />}
            {activeTab === 'workflow' && <div className="p-4 lg:p-10"><WorkflowTab newsHistory={newsHistory} isAdmin={isAdmin} onEdit={(p) => {setEditingPost(p); setActiveTab('editor');}} onDelete={onDeleteNews} onStatusUpdate={onUpdateNews} /></div>}
            {activeTab === 'advertisers' && <div className="p-4 lg:p-10"><AdvertisersTab advertisers={advertisers} adConfig={adConfig} onUpdateAdvertiser={onUpdateAdvertiser || console.log} onUpdateAdConfig={onUpdateAdConfig || console.log} /></div>}
            {activeTab === 'users' && isAdmin && <div className="p-4 lg:p-10"><UsersTab allUsers={allUsers} newsHistory={newsHistory} currentUser={user} onUpdateUser={onUpdateUser} onAddUser={onAddUser} adConfig={adConfig} /></div>}
            {activeTab === 'settings' && <div className="p-4 lg:p-10"><SettingsTab driveConfig={{ clientId: '', apiKey: '', appId: '' }} systemSettings={systemSettings} onSave={(d, s) => onUpdateSystemSettings(s)} onExportDB={() => {}} onExportSchema={() => {}} gapiInited={false} gisInited={false} /></div>}
        </div>
      </main>
    </div>
  );
};

export default Admin;
