
import React from 'react';
import { PromoPopupConfig } from '../../../../types';
import PromoPopupView from '../../../home/popup/PromoPopupView';
import PreviewStage from './PreviewStage';

interface PopupPreviewProps {
  config: PromoPopupConfig;
  defaultDevice?: 'phone' | 'desktop';
  placeholderTitle?: string;
  placeholderIcon?: string;
}

const PopupPreview: React.FC<PopupPreviewProps> = ({ 
    config, 
    defaultDevice = 'desktop', 
    placeholderTitle = 'Popup Desativado',
    placeholderIcon = 'fa-power-off'
}) => {
  return (
    <PreviewStage defaultDevice={defaultDevice}>
        {config.active ? (
            <PromoPopupView 
                config={config} 
                mode="preview"
            />
        ) : (
            <div className="flex flex-col items-center justify-center h-full w-full opacity-50 select-none">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                    <i className={`fas ${placeholderIcon} text-4xl text-gray-300`}></i>
                </div>
                <p className="text-sm font-black uppercase tracking-widest text-gray-500">{placeholderTitle}</p>
                <p className="text-[9px] font-bold text-gray-400 mt-2 bg-gray-100 px-3 py-1 rounded-full uppercase">
                    Ative nas configurações para visualizar
                </p>
            </div>
        )}
    </PreviewStage>
  );
};

export default PopupPreview;
