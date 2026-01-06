
import React from 'react';

interface HeadlinePanelProps {
  variant: string;
  data: any;
  onChange: (val: any) => void;
}

export const HeadlinePanel: React.FC<HeadlinePanelProps> = ({ variant, data, onChange }) => {
  if (variant === 'hero_headline') {
    const hh = data || { shadowDepth: 4, uppercase: true, weight: 900, subtitle: '', width: 'full' };
    return (
      <div className="space-y-6 animate-fadeIn w-full">
        <div className="w-full">
          <label className="text-[9px] font-black uppercase text-zinc-400 mb-3 block tracking-widest text-center">Peso da Fonte (Impacto)</label>
          <div className="grid grid-cols-3 gap-2 w-full">
            {[
                { val: 700, lbl: 'BOLD' },
                { val: 800, lbl: 'EXTRA' },
                { val: 900, lbl: 'ULTRA' }
            ].map(w => (
                <button
                    key={w.val}
                    onClick={() => onChange({ weight: w.val })}
                    className={`py-3 rounded-xl border-2 text-[10px] font-black transition-all w-full flex items-center justify-center ${hh.weight === w.val ? 'bg-black text-white border-black shadow-md' : 'bg-white text-zinc-400 border-gray-100 hover:bg-gray-50'}`}
                >
                    {w.lbl}
                </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
          <div>
            <label className="text-[8px] font-black uppercase text-zinc-500 mb-2 block">Sombra ({hh.shadowDepth}px)</label>
            <input 
                type="range" min="0" max="12" 
                value={hh.shadowDepth} 
                onChange={e => onChange({ shadowDepth: Number(e.target.value) })} 
                className="w-full accent-black h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[8px] font-black uppercase text-zinc-500 mb-2 block">Largura</label>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {['full', 'prose'].map(w => (
                <button 
                    key={w} 
                    onClick={() => onChange({ width: w })} 
                    className={`flex-1 py-1 rounded text-[8px] font-black uppercase transition-all ${hh.width === w ? 'bg-white text-black shadow-sm' : 'text-zinc-400'}`}
                >
                    {w === 'full' ? '100%' : '65ch'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <label className="text-[9px] font-black uppercase text-zinc-400 mb-2 block tracking-widest">Legenda/Subtítulo (Opcional)</label>
          <input 
            type="text" 
            value={hh.subtitle || ''} 
            onChange={e => onChange({ subtitle: e.target.value })} 
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-[11px] font-bold text-zinc-900 outline-none focus:border-red-600 transition-colors" 
            placeholder="Sub-manchete..." 
          />
        </div>
      </div>
    );
  }

  if (variant === 'breaking_alert') {
    const ba = data || { bgPreset: 'red', intensity: 'strong', pulseEnabled: true, icon: 'warning', skew: true, animation: 'shimmer' };
    
    const ICONS = [
        { id: 'warning', icon: 'fa-triangle-exclamation' },
        { id: 'fire', icon: 'fa-fire' },
        { id: 'siren', icon: 'fa-lightbulb' },
        { id: 'bolt', icon: 'fa-bolt' },
        { id: 'none', icon: 'fa-ban' }
    ];

    return (
      <div className="space-y-6 animate-fadeIn">
        {/* 1. SELEÇÃO DE ESTILO/COR */}
        <div>
          <label className="text-[9px] font-black uppercase text-zinc-500 mb-3 block tracking-widest text-center border-b border-zinc-100 pb-2">Estética do Alerta</label>
          <div className="grid grid-cols-2 gap-2">
            {[
                { id: 'red', label: 'Plantão Vermelho', color: 'bg-red-600' },
                { id: 'dark', label: 'Dark Mode', color: 'bg-zinc-900' },
                { id: 'amber', label: 'Aviso Amarelo', color: 'bg-amber-500' },
                { id: 'blue', label: 'Polícia/Urgência', color: 'bg-blue-600' }
            ].map(p => (
              <button 
                key={p.id} 
                onClick={() => onChange({ bgPreset: p.id })} 
                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${ba.bgPreset === p.id ? 'border-red-600 ring-2 ring-red-100' : 'border-zinc-50 bg-zinc-50 hover:bg-zinc-100'}`}
              >
                <div className={`w-3 h-3 rounded-full ${p.color}`}></div>
                <span className="text-[8px] font-black uppercase tracking-tighter text-zinc-700">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. ANIMAÇÃO E EFEITO BRASILEIRO */}
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-[8px] font-black uppercase text-zinc-500 mb-1 block">Animação</label>
                <select value={ba.animation} onChange={e => onChange({ animation: e.target.value })} className="w-full bg-zinc-50 border border-zinc-100 rounded-lg p-2 text-[10px] font-bold text-zinc-900">
                    <option value="none">ESTÁTICO</option>
                    <option value="shimmer">BRILHO (SHIMMER)</option>
                    <option value="pulse">PULSAR (SOFT)</option>
                </select>
            </div>
            <div className="flex flex-col">
                <label className="text-[8px] font-black uppercase text-zinc-500 mb-1 block">Inclinação</label>
                <button 
                    onClick={() => onChange({ skew: !ba.skew })}
                    className={`flex-1 rounded-lg text-[9px] font-black transition-all border ${ba.skew ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-50 text-zinc-400'}`}
                >
                    {ba.skew ? 'SKEW ATIVO' : 'RETO'}
                </button>
            </div>
        </div>

        {/* 3. ÍCONES DO ALERT BOX */}
        <div>
            <label className="text-[8px] font-black uppercase text-zinc-500 mb-2 block">Ícone Principal</label>
            <div className="flex gap-2 justify-between">
                {ICONS.map(i => (
                    <button 
                        key={i.id} onClick={() => onChange({ icon: i.id })}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${ba.icon === i.id ? 'bg-red-600 text-white border-red-600 shadow-md' : 'bg-zinc-50 text-zinc-400 border-zinc-50 hover:border-zinc-200'}`}
                    >
                        <i className={`fas ${i.icon}`}></i>
                    </button>
                ))}
            </div>
        </div>

        {/* 4. INTENSIDADE DO BOX */}
        <div className="pt-4 border-t border-zinc-50">
            <div className="flex items-center justify-between">
                <span className="text-[8px] font-black uppercase text-zinc-500">Intensidade do Alerta</span>
                <div className="flex bg-zinc-100 p-1 rounded-lg">
                    {['soft', 'strong'].map(mode => (
                        <button 
                            key={mode} onClick={() => onChange({ intensity: mode })}
                            className={`px-3 py-1 rounded text-[8px] font-black uppercase transition-all ${ba.intensity === mode ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400'}`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>
    );
  }

  if (variant === 'police_siren') {
    const ps = data || { mode: 'glow', animate: true, palette: 'redBlue' };
    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[8px] font-black uppercase text-zinc-500 mb-1 block text-zinc-400">Modo Visual</label>
            <select value={ps.mode} onChange={e => onChange({ mode: e.target.value })} className="w-full bg-zinc-800 border border-white/10 rounded-lg p-2 text-[10px] font-bold text-white">
              <option value="glow">GLOW</option>
              <option value="tape">TAPE (FITA)</option>
            </select>
          </div>
          <div>
            <label className="text-[8px] font-black uppercase text-zinc-500 mb-1 block text-zinc-400">Paleta</label>
            <select value={ps.palette} onChange={e => onChange({ palette: e.target.value })} className="w-full bg-zinc-800 border border-white/10 rounded-lg p-2 text-[10px] font-bold text-white">
              <option value="redBlue">PM (AZUL/VERMELHO)</option>
              <option value="red">URGÊNCIA (VERMELHO)</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-black uppercase text-zinc-500">Animação Ativa</span>
          <input type="checkbox" checked={ps.animate} onChange={e => onChange({ animate: e.target.checked })} />
        </div>
      </div>
    );
  }

  return null;
};
