import React from 'react';
import { PromoPopupItemConfig } from '@/types';
import RadicalThemeSelector from './RadicalThemeSelector';

interface AdvertiserPopupThemeSelectorPanelProps {
    currentThemeId: string;
    onSelect: (updates: Partial<PromoPopupItemConfig>) => void;
    darkMode?: boolean;
    previewImage?: string;
}

const AdvertiserPopupThemeSelectorPanel: React.FC<AdvertiserPopupThemeSelectorPanelProps> = ({
    currentThemeId,
    onSelect,
    darkMode = false,
    previewImage
}) => {
    return (
        <div className="w-full">
            <RadicalThemeSelector
                currentThemeId={currentThemeId}
                onSelect={onSelect}
                darkMode={darkMode}
                previewImage={previewImage}
            />
        </div>
    );
};

export default AdvertiserPopupThemeSelectorPanel;
