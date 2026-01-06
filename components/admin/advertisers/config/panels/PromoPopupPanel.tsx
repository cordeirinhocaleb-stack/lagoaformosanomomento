import React from 'react';
import { AdPricingConfig, PromoPopupSetConfig } from '../../../../../types';
import PopupSetBuilder from '../../popupBuilder/PopupSetBuilder';
import { MAX_ITEMS_PER_SET } from '../../../../../utils/popupSafety';

interface PromoPopupPanelProps {
  config: AdPricingConfig;
  onChange: (newConfig: AdPricingConfig) => void;
}

const DEFAULT_SET: PromoPopupSetConfig = {
    items: []
};

const PromoPopupPanel: React.FC<PromoPopupPanelProps> = ({ config, onChange }) => {
  const popupSet = config.popupSet || DEFAULT_SET;

  const handleSetChange = (newSet: PromoPopupSetConfig) => {
      onChange({ ...config, popupSet: newSet });
  };

  return (
    <div className="h-full flex flex-col animate-fadeIn">
        <div className="mb-6 flex justify-between items-center">
            <div>
                <h3 className="text-lg font-black uppercase text-gray-900 tracking-tight">Popup Global</h3>
                <p className="text-xs font-medium text-gray-500">
                    Campanhas que aparecem na Home e em todas as notícias para não-assinantes.
                </p>
            </div>
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100 shadow-sm">
                Max {MAX_ITEMS_PER_SET} Slides
            </div>
        </div>

        <div className="flex-1 min-h-[600px] relative">
            <PopupSetBuilder config={popupSet} onChange={handleSetChange} />
        </div>
    </div>
  );
};

export default PromoPopupPanel;