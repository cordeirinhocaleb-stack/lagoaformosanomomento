import React, { useState, useEffect } from 'react';
import { User, Invoice, UserSession } from '../../types';
import Logo from './Logo';

interface MyAccountModalProps {
  user: User;
  onClose: () => void;
  onUpdateUser: (updatedUser: User) => void;
  onLogout?: () => void;
}

const MOCK_SESSIONS: UserSession[] = [
  { id: '1', device: 'Chrome no Windows', location: 'Lagoa Formosa, MG', lastActive: 'Agora', isCurrent: true },
  { id: '2', device: 'iPhone 13', location: 'Patos de Minas, MG', lastActive: 'Há 2 horas', isCurrent: false },
];

const MOCK_INVOICES: Invoice[] = [
  { id: 'inv_001', date: '2025-01-01', description: 'Assinatura Anual - Plano Master', amount: 12000, status: 'paid' },
  { id: 'inv_002', date: '2024-01-01', description: 'Assinatura Anual - Plano Master', amount: 10000, status: 'paid' },
];

const MyAccountModal: React.FC<MyAccountModalProps> = ({ user, onClose, onUpdateUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'billing' | 'notifications'>('profile');
  const [formData, setFormData] = useState({ ...user });
  
  // Bloqueia o scroll da home ao abrir o perfil
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
    <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl relative">
        
        <button onClick={onClose} className="absolute top-6 right-6 z-50 w-10 h-10 bg-gray-100 hover:bg-red-600 hover:text-white rounded-full flex items-center justify-center transition-colors">
          <i className="fas fa-times"></i>
        </button>

        <div className="w-full md:w-80 bg-white border-r border-gray-100 flex flex-col">
          <div className="p-10 flex flex-col items-center border-b border-gray-100 bg-gray-50/50">
            <div 
                className="w-16 h-16 mb-6 cursor-pointer hover:scale-110 transition-transform hover:rotate-3 duration-300 drop-shadow-xl"
                onClick={() => {
                    try { window.location.hash = '/'; } catch (e) { console.warn('Hash navigation prevented'); }
                    onClose();
                }}
                title="Voltar para Home"
            >
                <Logo />
            </div>

            <div className="w-24 h-24 rounded-full bg-gray-200 mb-4 overflow-hidden border-4 border-white shadow-lg relative group cursor-pointer">
              {user.avatar ? (
                <img src={user.avatar} className="w-full h-full object-cover" alt="Avatar" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white text-2xl font-black">{user.name.charAt(0)}</div>
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="fas fa-camera text-white"></i>
              </div>
            </div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight text-center">{user.name}</h2>
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mt-2">{user.role}</span>
          </div>
          
          <nav className="flex-1 py-4">
            <TabButton id="profile" label="Meu Perfil" icon="fa-user-circle" />
            <TabButton id="security" label="Segurança & Login" icon="fa-shield-alt" />
            <TabButton id="billing" label="Faturamento" icon="fa-credit-card" />
            <TabButton id="notifications" label="Notificações" icon="fa-bell" />
          </nav>

          <div className="p-6 border-t border-gray-100 text-center space-y-4">
            {onLogout && (
                <button 
                    onClick={onLogout}
                    className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                    <i className="fas fa-power-off"></i> Sair da Conta
                </button>
            )}
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">ID: {user.id}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 p-8 md:p-12 custom-scrollbar">
          
          {activeTab === 'profile' && (
            <div className="max-w-3xl mx-auto animate-fadeIn">
              <header className="mb-8">
                <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Meu <span className="text-red-600">Perfil</span></h1>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Configurações de interface e dados pessoais</p>
              </header>

              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-8">
                <section>
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-4 block tracking-widest">Tema do Portal</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => setFormData({...formData, themePreference: 'light'})}
                            className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${formData.themePreference === 'light' ? 'bg-white border-red-600 shadow-lg' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-white'}`}
                        >
                            <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center text-white shadow-sm">
                                <i className="fas fa-sun"></i>
                            </div>
                            <div className="text-left">
                                <p className="font-black text-xs uppercase text-gray-900">Tema Claro</p>
                                <p className="text-[9px] font-bold uppercase opacity-50">Interface limpa e clássica</p>
                            </div>
                        </button>
                        <button 
                            onClick={() => setFormData({...formData, themePreference: 'dark'})}
                            className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${formData.themePreference === 'dark' ? 'bg-zinc-900 border-red-600 shadow-lg' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-zinc-800'}`}
                        >
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                                <i className="fas fa-moon"></i>
                            </div>
                            <div className="text-left">
                                <p className={`font-black text-xs uppercase ${formData.themePreference === 'dark' ? 'text-white' : 'text-gray-900'}`}>Tema Escuro</p>
                                <p className="text-[9px] font-bold uppercase opacity-50">Foco total no conteúdo</p>
                            </div>
                        </button>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Nome Completo</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">E-mail Corporativo</label>
                    <input 
                      type="email" 
                      value={formData.email} 
                      readOnly
                      className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-500 cursor-not-allowed" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Bio (Exibida nos posts)</label>
                  <textarea 
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    rows={4}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 resize-none"
                    placeholder="Conte um pouco sobre você..."
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button onClick={handleSaveProfile} className="bg-black text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-green-600 transition-all shadow-lg">
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'security' && (
            <div className="max-w-3xl mx-auto animate-fadeIn">
               <p className="text-center py-20 text-gray-400 font-bold uppercase text-xs">Módulo de Segurança</p>
            </div>
          )}
          {activeTab === 'billing' && (
            <div className="max-w-3xl mx-auto animate-fadeIn">
               <p className="text-center py-20 text-gray-400 font-bold uppercase text-xs">Módulo Financeiro</p>
            </div>
          )}
          {activeTab === 'notifications' && (
            <div className="max-w-3xl mx-auto animate-fadeIn">
               <p className="text-center py-20 text-gray-400 font-bold uppercase text-xs">Módulo de Notificações</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAccountModal;