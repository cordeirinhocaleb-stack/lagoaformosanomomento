import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../../types';

interface UserEditModalProps {
    user: UserProfile | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (userId: string | undefined, data: Partial<UserProfile>) => Promise<void>;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ user, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<UserProfile>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({ ...user });
        } else {
            setFormData({
                role: 'user',
                name: '',
                email: '',
                phone: '',
                address: '',
                profession: '',
                company: ''
            });
        }
    }, [user, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-slideUp border border-gray-100">
                <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <i className={`fas ${user ? 'fa-user-edit' : 'fa-user-plus'} text-red-500`}></i>
                        {user ? 'Editar Usuário' : 'Novo Usuário'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[80vh]">
                    <div className="space-y-4">
                        {/* Avatar Preview */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                {formData.avatar_url ? (
                                    <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <i className="fas fa-user text-2xl text-gray-300"></i>
                                )}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">{formData.name || 'Novo Usuário'}</h4>
                                <p className="text-xs text-gray-500">{formData.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Nome Completo</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name || ''}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-red-500"
                                    required
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">E-mail</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email || ''}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-red-500"
                                    required
                                    disabled={!!user} // Email geralmente é imutável se já cadastrado via provider
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Telefone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone || ''}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-red-500"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Função (Role)</label>
                                <select
                                    name="role"
                                    value={formData.role || 'user'}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-red-500"
                                >
                                    <option value="user">Usuário Comum</option>
                                    <option value="admin">Administrador</option>
                                    <option value="advertiser">Anunciante</option>
                                    <option value="candidate">Candidato</option>
                                </select>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Endereço</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address || ''}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-red-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Profissão</label>
                                <input
                                    type="text"
                                    name="profession"
                                    value={formData.profession || ''}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-red-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Empresa</label>
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company || ''}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-red-500"
                                />
                            </div>
                        </div>

                        <div className="pt-6 flex items-center justify-end gap-3 mt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-xs font-bold uppercase text-gray-500 hover:text-gray-700 transition-colors"
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
