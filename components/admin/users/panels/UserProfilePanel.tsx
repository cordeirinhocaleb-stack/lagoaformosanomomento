
import React from 'react';
import { User, UserRole } from '../../../../types';
import { USER_ROLES } from '../constants';

interface UserProfilePanelProps {
    user: User;
    isCreating: boolean;
    newUserPassword?: string;
    onUpdateUser: (updates: Partial<User>) => void;
    onUpdatePassword: (pass: string) => void;
    onSave: () => void;
    onToggleStatus: () => void;
}

const UserProfilePanel: React.FC<UserProfilePanelProps> = ({
    user, isCreating, newUserPassword, onUpdateUser, onUpdatePassword, onSave, onToggleStatus
}) => {
    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h3 className="text-xs font-black text-gray-900 uppercase mb-4 border-b border-gray-100 pb-2">Dados de Acesso</h3>
                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Nome Completo</label>
                        <input type="text" value={user.name} onChange={(e) => onUpdateUser({ name: e.target.value })} className="w-full bg-transparent font-bold text-gray-900 outline-none" />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Nível de Acesso (Role)</label>
                        <select value={user.role} onChange={(e) => onUpdateUser({ role: e.target.value as any })} className="w-full bg-transparent font-bold text-gray-900 outline-none uppercase text-xs">
                            <option value="Leitor">Leitor</option>
                            <option value="Anunciante">Anunciante</option>
                            <option value="Redator">Redator</option>
                            <option value="Editor">Editor</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">E-mail</label>
                        <p className="font-bold text-gray-900">{user.email}</p>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-xs font-black text-gray-900 uppercase mb-4 border-b border-gray-100 pb-2">Identidade Profissional</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">WhatsApp / Telefone</label>
                        <input type="text" value={user.phone || ''} onChange={(e) => onUpdateUser({ phone: e.target.value })} className="w-full bg-transparent font-bold text-gray-900 outline-none" />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Profissão</label>
                        <input type="text" value={user.profession || ''} onChange={(e) => onUpdateUser({ profession: e.target.value })} className="w-full bg-transparent font-bold text-gray-900 outline-none" />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 md:col-span-2">
                        <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Habilidades / Resumo</label>
                        <textarea value={user.professionalBio || ''} onChange={(e) => onUpdateUser({ professionalBio: e.target.value })} className="w-full bg-transparent font-bold text-gray-900 outline-none resize-none" rows={3} />
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <button onClick={onSave} className="w-full bg-black text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-green-600 transition-colors shadow-lg">Salvar Dados</button>
                <button onClick={onToggleStatus} className={`w-full py-3 rounded-xl font-black text-xs uppercase text-white shadow-lg transition-all ${user.status === 'active' ? 'bg-red-600' : 'bg-green-600'}`}>
                    {user.status === 'active' ? 'Banir Usuário' : 'Reativar Usuário'}
                </button>
            </div>
        </div>
    );
};

export default UserProfilePanel;
