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

  const showBilling = !!systemSettings?.purchasingEnabled;

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

  // Helper para renderizar abas (Igual ao UserDetailModal)
  const renderTabButton = (id: typeof activeTab, label: string, icon: string) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`
              group flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full
              ${activeTab === id
          ? 'bg-black text-white font-bold'
          : 'text-gray-500 hover:bg-gray-100 hover:text-black'
        }
          `}
    >
      <div className={`
              w-8 h-8 rounded-lg flex items-center justify-center transition-colors
              ${activeTab === id
          ? 'bg-white/20 text-white'
          : 'bg-transparent text-current opacity-70 group-hover:opacity-100'
        }
          `}>
        <i className={`fas ${icon} text-sm`}></i>
      </div>
      <span className="text-sm font-medium tracking-wide">{label}</span>
      {activeTab === id && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500 hidden md:block animate-pulse"></div>
      )}
    </button>
  );

  const renderMobileTab = (id: typeof activeTab, label: string, icon: string) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`
              min-w-fit px-4 py-2 rounded-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all border
              ${activeTab === id
          ? 'bg-black text-white border-black'
          : 'bg-gray-50 text-gray-500 border-gray-200'
        }
          `}
    >
      <i className={`fas ${icon}`}></i>
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center p-0 md:p-6 lg:p-8">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity animate-fadeIn" onClick={onClose}></div>

      <div className={`
            relative z-10 w-full h-full md:rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-scaleIn bg-white
            max-w-[1400px] max-h-[900px] md:h-[90vh]
        `}>

        {/* --- LEFT SIDEBAR (Desktop) --- */}
        <div className="hidden md:flex w-[280px] flex-col border-r border-gray-100 bg-gray-50">
          <div className="p-8 pb-4">
            <div className="flex flex-col items-center">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleAvatarChange} accept="image/*" />
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 rounded-full">
                    <i className="fas fa-spinner fa-spin text-white"></i>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 rounded-full">
                  <i className="fas fa-camera text-white text-xl"></i>
                </div>

                <div className="w-28 h-28 rounded-full p-1 mb-4 bg-white shadow-sm">
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      className="w-full h-full rounded-full object-cover"
                      alt="Avatar"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 rounded-full text-white text-3xl font-black">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-4 right-0 w-8 h-8 rounded-full flex items-center justify-center border-4 border-gray-50 bg-green-500">
                  <i className="fas fa-check text-white text-[10px]"></i>
                </div>
              </div>
              <h2 className="text-lg font-bold text-center leading-tight mb-1 text-gray-900">{user.name}</h2>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-gray-200 text-gray-600">{user.role}</span>
              </div>
              {user.id && <span className="text-[9px] text-gray-400 mt-1">ID: {user.id.substring(0, 6)}</span>}
            </div>
          </div>

          <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
            {renderTabButton('profile', 'Identidade', 'fa-id-card')}
            {renderTabButton('professional', 'Dados Pro', 'fa-briefcase')}
            {renderTabButton('security', 'Segurança', 'fa-shield-halved')}
            {showBilling && renderTabButton('billing', 'Recursos', 'fa-coins')}
            {renderTabButton('support', 'Suporte', 'fa-headset')}
          </div>

          <div className="p-4 mt-auto border-t border-gray-200">
            {onLogout && (
              <button
                onClick={onLogout}
                className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors hover:bg-red-50 text-gray-500 hover:text-red-500"
              >
                <i className="fas fa-power-off"></i> Sair do Sistema
              </button>
            )}
          </div>
        </div>

        {/* --- MOBILE HEADER (Sticky) --- */}
        <div className="md:hidden shrink-0 flex flex-col border-b sticky top-0 z-20 bg-white border-gray-100">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-lg font-black uppercase italic tracking-tighter text-black">Minha <span className="text-red-600">Conta</span></h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-black">
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="px-4 pb-4 flex gap-2 overflow-x-auto no-scrollbar mask-gradient-right">
            {renderMobileTab('profile', 'Identidade', 'fa-id-card')}
            {renderMobileTab('professional', 'Dados', 'fa-briefcase')}
            {renderMobileTab('security', 'Segurança', 'fa-shield-alt')}
            {showBilling && renderMobileTab('billing', 'Loja', 'fa-coins')}
            {renderMobileTab('support', 'Suporte', 'fa-headset')}
          </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-white">
          <button
            onClick={onClose}
            className="hidden md:flex absolute top-6 right-6 z-50 w-10 h-10 rounded-full items-center justify-center transition-all hover:scale-110 bg-gray-100 hover:bg-gray-200 text-black border border-gray-200"
          >
            <i className="fas fa-times text-sm"></i>
          </button>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 lg:p-12">
            <div className="max-w-4xl mx-auto pb-20">
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
                <SupportSection user={user} systemSettings={systemSettings} onOpenTerms={onOpenTerms} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccountModal;
