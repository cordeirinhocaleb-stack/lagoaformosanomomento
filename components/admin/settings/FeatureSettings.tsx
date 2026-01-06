import React from 'react';
import { SystemSettings } from '../../../types';

interface FeatureSettingsProps {
    settings: SystemSettings;
    onToggle: (key: keyof SystemSettings, label: string) => Promise<void>;
}

const FeatureSettings: React.FC<FeatureSettingsProps> = ({ settings, onToggle }) => {
    return (
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 text-2xl border border-blue-100">
                    <i className="fas fa-cog"></i>
                </div>
                <div>
                    <h2 className="text-xl font-black text-gray-900 uppercase italic">Funcionalidades</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Configurações de recursos do sistema</p>
                </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-gray-800 mb-1">Compartilhamento Social (Omnichannel)</h3>
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
                <div className="mt-4 text-xs text-gray-600 bg-white rounded-lg p-3">
                    <strong>Status:</strong> {settings.enableOmnichannel ? '✅ Ativado' : '❌ Desativado'}
                    {!settings.enableOmnichannel && (
                        <div className="mt-2 text-gray-500">
                            Os botões de compartilhamento social não aparecerão ao publicar notícias.
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Maintenance Mode */}
                <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                    <div>
                        <h3 className="text-sm font-bold text-gray-800 mb-1 flex items-center gap-2">
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
                <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                    <div>
                        <h3 className="text-sm font-bold text-gray-800 mb-1 flex items-center gap-2">
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
                <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-100 shadow-sm md:col-span-2">
                    <div>
                        <h3 className="text-sm font-bold text-gray-800 mb-1 flex items-center gap-2">
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
        </div>
    );
};

export default FeatureSettings;
