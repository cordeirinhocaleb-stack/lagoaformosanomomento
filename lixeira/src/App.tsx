import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import LoadingScreen from './components/common/LoadingScreen';
import MyAccountModal from './components/common/MyAccountModal';
import PricingModal from './components/common/PricingModal';
import RoleSelectionModal from './components/RoleSelectionModal';
import ErrorAlertModal from './components/common/ErrorAlertModal';
import Login from './components/Login';

// Pages
import Home from './pages/Home';
import Admin from './pages/Admin/index';
import NewsDetail from './pages/news-detail/NewsDetailPage';
import AdvertiserPage from './pages/Advertiser';
import Jobs from './pages/Jobs';

// Imports de Tipos (incluindo RegionFilterType)
import { NewsItem, User, Advertiser, Job, AdPricingConfig, SystemSettings, SocialDistribution, UserRole } from './types';
import { RegionFilterType } from './components/layout/CategoryMenu';

// Services & Types
import { getExternalNews, adaptContentForSocialMedia } from './services/geminiService';
import { trackAdClick } from './services/adService';
import { dispatchSocialWebhook } from './services/integrationService';
import { 
    initSupabase, 
    getSupabase,
    fetchSiteData, 
    createUser, 
    updateUser, 
    createNews, 
    updateNews, 
    deleteNews, 
    upsertAdvertiser,
    saveSystemSetting, 
    getSystemSetting,
    sendErrorReport 
} from './services/supabaseService';

// --- CONFIGURAÇÃO GLOBAL DO SISTEMA ---
const DEFAULT_SETTINGS: SystemSettings = {
    jobsModuleEnabled: true,
    enableOmnichannel: true,
    supabase: {
        url: 'https://xlqyccbnlqahyxhfswzh.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhscXljY2JubHFhaHl4aGZzd3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NjYwNTMsImV4cCI6MjA4MjU0MjA1M30.5sFnDeMEtXBSrKGjt4vILrQEdsg4MytlftGp67Ieiio'
    },
    socialWebhookUrl: ''
};

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
    active: true,
    popup: {
        active: false,
        frequency: 'once_per_session',
        theme: 'classic_default',
        title: 'Oferta Especial',
        description: '',
        mediaType: 'image',
        mediaUrl: '',
        buttonText: 'Ver Detalhes',
        buttonLink: '',
        colors: {
            background: '#ffffff',
            text: '#000000',
            buttonBg: '#dc2626',
            buttonText: '#ffffff'
        }
    }
};

