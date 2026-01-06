
import React from 'react';
import { AdPlanConfig } from '../../../../../types';

interface BenefitListProps {
  plan: AdPlanConfig;
}

const BenefitList: React.FC<BenefitListProps> = ({ plan }) => {
  const { features } = plan;

  const BenefitItem = ({ icon, label, value, highlight = false }: { icon: string, label: string, value: string, highlight?: boolean }) => (
      <li className={`flex items-center justify-between p-3 rounded-xl border ${highlight ? 'bg-green-50 border-green-100' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${highlight ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-400'}`}>
                  <i className={`fas ${icon}`}></i>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${highlight ? 'text-green-800' : 'text-gray-500'}`}>{label}</span>
          </div>
          <span className={`text-xs font-bold ${highlight ? 'text-green-700' : 'text-gray-900'}`}>{value}</span>
      </li>
  );

  return (
    <ul className="space-y-2">
        <BenefitItem 
            icon="fa-box-open" 
            label="Vitrine" 
            value={features.maxProducts === 0 ? 'Ilimitada' : `${features.maxProducts} itens`} 
            highlight={features.maxProducts === 0}
        />
        <BenefitItem 
            icon="fa-briefcase" 
            label="Vagas" 
            value={features.canCreateJobs ? 'Liberado' : 'Bloqueado'} 
            highlight={features.canCreateJobs}
        />
        <BenefitItem 
            icon="fa-video" 
            label="Vídeo Social" 
            value={features.socialVideoAd ? (features.videoLimit ? `${features.videoLimit}/mês` : 'Sim') : 'Não'} 
            highlight={features.socialVideoAd}
        />
        <BenefitItem 
            icon="fa-bullhorn" 
            label="Frequência" 
            value={features.socialFrequency === 'daily' ? 'Diária' : features.socialFrequency === 'weekly' ? 'Semanal' : features.socialFrequency === 'biweekly' ? 'Quinzenal' : 'Mensal'} 
            highlight={features.socialFrequency === 'daily'}
        />
        <BenefitItem 
            icon="fa-globe" 
            label="Página Interna" 
            value={features.hasInternalPage ? 'Sim' : 'Não'} 
            highlight={features.hasInternalPage}
        />
        <BenefitItem 
            icon="fa-share-nodes" 
            label="Redes Sociais" 
            value={`${features.allowedSocialNetworks.length} Canais`} 
        />
    </ul>
  );
};

export default BenefitList;
