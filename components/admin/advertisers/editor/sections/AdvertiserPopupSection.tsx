
import React from 'react';
import { Advertiser, PromoPopupSetConfig } from '../../../../../types';
import PopupSetBuilder from '../../popupBuilder/PopupSetBuilder';

interface AdvertiserPopupSectionProps {
  data: Advertiser;
  onChange: (data: Advertiser) => void;
}

const DEFAULT_SET: PromoPopupSetConfig = {
    items: []
};

const AdvertiserPopupSection: React.FC<AdvertiserPopupSectionProps> = ({ data, onChange }) => {
  const popupSet = data.popupSet || DEFAULT_SET;

  const handleSetChange = (newSet: PromoPopupSetConfig) => {
      onChange({ ...data, popupSet: newSet });
  };

  return (
    <div className="h-full flex flex-col animate-fadeIn min-h-[700px]">
        <div className="mb-6 flex justify-between items-center bg-yellow-50 p-6 rounded-[2rem] border border-yellow-100">
            <div>
                <h3 className="text-sm font-black uppercase text-yellow-900 tracking-tight">Popup Exclusivo</h3>
                <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest mt-1">
                    Exibido apenas na página interna deste anunciante
                </p>
            </div>
            <div className="bg-white text-yellow-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                Marketing Direto
            </div>
        </div>

        <div className="flex-1 relative">
            <PopupSetBuilder config={popupSet} onChange={handleSetChange} />
        </div>
    </div>
  );
};

export default AdvertiserPopupSection;
