
import React from 'react';
import { User, UserRole } from '../../../../types';
import { uploadToCloudinary } from '../../../../services/cloudinaryService';

interface UserProfilePanelProps {
    user: User;
    isCreating: boolean;
    newUserPassword?: string;
    onUpdateUser: (updates: Partial<User>) => void;
    onUpdatePassword: (pass: string) => void;
    onSave: () => void;
    onToggleStatus: () => void;
    onDelete?: () => void;
    darkMode?: boolean;
}

const UserProfilePanel: React.FC<UserProfilePanelProps> = ({
    user, isCreating, newUserPassword, onUpdateUser, onUpdatePassword, onSave, onToggleStatus, onDelete, darkMode = false
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
        } catch (err) {
            alert('Erro no upload');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const InputField = ({ label, value, onChange, type = 'text', disabled = false }: any) => (
        <div className={`p-4 rounded-xl border transition-all focus-within:ring-1 focus-within:ring-white/20 ${darkMode ? 'bg-[#0A0A0A] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">{label}</label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`w-full bg-transparent font-medium outline-none ${darkMode ? 'text-white disabled:text-gray-500' : 'text-gray-900 disabled:text-gray-400'}`}
            />
        </div>
    );

    return (
        <div className="space-y-8 animate-fadeIn">

            {/* --- SECTION 1: VISUAL IDENTITY --- */}
            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-[#0A0A0A]/50 border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
                <h3 className={`text-xs font-black uppercase mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                    <i className="fas fa-camera text-gray-500"></i> Identidade Visual
                </h3>

                <div className="flex flex-col sm:flex-row items-center gap-8">
                    <div className="relative group shrink-0">
                        <div className={`w-32 h-32 rounded-full overflow-hidden border-4 ${darkMode ? 'bg-black border-white/10' : 'bg-gray-50 border-white shadow-xl'}`}>
                            {isUploading && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20"><i className="fas fa-spinner fa-spin text-white"></i></div>
                            )}
                            <img
                                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-lg hover:bg-gray-200 transition-colors"
                        >
                            <i className="fas fa-camera text-sm"></i>
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-2">
                        <div className={`p-4 rounded-xl border inline-block w-full ${darkMode ? 'bg-[#0A0A0A] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Nome de Exibição</label>
                            <input
                                type="text"
                                value={user.name}
                                onChange={(e) => onUpdateUser({ name: e.target.value })}
                                className={`w-full bg-transparent text-lg font-bold outline-none ${darkMode ? 'text-white' : 'text-gray-900'}`}
                            />
                        </div>
                        {user.avatar && (
                            <button onClick={() => onUpdateUser({ avatar: '' })} className="text-xs text-red-500 font-bold hover:underline">Remover foto atual</button>
                        )}
                    </div>
                </div>
            </div>

            {/* --- SECTION 2: ACCESS & ROLE --- */}
            <div>
                <h3 className={`text-xs font-black uppercase mb-4 pl-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Dados de Acesso</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Role Selector */}
                    <div className={`p-4 rounded-xl border relative ${darkMode ? 'bg-[#0A0A0A] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Nível de Acesso (Role)</label>
                        <select
                            value={user.role}
                            onChange={(e) => onUpdateUser({ role: e.target.value as UserRole })}
                            className={`w-full bg-transparent font-bold outline-none uppercase text-xs appearance-none relative z-10 ${darkMode ? 'text-white' : 'text-gray-900'}`}
                        >
                            {['Leitor', 'Anunciante', 'Redator', 'Editor', 'Admin'].map(r => (
                                <option key={r} value={r} className="bg-black text-white">{r}</option>
                            ))}
                        </select>
                        <i className={`fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-xs pointer-events-none ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}></i>
                    </div>

                    <InputField
                        label="E-mail (Login)"
                        value={user.email}
                        disabled={!isCreating}
                        onChange={(e: any) => isCreating && onUpdateUser({ email: e.target.value })}
                    />

                    {isCreating && (
                        <InputField
                            label="Senha Inicial"
                            value={newUserPassword}
                            onChange={(e: any) => onUpdatePassword(e.target.value)}
                        />
                    )}
                </div>
            </div>

            {/* --- SECTION 3: PROFESSIONAL INFO --- */}
            <div>
                <h3 className={`text-xs font-black uppercase mb-4 pl-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Detalhes Profissionais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                        label="Telefone / WhatsApp"
                        value={user.phone || ''}
                        onChange={(e: any) => onUpdateUser({ phone: e.target.value })}
                    />
                    <InputField
                        label="Profissão / Cargo"
                        value={user.profession || ''}
                        onChange={(e: any) => onUpdateUser({ profession: e.target.value })}
                    />
                    <div className={`p-4 rounded-xl border md:col-span-2 ${darkMode ? 'bg-[#0A0A0A] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Bio / Resumo</label>
                        <textarea
                            value={user.professionalBio || ''}
                            onChange={(e) => onUpdateUser({ professionalBio: e.target.value })}
                            className={`w-full bg-transparent font-medium outline-none resize-none ${darkMode ? 'text-white' : 'text-gray-900'}`}
                            rows={3}
                        />
                    </div>
                </div>
            </div>

            {/* --- ACTIONS --- */}
            <div className="pt-8 border-t border-white/5 space-y-4">
                <button
                    onClick={onSave}
                    className="w-full bg-white text-black py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-[1.01] transition-transform shadow-2xl"
                >
                    Salvar Alterações
                </button>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={onToggleStatus}
                        className={`w-full py-3 rounded-xl font-bold text-[10px] uppercase transition-colors ${user.status === 'active' ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white'}`}
                    >
                        {user.status === 'active' ? 'Banir Usuário' : 'Reativar Conta'}
                    </button>
                    {onDelete && !isCreating && (
                        <button
                            onClick={onDelete}
                            className="w-full py-3 rounded-xl font-bold text-[10px] uppercase text-gray-500 hover:text-red-600 hover:bg-red-500/5 transition-colors"
                        >
                            Excluir Definitivamente
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfilePanel;
