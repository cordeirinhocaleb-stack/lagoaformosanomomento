
import React from 'react';

interface QuotePanelProps {
  variant: string;
  data: any;
  onChange: (val: any) => void;
}

export const QuotePanel: React.FC<QuotePanelProps> = ({ variant, data, onChange }) => {
  if (variant === 'impact_quote') {
    const iq = data || { borderPosition: 'left', borderWidth: 8, color: '#dc2626', backgroundSubtle: true, bigQuotes: true, quoteSize: 'lg', author: '', authorAlign: 'right' };
    
    return (
      <div className="space-y-4 animate-fadeIn">
        {/* COR DO DESTAQUE (Novo Seletor) */}
        <div>
            <label className="text-[8px] font-black uppercase text-zinc-400 mb-2 block tracking-widest">Cor do Destaque</label>
            <div className="flex gap-2 flex-wrap items-center">
                {[
                    { val: '#0f172a', label: 'Preto' },
                    { val: '#dc2626', label: 'Vermelho' },
                    { val: '#2563eb', label: 'Azul' },
                    { val: '#16a34a', label: 'Verde' },
                    { val: '#9333ea', label: 'Roxo' },
                    { val: '#ea580c', label: 'Laranja' }
                ].map(c => (
                    <button
                        key={c.val}
                        onClick={() => onChange({ color: c.val })}
                        className={`w-8 h-8 rounded-full transition-all border-2 ${iq.color === c.val ? 'border-white ring-2 ring-zinc-300 scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        style={{ backgroundColor: c.val }}
                        title={c.label}
                    />
                ))}
                <div className="relative">
                    <input 
                        type="color" 
                        value={iq.color || '#dc2626'} 
                        onChange={e => onChange({ color: e.target.value })}
                        className="w-8 h-8 rounded-full border-none p-0 cursor-pointer overflow-hidden opacity-0 absolute inset-0"
                    />
                    <div className="w-8 h-8 rounded-full bg-conic-gradient border-2 border-zinc-200 flex items-center justify-center text-[10px] text-zinc-500 pointer-events-none" style={{ background: `conic-gradient(red, yellow, lime, aqua, blue, magenta, red)` }}>
                        <i className="fas fa-plus text-white drop-shadow-md"></i>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[8px] font-black uppercase text-zinc-400 mb-1 block">Posição Borda</label>
            <select value={iq.borderPosition} onChange={e => onChange({ borderPosition: e.target.value })} className="w-full bg-zinc-50 border border-zinc-100 rounded-lg p-2 text-[10px] font-bold">
              <option value="left">ESQUERDA</option>
              <option value="right">DIREITA</option>
              <option value="none">NENHUMA</option>
            </select>
          </div>
          <div>
            <label className="text-[8px] font-black uppercase text-zinc-400 mb-1 block">Tam. Fonte</label>
            <select value={iq.quoteSize} onChange={e => onChange({ quoteSize: e.target.value })} className="w-full bg-zinc-50 border border-zinc-100 rounded-lg p-2 text-[10px] font-bold">
              <option value="sm">PEQUENO</option>
              <option value="md">MÉDIO</option>
              <option value="lg">GRANDE</option>
              <option value="xl">EXTRA</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-black uppercase text-zinc-400">Espessura Borda ({iq.borderWidth}px)</span>
            <input type="range" min="2" max="20" value={iq.borderWidth} onChange={e => onChange({ borderWidth: Number(e.target.value) })} className="w-24 accent-zinc-900" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-black uppercase text-zinc-400">Aspas Gigantes</span>
            <input type="checkbox" checked={iq.bigQuotes} onChange={e => onChange({ bigQuotes: e.target.checked })} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-black uppercase text-zinc-400">Fundo Sutil</span>
            <input type="checkbox" checked={iq.backgroundSubtle} onChange={e => onChange({ backgroundSubtle: e.target.checked })} />
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-50">
          <label className="text-[8px] font-black uppercase text-zinc-400 mb-1 block">Autor / Fonte</label>
          <input type="text" value={iq.author || ''} onChange={e => onChange({ author: e.target.value })} className="w-full bg-zinc-50 border border-zinc-100 rounded-lg p-2 text-[10px] font-bold" placeholder="Ex: Welix Duarte" />
          <div className="flex gap-1 h-7 mt-2">
            {['left', 'center', 'right'].map(a => (
              <button key={a} onClick={() => onChange({ authorAlign: a })} className={`flex-1 rounded border flex items-center justify-center ${iq.authorAlign === a ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-400'}`}><i className={`fas fa-align-${a} text-[10px]`}></i></button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'vintage_letter') {
    const vl = data || { paperTexture: true, borderStyle: 'dashed', signature: '', tilt: 0 };
    return (
      <div className="space-y-4 animate-fadeIn text-[#433422]">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[8px] font-black uppercase mb-1 block">Estilo Borda</label>
            <select value={vl.borderStyle} onChange={e => onChange({ borderStyle: e.target.value })} className="w-full bg-white/50 border border-[#d4c4a8] rounded-lg p-2 text-[10px] font-bold">
              {['dashed', 'dotted', 'double'].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[8px] font-black uppercase mb-1 block">Inclinação ({vl.tilt}°)</label>
            <input type="range" min="0" max="3" value={vl.tilt} onChange={e => onChange({ tilt: Number(e.target.value) })} className="w-full accent-[#433422]" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-black uppercase">Textura Papel</span>
          <input type="checkbox" checked={vl.paperTexture} onChange={e => onChange({ paperTexture: e.target.checked })} />
        </div>
        <div>
          <label className="text-[8px] font-black uppercase mb-1 block">Assinatura</label>
          <input type="text" value={vl.signature || ''} onChange={e => onChange({ signature: e.target.value })} className="w-full bg-white/50 border border-[#d4c4a8] rounded-lg px-2 py-2 text-[10px] font-bold" placeholder="Assinado por..." />
        </div>
      </div>
    );
  }

  return null;
};
