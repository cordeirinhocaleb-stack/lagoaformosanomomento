
import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import NewsCard from './components/NewsCard';
import AdminPanel from './components/AdminPanel';
import NewsDetails from './components/NewsDetails';
import AdvertiserPage from './components/AdvertiserPage';
import AdBanner from './components/AdBanner';
import CategoryMenu from './components/CategoryMenu';
import FullWidthPromo from './components/FullWidthPromo';
import DailyBread from './components/DailyBread';
import Footer from './components/Footer';
import Login from './components/Login';
import LoadingScreen from './components/LoadingScreen';
import BrazilNewsCard from './components/BrazilNewsCard';
import PermissionModal from './components/PermissionModal';
import JobsBoard from './components/JobsBoard';
import TopBillboard from './components/TopBillboard'; // Importado para uso no Layout
import PricingModal from './components/PricingModal'; // Importado
import { getBrazilNationalNews, STATIC_BRAZIL_NEWS } from './services/geminiService';
import { NewsItem, User, Advertiser, Job, AdPricingConfig, AdPlan } from './types';
import { trackAdClick } from './services/adService';

const INITIAL_USERS: User[] = [
  { id: '1', name: 'Welix Duarte', email: 'welix@lfnm.com.br', role: 'Editor-Chefe', status: 'active' },
  { id: '2', name: 'Dev Welix', email: 'dev', role: 'Desenvolvedor', status: 'active' },
  { id: '3', name: 'Júlia Silva', email: 'julia@lfnm.com.br', role: 'Repórter', status: 'active' },
  { id: '4', name: 'Marcos Agro', email: 'marcos@lfnm.com.br', role: 'Jornalista', status: 'active' },
];

const INITIAL_NEWS: NewsItem[] = [
  {
    id: '1',
    status: 'published',
    title: 'Lagoa Formosa registra aumento no turismo rural em 2025',
    lead: 'Com novas rotas gastronômicas, a cidade se torna polo regional de visitantes aos finais de semana.',
    content: 'O ano de 2025 começou com ventos prósperos para o turismo em Lagoa Formosa. Segundo dados da prefeitura, o fluxo de visitantes nas fazendas históricas e pesqueiros da região subiu 40% em comparação ao ano anterior.',
    category: 'Cotidiano',
    authorId: 'admin',
    author: 'Welix Duarte',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
    imageCredits: 'Welix Duarte',
    mediaType: 'image',
    city: 'Lagoa Formosa',
    region: 'Alto Paranaíba',
    isBreaking: false,
    isFeatured: true,
    featuredPriority: 10,
    seo: {
      slug: 'turismo-rural-lagoa-formosa-2025',
      metaTitle: 'Turismo Rural em Lagoa Formosa 2025',
      metaDescription: 'Aumento no turismo rural em Lagoa Formosa.',
      focusKeyword: 'turismo rural'
    },
    source: 'site'
  },
  {
    id: '2',
    status: 'published',
    title: 'Preços do milho e soja trazem otimismo para produtores rurais em 2025',
    lead: 'A safra deste ano em nossa região destaca-se pela alta produtividade e qualidade.',
    content: 'O setor do agronegócio em Lagoa Formosa celebra os números da última colheita. Os silos da região estão operando em capacidade máxima.',
    category: 'Agro',
    authorId: 'admin',
    author: 'Welix Duarte',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800',
    imageCredits: 'Welix Duarte',
    mediaType: 'image',
    city: 'Lagoa Formosa',
    region: 'Alto Paranaíba',
    isBreaking: false,
    isFeatured: false,
    featuredPriority: 5,
    seo: {
      slug: 'precos-milho-soja-2025',
      metaTitle: 'Preços Milho e Soja 2025',
      metaDescription: 'Otimismo para o agronegócio em 2025.',
      focusKeyword: 'agronegócio'
    },
    source: 'site'
  }
];

const INITIAL_ADVERTISERS: Advertiser[] = [
  {
    id: 'ad1',
    name: 'Comercial Lagoa',
    category: 'Supermercado',
    plan: 'master', // Atualizado para Master para aparecer no AdBanner
    logoIcon: 'fa-shopping-cart',
    startDate: '2024-01-01',
    endDate: '2030-12-31',
    isActive: true,
    views: 1200,
    clicks: 45,
    redirectType: 'internal',
    internalPage: {
        description: 'O melhor supermercado da região com ofertas diárias.',
        whatsapp: '34999999999',
        instagram: '@comerciallagoa',
        location: 'Av. Brasil, 100 - Centro',
        products: [
          {id: 'p1', name: 'Cesta Básica Premium', price: 'R$ 150,00', description: 'Itens selecionados das melhores marcas.'}
        ]
    }
  }
];

