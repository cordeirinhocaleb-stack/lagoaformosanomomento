import React from 'react';
import { User } from '@/types';
import { CreditItemControl } from './CreditItemControlPanel';

interface ManualResourceManagementProps {
    user: User;
    canEdit: boolean;
    onUpdateUser: (updates: Partial<User>) => void;
    darkMode: boolean;
}

export const ManualResourceManagement: React.FC<ManualResourceManagementProps> = ({
    user,
    canEdit,
    onUpdateUser,
    darkMode
}) => {
    const currentUsage = user.usageCredits || {};

    return (
        <div className={`rounded-xl p-6 ${darkMode ? 'bg-black/40' : 'bg-gray-50'}`}>
            <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                <i className="fas fa-tools text-yellow-600"></i> Gestão Direta de Itens (Manual)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                <CreditItemControl
                    label="Vídeos"
                    icon="fas fa-clapperboard"
                    field="videoLimit"
                    currentValue={(currentUsage as any).videoLimit || 0}
                    canEdit={canEdit}
                    onUpdateUser={onUpdateUser as any}
                    currentUsage={currentUsage}
                    user={user}
                    darkMode={darkMode}
                />
                <CreditItemControl
                    label="Instagram"
                    icon="fab fa-instagram"
                    field="instagram"
                    currentValue={(currentUsage as any).instagram || 0}
                    canEdit={canEdit}
                    onUpdateUser={onUpdateUser as any}
                    currentUsage={currentUsage}
                    user={user}
                    darkMode={darkMode}
                />
                <CreditItemControl
                    label="Facebook"
                    icon="fab fa-facebook-f"
                    field="facebook"
                    currentValue={(currentUsage as any).facebook || 0}
                    canEdit={canEdit}
                    onUpdateUser={onUpdateUser as any}
                    currentUsage={currentUsage}
                    user={user}
                    darkMode={darkMode}
                />
                <CreditItemControl
                    label="Youtube"
                    icon="fab fa-youtube"
                    field="youtube"
                    currentValue={(currentUsage as any).youtube || 0}
                    canEdit={canEdit}
                    onUpdateUser={onUpdateUser as any}
                    currentUsage={currentUsage}
                    user={user}
                    darkMode={darkMode}
                />
                <CreditItemControl
                    label="TikTok"
                    icon="fab fa-tiktok"
                    field="tiktok"
                    currentValue={(currentUsage as any).tiktok || 0}
                    canEdit={canEdit}
                    onUpdateUser={onUpdateUser as any}
                    currentUsage={currentUsage}
                    user={user}
                    darkMode={darkMode}
                />
                <CreditItemControl
                    label="WhatsApp"
                    icon="fab fa-whatsapp"
                    field="whatsapp"
                    currentValue={(currentUsage as any).whatsapp || 0}
                    canEdit={canEdit}
                    onUpdateUser={onUpdateUser as any}
                    currentUsage={currentUsage}
                    user={user}
                    darkMode={darkMode}
                />
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase mt-4 italic">
                * Item manual para correções rápidas ou bonificações avulsas sem necessidade de plano ou boost.
            </p>
        </div>
    );
};
