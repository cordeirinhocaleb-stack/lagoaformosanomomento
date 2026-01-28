
import React from 'react';
import Logo from '../common/Logo';
import { SystemSettings } from '../../types';

interface FooterProps {
  isSimplified?: boolean;
  settings?: SystemSettings;
}

import SYSTEM_VERSION from '@/constants/version';

const Footer: React.FC<FooterProps> = ({ isSimplified, settings }) => {
  const footerData = settings?.footer;
  const social = footerData?.socialLinks;
  const versionString = SYSTEM_VERSION.getDisplayString();

  if (isSimplified) {
    return (
      <footer className="bg-white border-t border-zinc-200 py-6 w-full relative z-10">
        <div className="w-full px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start">
            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em]">
              &copy; {new Date().getFullYear()} LAGOA FORMOSA NO MOMENTO • PAINEL ADMINISTRATIVO
            </p>
            <span className="text-[8px] font-bold text-zinc-300 uppercase tracking-tighter mt-1">{versionString}</span>
          </div>
          <a
            href="https://webgho.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 grayscale opacity-50 hover:opacity-100 hover:grayscale-0 transition-all"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
              Powered by <span className="text-red-600">Webgho</span>
            </span>
          </a>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-black text-white pt-16 pb-32 md:pb-20 border-t-4 border-red-600 w-full relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

      <div className="w-full px-4 md:px-6 lg:px-12 xl:px-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8 lg:gap-12 mb-16 md:mb-24">
          <div className="flex items-start space-y-6 flex-col">
            <div className="w-40 h-28 md:w-48 md:h-32 -ml-4 overflow-visible relative">
              <Logo className="scale-110 origin-left" />
            </div>
            <div className="md:pr-8">
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-none mb-3">
                LAGOA FORMOSA <br />
                <span className="text-red-600 italic">NO MOMENTO</span>
              </h2>
              <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest leading-relaxed max-w-xs">
                A rede de notícias de Welix Duarte. <br />
                Alto Paranaíba conectado em tempo real.
              </p>
            </div>
          </div>

          <div className="md:pl-4 lg:pl-0">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span> Contato Direto
            </h3>
            <ul className="space-y-5 text-gray-400">
              <li className="flex items-start gap-4 group cursor-pointer hover:text-white transition-colors">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 transition-colors">
                  <i className="fas fa-map-marker-alt text-red-600 group-hover:text-white text-xs"></i>
                </div>
                <span className="text-xs font-bold uppercase tracking-wide leading-relaxed mt-1">
                  Lagoa Formosa - MG<br />
                  <span className="text-[9px] text-gray-600 group-hover:text-gray-400 transition-colors">Redação Central • Centro</span>
                </span>
              </li>
              {(footerData?.phone || "(34) 99999-0000") && (
                <li className="flex items-center gap-4 hover:text-white transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 transition-colors">
                    <i className="fas fa-phone-alt text-red-600 hover:text-white text-xs"></i>
                  </div>
                  <span className="text-xs font-black tracking-widest">{footerData?.phone || "(34) 99999-0000"}</span>
                </li>
              )}
              {(footerData?.email || "pauta@lfnm.com.br") && (
                <li className="flex items-center gap-4 hover:text-white transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 transition-colors">
                    <i className="fas fa-envelope text-red-600 hover:text-white text-xs"></i>
                  </div>
                  <span className="text-xs font-medium">{footerData?.email || "pauta@lfnm.com.br"}</span>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span> Editorias
            </h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-4">
              {['Polícia', 'Agro', 'Política', 'Esporte', 'Cultura', 'Cotidiano', 'Saúde', 'Regional'].map((item) => (
                <li key={item}>
                  <a href={`/${item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`} className="text-[10px] text-gray-400 hover:text-red-500 transition-colors uppercase font-black tracking-widest flex items-center gap-2 group">
                    <i className="fas fa-chevron-right text-[8px] text-gray-700 group-hover:text-red-600 transition-colors"></i> {item}
                  </a>
                </li>
              ))}
              <li>
                <a href="/utilidade" className="text-[10px] text-gray-400 hover:text-red-500 transition-colors uppercase font-black tracking-widest flex items-center gap-2 group">
                  <i className="fas fa-chevron-right text-[8px] text-gray-700 group-hover:text-red-600 transition-colors"></i> Utilidade Pública
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col justify-between md:pl-4 lg:pl-0 h-full">
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span> Conecte-se
              </h3>
              <div className="flex gap-3 mb-8 flex-wrap">
                {social?.instagram && (
                  <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-gradient-to-tr from-yellow-500 to-red-600 hover:border-transparent transition-all text-gray-400 hover:text-white hover:-translate-y-1 shadow-lg"><i className="fab fa-instagram"></i></a>
                )}
                {social?.facebook && (
                  <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 transition-all text-gray-400 hover:text-white hover:-translate-y-1 shadow-lg"><i className="fab fa-facebook-f"></i></a>
                )}
                {social?.whatsapp && (
                  <a href={social.whatsapp.startsWith('http') ? social.whatsapp : `https://wa.me/55${social.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-green-50 hover:border-green-50 transition-all text-gray-400 hover:text-white hover:-translate-y-1 shadow-lg"><i className="fab fa-whatsapp"></i></a>
                )}
                {social?.youtube && (
                  <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-600 hover:border-red-600 transition-all text-gray-400 hover:text-white hover:-translate-y-1 shadow-lg"><i className="fab fa-youtube"></i></a>
                )}
              </div>
            </div>

            <button className="group w-full bg-gradient-to-r from-gray-900 to-black border border-white/10 p-5 rounded-2xl hover:border-red-600 transition-all text-left relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <p className="text-[9px] font-black uppercase tracking-widest text-red-500 mb-1 group-hover:text-red-400 transition-colors">Parceiros</p>
                <p className="text-xs font-bold text-white uppercase flex items-center justify-between">
                  Mídia Kit 2025 <i className="fas fa-arrow-right transform -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all text-red-500"></i>
                </p>
              </div>
              <div className="absolute inset-0 bg-red-600/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex flex-col">
            <p className="text-gray-600 text-[9px] font-bold uppercase tracking-[0.2em] leading-relaxed">
              &copy; {new Date().getFullYear()} Lagoa Formosa No Momento.<br className="md:hidden" /> Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a href="/termos" className="text-[8px] font-black text-zinc-700 uppercase hover:text-red-600 transition-colors">Termos</a>
              <a href="/politicas" className="text-[8px] font-black text-zinc-700 uppercase hover:text-red-600 transition-colors">Privacidade</a>
              <a href="/exclusao" className="text-[8px] font-black text-zinc-700 uppercase hover:text-red-600 transition-colors">Exclusão</a>
              <span className="text-[7px] font-bold text-zinc-800 uppercase tracking-widest opacity-50">{versionString}</span>
            </div>
          </div>

          <a
            href="https://webgho.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity group bg-white/5 px-4 py-2 rounded-full border border-white/5 hover:border-white/10"
          >
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">
              Powered by <span className="text-red-600">Webgho</span>
            </span>
            <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
