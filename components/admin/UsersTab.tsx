
import React, { useState, useMemo, useEffect } from 'react';
import { User, NewsItem, UserRole, AuditLog, AdPricingConfig } from '../../types';
import { logAction, getAuditLogs } from '../../services/supabaseService';

interface UsersTabProps {
  allUsers: User[];
  newsHistory: NewsItem[];
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onAddUser?: (user: User) => void; 
  adConfig?: AdPricingConfig; 
}

const USER_ROLES: UserRole[] = ['Desenvolvedor', 'Editor-Chefe', 'Repórter', 'Jornalista', 'Estagiário', 'Anunciante'];

const UsersTab: React.FC<UsersTabProps> = ({ allUsers, newsHistory, currentUser, onUpdateUser, onAddUser, adConfig }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [panelTab, setPanelTab] = useState<'control' | 'permissions' | 'audit'>('control');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  
  // New User State
  const [isCreating, setIsCreating] = useState(false);
  const [newUserPassword, setNewUserPassword] = useState('');

  // Permissions State (Agora Real)
  const [permissionsState, setPermissionsState] = useState<Record<string, boolean>>({});
  
  // Audit Logs Real
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Carrega permissões do usuário selecionado para o estado local
  useEffect(() => {
      if (selectedUser) {
          setPermissionsState(selectedUser.permissions || {});
      }
  }, [selectedUser]);

  // Carrega logs de auditoria
  useEffect(() => {
      if (panelTab === 'audit') {
          setIsLoadingLogs(true);
          getAuditLogs().then(logs => {
              setAuditLogs(logs);
              setIsLoadingLogs(false);
          });
      }
  }, [panelTab]);

  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [allUsers, userSearch, userRoleFilter]);

  const handleCreateClick = () => {
      const templateUser: User = {
          id: '', 
          name: '',
          email: '',
          role: 'Repórter',
          status: 'active',
          avatar: '',
          permissions: {} // Default empty perms
      };
      setSelectedUser(templateUser);
      setIsCreating(true);
      setPanelTab('control');
      setNewUserPassword('');
  };

  const handleSaveNewUser = () => {
      if (!selectedUser || !selectedUser.name || !selectedUser.email || !newUserPassword) {
          alert("Preencha todos os campos obrigatórios (Nome, Email, Senha).");
          return;
      }

      if (selectedUser.role === 'Anunciante' && !selectedUser.advertiserPlan) {
          alert("Selecione um plano para o anunciante.");
          return;
      }

      const newUser = {
          ...selectedUser,
          id: Math.random().toString(36).substr(2, 9),
          password: newUserPassword,
          permissions: permissionsState, // Salva permissões iniciais se houver
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
      };

      if (onAddUser) {
          onAddUser(newUser as User); 
          logAction(currentUser.id, currentUser.name, 'create_user', newUser.id, `Criou o usuário: ${newUser.name}`);
          alert(`Usuário ${newUser.name} criado com sucesso!`);
          setSelectedUser(null);
          setIsCreating(false);
      }
  };

  const togglePermission = (key: string) => {
      setPermissionsState(prev => ({
          ...prev,
          [key]: !prev[key]
      }));
  };

  const handleSavePermissions = () => {
      if (selectedUser) {
          const updatedUser = {
              ...selectedUser,
              permissions: permissionsState
          };
          onUpdateUser(updatedUser);
          logAction(currentUser.id, currentUser.name, 'update_permissions', selectedUser.id, `Alterou permissões de: ${selectedUser.name}`);
          alert(`Permissões de ${selectedUser.name} salvas com sucesso!`);
      }
  };

  return (
    <div className="animate-fadeIn relative w-full h-full">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
                <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter mb-2">GESTÃO DE <span className="text-red-600">EQUIPE</span></h1>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Controle de acesso e auditoria</p>
            </div>
            <button 
                onClick={handleCreateClick}
                className="bg-black text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2 hover:bg-green-600 transition-colors"
            >
                <i className="fas fa-plus"></i> Novo Membro
            </button>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                <input type="text" placeholder="Buscar membro..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="w-full p-4 pl-10 bg-white rounded-2xl border border-gray-100 outline-none font-bold text-sm" />
            </div>
            <select value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)} className="px-6 py-4 bg-white rounded-2xl border border-gray-100 outline-none font-bold text-sm uppercase">
                <option value="all">Todos os Cargos</option>
                {USER_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
            </select>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden w-full">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Usuário</th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Cargo & Nível</th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest hidden md:table-cell">Último Acesso</th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Ação</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center font-black text-gray-500">
                                        {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover"/> : u.name.charAt(0)}
                                    </div>
                                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${Math.random() > 0.5 ? 'bg-green-50' : 'bg-gray-300'}`}></div>
                                </div>
                                <div>
                                    <p className="font-black text-gray-900 text-sm leading-none">{u.name}</p>
                                    <p className="text-[10px] text-gray-400 mt-1">{u.email}</p>
                                </div>
                            </div>
                        </td>
                        <td className="p-6">
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase mb-1 inline-block ${u.role === 'Anunciante' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span>
                            {u.role === 'Anunciante' && u.advertiserPlan && (
                                <div className="text-[8px] font-bold text-gray-400 uppercase">Plano: {u.advertiserPlan}</div>
                            )}
                        </td>
                        <td className="p-6 hidden md:table-cell">
                            <p className="text-xs font-bold text-gray-600">Há 2 horas</p>
                            <p className="text-[9px] text-gray-400 uppercase">Chrome em Windows</p>
                        </td>
                        <td className="p-6">
                            <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${u.status === 'active' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                                {u.status === 'active' ? 'Ativo' : 'Suspenso'}
                            </span>
                        </td>
                        <td className="p-6 text-right">
                            <button onClick={() => { setSelectedUser(u); setIsCreating(false); }} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-black hover:text-white transition-colors flex items-center justify-center">
                                <i className="fas fa-ellipsis-h text-xs"></i>
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>

        {/* SLIDE-OVER PANEL */}
        {selectedUser && (
            <div className="fixed inset-0 z-[5000] flex justify-end">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={() => setSelectedUser(null)}></div>
                
                {/* Panel */}
                <div className="bg-white w-full max-w-[500px] h-full shadow-2xl relative z-10 animate-slideInRight flex flex-col border-l border-gray-100">
                    {/* Header */}
                    <div className="h-48 bg-gray-900 relative flex items-end p-8 flex-shrink-0">
                        <button onClick={() => setSelectedUser(null)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                            <i className="fas fa-times text-2xl"></i>
                        </button>
                        <div className="flex items-end gap-6 relative z-10 translate-y-12 w-full">
                            <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-xl">
                                {selectedUser.avatar ? (
                                    <img src={selectedUser.avatar} className="w-full h-full object-cover rounded-2xl" />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 rounded-2xl flex items-center justify-center text-3xl font-black text-gray-400">
                                        {selectedUser.name ? selectedUser.name.charAt(0) : '+'}
                                    </div>
                                )}
                            </div>
                            <div className="mb-2">
                                <h2 className="text-2xl font-black text-white leading-none mb-1">{selectedUser.name || 'Novo Usuário'}</h2>
                                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">{selectedUser.role}</span>
                            </div>
                        </div>
                        {/* Background Decoration */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                    </div>

                    {/* Navigation */}
                    <div className="pt-16 px-8 border-b border-gray-100 flex gap-6 flex-shrink-0">
                        {['control', 'permissions', 'audit'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setPanelTab(tab as any)}
                                className={`pb-4 text-xs font-black uppercase tracking-widest transition-all ${panelTab === tab ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-400 hover:text-black'}`}
                            >
                                {tab === 'control' ? (isCreating ? 'Cadastro' : 'Perfil & Controle') : tab === 'permissions' ? 'Permissões' : 'Auditoria'}
                            </button>
                        ))}
                    </div>

                    {/* Content - CORREÇÃO DE OVERLAP: Adicionado pb-24 para garantir scroll final */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar pb-24">
                        {panelTab === 'control' && (
                            <div className="space-y-8 animate-fadeIn">
                                <div>
                                    <h3 className="text-xs font-black text-gray-900 uppercase mb-4">Dados de Acesso</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {isCreating && (
                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Nome Completo</label>
                                                <input 
                                                    type="text" 
                                                    value={selectedUser.name}
                                                    onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                                                    className="w-full bg-transparent border-b border-gray-300 focus:border-red-500 outline-none py-1 font-bold text-gray-900"
                                                    placeholder="Ex: João da Silva"
                                                />
                                            </div>
                                        )}
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">E-mail</label>
                                            {isCreating ? (
                                                <input 
                                                    type="email" 
                                                    value={selectedUser.email}
                                                    onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                                                    className="w-full bg-transparent border-b border-gray-300 focus:border-red-500 outline-none py-1 font-bold text-gray-900"
                                                    placeholder="usuario@portal.com"
                                                />
                                            ) : (
                                                <p className="font-bold text-gray-900">{selectedUser.email}</p>
                                            )}
                                        </div>
                                        {isCreating && (
                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Senha Inicial</label>
                                                <input 
                                                    type="password" 
                                                    value={newUserPassword}
                                                    onChange={(e) => setNewUserPassword(e.target.value)}
                                                    className="w-full bg-transparent border-b border-gray-300 focus:border-red-500 outline-none py-1 font-bold text-gray-900"
                                                    placeholder="********"
                                                />
                                            </div>
                                        )}
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <label className="text-[9px] font-bold text-gray-400 uppercase block mb-2">Cargo</label>
                                            <select 
                                                value={selectedUser.role} 
                                                onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value as UserRole})}
                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold uppercase outline-none"
                                            >
                                                {USER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </div>

                                        {/* SEÇÃO ESPECÍFICA PARA ANUNCIANTES */}
                                        {selectedUser.role === 'Anunciante' && (
                                            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 animate-slideUp">
                                                <h4 className="text-xs font-black text-yellow-800 uppercase mb-3 flex items-center gap-2">
                                                    <i className="fas fa-star"></i> Detalhes do Anunciante
                                                </h4>
                                                
                                                <div className="mb-4">
                                                    <label className="text-[9px] font-bold text-yellow-700 uppercase block mb-2">Plano de Assinatura</label>
                                                    <select 
                                                        value={selectedUser.advertiserPlan || ''}
                                                        onChange={(e) => setSelectedUser({...selectedUser, advertiserPlan: e.target.value})}
                                                        className="w-full bg-white border border-yellow-300 rounded-lg px-3 py-2 text-sm font-bold uppercase outline-none"
                                                    >
                                                        <option value="">Selecione um Plano...</option>
                                                        {adConfig?.plans.map(p => (
                                                            <option key={p.id} value={p.id}>{p.name}</option>
                                                        )) || (
                                                            <>
                                                                <option value="master">Master</option>
                                                                <option value="premium">Premium</option>
                                                                <option value="standard">Standard</option>
                                                            </>
                                                        )}
                                                    </select>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-[9px] font-bold text-yellow-700 uppercase block mb-1">Início</label>
                                                        <input 
                                                            type="date" 
                                                            value={selectedUser.subscriptionStart || ''}
                                                            onChange={(e) => setSelectedUser({...selectedUser, subscriptionStart: e.target.value})}
                                                            className="w-full bg-white border border-yellow-300 rounded-lg px-3 py-2 text-xs font-bold outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] font-bold text-yellow-700 uppercase block mb-1">Término</label>
                                                        <input 
                                                            type="date" 
                                                            value={selectedUser.subscriptionEnd || ''}
                                                            onChange={(e) => setSelectedUser({...selectedUser, subscriptionEnd: e.target.value})}
                                                            className="w-full bg-white border border-yellow-300 rounded-lg px-3 py-2 text-xs font-bold outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {isCreating ? (
                                    <button 
                                        onClick={handleSaveNewUser}
                                        className="w-full bg-black text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-green-600 transition-colors shadow-lg"
                                    >
                                        Criar Conta
                                    </button>
                                ) : (
                                    <div>
                                        <h3 className="text-xs font-black text-red-600 uppercase mb-4">Ações de Risco</h3>
                                        <div className="space-y-3">
                                            <button className="w-full py-3 border border-gray-200 rounded-xl font-bold text-xs uppercase hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                                <i className="fas fa-key text-gray-400"></i> Enviar Redefinição de Senha
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    const newStatus = selectedUser.status === 'active' ? 'suspended' : 'active';
                                                    onUpdateUser({...selectedUser, status: newStatus});
                                                    logAction(currentUser.id, currentUser.name, 'change_user_status', selectedUser.id, `Alterou status para: ${newStatus}`);
                                                }}
                                                className={`w-full py-3 rounded-xl font-black text-xs uppercase text-white shadow-lg transition-all ${selectedUser.status === 'active' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                                            >
                                                {selectedUser.status === 'active' ? 'Banir Usuário' : 'Reativar Usuário'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {panelTab === 'permissions' && (
                            <div className="space-y-6 animate-fadeIn pb-24">
                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-4">
                                    <p className="text-[10px] text-blue-800 font-bold leading-relaxed">
                                        <i className="fas fa-info-circle mr-1"></i> As permissões abaixo controlam exatamente o que este usuário pode ver ou editar no painel. Lembre-se de salvar ao final.
                                    </p>
                                </div>

                                {['Editorial', 'Financeiro', 'Sistema'].map(group => (
                                    <div key={group} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                        <h3 className="text-xs font-black text-gray-900 uppercase mb-4 flex items-center gap-2">
                                            <i className={`fas ${group === 'Editorial' ? 'fa-pen-nib' : group === 'Financeiro' ? 'fa-wallet' : 'fa-cogs'} text-gray-400`}></i> 
                                            {group}
                                        </h3>
                                        <div className="space-y-4">
                                            {['Visualizar', 'Criar / Editar', 'Excluir (Risco)', 'Exportar Dados'].map(perm => {
                                                const permKey = `${group}-${perm}`;
                                                return (
                                                    <div key={perm} className="flex items-center justify-between">
                                                        <span className="text-xs font-bold text-gray-600">{perm}</span>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input 
                                                                type="checkbox" 
                                                                className="sr-only peer" 
                                                                checked={permissionsState[permKey] || false}
                                                                onChange={() => togglePermission(permKey)}
                                                            />
                                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                                
                                {/* FOOTER FIX: Absolute bottom sticky with proper z-index and shadow */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-20 flex justify-end rounded-b-[inherit]">
                                    <button 
                                        onClick={handleSavePermissions}
                                        className="bg-black text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-green-600 transition-colors shadow-lg w-full md:w-auto"
                                    >
                                        Salvar Permissões
                                    </button>
                                </div>
                            </div>
                        )}

                        {panelTab === 'audit' && (
                            <div className="relative animate-fadeIn pb-24">
                                <h3 className="text-xs font-black text-gray-900 uppercase mb-4 sticky top-0 bg-white py-2 z-10">
                                    Histórico de Ações
                                </h3>
                                
                                {isLoadingLogs ? (
                                    <div className="text-center py-10">
                                        <i className="fas fa-circle-notch fa-spin text-gray-300 text-2xl"></i>
                                        <p className="text-xs font-bold text-gray-400 mt-2 uppercase">Carregando Auditoria...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-8 relative">
                                        <div className="absolute left-3 top-2 bottom-0 w-0.5 bg-gray-100"></div>
                                        {isCreating ? (
                                            <div className="text-center text-gray-400 text-xs py-10">
                                                Sem histórico para novos usuários.
                                            </div>
                                        ) : (
                                            <>
                                                {/* Filter logs for current user if looking at a specific user in list, else show all */}
                                                {auditLogs.filter(log => log.userId === selectedUser.id || log.userName === selectedUser.name).map((log, idx) => (
                                                    <div key={idx} className="relative pl-10 group">
                                                        <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center z-10 transition-all ${log.action.includes('failed') || log.action.includes('delete') ? 'bg-red-500' : 'bg-blue-500 group-hover:scale-110'}`}></div>
                                                        <p className="text-xs font-black text-gray-900 leading-tight mb-1">{log.details}</p>
                                                        <div className="flex gap-2 text-[9px] font-bold text-gray-400 uppercase">
                                                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                                                            <span>•</span>
                                                            <span className="text-gray-500">{log.action}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                                {auditLogs.filter(log => log.userId === selectedUser.id).length === 0 && (
                                                    <p className="text-center text-gray-400 text-xs py-4 uppercase font-bold">Nenhum registro encontrado para este usuário.</p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default UsersTab;
