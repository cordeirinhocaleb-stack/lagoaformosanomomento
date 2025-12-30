
import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import LoadingScreen from './components/common/LoadingScreen';
import MyAccountModal from './components/common/MyAccountModal';
import PricingModal from './components/common/PricingModal';

// Pages
import Home from './pages/Home';
import Admin from './pages/Admin/index';
import NewsDetail from './pages/NewsDetail';
import AdvertiserPage from './pages/Advertiser';
import Jobs from './pages/Jobs';

// Componentes
import Login from './components/Login'; 

// Services & Types
import { getExternalNews, adaptContentForSocialMedia } from './services/geminiService';
import { trackAdClick } from './services/adService';
import { dispatchSocialWebhook } from './services/integrationService';
import { 
    initSupabase, 
    fetchSiteData, 
    createUser, 
    updateUser, 
    createNews, 
    updateNews,
    deleteNews,
    upsertAdvertiser,
    saveSystemSetting, 
    getSystemSetting
} from './services/supabaseService';
import { NewsItem, User, Advertiser, Job, AdPricingConfig, SystemSettings, SocialDistribution } from './types';

const INITIAL_AD_CONFIG: AdPricingConfig = {
    plans: [
        {
            id: 'master',
            name: 'Master',
            prices: { daily: 50, weekly: 300, monthly: 1200, quarterly: 3000, semiannual: 5500, yearly: 10000 },
            description: 'Domínio total do portal',
            cashbackPercent: 15,
            features: {
                placements: ['master_carousel', 'sidebar', 'standard_list'],
                canCreateJobs: true,
                maxProducts: 0,
                socialVideoAd: true,
                videoLimit: 4,
                socialFrequency: 'daily',
                allowedSocialNetworks: ['instagram', 'facebook', 'whatsapp', 'linkedin', 'tiktok'],
                hasInternalPage: true
            }
        }
    ],
    promoText: 'Assine agora e impulsione seu negócio!',
    active: true
};

const DEFAULT_SETTINGS: SystemSettings = {
    jobsModuleEnabled: false,
    enableOmnichannel: true,
    supabase: {
        url: 'https://xlqyccbnlqahyxhfswzh.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhscXljY2JubHFhaHl4aGZzd3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NjYwNTMsImV4cCI6MjA4MjU0MjA1M30.5sFnDeMEtXBSrKGjt4vILrQEdsg4MytlftGp67Ieiio'
    },
    socialWebhookUrl: ''
};

const DEV_USER: User = {
    id: 'dev_root',
    name: 'Desenvolvedor Master',
    email: 'dev@lagoaformosa.com',
    role: 'Desenvolvedor',
    status: 'active',
    avatar: 'https://cdn-icons-png.flaticon.com/512/9131/9131529.png',
    themePreference: 'light'
};

