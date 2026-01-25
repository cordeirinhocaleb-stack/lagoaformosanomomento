import React from 'react';
import { User } from '../../../../types';

interface ProfileSectionProps {
    formData: User;
    setFormData: (user: User) => void;
    isSaving: boolean;
    onSave: () => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ formData, setFormData, isSaving, onSave }) => {
    return (
        <div className="max-w-3xl mx-auto animate-fadeIn">
            <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-8">
                Meu <span className="text-red-600">Perfil</span>
            </h1>
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
                <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">
                        Nome Completo
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">
                            CEP
                        </label>
                        <input
                            type="text"
                            value={formData.zipCode || ''}
                            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                            placeholder="00000-000"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">
                            Endereço (Rua/Av)
                        </label>
                        <input
                            type="text"
                            value={formData.street || ''}
                            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">
                            Número
                        </label>
                        <input
                            type="text"
                            value={formData.number || ''}
                            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">
                            Bairro
                        </label>
                        <input
                            type="text"
                            placeholder="Bairro"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500 opacity-50 cursor-not-allowed"
                            disabled
                            title="Em breve"
                        />
                    </div>
                    <div className="md:col-span-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">
                            Cidade
                        </label>
                        <input
                            type="text"
                            value={formData.city || ''}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500"
                        />
                    </div>
                    <div className="md:col-span-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">
                            Estado
                        </label>
                        <input
                            type="text"
                            value={formData.state || ''}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500 text-center"
                        />
                    </div>
                </div>

                <button
                    onClick={onSave}
                    disabled={isSaving}
                    className="bg-black text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-green-600 transition-all disabled:cursor-wait disabled:opacity-50"
                >
                    {isSaving ? <><i className="fas fa-spinner fa-spin mr-2"></i> Salvando...</> : 'Salvar'}
                </button>
            </div>
        </div>
    );
};

export default ProfileSection;
