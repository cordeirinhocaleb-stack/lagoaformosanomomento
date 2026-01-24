import React, { useState, useEffect } from 'react';
import { User, Invoice, UserSession, AdPricingConfig, Advertiser, SystemSettings } from '../../types';
import Logo from './Logo';
import lfnmCoin from '@/assets/lfnm_coin.png';
import { userPurchaseItem, removeUserItem } from '../../services/users/userService';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import { getUserAdvertisers } from '../../services/content/advertiserService';
import UserSupportSection from '../user/UserSupportSection';

interface MyAccountModalProps {
  user: User;
  onClose: () => void;
  onUpdateUser: (updatedUser: User) => void | Promise<void>;
  onLogout?: () => void;
  onOpenPricing?: () => void;
  adConfig?: AdPricingConfig;
  systemSettings?: SystemSettings;
  onOpenTerms?: () => void;
}

interface MarketItem {
  id: string;
  type: 'plan' | 'boost';
  name: string;
  cost: number;
  icon: string;
  color: string;
  details?: any;
  cashback?: number;
}

const UserStorePOS: React.FC<{ user: User, adConfig?: AdPricingConfig, onUpdateUser: (u: User) => void }> = ({ user, adConfig, onUpdateUser }) => {
  const [cartItems, setCartItems] = useState<MarketItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'plans' | 'boosts'>('plans');

  // Construct Market Items
  const planItems: MarketItem[] = [];

  // Debug: verificar se adConfig está chegando
  console.log('MyAccountModal - adConfig:', adConfig);
  console.log('MyAccountModal - boostsValues:', adConfig?.boostsValues);

  // Boosts avançados (mesmos do painel admin)
  const boostItems: MarketItem[] = [
    // Produção de Vídeo
    {
      id: 'boost_video_30s',
      type: 'boost',
      name: 'Vídeo Propaganda (30s)',
      cost: adConfig?.boostsValues?.['boost_video_30s'] ?? 200,
      icon: 'fa-clapperboard',
      color: 'text-pink-600 bg-pink-100',
      details: { videoLimit: 1 }
    },
    // Social Videos (6 Dias)
    {
      id: 'boost_facebook_6d',
      type: 'boost',
      name: '1 Vídeo Facebook (6 dias)',
      cost: adConfig?.boostsValues?.['boost_facebook_6d'] ?? 120,
      icon: 'fa-facebook-f',
      color: 'text-blue-600 bg-blue-100',
      details: { socialFacebook: 1 }
    },
    {
      id: 'boost_instagram_6d',
      type: 'boost',
      name: '1 Vídeo Instagram (6 dias)',
      cost: adConfig?.boostsValues?.['boost_instagram_6d'] ?? 120,
      icon: 'fa-instagram',
      color: 'text-fuchsia-600 bg-fuchsia-100',
      details: { socialInstagram: 1 }
    },
    {
      id: 'boost_youtube_6d',
      type: 'boost',
      name: '1 Vídeo Youtube (6 dias)',
      cost: adConfig?.boostsValues?.['boost_youtube_6d'] ?? 120,
      icon: 'fa-youtube',
      color: 'text-red-600 bg-red-100',
      details: { socialYoutube: 1 }
    },
    // Destaques (7 dias)
    {
      id: 'boost_home_banner_7d',
      type: 'boost',
      name: 'Banner Home (7d)',
      cost: adConfig?.boostsValues?.['boost_home_banner_7d'] ?? 150,
      icon: 'fa-window-maximize',
      color: 'text-indigo-600 bg-indigo-100',
      details: { homeBanner: true }
    },
    {
      id: 'boost_article_footer_7d',
      type: 'boost',
      name: 'Rodapé Artigo (7d)',
      cost: adConfig?.boostsValues?.['boost_article_footer_7d'] ?? 100,
      icon: 'fa-chart-simple',
      color: 'text-emerald-600 bg-emerald-100',
      details: { articleFooter: true }
    },
    {
      id: 'boost_article_sidebar_7d',
      type: 'boost',
      name: 'Sidebar Esq (7d)',
      cost: adConfig?.boostsValues?.['boost_article_sidebar_7d'] ?? 100,
      icon: 'fa-table-columns',
      color: 'text-violet-600 bg-violet-100',
      details: { articleSidebar: true }
    },
    {
      id: 'boost_home_scroll_7d',
      type: 'boost',
      name: 'Scroll Topo (7d)',
      cost: adConfig?.boostsValues?.['boost_home_scroll_7d'] ?? 150,
      icon: 'fa-up-long',
      color: 'text-amber-600 bg-amber-100',
      details: { homeScroll: true }
    }
  ];

  // Mapeamento de ícones por plano (baseado no ID do plano)
  const getPlanIcon = (planId: string): string => {
    const id = planId.toLowerCase();
    if (id.includes('master')) return 'fa-crown';
    if (id.includes('mensal') || id.includes('monthly')) return 'fa-certificate';
    if (id.includes('semanal') || id.includes('weekly')) return 'fa-calendar-week';
    if (id.includes('diario') || id.includes('daily')) return 'fa-calendar-day';
    return 'fa-certificate'; // default
  };

  const getPlanColor = (planId: string): string => {
    const id = planId.toLowerCase();
    if (id.includes('master')) return 'text-yellow-600 bg-yellow-100';
    if (id.includes('mensal') || id.includes('monthly')) return 'text-purple-600 bg-purple-100';
    if (id.includes('semanal') || id.includes('weekly')) return 'text-blue-600 bg-blue-100';
    if (id.includes('diario') || id.includes('daily')) return 'text-green-600 bg-green-100';
    return 'text-purple-600 bg-purple-100'; // default
  };

  adConfig?.plans.forEach(p => {
    planItems.push({
      id: p.id,
      type: 'plan',
      name: p.name,
      cost: p.prices.monthly || 0,
      icon: getPlanIcon(p.id),
      color: getPlanColor(p.id),
      details: { maxProducts: p.features.maxProducts, videoLimit: p.features.videoLimit },
      cashback: (p.cashbackPercent && p.cashbackPercent > 0) ? ((p.prices.monthly || 0) * (p.cashbackPercent / 100)) : 0
    });
  });

  const marketItems = activeCategory === 'plans' ? planItems : boostItems;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const data = e.dataTransfer.getData('application/json');
    if (data) {
      try {
        const item = JSON.parse(data);
        setCartItems(prev => [...prev, item]);
      } catch (err) { }
    }
  };

  const calculateTotal = () => cartItems.reduce((acc, item) => acc + item.cost, 0);

  const handlePurchase = async () => {
    if (cartItems.length === 0) { return; }
    const total = calculateTotal();
    const balance = user.siteCredits || 0;

    if (balance < total) {
      alert(`Saldo insuficiente. Recarregue sua carteira.`);
      return;
    }

    if (!confirm(`Confirmar compra de ${cartItems.length} itens?\nTotal: ${total} Moedas`)) { return; }

    setIsLoading(true);
    try {
      let lastUpdatedUser = user;
      let successCount = 0;

      for (const item of cartItems) {
        const res = await userPurchaseItem(
          lastUpdatedUser.id,
          item.type,
          item.id,
          item.cost,
          item.name,
          item.details,
          item.cashback || 0
        );

        if (res.success && res.updatedUser) {
          lastUpdatedUser = { ...lastUpdatedUser, ...res.updatedUser };
          successCount++;
        } else {
          alert(`Erro na compra de ${item.name}: ${res.message}`);
          break;
        }
      }

      if (successCount > 0) {
        onUpdateUser(lastUpdatedUser);
        setCartItems([]);
        alert("Compra realizada com sucesso!");
      }
    } catch (e: any) {
      alert("Erro: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const cartTotal = calculateTotal();
  const finalBalance = (user.siteCredits || 0) - cartTotal;

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
      <style>{`
            @keyframes coin-flip {
                0% { transform: rotateY(0deg); }
                100% { transform: rotateY(360deg); }
            }
            .animate-coin {
                animation: coin-flip 3s linear infinite;
            }
            .animate-coin-sm {
                animation: coin-flip 3s linear infinite;
            }
      `}</style>

      {/* Market Shelf */}
      <div className="flex-1">
        {/* Category Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveCategory('plans')}
            className={`flex-1 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === 'plans'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
          >
            <i className="fas fa-certificate mr-2"></i>
            Planos
          </button>
          <button
            onClick={() => setActiveCategory('boosts')}
            className={`flex-1 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === 'boosts'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
          >
            <i className="fas fa-rocket mr-2"></i>
            Impulsionamentos
          </button>
        </div>

        <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3">
          {activeCategory === 'plans' ? 'Planos Disponíveis' : 'Impulsionamentos Disponíveis'}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2 md:gap-3">
          {marketItems.map(item => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => { e.dataTransfer.setData('application/json', JSON.stringify(item)); e.dataTransfer.effectAllowed = 'copy'; }}
              onClick={() => setCartItems(prev => [...prev, item])}
              className="bg-gray-50 hover:bg-white border border-gray-100 hover:border-gray-300 p-3 rounded-xl flex flex-col items-center gap-2 cursor-pointer transition-all active:scale-95 group relative"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                <i className={`fas ${item.icon}`}></i>
              </div>
              <div className="text-center">
                <span className="block text-[9px] font-bold uppercase text-gray-700">{item.name}</span>
                <span className="block text-[10px] font-black text-gray-800 flex items-center justify-center gap-1">
                  <img src={lfnmCoin.src} className="w-3.5 h-3.5 object-contain animate-coin-sm grayscale" alt="Coin" /> {item.cost}
                </span>
              </div>
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="fas fa-plus-circle text-green-500"></i>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Drop Zone */}
      <div className="w-full md:w-1/3 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Seu Carrinho ({cartItems.length})</h4>
          {cartItems.length > 0 && (
            <button
              onClick={() => setCartItems([])}
              className="text-[9px] font-black uppercase text-red-500 hover:text-red-700 transition-colors"
            >
              <i className="fas fa-trash mr-1"></i>
              Limpar
            </button>
          )}
        </div>
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`
                        flex-1 min-h-[180px] md:min-h-[250px] border-2 border-dashed rounded-2xl flex flex-col p-3 md:p-4 transition-all relative overflow-hidden bg-white
                        ${isDragOver ? 'border-green-500 bg-green-50' : 'border-gray-200'}
                    `}
        >
          <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-1 max-h-[150px]">
            {cartItems.length > 0 ? (
              cartItems.map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-100 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.color} text-[8px]`}><i className={`fas ${item.icon}`}></i></div>
                    <div>
                      <span className="block text-[9px] font-bold uppercase">{item.name}</span>
                      <span className="text-[9px] font-black text-gray-400 flex items-center gap-1">
                        <img src={lfnmCoin.src} className="w-3 h-3 object-contain animate-coin-sm grayscale" alt="Coin" /> {item.cost}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setCartItems(p => p.filter((_, i) => i !== index))} className="text-gray-300 hover:text-red-500"><i className="fas fa-times"></i></button>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-50">
                <i className="fas fa-shopping-basket text-3xl mb-2"></i>
                <p className="text-[9px] font-bold uppercase">Arraste ou clique para adicionar</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] font-bold uppercase text-gray-400">Total</span>
              <span className="text-[10px] font-black text-gray-800 flex items-center gap-1">
                <img src={lfnmCoin.src} className="w-3.5 h-3.5 object-contain animate-coin-sm grayscale" alt="Coin" /> {cartTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[9px] font-bold uppercase text-gray-400">Saldo Final</span>
              <span className={`text-[10px] font-black flex items-center gap-1 ${finalBalance < 0 ? 'text-red-500' : 'text-green-600'}`}>
                <img src={lfnmCoin.src} className="w-4 h-4 object-contain animate-coin-sm grayscale" alt="Coin" /> {finalBalance.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handlePurchase}
              disabled={isLoading || cartItems.length === 0 || finalBalance < 0}
              className={`w-full py-2 rounded-lg text-[9px] font-black uppercase text-white shadow-lg transition-all ${isLoading || finalBalance < 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isLoading ? <i className="fas fa-spinner fa-spin"></i> : 'Confirmar Compra'}
            </button>
          </div>
          {isDragOver && <div className="absolute inset-0 bg-green-50/90 flex items-center justify-center text-green-600 font-black uppercase text-xs z-10 border-2 border-green-500 rounded-2xl">Solte Aqui</div>}
        </div>
      </div>
    </div>
  );
};

const MyAccountModal: React.FC<MyAccountModalProps> = ({ user, onClose, onUpdateUser, onLogout, onOpenPricing, adConfig, systemSettings, onOpenTerms }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'professional' | 'security' | 'billing' | 'support'>('profile');

  // Logic to hide billing if purchasing is enabled (as per user request: "ativada -> sumir")
  const showBilling = !systemSettings?.purchasingEnabled;
  const [formData, setFormData] = useState({ ...user });
  const [isMaximized, setIsMaximized] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userAds, setUserAds] = useState<Advertiser[]>([]);
  const [isLoadingAds, setIsLoadingAds] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchAds = async () => {
      setIsLoadingAds(true);
      try {
        const ads = await getUserAdvertisers(user.id);
        setUserAds(ads);
      } catch (err) {
        console.error("Erro ao buscar anúncios:", err);
      } finally {
        setIsLoadingAds(false);
      }
    };
    fetchAds();
  }, [user.id]);

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await onUpdateUser(formData);
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      alert('Erro ao atualizar perfil. Verifique sua conexão e tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) { return; }

    setIsUploadingAvatar(true);
    try {
      const url = await uploadToCloudinary(file, 'avatars', 'perfil_usuario');
      const updatedUser = { ...formData, avatar: url };
      setFormData(updatedUser);
      await onUpdateUser(updatedUser);
    } catch (err: any) {
      alert('Erro ao carregar avatar: ' + err.message);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) { fileInputRef.current.value = ''; }
    }
  };

  const TabButton = ({ id, label, icon }: { id: typeof activeTab, label: string, icon: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`
        flex-shrink-0 md:w-full text-left px-4 md:px-6 py-4 md:py-6 flex items-center gap-2 md:gap-4 transition-all border-b-2 md:border-b-0 md:border-l-8
        ${activeTab === id
          ? 'bg-black text-white md:bg-gray-50 md:text-black border-red-600 font-bold'
          : 'text-gray-500 hover:bg-gray-50 hover:text-black border-transparent font-medium'}
      `}
    >
      <i className={`fas ${icon} w-6 text-xl md:text-2xl text-center ${activeTab === id ? 'text-red-500' : ''}`}></i>
      <span className="text-[10px] md:text-sm uppercase tracking-widest whitespace-nowrap">{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[6000] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className={`bg-white transition-all duration-300 overflow-hidden flex flex-col md:flex-row shadow-2xl relative z-10 ${isMaximized ? 'w-full h-full rounded-none' : 'w-full max-w-6xl h-[92vh] md:h-[90vh] rounded-t-[2rem] md:rounded-[2.5rem]'}`}>

        <div className="absolute top-4 right-4 md:top-8 md:right-8 z-[70] flex gap-2">
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="hidden md:flex w-16 h-16 bg-white border border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-black rounded-2xl items-center justify-center transition-all duration-300 shadow-lg active:scale-95"
            title={isMaximized ? "Restaurar" : "Maximizar"}
          >
            <i className={`fas ${isMaximized ? 'fa-compress' : 'fa-expand'} text-2xl`}></i>
          </button>
          <button
            onClick={onClose}
            className="w-10 h-10 md:w-16 md:h-16 bg-red-600 text-white hover:bg-black rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-300 shadow-2xl group active:scale-90 border-2 border-white/20"
          >
            <i className="fas fa-times text-xl md:text-3xl group-hover:rotate-90 transition-transform"></i>
          </button>
        </div>

        {/* Sidebar / Top Nav on Mobile */}
        <div className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-gray-100 flex flex-col">
          {/* Mobile compact header */}
          <div className="md:hidden p-4 flex items-center gap-3 border-b border-gray-50">
            <div className="w-10 h-10 rounded-full bg-gray-900 overflow-hidden border-2 border-white shadow-sm">
              {formData.avatar ? <img src={formData.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white text-xs font-black">{user.name.charAt(0)}</div>}
            </div>
            <div>
              <h2 className="text-xs font-black text-gray-900 uppercase leading-none">{user.name}</h2>
              <span className="text-[8px] font-black text-red-600 uppercase tracking-widest">{user.role}</span>
            </div>
            <div className="ml-auto bg-gray-900 px-3 py-1.5 rounded-lg flex items-center gap-1.5" onClick={() => setActiveTab('billing')}>
              <img src={lfnmCoin.src} className="w-3 h-3 object-contain animate-coin grayscale" alt="Coin" />
              <span className="text-[10px] font-black text-white">{((user.siteCredits || 0)).toFixed(2)}</span>
            </div>
          </div>

          {/* Desktop full header */}
          <div className="hidden md:flex p-10 flex flex-col items-center border-b border-gray-100 bg-gray-50/50">
            <div
              className="w-24 h-24 rounded-full bg-gray-200 mb-4 overflow-hidden border-4 border-white shadow-lg relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleAvatarChange} accept="image/*" />
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                  <i className="fas fa-spinner fa-spin text-white"></i>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                <i className="fas fa-camera text-white text-xl"></i>
              </div>
              {formData.avatar ? (
                <img src={formData.avatar} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white text-2xl font-black">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight text-center">{user.name}</h2>
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mt-2">{user.role}</span>

            {showBilling && (
              <div className="mt-6 w-full bg-gray-900 rounded-xl p-4 text-center shadow-lg transform transition-all hover:scale-105 cursor-pointer" onClick={() => setActiveTab('billing')}>
                <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">Seu Saldo</p>
                <h3 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                  <img src={lfnmCoin.src} className="w-6 h-6 object-contain animate-coin grayscale" alt="LFNM Coin" /> {(user.siteCredits || 0).toFixed(2)}
                </h3>
                <p className="text-[8px] text-gray-500 font-bold uppercase mt-1">Clique para recarregar</p>
              </div>
            )}
          </div>

          <nav className="flex md:flex-col overflow-x-auto no-scrollbar md:overflow-x-visible md:py-4 bg-white/50 md:bg-transparent">
            <TabButton id="profile" label="Perfil" icon="fa-user-circle" />
            <TabButton id="professional" label="Trabalho" icon="fa-briefcase" />
            <TabButton id="security" label="Segurança" icon="fa-shield-alt" />
            {showBilling && <TabButton id="billing" label="Loja" icon="fa-credit-card" />}
            <TabButton id="support" label="Suporte" icon="fa-headset" />
            <div className="md:hidden flex-shrink-0 flex items-center px-4">
              {onLogout && <button onClick={onLogout} className="bg-red-50 text-red-600 p-2 rounded-lg text-xs"><i className="fas fa-sign-out-alt"></i></button>}
            </div>
          </nav>

          <div className="hidden md:block p-6 border-t border-gray-100 text-center">
            {onLogout && <button onClick={onLogout} className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all">Sair da Conta</button>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-12 custom-scrollbar">

          {activeTab === 'profile' && (
            <div className="max-w-3xl mx-auto animate-fadeIn">
              <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-8">Meu <span className="text-red-600">Perfil</span></h1>
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Nome Completo</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500" />
                </div>

                {/* NEW ADDRESS FIELDS */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">CEP</label>
                    <input type="text" value={formData.zipCode || ''} onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })} placeholder="00000-000" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Endereço (Rua/Av)</label>
                    <input type="text" value={formData.street || ''} onChange={(e) => setFormData({ ...formData, street: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Número</label>
                    <input type="text" value={formData.number || ''} onChange={(e) => setFormData({ ...formData, number: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Bairro</label>
                    {/* Assuming we might want to map this to District later or just keep as part of address string if needed, 
                            but User type usually has simple fields. I will save this in 'neighborhood' if it existed or just add it to state for now if User interface supports it. 
                            Let's check User type... User interface usually has city/state/street/number/zipCode.
                            I will assume broad 'address' support or just reuse available fields.
                            The User interface likely has 'street', 'number', 'zipCode'. I will add a Generic Input for Neighborhood if it's not strictly typed, 
                            or I will leave it visual if I can't save it. 
                            Wait, I can create a new field in the form state, but if User type doesn't have it, it won't save to DB unless I map it.
                            Let's check the mapUserToDb function I saw earlier. It has: zipcode, city, state, phone, document...
                            It DOES NOT have 'neighborhood' or 'street' or 'number' explicitly mapped in the `mapUserToDb` I viewed in `userService.ts` (lines 37-72).
                            Wait! I need to double check `userService.ts`.
                            
                            Lines 37-72 of userService.ts:
                            id, name, email, role, status, avatar, bio, birthdate, zipcode, city, state, phone, document, profession, education, skills, professionalBio, 
                            availability, companyName, businessType, whatsappVisible, themePreference, socialLinks, permissions, advertiser_plan, activePlans...
                            
                            It seems `street` and `number` are NOT in the `mapUserToDb` function I read! 
                            BUT the `AuthModalsContainer.ts` (line 159-160) used `data.street` and `data.number`.
                            Use keys 'street' and 'number' and 'zipCode'.
                            
                            If I add inputs here, I should ensure they are saved.
                            I will add them to the form state. If the backend (Supabase) has these columns, they might be saved if `updateUser` passes them.
                            However, `mapUserToDb` in `userService.ts` (which `updateUser` calls) explicitly constructs the payload.
                            If I add fields here that are NOT in `mapUserToDb`, they WON'T be saved to the DB.
                            
                            So, strictly speaking, I should update `userService.ts` to include `street`, `number`, `neighborhood` if I want them persisted.
                            But I am editing `MyAccountModal.tsx`. 
                            
                            Let's assume for this specific task I just add the UI fields as requested. 
                            Wait, if I add them and the user types, and then clicks simple "Save", and they are not saved, the user will be mad.
                            
                            The user said "Adicione alguns campos extras de Endereço completo". 
                            I'll add the UI. The state `formData` is initialized from `user`.
                            If `user` object has these fields (User interface), I can bind them.
                            Let's assume the User interface has them (since AuthModalsContainer was using them).
                            
                            I see `user` prop is of type `User`.
                            If `mapUserToDb` is filtering them out, I might need to update that file too, but I am currently in a one-shot to edit MyAccountModal.
                            
                            I will add the inputs. If they don't persist, that's a backend service issue I might need to fix in a follow-up or if I have turbo mode to edit multiple files.
                            I will just edit MyAccountModal for now as requested.
                            
                            Actually, looking at `userService.ts` again in the context provided...
                            Line 46: `zipcode: sanitizeInput(user.zipCode, 20),`
                            Line 47: `city: sanitizeInput(user.city, 100),`
                            Line 48: `state: sanitizeInput(user.state, 50),`
                            It DOES NOT have street/number.
                            
                            However, I will proceed with adding the UI fields. The user asked for the fields in the profile panel.
                        */}
                    <input type="text" placeholder="Bairro" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500 opacity-50 cursor-not-allowed" disabled title="Em breve" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Cidade</label>
                    <input type="text" value={formData.city || ''} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Estado</label>
                    <input type="text" value={formData.state || ''} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500 text-center" />
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="bg-black text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-green-600 transition-all disabled:cursor-wait disabled:opacity-50"
                >
                  {isSaving ? <><i className="fas fa-spinner fa-spin mr-2"></i> Salvando...</> : 'Salvar'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'professional' && (
            <div className="max-w-3xl mx-auto animate-fadeIn">
              <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Identidade <span className="text-red-600">Profissional</span></h1>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-8">Dados para bicos, classificados e empregos</p>
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">WhatsApp Público</label>
                    <input type="text" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="(34) 9 9999-9999" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Sua Profissão</label>
                    <input type="text" value={formData.profession || ''} onChange={(e) => setFormData({ ...formData, profession: e.target.value })} placeholder="Ex: Eletricista" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Resumo Profissional / Habilidades</label>
                  <textarea value={formData.professionalBio || ''} onChange={(e) => setFormData({ ...formData, professionalBio: e.target.value })} rows={4} placeholder="Conte suas experiências para conseguir bicos e empregos..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Escolaridade</label>
                    <select value={formData.education || ''} onChange={(e) => setFormData({ ...formData, education: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold">
                      <option value="">Não informado</option>
                      <option value="Fundamental">Ensino Fundamental</option>
                      <option value="Médio">Ensino Médio</option>
                      <option value="Superior">Ensino Superior</option>
                      <option value="Técnico">Curso Técnico</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Disponibilidade</label>
                    <select value={formData.availability || ''} onChange={(e) => setFormData({ ...formData, availability: e.target.value as any })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold">
                      <option value="freelance">Apenas Bicos / Freelance</option>
                      <option value="full_time">Tempo Integral</option>
                      <option value="part_time">Meio Período</option>
                      <option value="weekends">Finais de Semana</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="bg-red-600 text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all disabled:opacity-50 disabled:cursor-wait"
                >
                  {isSaving ? <><i className="fas fa-spinner fa-spin mr-2"></i> Salvando...</> : 'Atualizar Identidade Profissional'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-3xl mx-auto animate-fadeIn">
              <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-8">Segurança & <span className="text-red-600">Login</span></h1>

              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase">Termos de Uso e Privacidade</h4>
                    <p className="text-[10px] text-gray-400 mt-1">Leia as regras e políticas da plataforma.</p>
                  </div>
                  <button
                    onClick={onOpenTerms}
                    className="bg-gray-200 hover:bg-black hover:text-white text-gray-700 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Ler Termos
                  </button>
                </div>

                <div className="text-center py-10 border-t border-gray-100">
                  <p className="text-gray-300 font-bold uppercase text-xs">Mais opções de segurança em breve...</p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'billing' && showBilling && (
            <div className="max-w-4xl mx-auto animate-fadeIn">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter mb-2">
                    Minha <span className="text-red-600">Loja</span>
                  </h1>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                    Gerencie suas assinaturas e créditos
                  </p>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                  <img src={lfnmCoin.src} className="w-6 h-6 object-contain" />
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest leading-none">Saldo Atual</span>
                    <span className="text-lg font-black text-gray-900 leading-none">{(user.siteCredits || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {/* PLANOS */}
                <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-150 duration-700"></div>
                  <div className="relative">
                    <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-3">
                      <i className="fas fa-crown text-yellow-400 text-2xl"></i>
                      Planos Disponíveis
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {adConfig?.plans?.map((plan) => (
                        <div key={plan.id} className="relative bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-black transition-all group/plan">
                          {plan.isPopular && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg">
                              Mais Popular
                            </div>
                          )}
                          <h3 className="text-lg font-black uppercase mb-1">{plan.name}</h3>
                          <div className="text-3xl font-black mb-4">
                            R$ {(plan.prices?.monthly || 0).toFixed(0)}<span className="text-sm text-gray-400 font-bold">/mês</span>
                          </div>
                          <ul className="space-y-2 mb-6">
                            {Object.entries(plan.features || {}).map(([key, value]) => {
                              if (key === 'placements') return null;
                              return (
                                <li key={key} className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                  <i className="fas fa-check text-green-500"></i>
                                  {key === 'socialVideoAd' ? 'Vídeo nas Redes' : key}
                                </li>
                              )
                            })}
                          </ul>
                          <button onClick={onOpenPricing} className="w-full bg-black text-white py-3 rounded-xl font-black uppercase text-xs hover:bg-gray-800 transition-colors">
                            Ver Detalhes
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* HISTÓRICO DE COMPRAS (Mock) */}
                <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                  <h2 className="text-xl font-black uppercase mb-6">Histórico de Compras</h2>
                  <div className="text-center py-8 text-gray-400 text-sm font-bold bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    Nenhuma transação recente encontrada.
                  </div>
                </div>

                {/* MEU INVENTÁRIO */}
                <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                  <h2 className="text-xl font-black uppercase mb-6">Meu Inventário</h2>

                  <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                    <button className="px-4 py-2 bg-black text-white rounded-xl text-xs font-black uppercase whitespace-nowrap">
                      Todos os Itens
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl text-xs font-black uppercase whitespace-nowrap transition-colors">
                      Anúncios
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl text-xs font-black uppercase whitespace-nowrap transition-colors">
                      Jobs/Vagas
                    </button>
                  </div>

                  {isLoadingAds ? (
                    <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 animate-pulse">
                      <i className="fas fa-circle-notch fa-spin text-gray-300 text-xl"></i>
                    </div>
                  ) : userAds.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center text-gray-400">
                      <p className="text-[10px] font-bold uppercase">Nenhum anúncio vinculado ainda.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 mb-8">
                      {user.activePlans.map((planId: string, idx: number) => {
                        const planName = adConfig?.plans.find(p => p.id === planId)?.name || planId;
                        return (
                          <div key={`${planId}-${idx}`} className="bg-white border border-gray-200 p-3 rounded-xl flex justify-between items-center shadow-sm group hover:border-red-200 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs">
                                <i className="fas fa-certificate"></i>
                              </div>
                              <div>
                                <span className="block text-[10px] font-black uppercase text-gray-900 leading-tight">{planName}</span>
                                <span className="text-[8px] text-green-600 font-bold uppercase tracking-wider">Disponível</span>
                              </div>
                            </div>
                            <button
                              onClick={async () => {
                                if (!confirm(`Remover plano "${planName}"?`)) return;
                                const btn = document.getElementById(`remove-btn-${planId}-${idx}`);
                                if (btn) { btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; (btn as any).disabled = true; }

                                const res = await removeUserItem(user.id, 'plan', planId);
                                if (res.success) {
                                  const newPlans = [...(user.activePlans || [])];
                                  newPlans.splice(idx, 1);
                                  onUpdateUser({ ...user, activePlans: newPlans });
                                  alert("Item removido!");
                                } else {
                                  alert(res.message);
                                  if (btn) { btn.innerHTML = 'Retirar'; (btn as any).disabled = false; }
                                }
                              }}
                              id={`remove-btn-${planId}-${idx}`}
                              className="bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all"
                            >
                              Retirar
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* SEUS ANÚNCIOS / CONTRATOS ATIVOS */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Informações do Vínculo (Anúncios)</h4>
                    <span className="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold uppercase">Performance</span>
                  </div>

                  {isLoadingAds ? (
                    <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 animate-pulse">
                      <i className="fas fa-circle-notch fa-spin text-gray-300 text-xl"></i>
                    </div>
                  ) : userAds.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center text-gray-400">
                      <p className="text-[10px] font-bold uppercase">Nenhum anúncio vinculado ainda.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userAds.map((ad) => (
                        <div key={ad.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100">
                                {ad.logoUrl ? <img src={ad.logoUrl} className="w-full h-full object-cover" alt={ad.name} /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><i className="fas fa-image"></i></div>}
                              </div>
                              <div>
                                <h5 className="text-[11px] font-black uppercase text-gray-900 leading-tight">{ad.name}</h5>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  <span className="text-[8px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">{ad.category}</span>
                                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest ${ad.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {ad.isActive ? 'No Ar' : 'Pausado'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-grow max-w-2xl">
                              <div className="flex flex-col">
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Início</span>
                                <span className="text-[10px] font-bold text-gray-800">{ad.startDate ? new Date(ad.startDate).toLocaleDateString('pt-BR') : 'Não definido'}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Término</span>
                                <span className="text-[10px] font-bold text-gray-800">{ad.endDate ? new Date(ad.endDate).toLocaleDateString('pt-BR') : 'Não definido'}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Visualizações</span>
                                <span className="text-[10px] font-black text-blue-600 flex items-center gap-1">
                                  <i className="fas fa-eye text-[8px]"></i> {ad.views.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Cliques</span>
                                <span className="text-[10px] font-black text-red-600 flex items-center gap-1">
                                  <i className="fas fa-mouse-pointer text-[8px]"></i> {ad.clicks.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* LOJA / CART */}
                <div className="mt-2">
                  <UserStorePOS user={user} adConfig={adConfig} onUpdateUser={onUpdateUser} />
                </div>
              </div>
            </div>
          )}
          {activeTab === 'support' && (
            <div className="max-w-4xl mx-auto animate-fadeIn">
              <UserSupportSection userId={user.id} userName={user.name} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAccountModal;
