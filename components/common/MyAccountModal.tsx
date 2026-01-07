import React, { useState, useEffect } from 'react';
import { User, Invoice, UserSession, AdPricingConfig } from '../../types';
import Logo from './Logo';
import lfnmCoin from '../../src/assets/lfnm_coin.png';

interface MyAccountModalProps {
  user: User;
  onClose: () => void;
  onUpdateUser: (updatedUser: User) => void;
  onLogout?: () => void;
  onOpenPricing?: () => void;
  adConfig?: AdPricingConfig;
}

import { userPurchaseItem } from '../../services/users/userService';
import { uploadToCloudinary } from '../../services/cloudinaryService';

interface MarketItem {
  id: string;
  type: 'plan' | 'boost';
  name: string;
  cost: number;
  icon: string;
  color: string;
  details?: any;
}

const UserStorePOS: React.FC<{ user: User, adConfig?: AdPricingConfig, onUpdateUser: (u: User) => void }> = ({ user, adConfig, onUpdateUser }) => {
  const [cartItems, setCartItems] = useState<MarketItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Construct Market Items
  const marketItems: MarketItem[] = [];
  adConfig?.plans.forEach(p => {
    marketItems.push({
      id: p.id,
      type: 'plan',
      name: p.name,
      cost: p.prices.monthly || 0,
      icon: 'fa-certificate',
      color: 'text-purple-600 bg-purple-100',
      details: { maxProducts: p.features.maxProducts, videoLimit: p.features.videoLimit }
    });
  });
  marketItems.push(
    { id: 'boost_posts_10', type: 'boost', name: '10 Posts', cost: 50, icon: 'fa-bullhorn', color: 'text-blue-600 bg-blue-100', details: { posts: 10 } },
    { id: 'boost_posts_50', type: 'boost', name: '50 Posts', cost: 200, icon: 'fa-bullhorn', color: 'text-blue-600 bg-blue-100', details: { posts: 50 } },
    { id: 'boost_videos_5', type: 'boost', name: '5 Vídeos', cost: 100, icon: 'fa-video', color: 'text-red-600 bg-red-100', details: { videos: 5 } },
    { id: 'boost_featured_7', type: 'boost', name: 'Destaque 7d', cost: 70, icon: 'fa-star', color: 'text-yellow-600 bg-yellow-100', details: { featuredDays: 7 } }
  );

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
          item.details
        );

        if (res.success && res.updatedUser) {
          lastUpdatedUser = res.updatedUser;
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
    <div className="flex flex-col md:flex-row gap-6">
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
        <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3">Serviços Disponíveis</h4>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
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
                  <img src={lfnmCoin} className="w-3.5 h-3.5 object-contain animate-coin-sm" alt="Coin" /> {item.cost}
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
        <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3">Seu Carrinho</h4>
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`
                        flex-1 min-h-[250px] border-2 border-dashed rounded-2xl flex flex-col p-4 transition-all relative overflow-hidden bg-white
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
                        <img src={lfnmCoin} className="w-3 h-3 object-contain animate-coin-sm" alt="Coin" /> {item.cost}
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
                <img src={lfnmCoin} className="w-3.5 h-3.5 object-contain animate-coin-sm" alt="Coin" /> {cartTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[9px] font-bold uppercase text-gray-400">Saldo Final</span>
              <span className={`text-[10px] font-black flex items-center gap-1 ${finalBalance < 0 ? 'text-red-500' : 'text-green-600'}`}>
                <img src={lfnmCoin} className="w-4 h-4 object-contain animate-coin-sm" alt="Coin" /> {finalBalance.toFixed(2)}
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

const MyAccountModal: React.FC<MyAccountModalProps> = ({ user, onClose, onUpdateUser, onLogout, onOpenPricing, adConfig }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'professional' | 'security' | 'billing' | 'notifications'>('profile');
  const [formData, setFormData] = useState({ ...user });
  const [isMaximized, setIsMaximized] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const handleSaveProfile = () => {
    onUpdateUser(formData);
    alert('Perfil atualizado com sucesso!');
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const url = await uploadToCloudinary(file, 'avatars', 'perfil_usuario');
      const updatedUser = { ...formData, avatar: url };
      setFormData(updatedUser);
      onUpdateUser(updatedUser);
    } catch (err: any) {
      alert('Erro ao carregar avatar: ' + err.message);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const TabButton = ({ id, label, icon }: { id: typeof activeTab, label: string, icon: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full text-left px-6 py-4 flex items-center gap-4 transition-all ${activeTab === id ? 'bg-black text-white font-bold' : 'text-gray-500 hover:bg-gray-50 hover:text-black font-medium'}`}
    >
      <i className={`fas ${icon} w-6 text-center ${activeTab === id ? 'text-red-500' : ''}`}></i>
      <span className="text-sm uppercase tracking-widest">{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className={`bg-white transition-all duration-300 overflow-hidden flex flex-col md:flex-row shadow-2xl relative z-10 ${isMaximized ? 'w-full h-full rounded-none' : 'w-full max-w-6xl h-[95vh] md:h-[90vh] rounded-none md:rounded-[2.5rem]'}`}>

        <div className="absolute top-4 right-4 md:top-8 md:right-8 z-50 flex gap-2">
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="w-10 h-10 md:w-16 md:h-16 bg-white border border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-black rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg active:scale-95"
            title={isMaximized ? "Restaurar" : "Maximizar"}
          >
            <i className={`fas ${isMaximized ? 'fa-compress' : 'fa-expand'} text-lg md:text-2xl`}></i>
          </button>
          <button
            onClick={onClose}
            className="w-10 h-10 md:w-16 md:h-16 bg-red-600 text-white hover:bg-black rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-300 shadow-2xl group active:scale-90 border-2 border-white/20"
          >
            <i className="fas fa-times text-xl md:text-3xl group-hover:rotate-90 transition-transform"></i>
          </button>
        </div>

        <div className="w-full md:w-80 bg-white border-r border-gray-100 flex flex-col">
          <div className="p-10 flex flex-col items-center border-b border-gray-100 bg-gray-50/50">
            <div
              className="w-24 h-24 rounded-full bg-gray-200 mb-4 overflow-hidden border-4 border-white shadow-lg relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
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
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
                accept="image/*"
              />
            </div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight text-center">{user.name}</h2>
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mt-2">{user.role}</span>

            {/* Balance Display in Sidebar */}
            <div className="mt-6 w-full bg-gray-900 rounded-xl p-4 text-center shadow-lg transform transition-all hover:scale-105 cursor-pointer" onClick={() => setActiveTab('billing')}>
              <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">Seu Saldo</p>
              <h3 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                <img src={lfnmCoin} className="w-6 h-6 object-contain animate-coin" alt="LFNM Coin" /> {(user.siteCredits || 0).toFixed(2)}
              </h3>
              <p className="text-[8px] text-gray-500 font-bold uppercase mt-1">Clique para recarregar</p>
            </div>
          </div>

          <nav className="flex-1 py-4">
            <TabButton id="profile" label="Meu Perfil" icon="fa-user-circle" />
            <TabButton id="professional" label="Identidade Profissional" icon="fa-briefcase" />
            <TabButton id="security" label="Segurança & Login" icon="fa-shield-alt" />
            <TabButton id="billing" label="Faturamento" icon="fa-credit-card" />
          </nav>

          <div className="p-6 border-t border-gray-100 text-center">
            {onLogout && <button onClick={onLogout} className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all">Sair da Conta</button>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 p-8 md:p-12 custom-scrollbar">

          {activeTab === 'profile' && (
            <div className="max-w-3xl mx-auto animate-fadeIn">
              <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-8">Meu <span className="text-red-600">Perfil</span></h1>
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Nome Completo</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Cidade</label>
                    <input type="text" value={formData.city || ''} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Estado</label>
                    <input type="text" value={formData.state || ''} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500 text-center" />
                  </div>
                </div>
                <button onClick={handleSaveProfile} className="bg-black text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-green-600 transition-all">Salvar</button>
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
                <button onClick={handleSaveProfile} className="bg-red-600 text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all">Atualizar Identidade Profissional</button>
              </div>
            </div>
          )}

          {activeTab === 'security' && <div className="text-center py-20 text-gray-400 font-bold uppercase text-xs">Módulo de Segurança em Desenvolvimento</div>}
          {activeTab === 'billing' && (
            <div className="max-w-4xl mx-auto animate-fadeIn">
              <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-8">Meus <span className="text-red-600">Planos & Loja</span></h1>

              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
                {/* Carteira Virtual */}
                <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-3xl text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Saldo em Carteira</p>
                      <h2 className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-3">
                        <img src={lfnmCoin} className="w-10 h-10 md:w-12 md:h-12 object-contain animate-coin" alt="LFNM Coin" />
                        {(user.siteCredits || 0).toFixed(2)}
                      </h2>
                      <p className="text-[10px] text-gray-500 mt-2 font-bold max-w-xs">Use seus créditos para adquirir destaques e planos comerciais.</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="bg-white text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-green-400 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                        <i className="fas fa-plus mr-2"></i> Recarregar
                      </button>
                    </div>
                  </div>
                </div>

                {/* LOJA / CART */}
                <div className="mt-8">
                  <UserStorePOS user={user} adConfig={adConfig} onUpdateUser={onUpdateUser} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAccountModal;
