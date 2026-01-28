
import React from 'react';
import { Advertiser, AdPricingConfig } from '../../types';
import AdBanner from '../ads/AdBanner';
import FullWidthPromo from '../ads/FullWidthPromo';

interface HeroSectionProps {
  advertisers: Advertiser[];
  adConfig?: AdPricingConfig;
  onAdvertiserClick: (adOrId: Advertiser | string) => void;
  onAdvertiserView?: (adId: string) => void;
  onPlanRequest: () => void;
  contractBanners?: any[];
}

const HeroSection: React.FC<HeroSectionProps> = ({ advertisers, adConfig, onAdvertiserClick, onAdvertiserView, onPlanRequest, contractBanners }) => {
  return (
    <section className="flex flex-col gap-0 w-full animate-fadeIn">
      {/* Faixa de Anunciantes Master removida para evitar duplicidade com PartnersStrip */}

      {/* Banner Promocional Rotativo (Carrega dos contratos de anunciantes) */}
      <FullWidthPromo
        banners={contractBanners}
        onAdvertiserClick={onAdvertiserClick}
        onAdvertiserView={onAdvertiserView}
      />

      {/* Título Conceitual da Home - Reduzido */}
      <div className="w-full px-4 md:px-8 lg:px-12 mt-2 md:mt-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-[1000] uppercase tracking-tighter text-black leading-none">
            NOTÍCIAS
          </h2>
          <div className="bg-red-600 px-5 py-2 md:py-3 skew-x-[-15deg] shadow-xl w-fit">
            <span className="text-white font-black text-xl md:text-3xl lg:text-4xl italic skew-x-[15deg] block leading-none">
              DO MOMENTO
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
