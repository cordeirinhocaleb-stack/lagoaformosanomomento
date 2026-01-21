
import React from 'react';

interface CurrentTextPanelProps {
  variant: string;
  data: any;
  onChange: (val: any) => void;
  darkMode?: boolean;
}

export const CurrentTextPanel: React.FC<CurrentTextPanelProps> = ({ variant, data, onChange, darkMode = false }) => {
  if (variant === 'newspaper_standard') {
    const ns = data || { columnWidth: 'full', paragraphGap: 'normal', dropCap: false, dropCapLines: 2, hyphenation: 'off', justify: false };
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[9px] font-black uppercase text-zinc-400 mb-2 block tracking-widest">Largura Coluna</label>
            <select value={ns.columnWidth} onChange={e => onChange({ columnWidth: e.target.value })} className={`w-full border-2 rounded-xl p-3 text-[11px] font-black uppercase outline-none focus:border-red-500 ${darkMode ? 'bg-black border-white/10 text-white' : 'bg-white border-zinc-100 text-zinc-900'}`}>
              <option value="full">100% (FULL)</option>
              <option value="prose">65ch (LEITURA)</option>
            </select>
          </div>
          <div>
            <label className="text-[9px] font-black uppercase text-zinc-400 mb-2 block tracking-widest">Espaço Parag.</label>
            <select value={ns.paragraphGap} onChange={e => onChange({ paragraphGap: e.target.value })} className={`w-full border-2 rounded-xl p-3 text-[11px] font-black uppercase outline-none focus:border-red-500 ${darkMode ? 'bg-black border-white/10 text-white' : 'bg-white border-zinc-100 text-zinc-900'}`}>
              <option value="compact">COMPACTO</option>
              <option value="normal">NORMAL</option>
              <option value="relaxed">RELAXADO</option>
            </select>
          </div>
        </div>

        <div className={`flex items-center justify-between border-y py-4 px-1 ${darkMode ? 'border-white/5' : 'border-zinc-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${ns.dropCap ? 'bg-red-600 text-white shadow-lg' : (darkMode ? 'bg-zinc-800 text-zinc-500' : 'bg-gray-100 text-gray-400')}`}>
              <i className="fas fa-font"></i>
            </div>
            <span className={`text-[10px] font-[1000] uppercase tracking-wider ${darkMode ? 'text-zinc-400' : 'text-zinc-700'}`}>Capitular (Drop Cap)</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={ns.dropCap} onChange={e => onChange({ dropCap: e.target.checked })} />
            <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600 ${darkMode ? 'bg-zinc-800' : 'bg-gray-200'}`}></div>
          </label>
        </div>

        {ns.dropCap && (
          <div className={`animate-fadeIn p-4 rounded-2xl border ${darkMode ? 'bg-red-950/20 border-red-900/50' : 'bg-red-50/30 border-red-100/50'}`}>
            <label className="text-[9px] font-black uppercase text-red-600 mb-3 block tracking-widest">Altura da Letra ({ns.dropCapLines} Linhas)</label>
            <div className="flex gap-2 h-10">
              {[2, 3, 4].map(l => (
                <button key={l} onClick={() => onChange({ dropCapLines: l })} className={`flex-1 rounded-xl border-2 text-[11px] font-black transition-all ${ns.dropCapLines === l ? 'bg-red-600 text-white border-red-600 shadow-lg' : (darkMode ? 'bg-transparent text-zinc-600 border-white/10' : 'bg-white text-zinc-400 border-zinc-100')}`}>{l} L</button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onChange({ hyphenation: ns.hyphenation === 'on' ? 'off' : 'on' })}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${ns.hyphenation === 'on' ? 'bg-red-600 text-white border-red-600 shadow-lg' : (darkMode ? 'bg-transparent text-zinc-600 border-white/5' : 'bg-white text-gray-400 border-zinc-100')}`}
          >
            <i className="fas fa-minus text-lg"></i>
            <span className="text-[9px] font-black uppercase">Hifenização</span>
          </button>
          <button
            onClick={() => onChange({ justify: !ns.justify })}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${ns.justify ? 'bg-red-600 text-white border-red-600 shadow-lg' : (darkMode ? 'bg-transparent text-zinc-600 border-white/5' : 'bg-white text-gray-400 border-zinc-100')}`}
          >
            <i className="fas fa-align-justify text-lg"></i>
            <span className="text-[9px] font-black uppercase">Justificar</span>
          </button>
        </div>
      </div>
    );
  }

  // footnote e tech_neon mantidos com estrutura similar mas garantindo colunas e tamanhos de botão
  if (variant === 'footnote') {
    const fn = data || { prefix: 'none', showTopBorder: true, opacity: 0.7, sizePx: 13, italic: true };
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[9px] font-black uppercase text-zinc-400 mb-2 block tracking-widest">Prefixo</label>
            <select value={fn.prefix} onChange={e => onChange({ prefix: e.target.value })} className="w-full bg-white border-2 border-zinc-100 rounded-xl p-3 text-[11px] font-black uppercase outline-none focus:border-red-500">
              {['none', 'NOTA', 'FONTE', 'OBS'].map(p => <option key={p} value={p.toLowerCase()}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[9px] font-black uppercase text-zinc-400 mb-2 block tracking-widest">Tamanho</label>
            <select value={fn.sizePx} onChange={e => onChange({ sizePx: Number(e.target.value) })} className="w-full bg-white border-2 border-zinc-100 rounded-xl p-3 text-[11px] font-black uppercase outline-none focus:border-red-500">
              {[12, 13, 14, 15].map(s => <option key={s} value={s}>{s}px</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={() => onChange({ showTopBorder: !fn.showTopBorder })}
          className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${fn.showTopBorder ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-zinc-100'}`}
        >
          <span className="text-[10px] font-black uppercase tracking-widest">Borda de Rodapé</span>
          <i className={`fas ${fn.showTopBorder ? 'fa-check-circle' : 'fa-circle-notch'} text-lg`}></i>
        </button>

        <div className="p-1">
          <label className="text-[9px] font-black uppercase text-zinc-400 mb-3 block tracking-widest text-center">Opacidade do Texto ({Math.round(fn.opacity * 100)}%)</label>
          <input type="range" min="0.3" max="1" step="0.1" value={fn.opacity} onChange={e => onChange({ opacity: Number(e.target.value) })} className="w-full accent-zinc-800" />
        </div>
      </div>
    );
  }

  return null;
};
