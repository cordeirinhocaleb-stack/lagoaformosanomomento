
import React, { useEffect, useState } from 'react';
import { ErrorReport } from '../../types';
import { getErrorReports, resolveErrorReport } from '../../services/supabaseService';

interface DeveloperTabProps {
    onLogout?: () => void;
}

const DeveloperTab: React.FC<DeveloperTabProps> = ({ onLogout }) => {
  const [reports, setReports] = useState<ErrorReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ErrorReport | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    const data = await getErrorReports();
    setReports(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (id: string) => {
      await resolveErrorReport(id);
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
      if (selectedReport?.id === id) {
          setSelectedReport(prev => prev ? { ...prev, status: 'resolved' } : null);
      }
  };

  return (
    <div className="animate-fadeIn w-full max-w-7xl mx-auto pb-20">
        <header className="mb-8 flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-2 text-red-700">Central de <span className="text-black">Bugs</span></h1>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Relatórios de erros do sistema</p>
            </div>
            <div className="flex gap-2">
                <button onClick={fetchReports} className="bg-gray-100 p-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center w-12 h-12" title="Atualizar">
                    {loading ? (
                        <img src="https://lh3.googleusercontent.com/d/1u0-ygqjuvPa4STtU8gT8HFyF05luNo1P" className="w-5 h-5 animate-coin object-contain" alt="Loading" />
                    ) : (
                        <i className="fas fa-sync"></i>
                    )}
                </button>
                {onLogout && (
                    <button onClick={onLogout} className="bg-red-600 text-white p-3 rounded-xl hover:bg-red-700 transition-colors shadow-lg" title="Sair do Sistema">
                        <i className="fas fa-power-off"></i>
                    </button>
                )}
            </div>
        </header>

        <div className="flex gap-6 h-[70vh]">
            {/* Lista de Erros */}
            <div className="w-1/3 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Incidentes ({reports.filter(r => r.status === 'open').length} Abertos)</h3>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    {reports.length === 0 && !loading && (
                        <div className="text-center py-10 text-gray-300">
                            <i className="fas fa-check-circle text-4xl mb-2"></i>
                            <p className="text-[10px] font-black uppercase">Sem erros relatados</p>
                        </div>
                    )}
                    {loading && reports.length === 0 && (
                        <div className="flex justify-center py-10">
                            <img src="https://lh3.googleusercontent.com/d/1u0-ygqjuvPa4STtU8gT8HFyF05luNo1P" className="w-8 h-8 animate-coin object-contain" alt="Loading" />
                        </div>
                    )}
                    {reports.map(report => (
                        <div 
                            key={report.id}
                            onClick={() => setSelectedReport(report)}
                            className={`p-4 rounded-xl mb-2 cursor-pointer transition-all border-l-4 ${selectedReport?.id === report.id ? 'bg-red-50 border-red-600' : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${report.status === 'open' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                    {report.status === 'open' ? 'Aberto' : 'Resolvido'}
                                </span>
                                <span className="text-[9px] text-gray-400 font-mono">{new Date(report.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight mb-2">
                                {report.message}
                            </p>
                            <div className="flex items-center gap-2 text-[9px] text-gray-400">
                                <i className="fas fa-user"></i> {report.userName || 'Anônimo'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detalhes do Erro */}
            <div className="flex-1 bg-zinc-900 rounded-[2rem] shadow-2xl p-8 text-zinc-300 relative overflow-y-auto custom-scrollbar">
                {selectedReport ? (
                    <div className="space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2 font-mono">Erro Detalhado</h2>
                                <p className="text-xs text-zinc-500 font-mono uppercase">ID: {selectedReport.id}</p>
                            </div>
                            {selectedReport.status === 'open' && (
                                <button 
                                    onClick={() => handleResolve(selectedReport.id)}
                                    className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg"
                                >
                                    <i className="fas fa-check mr-2"></i> Marcar Resolvido
                                </button>
                            )}
                        </div>

                        <div className="bg-black/50 p-4 rounded-xl border border-white/10">
                            <label className="text-[9px] font-black uppercase text-red-500 tracking-widest mb-2 block">Mensagem</label>
                            <p className="text-white font-mono text-sm">{selectedReport.message}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mb-2 block">Usuário</label>
                                <p className="text-sm">{selectedReport.userName || 'N/A'}</p>
                                <p className="text-xs text-zinc-500">{selectedReport.userId}</p>
                            </div>
                            <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mb-2 block">Navegador / OS</label>
                                <p className="text-xs font-mono break-all">{selectedReport.userAgent}</p>
                            </div>
                        </div>

                        {selectedReport.context && (
                            <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                <label className="text-[9px] font-black uppercase text-blue-500 tracking-widest mb-2 block">Contexto</label>
                                <p className="text-xs font-mono text-blue-300">{selectedReport.context}</p>
                            </div>
                        )}

                        <div className="bg-black p-4 rounded-xl border border-white/10">
                            <label className="text-[9px] font-black uppercase text-yellow-500 tracking-widest mb-2 block">Stack Trace</label>
                            <pre className="text-[10px] font-mono text-yellow-100 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                                {selectedReport.stack || 'Sem stack trace disponível.'}
                            </pre>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                        <i className="fas fa-bug text-6xl mb-4 opacity-20"></i>
                        <p className="text-xs font-black uppercase tracking-widest">Selecione um relatório para analisar</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default DeveloperTab;