const App: React.FC = () => {
  const [showLoading, setShowLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'home' | 'admin' | 'details' | 'advertiser' | 'jobs' | 'auth_callback'>('home');
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // NEW USER REGISTRATION STATES
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState<any>(null);
  
  // GLOBAL FILTER STATES
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState<RegionFilterType>('Lagoa Formosa');
  
  // SCROLL CONTROL
  const [shouldScrollToGrid, setShouldScrollToGrid] = useState(false);
  
  // ERROR HANDLING STATE
  const [errorModal, setErrorModal] = useState<{ visible: boolean, error: any, context?: string }>({ visible: false, error: null });

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

  // Helper para leitura segura do hash em ambientes blob
  const getSafeHash = () => {
      try {
          return window.location.hash;
      } catch {
          return '';
      }
  };

  // FILTRO: Notícias Internas (Site) para o Plantão Vermelho
  const internalNews = useMemo(() => {
      return news.filter(n => n.source === 'site' || !n.source);
  }, [news]);

  // FILTRO: Notícias Externas Específicas (Política, Agro, Tecnologia) para o Plantão Verde
  const marqueeNews = useMemo(() => {
      const allowedCategories = ['Política', 'Agro', 'Agronegócio', 'Tecnologia'];
      const filtered = Object.entries(externalCategories)
          .filter(([cat]) => allowedCategories.includes(cat))
          .flatMap(([_, items]) => items);
      
      // Shuffle para misturar as categorias
      return filtered.sort(() => 0.5 - Math.random()).slice(0, 15);
  }, [externalCategories]);

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
      // Verificação segura antes de tentar setar
      const current = getSafeHash();
      if (current !== target) {
        window.location.hash = target; 
      }
    } catch (e) {
      console.warn("Navegação interna via estado. Hash update blocked.");
    }
  };

  const handleError = (error: any, context: string = '') => {
      console.error(`Erro [${context}]:`, error);
      setErrorModal({ visible: true, error, context });
  };

  const handleSendReport = async () => {
      if (errorModal.error) {
          await sendErrorReport(errorModal.error, errorModal.context, user);
      }
  };

  const checkUserExists = async (sessionUser: any, sbClient: any) => {
      if (!sessionUser || !sessionUser.email) {return null;}
      try {
          const { data: dbUser } = await sbClient.from('users').select('*').eq('email', sessionUser.email).single();
          if (dbUser) {return { ...dbUser, avatar: sessionUser.user_metadata.avatar_url || dbUser.avatar };}
          return null;
      } catch (error) { return null; }
  };

  const handleFinalizeRegistration = async (selectedRole: UserRole, extraData: any) => {
      if (!pendingGoogleUser) {return;}
      const newUser: User = {
          id: pendingGoogleUser.id,
          name: extraData.username || pendingGoogleUser.user_metadata.full_name || 'Usuário Google',
          email: pendingGoogleUser.email,
          role: selectedRole,
          status: 'active',
          avatar: pendingGoogleUser.user_metadata.avatar_url,
          themePreference: 'light',
          birthDate: extraData.birthDate,
          zipCode: extraData.zipCode,
          city: extraData.city,
          state: extraData.state,
          password: extraData.password
      };
      try {
          await createUser(newUser);
          setUser(newUser);
          localStorage.setItem('lfnm_user', JSON.stringify(newUser));
          if (['Anunciante', 'Repórter', 'Editor-Chefe', 'Desenvolvedor'].includes(selectedRole)) {
              updateHash('/admin');
              setView('admin');
          } else {
              setView('home');
              updateHash('/');
          }
          setShowRoleSelector(false);
          setPendingGoogleUser(null);
          setShowLoginModal(false);
      } catch (error: any) {
          handleError(error, "Falha ao finalizar cadastro de usuário.");
      }
  };

  const cancelRegistration = async () => {
      const sb = getSupabase();
      if (sb) {await sb.auth.signOut();}
      setShowRoleSelector(false);
      setPendingGoogleUser(null);
      setView('home');
  };

  useEffect(() => {
    let isMounted = true;
    let newsInterval: any;

    const initializeSystem = async () => {
        const savedUser = localStorage.getItem('lfnm_user') || sessionStorage.getItem('lfnm_user');
        if (savedUser) {
            try { 
                const u = JSON.parse(savedUser);
                setUser(u); 
                // USO SEGURO DO HASH
                if (getSafeHash().includes('access_token')) { updateHash('/admin'); setView('admin'); }
            } catch { setUser(null); }
        }

        const savedSettings = localStorage.getItem('lfnm_system_settings');
        let currentSettings = DEFAULT_SETTINGS;
        if(savedSettings) {
            try { const parsed = JSON.parse(savedSettings); if(parsed) {currentSettings = parsed;} } catch {}
        }
        setSystemSettings(currentSettings);

        if (currentSettings.supabase?.url && currentSettings.supabase?.anonKey) {
            const sbClient = initSupabase(currentSettings.supabase.url, currentSettings.supabase.anonKey);
            if (sbClient) {
                sbClient.auth.onAuthStateChange(async (event, session) => {
                    if (event === 'SIGNED_IN' && session?.user) {
                        const dbUser = await checkUserExists(session.user, sbClient);
                        if (dbUser) {
                            setUser(dbUser);
                            localStorage.setItem('lfnm_user', JSON.stringify(dbUser));
                            // USO SEGURO DO HASH
                            if (getSafeHash().includes('access_token') || view === 'auth_callback') { updateHash('/admin'); setView('admin'); }
                            setShowLoginModal(false);
                        } else {
                            setPendingGoogleUser(session.user);
                            setShowRoleSelector(true);
                            setShowLoginModal(false);
                        }
                    } else if (event === 'SIGNED_OUT') {
                        const { data: { session: currentSession } } = await sbClient.auth.getSession();
                        if (!currentSession) { setUser(null); localStorage.removeItem('lfnm_user'); sessionStorage.removeItem('lfnm_user'); setView('home'); }
                    }
                });
            }
            
            const response = await fetchSiteData();
            if (isMounted && response) {
                setNews(response.data.news);
                setAdvertisers(response.data.advertisers);
                setUsers(response.data.users);
                setJobs(response.data.jobs);
                setDataSource(response.source);
                if (response.source === 'database') {
                    const remoteConfig = await getSystemSetting('ad_config');
                    if (remoteConfig) {setAdConfig(remoteConfig);}
                }
            }
        }

        const loadExternalNews = () => {
            getExternalNews().then(data => { if (isMounted) {setExternalCategories(data);} });
        };
        loadExternalNews();
        newsInterval = setInterval(loadExternalNews, 3600000);
        
        if (isMounted) { setIsInitialized(true); setShowLoading(false); }
    };

    initializeSystem();
    return () => { isMounted = false; if (newsInterval) {clearInterval(newsInterval);} };
  }, []);

  useEffect(() => {
      if (view === 'auth_callback') {
          const timer = setTimeout(() => {
              if (localStorage.getItem('lfnm_user')) {
                  const u = JSON.parse(localStorage.getItem('lfnm_user') || '{}');
                  setUser(u);
                  setView('admin');
                  updateHash('/admin');
              } else {
                  if (!showRoleSelector) { setView('home'); updateHash('/'); }
              }
          }, 8000); 
          return () => clearTimeout(timer);
      }
  }, [view, showRoleSelector]);

  useEffect(() => {
    if (!isInitialized) {return;}
    const handleHashChange = () => {
      // Leitura segura do hash
      const hash = getSafeHash();
      if (!hash) {return;}
      
      if (hash.includes('access_token') || hash.includes('refresh_token') || hash.includes('type=recovery') || hash.includes('/oauth/consent')) {
          setView('auth_callback');
          return;
      }

      if (hash === '#/admin') {
         if (user) { setView('admin'); setShowLoginModal(false); } 
         else { if (!showRoleSelector) { setView('home'); updateHash('/'); setShowLoginModal(true); } }
      } else if (hash.startsWith('#/news/')) {
        const id = hash.split('/').pop();
        const item = news.find(n => n.id === id);
        if (item) { setSelectedNews(item); setView('details'); } else { setView('home'); updateHash('/'); }
      } else if (hash === '#/jobs') { setView('jobs'); }
      else { 
          if (view !== 'admin' && view !== 'details' && view !== 'advertiser' && view !== 'auth_callback' && view !== 'jobs') { setView('home'); }
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [news, user, isInitialized, showRoleSelector]); 

  const handleCategorySelection = (id: string) => {
      if (id === 'jobs_view_trigger') {
          setView('jobs');
          updateHash('/jobs');
      } else {
          setSelectedCategory(id);
          if (view !== 'home') {
              setView('home');
              updateHash('/');
          }
          setShouldScrollToGrid(true); // Sempre sinaliza rolagem para o grid
      }
  };

  const handleRegionSelection = (region: RegionFilterType) => {
      setSelectedRegion(region);
      if (view !== 'home') {
          setView('home');
          updateHash('/');
      }
      setShouldScrollToGrid(true); // Força a rolagem para o grid de notícias do momento
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
    if (remember) {localStorage.setItem('lfnm_user', JSON.stringify(u));}
    else {sessionStorage.setItem('lfnm_user', JSON.stringify(u));}
    setShowLoginModal(false);
    setView('admin');
    updateHash('/admin');
  };

  const handleLogout = async () => {
    // 1. Limpeza de Estado Local (Imediata para UI)
    setUser(null);
    localStorage.removeItem('lfnm_user');
    sessionStorage.removeItem('lfnm_user');
    setShowProfileModal(false); // Fecha modal se aberto
    handleBackToHome();
    
    // 2. Limpeza no Backend (Assíncrona)
    try {
        const sb = getSupabase();
        if (sb) {await sb.auth.signOut();}
    } catch (e) {
        console.warn("Falha no logout backend (ignorado pois usuário já saiu localmente):", e);
    }
  };

  const handleAddNews = async (n: NewsItem) => {
      setNews(p => [n, ...p]);
      if(dataSource === 'database') { 
          try { await createNews(n); } 
          catch(e) { console.error("Erro ao salvar notícia:", e); alert("Erro ao salvar no banco. Verifique o console."); } 
      }
  };

  const handleUpdateNews = async (n: NewsItem) => {
      setNews(p => p.map(x => x.id === n.id ? n : x));
      if(dataSource === 'database') { try { await updateNews(n); } catch(e) {} }
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
          if (localStorage.getItem('lfnm_user')) {localStorage.setItem('lfnm_user', JSON.stringify(u));}
          else if (sessionStorage.getItem('lfnm_user')) {sessionStorage.setItem('lfnm_user', JSON.stringify(u));}
      }
      if (dataSource === 'database') { try { await updateUser(u); } catch (e) {} }
  };

  const handleUpdateAdvertiser = async (a: Advertiser) => {
      setAdvertisers(prev => {
         const exists = prev.find(item => item.id === a.id);
         if(exists) {return prev.map(item => item.id === a.id ? a : item);}
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
      if(s.supabase?.url && s.supabase?.anonKey) {initSupabase(s.supabase.url, s.supabase.anonKey);}
  };

  const containerClasses = showLoading 
      ? 'w-full flex flex-col min-h-screen transition-all duration-700 opacity-50 scale-95' 
      : 'w-full flex flex-col min-h-screen transform-none';

  return (
    <div className={`min-h-screen flex flex-col w-full overflow-x-hidden ${user?.themePreference === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-gray-50 text-gray-900'}`}>
      {showLoading && <LoadingScreen onFinished={() => setShowLoading(false)} />}
      
      {errorModal.visible && errorModal.error && (
          <ErrorAlertModal 
              error={errorModal.error} 
              context={errorModal.context}
              onClose={() => setErrorModal({ ...errorModal, visible: false })} 
              onSendReport={handleSendReport}
          />
      )}

      {showRoleSelector && pendingGoogleUser && (
          <RoleSelectionModal 
              userName={pendingGoogleUser.user_metadata.full_name || 'Novo Usuário'}
              userAvatar={pendingGoogleUser.user_metadata.avatar_url}
              onSelect={handleFinalizeRegistration}
              onCancel={cancelRegistration}
          />
      )}

      {showLoginModal && (
          <Login onLogin={handleLoginSuccess} onClose={() => setShowLoginModal(false)} />
      )}

      {showPricingModal && (
        <PricingModal 
            config={adConfig}
            onClose={() => setShowPricingModal(false)}
            onSelectPlan={(plan) => { setShowPricingModal(false); if(user) {handleAdminClick();} }}
        />
      )}

      {showProfileModal && user && (
          <MyAccountModal user={user} onClose={() => setShowProfileModal(false)} onUpdateUser={handleUpdateUser} onLogout={handleLogout} />
      )}

      {view === 'auth_callback' && (
          <div className="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-black/95 text-white animate-fadeIn">
              <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-6"></div>
              <h2 className="text-xl font-black uppercase italic tracking-tighter">Autenticando</h2>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-2 animate-pulse">Conectando ao Google...</p>
          </div>
      )}

      <div className={containerClasses}>
        {view !== 'admin' && view !== 'auth_callback' && !showRoleSelector && (
          <Header 
              onAdminClick={handleAdminClick} onHomeClick={handleBackToHome}
              latestNews={internalNews.slice(0, 10)} brazilNews={marqueeNews} 
              user={user} onLogout={handleLogout} onNewsClick={handleNewsClick}
              isSimplified={view === 'jobs'} onOpenProfile={() => setShowProfileModal(true)}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelection}
              selectedRegion={selectedRegion}
              onSelectRegion={handleRegionSelection}
              onJobsClick={() => { setView('jobs'); updateHash('/jobs'); }}
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
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategorySelection}
                selectedRegion={selectedRegion}
                onSelectRegion={handleRegionSelection}
                shouldScrollToGrid={shouldScrollToGrid}
                onScrollConsumed={() => setShouldScrollToGrid(false)}
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
                <NewsDetail 
                    news={selectedNews}
                    allNews={news} 
                    onNewsClick={handleNewsClick}
                    onBack={handleBackToHome} 
                    advertisers={advertisers} 
                    onAdvertiserClick={handleAdvertiserClick}
                    selectedCategory={selectedCategory}
                    onSelectCategory={handleCategorySelection}
                    user={user}
                    onAdminClick={handleAdminClick}
                    selectedRegion={selectedRegion}
                    onSelectRegion={handleRegionSelection}
                />
            )}
            {view === 'advertiser' && selectedAdvertiser && <AdvertiserPage advertiser={selectedAdvertiser} onBack={handleBackToHome} />}
            {view === 'jobs' && <Jobs jobs={jobs} onBack={handleBackToHome} isEnabled={systemSettings.jobsModuleEnabled} />}
          </main>
          
          {view !== 'admin' && view !== 'auth_callback' && !showRoleSelector && <Footer isSimplified={view === 'jobs'} />}
        </div>
      </div>
    </div>
  );
};

export default App;