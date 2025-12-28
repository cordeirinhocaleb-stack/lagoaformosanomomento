
import React from 'react';
import Logo from './Logo';
import VideoPresenter from './ChromaKeyVideo';

const TopBillboard: React.FC = () => {
  const presenterVideoUrl = "https://vimeo.com/1149429293";

  return (
    <div className="w-full bg-white overflow-hidden">
      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
        <div className="w-full h-[342px] sm:h-[504px] md:h-[720px] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden flex relative group cursor-pointer border-4 md:border-8 border-red-600 bg-white shadow-2xl transition-all duration-700">
          
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-gray-50 to-white opacity-100"></div>
          
          {/* CONTAINER CENTRALIZADO (Correção Desktop) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 select-none px-4">
            <div className="w-full max-w-7xl mx-auto h-full flex items-center justify-center relative">
              
              <div className="flex flex-col md:flex-row items-center justify-center w-full relative transform-gpu transition-all duration-1000 group-hover:scale-[1.01]">
                <div className="w-36 h-36 sm:w-48 sm:h-48 md:w-[360px] md:h-[360px] z-30 flex-shrink-0">
                  <Logo className="drop-shadow-[0_20px_60px_rgba(220,38,38,0.3)] scale-110 group-hover:scale-125 transition-transform duration-1000" />
                </div>

                <div className="flex flex-col items-start -mt-4 sm:-mt-8 md:mt-0 md:-ml-8 z-40">
                    <h1 className="text-black text-[12vw] sm:text-[10vw] md:text-[8vw] font-[1000] uppercase tracking-tighter leading-none drop-shadow-2xl whitespace-nowrap">
                      LAGOA <span className="text-red-600">FORMOSA</span>
                    </h1>
                    <div className="self-end relative mt-2 sm:mt-6">
                      <div className="bg-red-600 px-4 sm:px-16 py-3 sm:py-6 skew-x-[-15deg] shadow-2xl border-r-[8px] sm:border-r-[24px] border-white/20">
                        <span className="block text-white text-[8vw] sm:text-[5vw] font-[1000] uppercase tracking-tighter skew-x-[15deg] leading-none whitespace-nowrap">
                          NO MOMENTO
                        </span>
                      </div>
                    </div>
                </div>

                {/* Apresentador Welix Duarte */}
                <div className="absolute right-2 md:right-10 bottom-[-140px] sm:bottom-[-200px] md:bottom-[-220px] lg:bottom-[-280px] h-[280px] sm:h-[500px] lg:h-[750px] w-auto z-20 flex items-end pointer-events-none">
                   <VideoPresenter 
                    src={presenterVideoUrl} 
                    className="h-full aspect-[9/16] drop-shadow-2xl"
                   />
                </div>
              </div>

            </div>
          </div>
          
          {/* Barra Inferior (Contato) - Centralizada no Container */}
          <div className="absolute bottom-4 sm:bottom-8 left-0 right-0 z-50 flex justify-center w-full">
             <div className="w-full max-w-7xl px-4 sm:px-24 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="hidden lg:flex bg-black text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.5em] items-center gap-4 border border-white/10">
                  <span className="w-3 h-3 bg-red-600 rounded-full animate-ping"></span>
                  REDE WELIX DUARTE
                </div>
                
                <button className="bg-red-600 hover:bg-black text-white px-8 sm:px-16 py-3 sm:py-6 rounded-full font-black uppercase text-[10px] sm:text-base tracking-widest transition-all shadow-2xl flex items-center gap-4 border-2 border-white/20">
                  FALE CONOSCO
                  <i className="fab fa-whatsapp text-xl sm:text-2xl"></i>
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBillboard;
