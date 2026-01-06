import React from 'react';
import { SystemSettings } from '../../../types';

interface IntegrationSettingsProps {
    settings: SystemSettings;
    onUpdateCloudinary: (type: 'images' | 'videos', field: 'cloudName' | 'uploadPreset', value: string) => void;
    onTestCloudinary: (type: 'images' | 'videos') => void;
    onTestSupabase: () => void;
    cloudinaryImgStatus: 'idle' | 'checking' | 'success' | 'error';
    cloudinaryVidStatus: 'idle' | 'checking' | 'success' | 'error';
    connectionStatus: 'idle' | 'checking' | 'success' | 'error';
}

const IntegrationSettings: React.FC<IntegrationSettingsProps> = ({
    settings,
    onUpdateCloudinary,
    onTestCloudinary,
    onTestSupabase,
    cloudinaryImgStatus,
    cloudinaryVidStatus,
    connectionStatus
}) => {
    return (
        <>
            {/* Cloudinary */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 text-2xl border border-blue-100">
                        <i className="fas fa-cloud"></i>
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 uppercase italic">Hospedagem de Mídia</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Separação de Imagens e Vídeos</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    {/* Images Column */}
                    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                        <h3 className="text-xs font-black uppercase text-blue-800 mb-4 flex items-center gap-2">
                            <i className="fas fa-images"></i> Conta para Imagens
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Cloud Name</label>
                                <input
                                    type="text"
                                    value={settings.cloudinary?.images?.cloudName || ''}
                                    onChange={(e) => onUpdateCloudinary('images', 'cloudName', e.target.value)}
                                    className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Upload Preset</label>
                                <input
                                    type="text"
                                    value={settings.cloudinary?.images?.uploadPreset || ''}
                                    onChange={(e) => onUpdateCloudinary('images', 'uploadPreset', e.target.value)}
                                    className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-blue-500"
                                />
                            </div>
                            <button
                                onClick={() => onTestCloudinary('images')}
                                className={`w-full px-4 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all flex items-center justify-center gap-2 ${cloudinaryImgStatus === 'success' ? 'bg-green-100 text-green-700' : cloudinaryImgStatus === 'error' ? 'bg-red-100 text-red-600' : 'bg-white border border-blue-200 text-blue-600 hover:bg-blue-50'}`}
                            >
                                {cloudinaryImgStatus === 'checking' ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-plug"></i>}
                                {cloudinaryImgStatus === 'success' ? 'Conexão OK' : 'Testar Imagens'}
                            </button>
                        </div>
                    </div>

                    {/* Videos Column */}
                    <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100">
                        <h3 className="text-xs font-black uppercase text-red-800 mb-4 flex items-center gap-2">
                            <i className="fas fa-video"></i> Conta para Vídeos
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Cloud Name</label>
                                <input
                                    type="text"
                                    value={settings.cloudinary?.videos?.cloudName || ''}
                                    onChange={(e) => onUpdateCloudinary('videos', 'cloudName', e.target.value)}
                                    className="w-full bg-white border border-red-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-red-500"
                                />
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Upload Preset</label>
                                <input
                                    type="text"
                                    value={settings.cloudinary?.videos?.uploadPreset || ''}
                                    onChange={(e) => onUpdateCloudinary('videos', 'uploadPreset', e.target.value)}
                                    className="w-full bg-white border border-red-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-red-500"
                                />
                            </div>
                            <button
                                onClick={() => onTestCloudinary('videos')}
                                className={`w-full px-4 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all flex items-center justify-center gap-2 ${cloudinaryVidStatus === 'success' ? 'bg-green-100 text-green-700' : cloudinaryVidStatus === 'error' ? 'bg-red-100 text-red-600' : 'bg-white border border-red-200 text-red-600 hover:bg-red-50'}`}
                            >
                                {cloudinaryVidStatus === 'checking' ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-plug"></i>}
                                {cloudinaryVidStatus === 'success' ? 'Conexão OK' : 'Testar Vídeos'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Supabase */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden mt-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 text-2xl border border-green-100">
                        <i className="fas fa-database"></i>
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 uppercase italic">Conexão Supabase</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Banco de Dados</p>
                    </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full animate-pulse ${connectionStatus === 'success' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-zinc-400'}`}></div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Status da Comunicação</p>
                            <p className="text-sm font-bold text-gray-900">
                                {connectionStatus === 'success' ? 'Link established with Supabase Engine' :
                                    connectionStatus === 'error' ? 'Connection timeout or invalid credentials' :
                                        'Awaiting manual diagnostic check'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onTestSupabase}
                        className={`px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 ${connectionStatus === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-black text-white hover:bg-zinc-800'}`}
                    >
                        {connectionStatus === 'checking' ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-plug"></i>}
                        {connectionStatus === 'success' ? 'Conectado' : 'Testar Conexão'}
                    </button>
                </div>
            </div>
        </>
    );
};

export default IntegrationSettings;
