import React, { useEffect, useState } from 'react';
import { SocialDistribution } from '../../types';
import Logo from '../common/Logo';

interface SocialDistributionOverlayProps {
  status: 'idle' | 'uploading' | 'distributing' | 'success' | 'error' | 'report';
  distributions: SocialDistribution[];
  onClose: () => void;
}

const SocialDistributionOverlay: React.FC<SocialDistributionOverlayProps> = ({ status, distributions, onClose }) => {
  if (status === 'idle') {return null;}

  const isReport = status === 'report';

  return (
    <div className="fixed inset-0 z-[5000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-fadeIn">
      <div className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 blur-[100px] animate-pulse"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 mb-8 relative">
            <div className={`absolute inset-0 rounded-full border-4 border-t-red-600 border-white/10 ${!isReport && status !== 'success' ? 'animate-spin' : ''}`}></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <Logo className="w-12 h-12" />
            </div>
          </div>

          <h2 className="text-3xl font-[1000] text-white uppercase italic tracking-tighter mb-2">
            {status === 'uploading' && 'Sincronizando Mídia Cloud...'}
            {status === 'distributing' && 'Disparando Redes Sociais...'}
            {status === 'success' && 'Publicação Concluída!'}
            {status === 'error' && 'Falha na Distribuição'}
            {status === 'report' && 'Relatório Social'}
          </h2>
          
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-[0.3em] mb-12">
            Centro de Distribuição Omnichannel LFNM
          </p>

          <div className="w-full space-y-4 mb-12 text-left">
            {distributions.length > 0 ? distributions.map((dist, idx) => (
              <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${
                    dist.platform === 'instagram_feed' ? 'bg-gradient-to-tr from-purple-600 to-pink-500' :
                    dist.platform === 'facebook' ? 'bg-blue-600' :
                    dist.platform === 'whatsapp' ? 'bg-green-600' : 'bg-blue-800'
                  }`}>
                    <i className={`fab fa-${dist.platform === 'whatsapp' ? 'whatsapp' : dist.platform.includes('instagram') ? 'instagram' : dist.platform}`}></i>
                  </div>
                  <div>
                    <p className="text-white font-black text-[10px] uppercase tracking-widest">{dist.platform.replace('_', ' ')}</p>
                    <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-tighter line-clamp-1">{dist.content.substring(0, 40)}...</p>
                  </div>
                </div>
                <div>
                   {status === 'distributing' ? (
                     <img src="https://lh3.googleusercontent.com/d/1u0-ygqjuvPa4STtU8gT8HFyF05luNo1P" className="w-4 h-4 animate-coin object-contain" alt="Loading" />
                   ) : (dist.status === 'posted' || status === 'success' || isReport) ? (
                     <i className="fas fa-check-circle text-green-500"></i>
                   ) : (
                     <span className="w-2 h-2 bg-white/10 rounded-full"></span>
                   )}
                </div>
              </div>
            )) : (
                <div className="text-center text-zinc-500 text-xs font-bold uppercase py-4">Nenhuma rede social configurada para este post.</div>
            )}
          </div>

          {(status === 'success' || isReport || status === 'error') && (
            <button 
              onClick={onClose}
              className="bg-white text-black px-12 py-4 rounded-full font-black uppercase text-[10px] tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all shadow-xl"
            >
              Voltar ao Painel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialDistributionOverlay;