import React from 'react';
import { SystemSettings } from '../../../types';

interface FooterSettingsProps {
    settings: SystemSettings;
    onUpdateFooter: (field: string, value: string) => void;

    onUpdateSocial: (network: string, value: string) => void;
    darkMode?: boolean;
}

const FooterSettings: React.FC<FooterSettingsProps> = ({ settings, onUpdateFooter, onUpdateSocial, darkMode = true }) => {
    return (
        <div className={`p-6 md:p-8 rounded-[2rem] border shadow-sm relative overflow-hidden transition-colors ${darkMode ? 'bg-[#0F0F0F] border-white/5' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600 text-2xl border border-red-100">
                    <i className="fas fa-address-card"></i>
                </div>
                <div>
                    <h2 className={`text-xl font-black uppercase italic ${darkMode ? 'text-white' : 'text-gray-900'}`}>Identidade & Rodapé</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Contatos oficiais e Redes Sociais</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 mb-10">
                <div>
                    <label className="text-[9px] font-black uppercase text-gray-400 mb-2 block tracking-widest">E-mail de Contato</label>
                    <input
                        type="email"
                        value={settings.footer?.email || ''}
                        onChange={(e) => onUpdateFooter('email', e.target.value)}
                        placeholder="pauta@lfnm.com.br"
                        className={`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500 ${darkMode ? 'bg-black/30 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
                    />
                </div>
                <div>
                    <label className="text-[9px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Telefone / WhatsApp</label>
                    <input
                        type="text"
                        value={settings.footer?.phone || ''}
                        onChange={(e) => onUpdateFooter('phone', e.target.value)}
                        placeholder="(34) 99999-0000"
                        className={`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500 ${darkMode ? 'bg-black/30 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
                    />
                </div>
            </div>

            <h3 className={`text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest border-b pb-2 ${darkMode ? 'border-white/5' : 'border-gray-50'}`}>Links das Redes Sociais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Social Networks Inputs */}
                {[
                    { key: 'instagram', icon: 'fab fa-instagram', color: 'text-pink-500', focus: 'focus:border-pink-500' },
                    { key: 'facebook', icon: 'fab fa-facebook', color: 'text-blue-600', focus: 'focus:border-blue-600' },
                    { key: 'whatsapp', icon: 'fab fa-whatsapp', color: 'text-green-500', focus: 'focus:border-green-500' },
                    { key: 'youtube', icon: 'fab fa-youtube', color: 'text-red-600', focus: 'focus:border-red-600' }
                ].map((network) => (
                    <div key={network.key}>
                        <label className="text-[9px] font-black uppercase text-gray-400 mb-2 block tracking-widest">{network.key}</label>
                        <div className="relative">
                            <i className={`${network.icon} absolute left-4 top-1/2 -translate-y-1/2 ${network.color}`}></i>
                            <input
                                type="text"
                                value={settings.footer?.socialLinks?.[network.key as keyof typeof settings.footer.socialLinks] || ''}
                                onChange={(e) => onUpdateSocial(network.key, e.target.value)}
                                placeholder={`Link do ${network.key}...`}
                                className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm font-bold outline-none ${network.focus} placeholder:text-gray-600 ${darkMode ? 'bg-black/30 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Status Preview */}
            <div className={`mt-8 pt-6 border-t ${darkMode ? 'border-white/5' : 'border-gray-100'}`}>
                <h4 className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-4">Informações Públicas Ativas</h4>
                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                    <h5 className="text-[9px] font-bold uppercase text-gray-500 mb-3 flex items-center gap-2">
                        <i className="fas fa-share-alt"></i> Redes Conectadas
                    </h5>
                    <div className="flex flex-wrap gap-2 text-[10px]">
                        {Object.entries(settings.footer?.socialLinks || {}).filter(([_, v]) => v).length === 0 && (
                            <span className="text-gray-400 italic">Nenhuma rede conectada</span>
                        )}
                        {Object.entries(settings.footer?.socialLinks || {}).filter(([_, v]) => v).map(([key]) => (
                            <span key={key} className={`px-2 py-1 border rounded-md font-bold uppercase ${darkMode ? 'bg-white/10 border-white/5 text-gray-300' : 'bg-white border-gray-200 text-gray-700'}`}>{key}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FooterSettings;
