
import React from 'react';
import { SocialDistribution } from '../../types';
import Logo from '../common/Logo';

interface SocialDistributionOverlayProps {
  status: 'idle' | 'uploading' | 'distributing' | 'success' | 'error' | 'report';
  distributions: SocialDistribution[];
  onClose: () => void;
  newsId?: string | null;
  onNewPost?: () => void;
}

const SocialDistributionOverlay: React.FC<SocialDistributionOverlayProps> = ({ status, distributions, onClose, newsId, onNewPost }) => {
  if (status === 'idle') return null;

  const isReport = status === 'report';
  const isSuccess = status === 'success';
  const isError = status === 'error';
  const isProcessing = status === 'uploading' || status === 'distributing';

  const handleExitToSite = () => {
      window.location.hash = '/';
      window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[5000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-fadeIn">
      <div className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
        
        {/* BOTÃO VOLTAR (X) SEMPRE ACESSÍVEL */}
        <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-[60] w-12 h-12 rounded-full bg-white/5 border border-white/10 text-white hover:bg-red-600 transition-all flex items-center justify-center shadow-lg group active:scale-90"
            title={isError ? "Corrigir no Editor" : "Fechar"}
        >
            <i className="fas fa-times text-xl group-hover:rotate-90 transition-transform"></i>
        </button>

        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 blur-[100px] animate-pulse"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 mb-8 relative">
            <div className={`absolute inset-0 rounded-full border-4 border-t-red-600 border-white/10 ${isProcessing ? 'animate-spin' : ''}`}></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <Logo className="w-12 h-12" />
            </div>
          </div>

          <h2 className="text-3xl font-[1000] text-white uppercase italic tracking-tighter mb-2">
            {status === 'uploading' && 'Sincronizando Mídia Cloud...'}
            {status === 'distributing' && 'Disparando Redes Sociais...'}
            {isSuccess && 'Publicação Concluída!'}
            {isError && 'Falha Crítica no Upload'}
            {status === 'report' && 'Relatório Social'}
          </h2>
          
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-[0.3em] mb-12">
            Centro de Distribuição Omnichannel LFNM
          </p>

          {!isSuccess && !isError && (
              <div className="w-full space-y-4 mb-12 text-left max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {distributions.length > 0 ? distributions.map((dist, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between group animate-fadeIn">
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
                      ) : (dist.status === 'posted' || isReport) ? (
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
          )}

          {isError && (
              <div className="w-full p-6 bg-red-600/10 border border-red-600/30 rounded-3xl mb-12 text-left">
                  <div className="flex items-center gap-4 text-red-500 mb-4">
                      <i className="fas fa-exclamation-triangle text-2xl"></i>
                      <span className="text-xs font-black uppercase tracking-widest">Ocorreu um erro no processamento</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed mb-6">
                      O editor preservou todos os seus textos, blocos e seleções de mídia. Verifique sua conexão ou se os arquivos (vídeos/imagens) estão corrompidos e tente novamente.
                  </p>
                  <button 
                    onClick={onClose}
                    className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95"
                  >
                      Voltar e Recuperar Edição
                  </button>
              </div>
          )}

          {/* SUCESSO: OPÇÕES DE NAVEGAÇÃO */}
          {isSuccess && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md animate-slideUp">
                  {newsId && (
                      <button 
                        onClick={() => { window.open(`/#/news/${newsId}`, '_blank'); }}
                        className="bg-green-600 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-green-500 transition-all shadow-xl border border-green-500 flex flex-col items-center justify-center gap-2 group"
                      >
                          <i className="fas fa-external-link-alt text-2xl group-hover:scale-110 transition-transform"></i>
                          Ir para Publicação
                      </button>
                  )}

                  <button 
                    onClick={onNewPost}
                    className="bg-white text-black py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 transition-all shadow-xl flex flex-col items-center justify-center gap-2 group"
                  >
                      <i className="fas fa-plus text-2xl group-hover:rotate-90 transition-transform"></i>
                      Nova Notícia
                  </button>
                  
                  <button 
                    onClick={onClose}
                    className="bg-zinc-800 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-pen"></i> Voltar ao Editor
                  </button>

                  <button 
                    onClick={handleExitToSite}
                    className="bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-power-off"></i> Sair para o Site
                  </button>
              </div>
          )}

          {/* PROCESSANDO: BOTÃO DE VOLTAR DISCRETO */}
          {isProcessing && (
              <button 
                onClick={onClose}
                className="mt-4 bg-white/5 text-zinc-500 py-3 px-8 rounded-full font-black uppercase text-[9px] tracking-widest hover:text-white hover:bg-white/10 transition-all border border-white/5"
              >
                Continuar Editando em Segundo Plano
              </button>
          )}

          {/* RELATÓRIO: BOTÃO DE VOLTAR SIMPLES */}
          {isReport && (
            <button 
              onClick={onClose}
              className="bg-white text-black px-12 py-4 rounded-full font-black uppercase text-[10px] tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all shadow-xl"
            >
              Voltar ao Editor
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialDistributionOverlay;
