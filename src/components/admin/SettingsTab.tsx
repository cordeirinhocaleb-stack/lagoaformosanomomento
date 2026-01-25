import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { SystemSettings, SettingsAuditItem } from '../../types';
import { checkConnection, getSupabase } from '../../services/supabaseService';
import { testCloudinaryConnection } from '../../services/cloudinaryService';
import { saveSystemSettings, getSettingsHistory } from '../../services/settingsService';

import FeatureSettings from './settings/FeatureSettings';
import FooterSettings from './settings/FooterSettings';
import IntegrationSettings from './settings/IntegrationSettings';

interface SettingsTabProps {
    driveConfig?: { clientId: string; apiKey: string; appId: string }; // Optional to prevent crash if not passed
    systemSettings: SystemSettings;
    onSave: (driveConfig: { clientId: string; apiKey: string; appId: string }, systemSettings: SystemSettings) => Promise<void> | void;
    currentUser: User | null;
    onUpdateSettings: (settings: SystemSettings) => Promise<void> | void;
    darkMode?: boolean;
}

const DEFAULT_DRIVE_CONFIG = { clientId: '', apiKey: '', appId: '' };

const SettingsTab: React.FC<SettingsTabProps> = ({
    driveConfig = DEFAULT_DRIVE_CONFIG,
    systemSettings,
    onSave,
    onUpdateSettings,
    currentUser,
    darkMode = false
}) => {
    const [config, setConfig] = useState(driveConfig);
    const [settings, setSettings] = useState<SystemSettings>(systemSettings);

    // Local State
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
    const [cloudinaryImgStatus, setCloudinaryImgStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
    const [cloudinaryVidStatus, setCloudinaryVidStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);


    useEffect(() => {
        if (driveConfig) { setConfig(driveConfig); }
        setSettings(systemSettings);
    }, [driveConfig, systemSettings]);


    const testConnection = async () => {
        setConnectionStatus('checking');
        try {
            if (settings.supabase?.url && settings.supabase?.anonKey) {
                const ok = await checkConnection(settings.supabase.url, settings.supabase.anonKey);
                setConnectionStatus(ok ? 'success' : 'error');
                return;
            }
            const globalClient = getSupabase();
            if (globalClient) {
                const { error } = await globalClient.from('users').select('count', { count: 'exact', head: true }).limit(1);
                setConnectionStatus(!error ? 'success' : 'error');
            } else {
                setConnectionStatus('error');
            }
        } catch (e) {
            console.error("Erro no teste de conexão:", e);
            setConnectionStatus('error');
        }
    };

    const testCloudinary = async (type: 'images' | 'videos') => {
        const config = type === 'images' ? settings.cloudinary?.images : settings.cloudinary?.videos;
        if (!config?.cloudName || !config?.uploadPreset) { return alert("Cloud Name e Upload Preset são obrigatórios."); }

        type === 'images' ? setCloudinaryImgStatus('checking') : setCloudinaryVidStatus('checking');
        const result = await testCloudinaryConnection(config.cloudName, config.uploadPreset);

        if (result.success) {
            type === 'images' ? setCloudinaryImgStatus('success') : setCloudinaryVidStatus('success');
        } else {
            type === 'images' ? setCloudinaryImgStatus('error') : setCloudinaryVidStatus('error');
            alert(`Falha no teste: ${result.message}`);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setNotification(null);
        try {
            const result = await saveSystemSettings(settings, 'admin');
            if (!result.success) { throw new Error(result.message); }

            await onSave(config, settings);
            await onUpdateSettings(settings); // Propagate up

            setTimeout(() => setNotification(null), 3000);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Erro ao salvar.";
            console.error("Erro ao salvar:", error);
            setNotification({ type: 'error', message: message });
            setTimeout(() => setNotification(null), 5000);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFooterUpdate = (field: string, value: string) => {
        setSettings(prev => ({
            ...prev,
            footer: { ...prev.footer, [field]: value }
        }));
    };

    const handleSocialUpdate = (network: string, value: string) => {
        setSettings(prev => ({
            ...prev,
            footer: {
                ...prev.footer,
                socialLinks: { ...prev.footer?.socialLinks, [network]: value }
            }
        }));
    };

    const handleToggle = async (key: keyof SystemSettings, label: string) => {
        const newValue = !settings[key];
        const newSettings = { ...settings, [key]: newValue };
        setSettings(newSettings);

        // Optimistic UI + Save
        try {
            const result = await saveSystemSettings(newSettings, 'admin');
            if (result.success) {
                await onUpdateSettings(newSettings);
                setTimeout(() => setNotification(null), 3000);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            setSettings({ ...settings, [key]: !newValue }); // Revert
            setNotification({ type: 'error', message: `Falha ao atualizar ${label}.` });
        }
    };

    const handleCloudinaryUpdate = (type: 'images' | 'videos', field: 'cloudName' | 'uploadPreset', value: string) => {
        setSettings(prev => ({
            ...prev,
            cloudinary: {
                ...prev.cloudinary,
                [type]: { ...prev.cloudinary?.[type], [field]: value }
            }
        }));
    };

    return (
        <div className="animate-fadeIn max-w-5xl mx-auto w-full pb-20 relative">
            {/* Notification Toast */}
            {notification && (
                <div className={`fixed bottom-6 right-6 z-[9999] animate-slideInRight max-w-sm bg-white rounded-xl shadow-lg p-4 flex items-center gap-3 border-l-4 ${notification.type === 'success' ? 'border-green-500' : notification.type === 'error' ? 'border-red-600' : 'border-blue-500'}`}>
                    <p className="text-sm font-bold text-gray-900">{notification.message}</p>
                    <button onClick={() => setNotification(null)} className="ml-auto text-gray-400 hover:text-gray-600"><i className="fas fa-times"></i></button>
                </div>
            )}

            <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className={`text-3xl md:text-4xl font-black uppercase italic tracking-tighter ${darkMode ? 'text-white' : 'text-gray-900'}`}>CONFIGURAÇÕES DO <span className="text-red-600">SISTEMA</span></h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gerenciamento de Integrações e APIs</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`${darkMode ? 'bg-white text-black hover:bg-green-400' : 'bg-black text-white hover:bg-green-600'} px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg flex items-center gap-2 ${isSaving ? 'opacity-70 cursor-wait' : ''}`}
                >
                    {isSaving ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-save"></i>}
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </header>

            <div className="grid grid-cols-1 gap-8">
                <FeatureSettings settings={settings} onToggle={handleToggle} darkMode={darkMode} user={currentUser} />

                <FooterSettings
                    settings={settings}
                    onUpdateFooter={handleFooterUpdate}
                    onUpdateSocial={handleSocialUpdate}
                    darkMode={darkMode}
                />

                <IntegrationSettings
                    settings={settings}
                    onUpdateCloudinary={handleCloudinaryUpdate}
                    onTestCloudinary={testCloudinary}
                    onTestSupabase={testConnection}
                    cloudinaryImgStatus={cloudinaryImgStatus}
                    cloudinaryVidStatus={cloudinaryVidStatus}
                    connectionStatus={connectionStatus}
                    darkMode={darkMode}
                />
            </div>
        </div>
    );
};

export default SettingsTab;
