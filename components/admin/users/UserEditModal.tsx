import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../../types';

interface UserEditModalProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (userId: string | undefined, data: Partial<User>) => Promise<void>;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ user, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<User>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({ ...user });
        } else {
            setFormData({
                role: 'Leitor',
                name: '',
                email: '',
                phone: '',
                city: '',
                profession: '',
                companyName: ''
            });
        }
    }, [user, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const processedValue = name === 'name' ? value.toUpperCase() : value;
        setFormData((prev: Partial<User>) => ({ ...prev, [name]: processedValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(user?.id, formData);
            onClose();
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar usuário. Verifique o console.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) { return null; }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn p-4">
            <div className="bg-[#0F0F0F] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-slideUp border border-white/10">
                <div className="bg-white/5 px-6 py-4 flex items-center justify-between border-b border-white/5">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <i className={`fas ${user ? 'fa-user-edit' : 'fa-user-plus'} text-red-500`}></i>
                        {user ? 'Editar Usuário' : 'Novo Usuário'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[80vh] custom-scrollbar">
                    <div className="space-y-4">
                        {/* Avatar Preview */}
                        <div className="flex items-center gap-4 mb-6 group">
                            <div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-red-500/50 transition-colors">
                                {formData.avatar ? (
                                    <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <i className="fas fa-user text-2xl text-gray-400 group-hover:text-white group-hover:animate-almost-fall transition-colors"></i>
                                )}
                            </div>
                            <div>
                                <h4 className="font-bold text-white group-hover:text-red-500 transition-colors">{formData.name || 'Novo Usuário'}</h4>
                                <p className="text-xs text-gray-500">{formData.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">Nome Completo</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name || ''}
                                    onChange={handleChange}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm font-medium text-white outline-none focus:border-red-500 focus:bg-white/5 transition-all"
                                    required
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">E-mail</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email || ''}
                                    onChange={handleChange}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm font-medium text-white outline-none focus:border-red-500 focus:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    required
                                    disabled={!!user}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">Telefone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone || ''}
                                    onChange={handleChange}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm font-medium text-white outline-none focus:border-red-500 focus:bg-white/5 transition-all"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">Função (Role)</label>
                                <select
                                    name="role"
                                    value={formData.role || 'Leitor'}
                                    onChange={handleChange}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm font-medium text-white outline-none focus:border-red-500 focus:bg-white/5 transition-all appearance-none"
                                >
                                    <option value="Leitor" className="bg-black text-white">Leitor (Padrão)</option>
                                    <option value="Editor-Chefe" className="bg-black text-white">Editor-Chefe (Admin)</option>
                                    <option value="Repórter" className="bg-black text-white">Repórter</option>
                                    <option value="Anunciante" className="bg-black text-white">Anunciante</option>
                                    <option value="Prestador de Serviço" className="bg-black text-white">Prestador de Serviço</option>
                                </select>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">Cidade</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city || ''}
                                    onChange={handleChange}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm font-medium text-white outline-none focus:border-red-500 focus:bg-white/5 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">Profissão</label>
                                <input
                                    type="text"
                                    name="profession"
                                    value={formData.profession || ''}
                                    onChange={handleChange}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm font-medium text-white outline-none focus:border-red-500 focus:bg-white/5 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">Empresa</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName || ''}
                                    onChange={handleChange}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm font-medium text-white outline-none focus:border-red-500 focus:bg-white/5 transition-all"
                                />
                            </div>
                        </div>

                        <div className="pt-6 flex items-center justify-end gap-3 mt-4 border-t border-white/10">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-xs font-bold uppercase text-gray-500 hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`
                                    px-6 py-2 bg-red-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider
                                    hover:bg-red-700 transition-all shadow-md flex items-center gap-2
                                    ${loading ? 'opacity-70 cursor-wait' : ''}
                                `}
                            >
                                {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-save"></i>}
                                {loading ? 'Salvando...' : 'Salvar Dados'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserEditModal;
