
import React, { useState } from 'react';
import { User, Invoice, UserSession } from '../../types';

interface MyAccountModalProps {
  user: User;
  onClose: () => void;
  onUpdateUser: (updatedUser: User) => void;
}

const MOCK_SESSIONS: UserSession[] = [
  { id: '1', device: 'Chrome no Windows', location: 'Lagoa Formosa, MG', lastActive: 'Agora', isCurrent: true },
  { id: '2', device: 'iPhone 13', location: 'Patos de Minas, MG', lastActive: 'Há 2 horas', isCurrent: false },
];

const MOCK_INVOICES: Invoice[] = [
  { id: 'inv_001', date: '2025-01-01', description: 'Assinatura Anual - Plano Master', amount: 12000, status: 'paid' },
  { id: 'inv_002', date: '2024-01-01', description: 'Assinatura Anual - Plano Master', amount: 10000, status: 'paid' },
];

const MyAccountModal: React.FC<MyAccountModalProps> = ({ user, onClose, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'billing' | 'notifications'>('profile');
  const [formData, setFormData] = useState({ ...user });
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  
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
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-6 right-6 z-50 w-10 h-10 bg-gray-100 hover:bg-red-600 hover:text-white rounded-full flex items-center justify-center transition-colors">
          <i className="fas fa-times"></i>
        </button>

        {/* Sidebar */}
        <div className="w-full md:w-80 bg-white border-r border-gray-100 flex flex-col">
          <div className="p-10 flex flex-col items-center border-b border-gray-100 bg-gray-50/50">
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

          <div className="p-6 border-t border-gray-100 text-center">
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">ID: {user.id}</p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-8 md:p-12 custom-scrollbar">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="max-w-3xl mx-auto animate-fadeIn">
              <header className="mb-8">
                <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Meu <span className="text-red-600">Perfil</span></h1>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Informações públicas e pessoais</p>
              </header>

              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
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

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Redes Sociais</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <i className="fab fa-instagram absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                      <input type="text" placeholder="@usuario" className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-xs font-bold" value={formData.socialLinks?.instagram || ''} onChange={e => setFormData({...formData, socialLinks: {...formData.socialLinks, instagram: e.target.value}})} />
                    </div>
                    <div className="relative">
                      <i className="fab fa-twitter absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                      <input type="text" placeholder="@usuario" className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-xs font-bold" value={formData.socialLinks?.twitter || ''} onChange={e => setFormData({...formData, socialLinks: {...formData.socialLinks, twitter: e.target.value}})} />
                    </div>
                    <div className="relative">
                      <i className="fab fa-linkedin absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                      <input type="text" placeholder="URL" className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-xs font-bold" value={formData.socialLinks?.linkedin || ''} onChange={e => setFormData({...formData, socialLinks: {...formData.socialLinks, linkedin: e.target.value}})} />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button onClick={handleSaveProfile} className="bg-black text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-green-600 transition-all shadow-lg">
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="max-w-3xl mx-auto animate-fadeIn">
              <header className="mb-8">
                <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Segurança & <span className="text-red-600">Login</span></h1>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Proteja sua conta e sessões</p>
              </header>

              <div className="space-y-8">
                {/* Password Change */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                  <h3 className="text-lg font-black uppercase text-gray-900 mb-6">Alterar Senha</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <input type="password" placeholder="Senha Atual" className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold" />
                    <input type="password" placeholder="Nova Senha" className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold" />
                    <input type="password" placeholder="Confirmar Nova Senha" className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold" />
                  </div>
                  <div className="flex justify-end">
                    <button className="text-gray-500 hover:text-black font-bold text-xs uppercase tracking-widest">Atualizar Senha</button>
                  </div>
                </div>

                {/* 2FA */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black uppercase text-gray-900 mb-1">Autenticação em Dois Fatores (2FA)</h3>
                    <p className="text-xs text-gray-500 font-medium">Adicione uma camada extra de segurança à sua conta.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {formData.twoFactorEnabled && <i className="fas fa-check-circle text-green-500 text-2xl"></i>}
                    <button 
                      onClick={() => setFormData({...formData, twoFactorEnabled: !formData.twoFactorEnabled})}
                      className={`w-14 h-8 rounded-full p-1 transition-colors ${formData.twoFactorEnabled ? 'bg-green-500' : 'bg-gray-200'}`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${formData.twoFactorEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                </div>

                {/* Active Sessions */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                  <h3 className="text-lg font-black uppercase text-gray-900 mb-6">Sessões Ativas</h3>
                  <div className="space-y-4">
                    {MOCK_SESSIONS.map(session => (
                      <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${session.isCurrent ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                            <i className={`fas ${session.device.toLowerCase().includes('iphone') ? 'fa-mobile-alt' : 'fa-desktop'}`}></i>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{session.device} {session.isCurrent && <span className="text-[9px] bg-green-500 text-white px-2 py-0.5 rounded ml-2 uppercase font-black">Atual</span>}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{session.location} • {session.lastActive}</p>
                          </div>
                        </div>
                        {!session.isCurrent && (
                          <button className="text-red-500 hover:text-red-700 text-xs font-black uppercase tracking-widest">Desconectar</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BILLING TAB */}
          {activeTab === 'billing' && (
            <div className="max-w-4xl mx-auto animate-fadeIn">
              <header className="mb-8">
                <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Faturamento & <span className="text-red-600">Planos</span></h1>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Gerencie seus investimentos</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Premium Card */}
                <div className="bg-gradient-to-br from-gray-900 to-black rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-32 bg-red-600 rounded-full filter blur-[100px] opacity-20 pointer-events-none"></div>
                  <div className="relative z-10 flex flex-col h-full justify-between min-h-[220px]">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Plano Atual</p>
                        <h3 className="text-2xl font-black uppercase italic tracking-tight">Master Anual</h3>
                      </div>
                      <i className="fas fa-crown text-yellow-400 text-2xl"></i>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-gray-400">Renovação em 45 dias</span>
                        <span className="text-xl font-mono font-bold">**** 1234</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-red-600 to-red-400 w-[75%]"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-center">
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Investimento Total (Lifetime)</span>
                  <p className="text-4xl font-black text-gray-900 mb-6">R$ 22.000,00</p>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-gray-50 border border-gray-200 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                      Alterar Cartão
                    </button>
                    <button className="flex-1 bg-gray-50 border border-gray-200 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-colors">
                      Upgrade Plano
                    </button>
                  </div>
                </div>
              </div>

              {/* Invoices */}
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-sm font-black uppercase text-gray-900 tracking-widest">Histórico de Faturas</h3>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-6 text-[9px] font-black uppercase text-gray-400 tracking-widest">Data</th>
                      <th className="p-6 text-[9px] font-black uppercase text-gray-400 tracking-widest">Descrição</th>
                      <th className="p-6 text-[9px] font-black uppercase text-gray-400 tracking-widest">Valor</th>
                      <th className="p-6 text-[9px] font-black uppercase text-gray-400 tracking-widest">Status</th>
                      <th className="p-6 text-[9px] font-black uppercase text-gray-400 tracking-widest text-right">PDF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {MOCK_INVOICES.map(inv => (
                      <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-6 text-xs font-bold text-gray-600">{new Date(inv.date).toLocaleDateString()}</td>
                        <td className="p-6 text-xs font-bold text-gray-900">{inv.description}</td>
                        <td className="p-6 text-xs font-bold text-gray-900">R$ {inv.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                        <td className="p-6">
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest">Pago</span>
                        </td>
                        <td className="p-6 text-right">
                          <button className="text-gray-400 hover:text-black"><i className="fas fa-download"></i></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="max-w-2xl mx-auto animate-fadeIn">
              <header className="mb-8">
                <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Central de <span className="text-red-600">Alertas</span></h1>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">O que você quer receber?</p>
              </header>

              <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
                {[
                  { title: "Publicações", desc: "Quando minha matéria for publicada" },
                  { title: "Financeiro", desc: "Quando um anúncio vencer ou renovar" },
                  { title: "Segurança", desc: "Alertas de novos logins" },
                  { title: "Performance", desc: "Relatórios semanais de views" }
                ].map((item, idx) => (
                  <div key={idx} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default MyAccountModal;