const App: React.FC = () => {
  const [showLoading, setShowLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'home' | 'admin' | 'details' | 'advertiser' | 'jobs'>('home');
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const [news, setNews] = useState<NewsItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [dataSource, setDataSource] = useState<'database' | 'mock' | 'missing_tables'>('mock');
  
  const [externalCategories, setExternalCategories] = useState<Record<string, any[]>>({});
  const [adConfig, setAdConfig] = useState<AdPricingConfig>(INITIAL_AD_CONFIG);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [selectedAdvertiser, setSelectedAdvertiser] = useState<Advertiser | null>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    if (user?.themePreference === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user?.themePreference]);

  const updateHash = (hash: string) => {
    const target = hash.startsWith('#') ? hash : `#${hash}`;
    try { 
      if (window.location.hash !== target) {
        window.location.hash = target; 
      }
    } catch (e) {
      console.warn("Navegação interna via estado.");
    }
  };

  useEffect(() => {
    let isMounted = true;
    let newsInterval: any;

    const initializeSystem = async () => {
        const savedUser = localStorage.getItem('lfnm_user') || sessionStorage.getItem('lfnm_user');
        if (savedUser) {
            try { setUser(JSON.parse(savedUser)); } catch { setUser(DEV_USER); }
        } else {
            setUser(DEV_USER);
        }

        const savedSettings = localStorage.getItem('lfnm_system_settings');
        let currentSettings = DEFAULT_SETTINGS;
        if(savedSettings) {
            try { 
                const parsed = JSON.parse(savedSettings);
                if(!parsed.supabase || !parsed.supabase.url) parsed.supabase = DEFAULT_SETTINGS.supabase;
                currentSettings = parsed;
                setSystemSettings(currentSettings); 
            } catch {}
        }

        if (currentSettings.supabase?.url && currentSettings.supabase?.anonKey) {
            initSupabase(currentSettings.supabase.url, currentSettings.supabase.anonKey);
            const response = await fetchSiteData();
            if (isMounted && response) {
                setNews(response.data.news);
                setAdvertisers(response.data.advertisers);
                setUsers(response.data.users);
                setJobs(response.data.jobs);
                setDataSource(response.source);
                if (response.source === 'database') {
                    const remoteConfig = await getSystemSetting('ad_config');
                    if (remoteConfig) setAdConfig(remoteConfig);
                }
            }
        }

        const loadExternalNews = () => {
            getExternalNews().then(data => { if (isMounted) setExternalCategories(data); });
        };
        loadExternalNews();
        newsInterval = setInterval(loadExternalNews, 3600000);
        if (isMounted) setIsInitialized(true);
    };

    initializeSystem();
    return () => { isMounted = false; if (newsInterval) clearInterval(newsInterval); };
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    const handleHashChange = () => {
      let hash = '';
      try { hash = window.location.hash; } catch { return; }
      
      if (hash === '#/admin') {
         if (user) { 
           setView('admin'); 
           setShowLoginModal(false); 
         } else { 
           setView('home'); 
           updateHash('/'); 
         }
      } else if (hash.startsWith('#/news/')) {
        const id = hash.split('/').pop();
        const item = news.find(n => n.id === id);
        if (item) { setSelectedNews(item); setView('details'); } 
        else { setView('home'); updateHash('/'); }
      } else if (hash === '#/jobs') { setView('jobs'); }
      else { if (view !== 'admin' && view !== 'details' && view !== 'advertiser') setView('home'); }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [news, user, view, isInitialized]); 

  const triggerOmnichannelPost = async (newsItem: NewsItem) => {
      if (!systemSettings.enableOmnichannel) return;
      try {
          const socialContent = await adaptContentForSocialMedia(newsItem.title, newsItem.lead, newsItem.category);
          const distributions: SocialDistribution[] = [
              { platform: 'instagram_feed', status: 'pending', content: socialContent.instagram_feed },
              { platform: 'facebook', status: 'pending', content: socialContent.facebook },
              { platform: 'whatsapp', status: 'pending', content: socialContent.whatsapp },
              { platform: 'linkedin', status: 'pending', content: socialContent.linkedin }
          ];
          const updatedNews = { ...newsItem, socialDistribution: distributions };
          const success = await dispatchSocialWebhook(updatedNews);
          if (success) {
              updatedNews.socialDistribution = distributions.map(d => ({ ...d, status: 'posted', postedAt: new Date().toISOString() }));
          } else {
              updatedNews.socialDistribution = distributions.map(d => ({ ...d, status: 'failed' }));
          }
          setNews(prev => prev.map(n => n.id === newsItem.id ? updatedNews : n));
          if(dataSource === 'database') await updateNews(updatedNews);
      } catch (error) {
          console.error("Erro na distribuição social:", error);
      }
  };

  const handleAddNews = async (n: NewsItem) => {
      setNews(p => [n, ...p]);
      if(dataSource === 'database') { 
          try { 
              await createNews(n); 
              if (n.status === 'published') triggerOmnichannelPost(n);
          } catch(e) {} 
      }
  };

  const handleUpdateNews = async (n: NewsItem) => {
      setNews(p => p.map(x => x.id === n.id ? n : x));
      if(dataSource === 'database') { 
          try { 
              await updateNews(n); 
              if (n.status === 'published') triggerOmnichannelPost(n);
          } catch(e) {} 
      }
  };

  const handleNewsClick = (item: NewsItem) => {
    setSelectedNews(item);
    setView('details');
    updateHash(`/news/${item.id}`);
    window.scrollTo(0, 0);
  };

  const handleAdvertiserClick = (advertiser: Advertiser) => {
    trackAdClick(advertiser.id);
    if (advertiser.redirectType === 'external' && advertiser.externalUrl) {
      window.open(advertiser.externalUrl, '_blank');
    } else {
      setSelectedAdvertiser(advertiser);
      setView('advertiser');
      window.scrollTo(0, 0);
    }
  };

  const handleBackToHome = () => {
    setView('home');
    setSelectedNews(null);
    setSelectedAdvertiser(null);
    updateHash('/');
  };

  const handleAdminClick = () => {
    if (user) { setView('admin'); updateHash('/admin'); } 
    else { setShowLoginModal(true); }
  };

  const handleLoginSuccess = (u: User, remember: boolean) => {
    setUser(u);
    if (remember) localStorage.setItem('lfnm_user', JSON.stringify(u));
    else sessionStorage.setItem('lfnm_user', JSON.stringify(u));
    setShowLoginModal(false);
    setView('admin');
    updateHash('/admin');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('lfnm_user');
    sessionStorage.removeItem('lfnm_user');
    handleBackToHome();
  };

  const handleDeleteNews = async (id: string) => {
      setNews(p => p.filter(x => x.id !== id));
      if(dataSource === 'database') { try { await deleteNews(id); } catch(e) {} }
  };
  
  const handleAddUser = async (u: User) => {
      setUsers(p => [...p, u]);
      if (dataSource === 'database') { try { await createUser(u); } catch (e) {} }
  };

  const handleUpdateUser = async (u: User) => {
      setUsers(p => p.map(x => x.id === u.id ? u : x));
      if(user && user.id === u.id) {
          setUser(u);
          if (localStorage.getItem('lfnm_user')) localStorage.setItem('lfnm_user', JSON.stringify(u));
          else if (sessionStorage.getItem('lfnm_user')) sessionStorage.setItem('lfnm_user', JSON.stringify(u));
      }
      if (dataSource === 'database') { try { await updateUser(u); } catch (e) {} }
  };

  const handleUpdateAdvertiser = async (a: Advertiser) => {
      setAdvertisers(prev => {
         const exists = prev.find(item => item.id === a.id);
         if(exists) return prev.map(item => item.id === a.id ? a : item);
         return [...prev, a];
      });
      if(dataSource === 'database') { try { await upsertAdvertiser(a); } catch(e) {} }
  };

  const handleUpdateAdConfig = async (c: AdPricingConfig) => {
      setAdConfig(c);
      localStorage.setItem('lfnm_ad_config', JSON.stringify(c));
      if(dataSource === 'database') { try { await saveSystemSetting('ad_config', c); } catch(e) {} }
  };

  const handleUpdateSystemSettings = (s: SystemSettings) => {
      setSystemSettings(s);
      localStorage.setItem('lfnm_system_settings', JSON.stringify(s));
      if(s.supabase?.url && s.supabase?.anonKey) initSupabase(s.supabase.url, s.supabase.anonKey);
  };

  const marqueeNews = Object.values(externalCategories).flat().slice(0, 10);

  return (
    <div className={`min-h-screen flex flex-col w-full overflow-x-hidden transition-colors duration-500 ${user?.themePreference === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-gray-50 text-gray-900'}`}>
      {showLoading && <LoadingScreen onFinished={() => setShowLoading(false)} />}
      
      {showLoginModal && (
          <Login onLogin={handleLoginSuccess} onClose={() => setShowLoginModal(false)} />
      )}

      {showPricingModal && (
        <PricingModal 
            config={adConfig}
            onClose={() => setShowPricingModal(false)}
            onSelectPlan={(plan) => {
                setShowPricingModal(false);
                if(user) handleAdminClick();
            }}
        />
      )}

      {showProfileModal && user && (
          <MyAccountModal user={user} onClose={() => setShowProfileModal(false)} onUpdateUser={handleUpdateUser} />
      )}

      <div className={`w-full flex flex-col min-h-screen transition-all duration-700 ${showLoading ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
        {/* HEADER SÓ APARECE SE NÃO FOR ADMIN */}
        {view !== 'admin' && (
          <Header 
              onAdminClick={handleAdminClick} onHomeClick={handleBackToHome}
              latestNews={news.slice(0, 6)} brazilNews={marqueeNews} 
              user={user} onLogout={handleLogout} onNewsClick={handleNewsClick}
              isSimplified={view === 'jobs'} onOpenProfile={() => setShowProfileModal(true)}
          />
        )}

        <div className={`w-full flex-grow flex flex-col md:w-[94%] md:max-w-[1550px] md:mx-auto relative ${user?.themePreference === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100 shadow-2xl border-x'} ${view === 'details' ? 'md:w-full md:max-w-none md:border-none md:shadow-none' : ''}`}>
          <main className="flex-grow w-full">
            {view === 'home' && (
              <Home 
                news={news} advertisers={advertisers} user={user}
                onNewsClick={handleNewsClick} onAdvertiserClick={handleAdvertiserClick}
                onAdminClick={handleAdminClick} onPricingClick={() => setShowPricingModal(true)}
                onJobsClick={() => { setView('jobs'); updateHash('/jobs'); }}
                adConfig={adConfig} externalCategories={externalCategories}
              />
            )}
            {view === 'admin' && user && (
              <Admin 
                user={user} newsHistory={news} allUsers={users}
                advertisers={advertisers} adConfig={adConfig} systemSettings={systemSettings}
                onAddNews={handleAddNews} onUpdateNews={handleUpdateNews} onDeleteNews={handleDeleteNews}
                onAddUser={handleAddUser} onUpdateUser={handleUpdateUser}
                onUpdateAdvertiser={handleUpdateAdvertiser} onUpdateAdConfig={handleUpdateAdConfig}
                onUpdateSystemSettings={handleUpdateSystemSettings} dataSource={dataSource}
                onNavigateHome={handleBackToHome} onLogout={handleLogout}
                onOpenProfile={() => setShowProfileModal(true)}
              />
            )}
            {view === 'details' && selectedNews && (
                <NewsDetail news={selectedNews} onBack={handleBackToHome} advertisers={advertisers} onAdvertiserClick={handleAdvertiserClick} />
            )}
            {view === 'advertiser' && selectedAdvertiser && <AdvertiserPage advertiser={selectedAdvertiser} onBack={handleBackToHome} />}
            {view === 'jobs' && <Jobs jobs={jobs} onBack={handleBackToHome} isEnabled={systemSettings.jobsModuleEnabled} />}
          </main>
          
          {view !== 'admin' && <Footer isSimplified={view === 'jobs'} />}
        </div>
      </div>
    </div>
  );
};

export default App;
