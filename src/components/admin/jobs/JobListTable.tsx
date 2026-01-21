import React, { useState } from 'react';
import { Job } from '../../../types';

interface JobListTableProps {
    jobs: Job[];
    loading: boolean;
    onEdit: (job: Job) => void;
    onDelete: (jobId: string) => Promise<void>;
    darkMode?: boolean;
}

const JobListTable: React.FC<JobListTableProps> = ({ jobs, loading, onEdit, onDelete, darkMode = true }) => {
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta vaga?')) {
            setDeletingId(id);
            await onDelete(id);
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="flex flex-col items-center gap-4">
                    <i className="fas fa-circle-notch fa-spin text-4xl text-red-600"></i>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Carregando Vagas...</p>
                </div>
            </div>
        );
    }

    if (jobs.length === 0) {
        return (
            <div className={`rounded-2xl p-12 text-center border border-dashed ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                <i className={`fas fa-briefcase text-4xl mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}></i>
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Nenhuma vaga encontrada</h3>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tente ajustar os filtros ou adicione uma nova vaga.</p>
            </div>
        );
    }

    return (
        <div className={`rounded-2xl border shadow-sm overflow-hidden animate-fadeIn ${darkMode ? 'bg-[#0F0F0F] border-white/5' : 'bg-white border-gray-100'}`}>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className={`border-b ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                        <tr>
                            <th className="px-6 py-4 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Cargo / Empresa</th>
                            <th className="px-6 py-4 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Local / Tipo</th>
                            <th className="px-6 py-4 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Postado em</th>
                            <th className="px-6 py-4 text-right text-[9px] font-black text-gray-400 uppercase tracking-widest">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {jobs.map((job) => (
                            <tr key={job.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${job.isActive ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
                                            <i className="fas fa-briefcase"></i>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{job.title}</p>
                                            <p className="text-xs text-gray-500 font-medium">{job.company}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-gray-700">{job.location}</span>
                                        <span className="text-[10px] text-gray-400 uppercase tracking-wide">{job.type}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`
                                        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                                        ${job.isActive
                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                            : 'bg-gray-100 text-gray-500 border border-gray-200'}
                                    `}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${job.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                        {job.isActive ? 'Ativa' : 'Inativa'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-bold text-gray-500">
                                        {new Date(job.postedAt).toLocaleDateString('pt-BR')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onEdit(job)}
                                            className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center transition-all shadow-sm hover:shadow-md"
                                            title="Editar Vaga"
                                        >
                                            <i className="fas fa-pencil-alt text-xs"></i>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(job.id)}
                                            disabled={deletingId === job.id}
                                            className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-600 hover:border-red-500 hover:text-red-600 flex items-center justify-center transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                                            title="Excluir Vaga"
                                        >
                                            {deletingId === job.id ? (
                                                <i className="fas fa-circle-notch fa-spin text-xs"></i>
                                            ) : (
                                                <i className="fas fa-trash-alt text-xs"></i>
                                            )}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default JobListTable;
