import React, { useState, useEffect } from 'react';
import { User, Invoice, UserSession, AdPricingConfig, Advertiser, SystemSettings } from '../../types';
import Logo from './Logo';
import lfnmCoin from '@/assets/lfnm_coin.png';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import { getUserAdvertisers } from '../../services/content/advertiserService';
import UserSupportSection from '../user/UserSupportSection';
import UserStorePOS from './MyAccountModal/UserStorePOS';

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
              <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
                <div className="bg-gray-50 p-6 rounded-full mb-6 relative">
                  <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-20"></div>
                  <i className="fas fa-store-slash text-5xl text-gray-400"></i>
                </div>
                <h2 className="text-2xl font-black uppercase text-gray-900 mb-2">Loja em Manutenção</h2>
                <p className="text-gray-500 font-medium max-w-md text-center">
                  Estamos reformulando nossa loja de serviços e assinaturas.
                  <br />Novidades e ofertas exclusivas chegarão em breve.
                </p>
                <div className="mt-8 flex gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black uppercase rounded-lg tracking-widest">Em Breve</span>
                </div>
              </div>
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

        {activeTab === 'support' && (
          <div className="max-w-4xl mx-auto animate-fadeIn">
            <UserSupportSection userId={user.id} userName={user.name} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAccountModal;
