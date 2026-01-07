
import React from 'react';
import { User, UserRole } from '../../../../types';
import { USER_ROLES } from '../constants';
import { uploadToCloudinary } from '../../../../services/cloudinaryService';

interface UserProfilePanelProps {
    user: User;
    isCreating: boolean;
    newUserPassword?: string;
    onUpdateUser: (updates: Partial<User>) => void;
    onUpdatePassword: (pass: string) => void;
    onSave: () => void;
    onToggleStatus: () => void;
    darkMode?: boolean;
}

const UserProfilePanel: React.FC<UserProfilePanelProps> = ({
    user, isCreating, newUserPassword, onUpdateUser, onUpdatePassword, onSave, onToggleStatus, darkMode = false
}) => {
    const [isUploading, setIsUploading] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await uploadToCloudinary(file, 'avatars', 'admin_user_edit');
            onUpdateUser({ avatar: url });
        } catch (err: any) {
            alert('Erro no upload: ' + err.message);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h3 className={`text-xs font-black uppercase mb-4 border-b pb-2 ${darkMode ? 'text-white border-white/5' : 'text-gray-900 border-gray-100'}`}>Identidade Visual</h3>
                <div className="flex items-center gap-6 mb-6">
                    <div className="relative group">
                        <div className={`w-24 h-24 rounded-full overflow-hidden border-4 shadow-xl ${darkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-100 border-white'}`}>
                            {isUploading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                                    <i className="fas fa-spinner fa-spin text-white"></i>
                                </div>
                            )}
                            {user.avatar ? (
                                <img src={user.avatar} className="w-full h-full object-cover" />
                            ) : (
                                <div className={`w-full h-full flex items-center justify-center text-3xl font-black ${darkMode ? 'text-zinc-600' : 'text-gray-300'}`}>
                                    {user.name?.charAt(0) || '?'}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-1 -right-1 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-black transition-colors border-2 border-white"
                        >
                            <i className="fas fa-camera text-xs"></i>
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAvatarUpload}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                    <div>
                        <h4 className={`text-sm font-black uppercase tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user.name || 'Novo Usuário'}</h4>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{user.role || 'Sem Cargo'}</p>
                        {user.avatar && (
                            <button
                                onClick={() => onUpdateUser({ avatar: '' })}
                                className="text-[9px] text-red-500 font-bold uppercase mt-1 hover:underline"
                            >
                                Remover foto
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div>
                <h3 className={`text-xs font-black uppercase mb-4 border-b pb-2 ${darkMode ? 'text-white border-white/5' : 'text-gray-900 border-gray-100'}`}>Dados de Acesso</h3>
                <div className="grid grid-cols-1 gap-4">
                    <div className={`p-4 rounded-xl border ${darkMode ? 'bg-black/40 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                        <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Nome Completo</label>
                        <input type="text" value={user.name} onChange={(e) => onUpdateUser({ name: e.target.value })} className={`w-full bg-transparent font-bold outline-none ${darkMode ? 'text-white' : 'text-gray-900'}`} />
                    </div>
                    <div className={`p-4 rounded-xl border ${darkMode ? 'bg-black/40 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                        <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Nível de Acesso (Role)</label>
                        <select value={user.role} onChange={(e) => onUpdateUser({ role: e.target.value as any })} className={`w-full bg-transparent font-bold outline-none uppercase text-xs ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            <option value="Leitor" className={darkMode ? 'bg-black text-white' : 'bg-white text-gray-900'}>Leitor</option>
                            <option value="Anunciante" className={darkMode ? 'bg-black text-white' : 'bg-white text-gray-900'}>Anunciante</option>
                            <option value="Redator" className={darkMode ? 'bg-black text-white' : 'bg-white text-gray-900'}>Redator</option>
                            <option value="Editor" className={darkMode ? 'bg-black text-white' : 'bg-white text-gray-900'}>Editor</option>
                            <option value="Admin" className={darkMode ? 'bg-black text-white' : 'bg-white text-gray-900'}>Admin</option>
                        </select>
                    </div>
                    <div className={`p-4 rounded-xl border ${darkMode ? 'bg-black/40 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                        <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">E-mail</label>
                        <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user.email}</p>
                    </div>
                    {isCreating && (
                        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-black/40 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                            <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Senha Inicial</label>
                            <input
                                type="text"
                                value={newUserPassword}
                                onChange={(e) => onUpdatePassword(e.target.value)}
                                className={`w-full bg-transparent font-bold outline-none ${darkMode ? 'text-white' : 'text-gray-900'}`}
                                placeholder="Defina uma senha..."
                            />
                        </div>
                    )}
                </div>
            </div>

            <div>
                <h3 className={`text-xs font-black uppercase mb-4 border-b pb-2 ${darkMode ? 'text-white border-white/5' : 'text-gray-900 border-gray-100'}`}>Identidade Profissional</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl border ${darkMode ? 'bg-black/40 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                        <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">WhatsApp / Telefone</label>
                        <input type="text" value={user.phone || ''} onChange={(e) => onUpdateUser({ phone: e.target.value })} className={`w-full bg-transparent font-bold outline-none ${darkMode ? 'text-white' : 'text-gray-900'}`} />
                    </div>
                    <div className={`p-4 rounded-xl border ${darkMode ? 'bg-black/40 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                        <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Profissão</label>
                        <input type="text" value={user.profession || ''} onChange={(e) => onUpdateUser({ profession: e.target.value })} className={`w-full bg-transparent font-bold outline-none ${darkMode ? 'text-white' : 'text-gray-900'}`} />
                    </div>
                    <div className={`p-4 rounded-xl border md:col-span-2 ${darkMode ? 'bg-black/40 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                        <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Habilidades / Resumo</label>
                        <textarea value={user.professionalBio || ''} onChange={(e) => onUpdateUser({ professionalBio: e.target.value })} className={`w-full bg-transparent font-bold outline-none resize-none ${darkMode ? 'text-white' : 'text-gray-900'}`} rows={3} />
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <button onClick={onSave} className="w-full bg-green-600 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-green-700 transition-colors shadow-lg">Salvar Dados</button>
                <button onClick={onToggleStatus} className={`w-full py-3 rounded-xl font-black text-xs uppercase text-white shadow-lg transition-all ${user.status === 'active' ? 'bg-red-600/20 text-red-500 border border-red-900/50 hover:bg-red-600 hover:text-white' : 'bg-green-600 text-white'}`}>
                    {user.status === 'active' ? 'Banir Usuário' : 'Reativar Usuário'}
                </button>
            </div>
        </div>
    );
};

export default UserProfilePanel;
