import React, { useState, useEffect } from 'react';
import { User, AdPricingConfig, SystemSettings } from '../../types';
import lfnmCoin from '@/assets/lfnm_coin.png';

// Hooks
import { useAvatarUpload } from './MyAccountModal/hooks/useAvatarUpload';
import { useAccountData } from './MyAccountModal/hooks/useAccountData';
import { useAccountActions } from './MyAccountModal/hooks/useAccountActions';

// Componentes
import TabButton from './MyAccountModal/components/TabButton';
import AdvertiserCard from './MyAccountModal/components/AdvertiserCard';
import UserStorePOS from './MyAccountModal/UserStorePOS';

// Seções
import ProfileSection from './MyAccountModal/sections/ProfileSection';
import ProfessionalSection from './MyAccountModal/sections/ProfessionalSection';
import SecuritySection from './MyAccountModal/sections/SecuritySection';
import BillingSection from './MyAccountModal/sections/BillingSection';
import SupportSection from './MyAccountModal/sections/SupportSection';

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

const MyAccountModal: React.FC<MyAccountModalProps> = ({
  user,
  onClose,
  onUpdateUser,
  onLogout,
  onOpenPricing,
  adConfig,
  systemSettings,
  onOpenTerms
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'professional' | 'security' | 'billing' | 'support'>('profile');
  const [formData, setFormData] = useState({ ...user });
  const [isMaximized, setIsMaximized] = useState(false);

  const showBilling = !systemSettings?.purchasingEnabled;

  // Custom hooks
  const { isUploadingAvatar, fileInputRef, handleAvatarChange } = useAvatarUpload(formData, setFormData, onUpdateUser);
  const { userAds, isLoadingAds } = useAccountData(user.id);
  const { isSaving, handleSaveProfile } = useAccountActions(formData, onUpdateUser);

  // Lock body scroll
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[6000] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className={`bg-white transition-all duration-300 overflow-hidden flex flex-col md:flex-row shadow-2xl relative z-10 ${isMaximized ? 'w-full h-full rounded-none' : 'w-full max-w-6xl h-[92vh] md:h-[90vh] rounded-t-[2rem] md:rounded-[2.5rem]'}`}>

        {/* Close/Maximize buttons */}
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

        {/* Sidebar */}
        <div className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-gray-100 flex flex-col">
          {/* Mobile compact header */}
          <div className="md:hidden p-4 flex items-center gap-3 border-b border-gray-50">
            <div className="w-10 h-10 rounded-full bg-gray-900 overflow-hidden border-2 border-white shadow-sm">
              {formData.avatar ? (
                <img src={formData.avatar} className="w-full h-full object-cover" alt="Avatar" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-xs font-black">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xs font-black text-gray-900 uppercase leading-none">{user.name}</h2>
              <span className="text-[8px] font-black text-red-600 uppercase tracking-widest">{user.role}</span>
            </div>
            <div className="ml-auto bg-gray-900 px-3 py-1.5 rounded-lg flex items-center gap-1.5" onClick={() => setActiveTab('billing')}>
              <img src={lfnmCoin.src} className="w-3 h-3 object-contain animate-coin grayscale" alt="Coin" />
              <span className="text-[10px] font-black text-white">{(user.siteCredits || 0).toFixed(2)}</span>
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
                <img src={formData.avatar} className="w-full h-full object-cover" alt="Avatar" />
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
                  <img src={lfnmCoin.src} className="w-6 h-6 object-contain animate-coin grayscale" alt="Coin" />
                  {(user.siteCredits || 0).toFixed(2)}
                </h3>
                <p className="text-[8px] text-gray-500 font-bold uppercase mt-1">Clique para recarregar</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex md:flex-col overflow-x-auto no-scrollbar md:overflow-x-visible md:py-4 bg-white/50 md:bg-transparent">
            <TabButton id="profile" label="Perfil" icon="fa-user-circle" activeTab={activeTab} onClick={setActiveTab} />
            <TabButton id="professional" label="Trabalho" icon="fa-briefcase" activeTab={activeTab} onClick={setActiveTab} />
            <TabButton id="security" label="Segurança" icon="fa-shield-alt" activeTab={activeTab} onClick={setActiveTab} />
            {showBilling && <TabButton id="billing" label="Loja" icon="fa-credit-card" activeTab={activeTab} onClick={setActiveTab} />}
            <TabButton id="support" label="Suporte" icon="fa-headset" activeTab={activeTab} onClick={setActiveTab} />
            <div className="md:hidden flex-shrink-0 flex items-center px-4">
              {onLogout && <button onClick={onLogout} className="bg-red-50 text-red-600 p-2 rounded-lg text-xs"><i className="fas fa-sign-out-alt"></i></button>}
            </div>
          </nav>

          <div className="hidden md:block p-6 border-t border-gray-100 text-center">
            {onLogout && <button onClick={onLogout} className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all">Sair da Conta</button>}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-12 custom-scrollbar">
          {activeTab === 'profile' && (
            <ProfileSection
              formData={formData}
              setFormData={setFormData}
              isSaving={isSaving}
              handleSaveProfile={handleSaveProfile}
            />
          )}

          {activeTab === 'professional' && (
            <ProfessionalSection
              formData={formData}
              setFormData={setFormData}
              isSaving={isSaving}
              handleSaveProfile={handleSaveProfile}
            />
          )}

          {activeTab === 'security' && (
            <SecuritySection onOpenTerms={onOpenTerms} />
          )}

          {activeTab === 'billing' && showBilling && (
            <BillingSection
              user={user}
              adConfig={adConfig}
              onUpdateUser={onUpdateUser}
              userAds={userAds}
              isLoadingAds={isLoadingAds}
              AdvertiserCard={AdvertiserCard}
            />
          )}

          {activeTab === 'support' && (
            <SupportSection />
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAccountModal;
