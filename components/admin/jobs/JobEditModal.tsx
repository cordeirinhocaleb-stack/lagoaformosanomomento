import React, { useState, useEffect } from 'react';
import { Job } from '../../../types';

interface JobEditModalProps {
    job: Job | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (jobId: string | undefined, data: Partial<Job>) => Promise<void>;
}

const JobEditModal: React.FC<JobEditModalProps> = ({ job, isOpen, onClose, onSave }) => {
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

    if (!isOpen) {return null;}

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
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] animate-scaleIn">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-black italic uppercase text-gray-900 tracking-tighter">
                            {job ? 'Editar' : 'Nova'} <span className="text-red-600">Vaga</span>
                        </h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            {job ? 'Atualizar detalhes da oportunidade' : 'Cadastrar nova oportunidade'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center"
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
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-red-500 transition-colors"
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
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-red-500 transition-colors"
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
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-red-500 transition-colors"
                                />
                            </div>

                            {/* Tipo de Contrato */}
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Tipo de Contrato</label>
                                <select
                                    value={formData.type || 'Tempo Integral'}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-red-500 transition-colors appearance-none cursor-pointer"
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
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-red-500 transition-colors"
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
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-green-500 transition-colors"
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
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 outline-none focus:border-red-500 transition-colors resize-none"
                                    placeholder="Descreva os requisitos, responsabilidades e benefícios..."
                                ></textarea>
                            </div>

                            {/* Status Toggle */}
                            <div className="md:col-span-2">
                                <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                                    <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${formData.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive || false}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="hidden"
                                    />
                                    <span className="text-sm font-bold text-gray-700">Vaga Ativa (Visível no portal)</span>
                                </label>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-4 sticky bottom-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-200 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="jobForm"
                        disabled={saving}
                        className="bg-black text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-gray-800 transition-all shadow-lg shadow-black/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
