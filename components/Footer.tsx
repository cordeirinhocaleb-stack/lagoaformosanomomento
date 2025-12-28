
import React from 'react';
import Logo from './Logo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white pt-20 pb-32 md:pb-16 border-t-[12px] border-red-600 w-full">
      <div className="w-full px-4 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-12 mb-20">
          {/* Coluna 1: Marca */}
          <div className="flex flex-col items-start">
            <div className="w-48 h-40 md:w-72 md:h-64 mb-4 -ml-6 md:-ml-12 overflow-visible">
              <Logo className="scale-110 md:scale-125" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-3">
              LAGOA FORMOSA <br />
              <span className="text-red-600 italic">NO MOMENTO</span>
            </h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2 leading-relaxed">
              A rede de notícias de Welix Duarte. <br />
              Alto Paranaíba conectado em tempo real.
            </p>
          </div>

          {/* Coluna 2: Localização e Contato */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-red-600 mb-8 border-l-4 border-red-600 pl-4">Comunidade</h3>
            <ul className="space-y-6 text-gray-300">
              <li className="flex items-start gap-4">
                <i className="fas fa-map-marker-alt mt-1 text-red-600 text-lg"></i>
                <span className="text-sm font-bold uppercase tracking-tighter">Lagoa Formosa - Minas Gerais<br /><span className="text-gray-500 font-medium">Coração do Alto Paranaíba</span></span>
              </li>
              <li className="flex items-center gap-4">
                <i className="fas fa-phone-alt text-red-600 text-lg"></i>
                <span className="text-sm font-black tracking-widest">(34) 99999-0000</span>
              </li>
              <li className="flex items-center gap-4">
                <i className="fas fa-envelope text-red-600 text-lg"></i>
                <span className="text-sm font-medium">pauta@lagoaformosanomomento.com</span>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Links Rápidos */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-red-600 mb-8 border-l-4 border-red-600 pl-4">Redação</h3>
            <ul className="grid grid-cols-2 gap-4 text-gray-300">
              <li><a href="#" className="text-xs hover:text-red-600 transition-colors uppercase font-black tracking-tighter">Plantão Policial</a></li>
              <li><a href="#" className="text-xs hover:text-red-600 transition-colors uppercase font-black tracking-tighter">Agro Notícias</a></li>
              <li><a href="#" className="text-xs hover:text-red-600 transition-colors uppercase font-black tracking-tighter">Cultura & Lazer</a></li>
              <li><a href="#" className="text-xs hover:text-red-600 transition-colors uppercase font-black tracking-tighter">Esporte Total</a></li>
              <li><a href="#" className="text-xs hover:text-red-600 transition-colors uppercase font-black tracking-tighter">Política Local</a></li>
              <li><a href="#" className="text-xs hover:text-red-600 transition-colors uppercase font-black tracking-tighter">Painel Social</a></li>
            </ul>
          </div>

          {/* Coluna 4: Redes Sociais */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-red-600 mb-8 border-l-4 border-red-600 pl-4">Multimídia</h3>
            <div className="flex gap-4 mb-10">
              <a href="#" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-600 transition-all text-2xl shadow-xl hover:scale-110 active:scale-95"><i className="fab fa-instagram"></i></a>
              <a href="#" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-600 transition-all text-2xl shadow-xl hover:scale-110 active:scale-95"><i className="fab fa-facebook"></i></a>
              <a href="#" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-600 transition-all text-2xl shadow-xl hover:scale-110 active:scale-95"><i className="fab fa-youtube"></i></a>
              <a href="#" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-600 transition-all text-2xl shadow-xl hover:scale-110 active:scale-95"><i className="fab fa-tiktok"></i></a>
            </div>
            <div className="bg-red-600/5 border border-red-600/20 p-6 rounded-3xl backdrop-blur-sm">
              <p className="text-[11px] font-black uppercase tracking-widest text-red-500 mb-3">Publicidade Regional</p>
              <button className="bg-red-600 text-white w-full py-4 rounded-xl font-black text-xs uppercase hover:bg-white hover:text-red-600 transition-all shadow-lg active:scale-95">
                BAIXAR MÍDIA KIT 2025
              </button>
            </div>
          </div>
        </div>

        {/* Linha Final de Créditos */}
        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em]">
            &copy; 2025 LAGOA FORMOSA NO MOMENTO - TODOS OS DIREITOS RESERVADOS
          </p>
          
          {/* Propaganda webgho.com */}
          <div className="flex items-center gap-4 group">
            <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">SISTEMA POR:</span>
            <a 
              href="https://webgho.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 hover:border-red-600 transition-all shadow-inner"
            >
              <span className="text-white font-black tracking-tighter text-lg group-hover:text-red-600 transition-colors">
                webgho<span className="text-red-600">.com</span>
              </span>
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(255,0,0,0.5)]"></div>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
