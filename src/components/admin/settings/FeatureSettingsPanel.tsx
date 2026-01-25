import React, { useState } from 'react';
import { SystemSettings, User } from '@/types';
import { logger } from '@/services/core/debugLogger';

interface FeatureSettingsProps {
    settings: SystemSettings;
    onToggle: (key: keyof SystemSettings, label: string) => Promise<void>;
    darkMode?: boolean;
    user?: User | null;
}

const FeatureSettings: React.FC<FeatureSettingsProps> = ({ settings, onToggle, darkMode = false, user }) => {
    const [resetStatus, setResetStatus] = useState<'idle' | 'armed' | 'processing'>('idle');

    // Permissões: Apenas Desenvolvedor e Editor-Chefe podem ver configurações sensíveis
    const canManageFeatures = user?.role === 'Desenvolvedor' || user?.role === 'Editor-Chefe';

    const handleNuclearReset = async () => {
        if (resetStatus === 'idle') {
            setResetStatus('armed');
            // Auto-cancel after 5s
            setTimeout(() => {
                setResetStatus(prev => prev === 'armed' ? 'idle' : prev);
            }, 5000);
            return;
        }

        if (resetStatus === 'armed') {
            setResetStatus('processing');
            logger.log("🔥 [DEV TOOLS] Executando reset NUCLEAR...");

            try {
                // Import dinâmico com catch
                const { resetAllUsersBoosters } = await import('@/services/admin/devToolsService');
                const res = await resetAllUsersBoosters();
                logger.log("✅ Resultado Nuclear:", res);

                if (res.success) {
                    alert(`☢️ SUCESSO NUCLEAR ☢️\n\n${res.message}\nUsuários afetados: ${res.count}`);
                    window.location.reload();
                } else {
                    throw new Error(res.message);
                }
            } catch (err: unknown) {
                logger.error("❌ ERRO CRÍTICO no handler:", err);
                alert(`❌ ERRO: ${err instanceof Error ? err.message : "Falha desconhecida. Verifique o console."}`);
                setResetStatus('idle');
            }
        }
    };
    return (
        <div className={`p-6 md:p-8 rounded-[2rem] border shadow-sm transition-colors ${darkMode ? 'bg-[#0F0F0F] border-white/5' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 text-2xl border border-blue-100">
                    <i className="fas fa-cog"></i>
                </div>
                <div>
                    <h2 className={`text-xl font-black uppercase italic ${darkMode ? 'text-white' : 'text-gray-900'}`}>Funcionalidades</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Configurações de recursos do sistema</p>
                </div>
            </div>

            {canManageFeatures ? (
                <>
                    <div className={`rounded-xl p-6 ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className={`text-sm font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Compartilhamento Social (Omnichannel)</h3>
                                <p className="text-xs text-gray-500">
                                    Habilita botões de compartilhamento em redes sociais ao publicar notícias.
                                    <br />
                                    <span className="text-gray-400">Desabilite para manter apenas upload de imagens/vídeos.</span>
                                </p>
                            </div>
                            <button
                                onClick={() => onToggle('enableOmnichannel', 'Omnichannel')}
                                className={`
                            relative w-14 h-8 rounded-full transition-all duration-300 ease-in-out
                            ${settings.enableOmnichannel ? 'bg-green-500' : 'bg-gray-300'}
                        `}
                            >
                                <span className={`
                            absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md
                            transition-transform duration-300 ease-in-out
                            ${settings.enableOmnichannel ? 'translate-x-6' : 'translate-x-0'}
                        `} />
                            </button>
                        </div>
                        <div className={`mt-4 text-xs rounded-lg p-3 ${darkMode ? 'bg-white/5 text-gray-400' : 'bg-white text-gray-600'}`}>
                            <strong>Status:</strong> {settings.enableOmnichannel ? '✅ Ativado' : '❌ Desativado'}
                            {!settings.enableOmnichannel && (
                                <div className="mt-2 text-gray-500">
                                    Os botões de compartilhamento social não aparecerão ao publicar notícias.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={`rounded-xl p-6 mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                        {/* Maintenance Mode */}
                        <div className={`flex items-center justify-between p-4 rounded-lg border shadow-sm ${darkMode ? 'bg-[#151515] border-white/5' : 'bg-white border-gray-100'}`}>
                            <div>
                                <h3 className={`text-sm font-bold mb-1 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                    <i className="fas fa-hard-hat text-yellow-500"></i> Modo Construção
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Ativa a tela de "Em Breve" para visitantes.
                                </p>
                            </div>
                            <button
                                onClick={() => onToggle('maintenanceMode', 'Modo Construção')}
                                className={`
                            relative w-12 h-7 rounded-full transition-all duration-300 ease-in-out flex-shrink-0
                            ${settings.maintenanceMode ? 'bg-yellow-500' : 'bg-gray-300'}
                        `}
                            >
                                <span className={`
                            absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md
                            transition-transform duration-300 ease-in-out
                            ${settings.maintenanceMode ? 'translate-x-5' : 'translate-x-0'}
                        `} />
                            </button>
                        </div>

                        {/* Registration */}
                        <div className={`flex items-center justify-between p-4 rounded-lg border shadow-sm ${darkMode ? 'bg-[#151515] border-white/5' : 'bg-white border-gray-100'}`}>
                            <div>
                                <h3 className={`text-sm font-bold mb-1 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                    <i className="fas fa-user-plus text-blue-500"></i> Registro de Contas
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Permite criação de novas contas.
                                </p>
                            </div>
                            <button
                                onClick={() => onToggle('registrationEnabled', 'Registro de Contas')}
                                className={`
                            relative w-12 h-7 rounded-full transition-all duration-300 ease-in-out flex-shrink-0
                            ${settings.registrationEnabled ? 'bg-blue-500' : 'bg-gray-300'}
                        `}
                            >
                                <span className={`
                            absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md
                            transition-transform duration-300 ease-in-out
                            ${settings.registrationEnabled ? 'translate-x-5' : 'translate-x-0'}
                        `} />
                            </button>
                        </div>

                        {/* Purchasing */}
                        <div className={`flex items-center justify-between p-4 rounded-lg border shadow-sm md:col-span-2 ${darkMode ? 'bg-[#151515] border-white/5' : 'bg-white border-gray-100'}`}>
                            <div>
                                <h3 className={`text-sm font-bold mb-1 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                    <i className="fas fa-shopping-cart text-green-600"></i> Sistema de Compras
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Habilita funcionalidades de compra, PDV e assinaturas.
                                    <span className="block text-red-500 font-bold mt-1 text-[10px] uppercase">
                                        {!settings.purchasingEnabled ? '⚠️ Módulo Financeiro Desativado' : ''}
                                    </span>
                                </p>
                            </div>
                            <button
                                onClick={() => onToggle('purchasingEnabled', 'Sistema de Compras')}
                                className={`
                            relative w-12 h-7 rounded-full transition-all duration-300 ease-in-out flex-shrink-0
                            ${settings.purchasingEnabled ? 'bg-green-600' : 'bg-gray-300'}
                        `}
                            >
                                <span className={`
                            absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md
                            transition-transform duration-300 ease-in-out
                            ${settings.purchasingEnabled ? 'translate-x-5' : 'translate-x-0'}
                        `} />
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-center">
                    <i className="fas fa-lock text-gray-300 text-3xl mb-3"></i>
                    <p className="text-sm font-bold text-gray-500 uppercase">Configurações Restritas ao Administrador</p>
                </div>
            )}      {/* --- DEV TOOLS / ZONA DE PERIGO --- */}
            <div className={`flex items-center justify-between p-4 rounded-lg border shadow-sm md:col-span-2 border-red-500/30 ${darkMode ? 'bg-red-900/10' : 'bg-red-50'}`}>
                <div>
                    <h3 className="text-sm font-black mb-1 flex items-center gap-2 text-red-600">
                        <i className="fas fa-biohazard"></i> ZONA DE PERIGO (DEV)
                    </h3>
                    <p className="text-xs text-red-400">
                        Ferramentas avançadas de desenvolvimento. <br />
                        <span className="font-bold">CUIDADO: Ações irreversíveis.</span>
                    </p>
                </div>
                <button
                    onClick={handleNuclearReset}
                    disabled={resetStatus === 'processing'}
                    className={`
                            px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg transition-all flex items-center gap-2
                            ${resetStatus === 'idle' ? 'bg-red-600 hover:bg-red-700 text-white hover:shadow-red-600/30' : ''}
                            ${resetStatus === 'armed' ? 'bg-yellow-400 hover:bg-yellow-500 text-black animate-pulse' : ''}
                            ${resetStatus === 'processing' ? 'bg-gray-800 text-gray-400 cursor-wait' : ''}
                        `}
                >
                    {resetStatus === 'idle' && <><i className="fas fa-bomb"></i> ZERAR TUDO (NUCLEAR)</>}
                    {resetStatus === 'armed' && <><i className="fas fa-exclamation-triangle"></i> CLIQUE PARA CONFIRMAR</>}
                    {resetStatus === 'processing' && <><i className="fas fa-cog fa-spin"></i> PROCESSANDO...</>}
                </button>
            </div>
        </div>
    );
};

export default FeatureSettings;
