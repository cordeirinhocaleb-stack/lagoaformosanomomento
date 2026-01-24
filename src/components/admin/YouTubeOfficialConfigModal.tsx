import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useGoogleLogin } from '@react-oauth/google';
import YouTubeMetadataForm from '@/components/media/YouTubeMetadataForm';
import { YouTubeVideoMetadata } from '@/services/upload/youtubeVideoService';
import { logger } from '@/services/core/debugLogger';

export interface YouTubeOfficialConfig {
    id?: string;
    userId: string;
    googleAccessToken: string;
    googleRefreshToken?: string;
    channelId?: string;
    defaultMetadata: YouTubeVideoMetadata;
    createdAt?: string;
    updatedAt?: string;
}

interface YouTubeOfficialConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (config: YouTubeOfficialConfig) => Promise<void>;
    userId: string;
    existingConfig?: YouTubeOfficialConfig | null;
    darkMode?: boolean;
}

/**
 * YouTube Official Configuration Modal
 * Handles Google OAuth authentication and default metadata setup
 */
export const YouTubeOfficialConfigModal: React.FC<YouTubeOfficialConfigModalProps> = ({
    isOpen,
    onClose,
    onSave,
    userId,
    existingConfig,
    darkMode = true
}) => {
    const [accessToken, setAccessToken] = useState<string | null>(existingConfig?.googleAccessToken || null);
    const [isMetadataValid, setIsMetadataValid] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [metadata, setMetadata] = useState<YouTubeVideoMetadata>(
        existingConfig?.defaultMetadata || {
            title: 'Notícia LFNM',
            description: 'Vídeo exclusivo Portal Lagoa Formosa No Momento.',
            tags: ['lagoa formosa', 'noticias', 'lfnm'],
            privacy: 'public',
            categoryId: '25',
            madeForKids: false
        }
    );

    // Google OAuth login
    const login = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            logger.log('🚀 [YOUTUBE OFFICIAL] Google Auth Success');
            if (!tokenResponse.access_token) {
                setError('Token de acesso não recebido do Google.');
                return;
            }
            setAccessToken(tokenResponse.access_token);
            setError(null);
        },
        onError: (errorResponse) => {
            logger.error('❌ [YOUTUBE OFFICIAL] Google Auth Error:', errorResponse);
            setError('Falha na autenticação com Google.');
        },
        scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly'
    });

    const handleSave = async () => {
        if (!accessToken) {
            setError('É necessário conectar sua conta Google primeiro.');
            return;
        }

        if (!isMetadataValid) {
            setError('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const config: YouTubeOfficialConfig = {
                id: existingConfig?.id,
                userId,
                googleAccessToken: accessToken,
                defaultMetadata: metadata,
                updatedAt: new Date().toISOString()
            };

            await onSave(config);
            onClose();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao salvar configuração';
            setError(message);
            logger.error('❌ [YOUTUBE OFFICIAL] Save error:', err);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    // Check for Google Client ID
    const gClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const isConfigured = !!gClientId && typeof gClientId === 'string' && gClientId.trim() !== '';

    if (!isConfigured) {
        return ReactDOM.createPortal(
            <div className="fixed inset-0 z-[6000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-red-50 border-2 border-red-400 rounded-xl p-6 text-center text-black max-w-md">
                    <i className="fas fa-exclamation-circle text-red-600 text-3xl mb-3"></i>
                    <h4 className="font-bold text-red-900 mb-2">Configuração Pendente</h4>
                    <p className="text-sm text-red-800 mb-4">
                        O <strong>NEXT_PUBLIC_GOOGLE_CLIENT_ID</strong> não foi configurado no arquivo .env.
                    </p>
                    <div className="bg-white p-3 rounded border border-red-200 text-left text-xs text-gray-600 font-mono">
                        NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu_client_id_aqui
                    </div>
                    <button
                        onClick={onClose}
                        className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
                    >
                        Fechar
                    </button>
                </div>
            </div>,
            document.body
        );
    }

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[6000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn overflow-y-auto custom-scrollbar">
            <div className={`w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl relative my-8 border ${darkMode ? 'bg-[#0F0F0F] border-white/5' : 'bg-white border-transparent'
                }`}>
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 p-8 text-white flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-xl">
                            <i className="fab fa-youtube text-3xl"></i>
                        </div>
                        <div>
                            <h3 className="text-2xl font-[1000] uppercase italic tracking-tighter">
                                YouTube Official
                            </h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                                Configuração de Canal e Metadados Padrão
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="text-white/50 hover:text-white transition-colors relative z-10 disabled:opacity-30"
                    >
                        <i className="fas fa-times text-2xl"></i>
                    </button>
                </div>

                <div className="p-10 space-y-8">
                    {/* Info Alert */}
                    <div className={`p-4 rounded-2xl flex items-start gap-3 border ${darkMode ? 'bg-blue-900/10 border-blue-900/30' : 'bg-blue-50 border-blue-100'
                        }`}>
                        <i className="fas fa-info-circle text-blue-500 mt-1"></i>
                        <div>
                            <p className={`text-[10px] font-[1000] uppercase ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                                Configuração Única
                            </p>
                            <p className={`text-[9px] leading-relaxed ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                                Configure uma vez e todos os vídeos publicados no YouTube Official usarão estes metadados como padrão.
                                Você poderá editar individualmente cada vídeo antes de publicar.
                            </p>
                        </div>
                    </div>

                    {/* Google Auth Section */}
                    {!accessToken ? (
                        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                            }`}>
                            <div className="text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-600/30">
                                    <i className="fab fa-google text-4xl text-white"></i>
                                </div>
                                <h4 className={`text-xl font-black mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Conectar Conta Google
                                </h4>
                                <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Autorize o acesso ao seu canal do YouTube para publicar vídeos
                                </p>
                                <button
                                    onClick={() => login()}
                                    className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 px-8 rounded-xl border border-gray-300 shadow-lg flex items-center gap-3 mx-auto transition-all hover:shadow-xl"
                                >
                                    <i className="fab fa-google text-red-500 text-xl"></i>
                                    <span>Conectar com Google</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Connected Status */}
                            <div className={`p-4 rounded-xl flex items-center gap-3 border ${darkMode ? 'bg-green-900/10 border-green-900/30' : 'bg-green-50 border-green-200'
                                }`}>
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <p className={`text-sm font-bold ${darkMode ? 'text-green-300' : 'text-green-800'}`}>
                                    ✓ Conta Google conectada
                                </p>
                                <button
                                    onClick={() => {
                                        setAccessToken(null);
                                        login();
                                    }}
                                    className={`ml-auto text-xs ${darkMode ? 'text-white/60 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
                                >
                                    Reconectar
                                </button>
                            </div>

                            {/* Metadata Form */}
                            <div>
                                <h4 className={`text-lg font-black mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Metadados Padrão do YouTube
                                </h4>
                                <YouTubeMetadataForm
                                    initialData={metadata}
                                    onChange={setMetadata}
                                    onValidationChange={setIsMetadataValid}
                                />
                            </div>
                        </>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                            <i className="fas fa-exclamation-triangle mr-2"></i>
                            {error}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className={`pt-8 border-t flex flex-col md:flex-row gap-4 justify-end ${darkMode ? 'border-white/5' : 'border-gray-100'
                        }`}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-colors ${darkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                } disabled:opacity-50`}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!accessToken || !isMetadataValid || isSaving}
                            className="px-12 py-4 bg-red-600 text-white rounded-2xl font-[1000] uppercase text-[11px] tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-check"></i>
                                    Salvar Configuração
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default YouTubeOfficialConfigModal;
