import React, { useState, useEffect } from 'react';
import { Job } from '../../../types';

interface JobEditModalProps {
    job: Job | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (jobId: string | undefined, data: Partial<Job>) => Promise<void>;
    darkMode?: boolean;
}

const JobEditModal: React.FC<JobEditModalProps> = ({ job, isOpen, onClose, onSave, darkMode = true }) => {
    const [formData, setFormData] = useState<Partial<Job>>({
        title: '',
        company: '',
        location: 'Lagoa Formosa, MG',
        type: 'Tempo Integral',
        description: '',
        salary: '',
        whatsapp: '',
        isActive: true
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (job) {
            setFormData({ ...job });
        } else {
            setFormData({
                title: '',
                company: '',
                location: 'Lagoa Formosa, MG',
                type: 'Tempo Integral',
                description: '',
                salary: '',
                whatsapp: '',
                isActive: true
            });
        }
    }, [job, isOpen]);

    if (!isOpen) { return null; }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(job?.id, formData);
            onClose();
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar vaga');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className={`rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] animate-scaleIn ${darkMode ? 'bg-[#0F0F0F] text-white' : 'bg-white text-gray-900'}`}>
                {/* Header */}
                <div className={`px-8 py-6 border-b flex items-center justify-between sticky top-0 z-10 transition-colors ${darkMode ? 'bg-[#0F0F0F] border-white/5' : 'bg-white border-gray-100'}`}>
                    <div>
                        <h2 className={`text-2xl font-black italic uppercase tracking-tighter ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {job ? 'Editar' : 'Nova'} <span className="text-red-600">Vaga</span>
                        </h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            {job ? 'Atualizar detalhes da oportunidade' : 'Cadastrar nova oportunidade'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center ${darkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white' : 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600'}`}
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto p-8 custom-scrollbar">
                    <form id="jobForm" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Título */}
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Cargo / Título da Vaga</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title || ''}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className={`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500 transition-colors ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                    placeholder="Ex: Vendedor Externo"
                                />
                            </div>

                            {/* Empresa */}
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Empresa Contratante</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.company || ''}
                                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                                    className={`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500 transition-colors ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                    placeholder="Nome da Empresa"
                                />
                            </div>

                            {/* Localização */}
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Localização</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.location || ''}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    className={`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500 transition-colors ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                />
                            </div>

                            {/* Tipo de Contrato */}
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Tipo de Contrato</label>
                                <select
                                    value={formData.type || 'Tempo Integral'}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    className={`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500 transition-colors appearance-none cursor-pointer ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                >
                                    <option value="Tempo Integral">Tempo Integral</option>
                                    <option value="Meio Período">Meio Período</option>
                                    <option value="Freelance">Freelance</option>
                                    <option value="Estágio">Estágio</option>
                                    <option value="Temporário">Temporário</option>
                                </select>
                            </div>

                            {/* Salário (Opcional) */}
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Salário (Opcional)</label>
                                <input
                                    type="text"
                                    value={formData.salary || ''}
                                    onChange={e => setFormData({ ...formData, salary: e.target.value })}
                                    className={`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500 transition-colors ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                    placeholder="Ex: A combinar ou R$ 2.000"
                                />
                            </div>

                            {/* WhatsApp */}
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">WhatsApp para Contato</label>
                                <div className="relative">
                                    <i className="fab fa-whatsapp absolute left-4 top-1/2 -translate-y-1/2 text-green-500 text-lg"></i>
                                    <input
                                        type="text"
                                        value={formData.whatsapp || ''}
                                        onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                        className={`w-full pl-12 pr-4 py-3 border rounded-xl text-sm font-bold outline-none focus:border-green-500 transition-colors ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                        placeholder="(34) 99999-9999"
                                    />
                                </div>
                            </div>

                            {/* Descrição */}
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Descrição da Vaga</label>
                                <textarea
                                    rows={5}
                                    required
                                    value={formData.description || ''}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className={`w-full border rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-red-500 transition-colors resize-none ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                    placeholder="Descreva os requisitos, responsabilidades e benefícios..."
                                ></textarea>
                            </div>

                            {/* Status Toggle */}
                            <div className="md:col-span-2">
                                <label className={`flex items-center gap-3 cursor-pointer p-4 rounded-xl border transition-all ${darkMode ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}>
                                    <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${formData.isActive ? 'bg-green-500' : (darkMode ? 'bg-white/10' : 'bg-gray-300')}`}>
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive || false}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="hidden"
                                    />
                                    <span className={`text-sm font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Vaga Ativa (Visível no portal)</span>
                                </label>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className={`px-8 py-6 border-t flex items-center justify-end gap-4 sticky bottom-0 z-10 ${darkMode ? 'bg-[#0F0F0F] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${darkMode ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-500 hover:bg-gray-200'}`}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="jobForm"
                        disabled={saving}
                        className={`${darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {saving ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-save"></i>}
                        {saving ? 'Salvando...' : 'Salvar Vaga'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JobEditModal;