const INITIAL_JOBS: Job[] = [
  {
    id: 'j1',
    title: 'Auxiliar Administrativo',
    company: 'Agropecuária Boa Vista',
    location: 'Lagoa Formosa - MG',
    type: 'CLT',
    salary: 'R$ 1.800,00',
    description: 'Vaga para auxiliar administrativo com experiência em emissão de notas fiscais e controle de estoque. Necessário ensino médio completo e domínio de Excel.',
    whatsapp: '34999998888',
    postedAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'j2',
    title: 'Vendedor Externo',
    company: 'Distribuidora Aliança',
    location: 'Região (Patos/Lagoa)',
    type: 'PJ',
    salary: 'Comissão + Ajuda de Custo',
    description: 'Buscamos vendedor com veículo próprio para atuar na região do Alto Paranaíba. Ótimas comissões.',
    whatsapp: '34999997777',
    postedAt: new Date().toISOString(),
    isActive: true
  }
];

// Configuração Padrão de Preços
const INITIAL_AD_CONFIG: AdPricingConfig = {
    masterDailyPrice: 50,
    premiumDailyPrice: 30,
    standardDailyPrice: 15,
    cashbackPercent: 10,
    promoText: 'Comece hoje e ganhe bônus!',
    active: true
};

const App: React.FC = () => {
  const [showLoading, setShowLoading] = useState(true);
  const [user, setUser] = useState<User | null>(INITIAL_USERS[0]);
  const [view, setView] = useState<'home' | 'admin' | 'details' | 'login' | 'advertiser' | 'jobs'>('home');
  const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [advertisers, setAdvertisers] = useState<Advertiser[]>(INITIAL_ADVERTISERS);
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [selectedAdvertiser, setSelectedAdvertiser] = useState<Advertiser | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [brazilNews, setBrazilNews] = useState<any[]>(STATIC_BRAZIL_NEWS);
  
  // New States for Pricing Logic
  const [adConfig, setAdConfig] = useState<AdPricingConfig>(INITIAL_AD_CONFIG);
  const [showPricingModal, setShowPricingModal] = useState(false);

  useEffect(() => {
    // 1. Carrega dados externos
    let isMounted = true;
    getBrazilNationalNews().then(data => {
      if (isMounted && data && data.length > 0) setBrazilNews(data);
    });

    const savedUser = localStorage.getItem('lfnm_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) { console.error('Erro ao recuperar sessão', e); }
    }
    
    // Recupera config de preços salva
    const savedConfig = localStorage.getItem('lfnm_ad_config');
    if(savedConfig) {
        try { setAdConfig(JSON.parse(savedConfig)); } catch {}
    }

    return () => { isMounted = false; };
  }, []);

  const updateHash = (hash: string) => {
    try {
      window.location.hash = hash;
    } catch (e) {
      console.warn("Navigation warning: Could not update URL hash in this environment.", e);
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      let hash = '';
      try {
        hash = window.location.hash;
      } catch (e) {
        return;
      }

      if (hash === '#/admin') {
          setView('admin');
      } else if (hash === '#/login') {
           setView('admin');
           updateHash('/admin');
      } else if (hash.startsWith('#/news/')) {
        const id = hash.split('/').pop();
        const item = news.find(n => n.id === id);
        if (item) {
          setSelectedNews(item);
          setView('details');
        } else {
          setView('home');
          updateHash('/');
        }
      } else if (hash === '#/jobs') {
        setView('jobs');
      } else {
        setView('home');
        if(hash !== '' && hash !== '#/') updateHash('/');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [news]);

  const filteredNews = useMemo(() => {
    let list = news.filter(n => n.status === 'published');
    if (selectedCategory !== 'all') list = list.filter(n => n.category === selectedCategory);
    
    return [...list].sort((a, b) => {
      const pA = a.featuredPriority || 0;
      const pB = b.featuredPriority || 0;
      if (pB !== pA) return pB - pA;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [news, selectedCategory]);

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

  const handleCategorySelect = (id: string) => {
    if (id === 'jobs_view_trigger') {
      setView('jobs');
      updateHash('/jobs');
      window.scrollTo(0, 0);
    } else {
      setSelectedCategory(id);
    }
  };

  const handleBackToHome = () => {
    setView('home');
    setSelectedNews(null);
    setSelectedAdvertiser(null);
    updateHash('/');
  };

  const handleAdminClick = () => {
    setView('admin'); 
    updateHash('/admin'); 
  };

  const handleLoginSuccess = (u: User) => {
    setUser(u);
    localStorage.setItem('lfnm_user', JSON.stringify(u));
    setView('admin');
    updateHash('/admin');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('lfnm_user');
    handleBackToHome();
  };

  // --- LOGIC FOR PRICING MODAL ---
  const handleOpenPricing = () => setShowPricingModal(true);
  const handleClosePricing = () => setShowPricingModal(false);
  const handleSelectPlan = (plan: AdPlan) => {
     setShowPricingModal(false);
     // Em um fluxo real, isso levaria para um checkout.
     // Aqui, simulamos indo para o Admin para "cadastrar" o anunciante, ou poderia abrir um formulário de contato.
     alert(`Plano ${plan.toUpperCase()} selecionado! Em breve você será redirecionado para o checkout.`);
     // Opcional: Redirecionar para o admin para 'simular' o cadastro self-service se o usuário estiver logado
     if(user) {
         setView('admin');
         updateHash('/admin');
     }
  };

  // --- ADMIN UPDATE CONFIG ---
  const handleUpdateAdConfig = (newConfig: AdPricingConfig) => {
      setAdConfig(newConfig);
      localStorage.setItem('lfnm_ad_config', JSON.stringify(newConfig));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full overflow-x-hidden">
      {showLoading && <LoadingScreen onFinished={() => setShowLoading(false)} />}
      <PermissionModal onAccept={() => console.log('Mídias autorizadas')} />
      
      {showPricingModal && (
        <PricingModal 
            config={adConfig}
            onClose={handleClosePricing}
            onSelectPlan={handleSelectPlan}
        />
      )}

      <div className={`w-full flex flex-col min-h-screen transition-all duration-700 ${showLoading ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
        {view === 'login' && <Login onLogin={handleLoginSuccess} />}

        {view !== 'login' && (
          <Header 
            onAdminClick={handleAdminClick} 
            onHomeClick={handleBackToHome}
            latestNews={news.slice(-6)}
            brazilNews={brazilNews}
            user={user}
            onLogout={handleLogout}
            onNewsClick={handleNewsClick}
            isSimplified={view === 'admin' || view === 'jobs'}
          />
        )}

        <div className={`w-full flex-grow flex flex-col md:w-[94%] md:max-w-[1550px] md:mx-auto bg-white md:shadow-2xl md:border-x border-gray-100 relative ${view === 'details' ? 'md:w-full md:max-w-none md:border-none md:shadow-none' : ''}`}>
          <main className="flex-grow w-full">
            {view === 'home' && (
              <div className="w-full">
                {/* Agora TopBillboard tem a correção de layout interna */}
                <TopBillboard /> 
                <CategoryMenu selectedCategory={selectedCategory} onSelectCategory={handleCategorySelect} onAdminClick={handleAdminClick} user={user} />
                <AdBanner 
                    advertisers={advertisers} 
                    onAdvertiserClick={handleAdvertiserClick}
                    onPlanRequest={handleOpenPricing} 
                />
                <FullWidthPromo />
                <div className="w-full px-4 md:px-12">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 mb-8 md:mb-12 mt-4 md:mt-16 animate-fadeIn">
                    <h2 className="text-4xl md:text-7xl lg:text-8xl font-[1000] uppercase tracking-tighter text-black leading-none">NOTÍCIAS</h2>
                    <div className="bg-red-600 px-6 md:px-10 py-2 md:py-4 skew-x-[-15deg] shadow-[0_10px_30px_rgba(220,38,38,0.3)] inline-block w-fit">
                      <span className="text-white font-black text-2xl md:text-5xl lg:text-6xl italic skew-x-[15deg] tracking-tighter whitespace-nowrap block leading-none">DO MOMENTO</span>
                    </div>
                  </div>
                  <section className="mb-12 md:mb-20 w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                    {filteredNews.slice(0, 6).map((item) => <NewsCard key={item.id} news={item} featured onClick={handleNewsClick} />)}
                  </section>
                </div>
                <DailyBread />
              </div>
            )}

            {view === 'admin' && user && (
              <AdminPanel 
                user={user} 
                newsHistory={news}
                allUsers={users}
                advertisers={advertisers}
                adConfig={adConfig}
                onAddNews={(n) => setNews(p => [...p, n])} 
                onUpdateNews={(n) => setNews(p => p.map(x => x.id === n.id ? n : x))}
                onUpdateUser={(u) => setUsers(p => p.map(x => x.id === u.id ? u : x))}
                onUpdateAdConfig={handleUpdateAdConfig}
              />
            )}
            {view === 'details' && selectedNews && <NewsDetails news={selectedNews} onBack={handleBackToHome} />}
            {view === 'advertiser' && selectedAdvertiser && <AdvertiserPage advertiser={selectedAdvertiser} onBack={handleBackToHome} />}
            {view === 'jobs' && <JobsBoard jobs={jobs} onBack={handleBackToHome} />}
          </main>
          {view !== 'login' && <Footer />}
        </div>
      </div>
    </div>
  );
};

export default App;
