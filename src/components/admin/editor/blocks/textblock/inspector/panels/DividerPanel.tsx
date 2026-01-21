import React from 'react';

interface DividerPanelProps {
  side: 'dividerBefore' | 'dividerAfter';
  data: any;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (val: any) => void;
}

export const DividerPanel: React.FC<DividerPanelProps> = ({ side, data, isOpen, onToggle, onChange }) => {
  const div = data || {
    enabled: false, kind: 'solid', thickness: 1, width: 'full', align: 'left',
    color: 'themeDefault', opacity: 1, labelText: '', icon: { enabled: false, name: 'circle' }
  };

  const label = side === 'dividerBefore' ? 'Divisor Superior' : 'Divisor Inferior';

  return (
    <div className="mt-4 border border-zinc-100 rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        className={`w-full p-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest transition-all ${isOpen ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-500'}`}
      >
        <div className="flex items-center gap-2">
          <i className={`fas fa-minus ${div.enabled ? 'text-blue-500' : ''}`}></i>
          {label}
        </div>
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} opacity-50`}></i>
      </button>

      {isOpen && (
        <div className="p-4 space-y-4 bg-white animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase text-zinc-400">Ativar Divisor</span>
            <input type="checkbox" checked={div.enabled} onChange={e => onChange({ enabled: e.target.checked })} />
          </div>

          {div.enabled && (
            <>
              <div>
                <label className="text-[8px] font-black uppercase text-zinc-400 mb-1 block">Estilo</label>
                <select value={div.kind} onChange={e => onChange({ kind: e.target.value })} className="w-full bg-zinc-50 border border-zinc-100 rounded-lg p-2 text-[10px] font-bold">
                  <option value="solid">SÓLIDO</option>
                  <option value="dashed">TRACEJADO</option>
                  <option value="dotted">PONTILHADO</option>
                  <option value="double">DUPLO</option>
                  <option value="gradient">GRADIENTE</option>
                  <option value="fade">FADE (SUAVE)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[8px] font-black uppercase text-zinc-400 mb-1 block">Espessura ({div.thickness}px)</label>
                  <input type="range" min="1" max="8" value={div.thickness} onChange={e => onChange({ thickness: Number(e.target.value) })} className="w-full accent-zinc-900" />
                </div>
                <div>
                  <label className="text-[8px] font-black uppercase text-zinc-400 mb-1 block">Alinhamento</label>
                  <div className="flex gap-1 h-7">
                    {['left', 'center', 'right'].map(a => (
                      <button key={a} onClick={() => onChange({ align: a })} className={`flex-1 rounded border flex items-center justify-center ${div.align === a ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-400'}`}><i className={`fas fa-align-${a} text-[10px]`}></i></button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[8px] font-black uppercase text-zinc-400 mb-1 block">Largura</label>
                  <select value={div.width} onChange={e => onChange({ width: e.target.value })} className="w-full bg-zinc-50 border border-zinc-100 rounded-lg p-2 text-[10px] font-bold">
                    <option value="full">100%</option>
                    <option value="content">66%</option>
                    <option value="short">33%</option>
                  </select>
                </div>
                <div>
                  <label className="text-[8px] font-black uppercase text-zinc-400 mb-1 block">Cor</label>
                  <select value={div.color} onChange={e => onChange({ color: e.target.value })} className="w-full bg-zinc-50 border border-zinc-100 rounded-lg p-2 text-[10px] font-bold">
                    <option value="themeDefault">PADRÃO</option>
                    <option value="muted">SUAVE</option>
                    <option value="accent">DESTAQUE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[8px] font-black uppercase text-zinc-400 mb-1 block">Texto Central</label>
                <input type="text" value={div.labelText || ''} onChange={e => onChange({ labelText: e.target.value })} className="w-full bg-zinc-50 border border-zinc-100 rounded-lg px-2 py-2 text-[10px] font-bold" placeholder="Opcional..." />
              </div>

              <div className="border-t border-zinc-100 pt-4 mt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[9px] font-black uppercase text-zinc-400">Ícone Central</label>
                  <button
                    onClick={() => onChange({ iconName: 'site_logo', iconPosition: 'center', iconSize: 24 })}
                    className="text-[8px] bg-red-600 text-white px-2 py-0.5 rounded uppercase font-bold hover:bg-red-700 transition-colors"
                  >
                    Usar Logo Site
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[8px] font-black uppercase text-zinc-400 mb-1 block">Nome (FontAwesome)</label>
                    <input
                      type="text"
                      value={div.iconName || 'fa-star'}
                      onChange={e => onChange({ iconName: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-lg px-2 py-2 text-[10px] font-bold"
                      placeholder="ex: fa-star"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] font-black uppercase text-zinc-400 mb-1 block">Posição</label>
                    <select
                      value={div.iconPosition || 'none'}
                      onChange={e => onChange({ iconPosition: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-lg p-2 text-[10px] font-bold"
                    >
                      <option value="none">NENHUM</option>
                      <option value="left">ESQUERDA</option>
                      <option value="center">CENTRO</option>
                      <option value="right">DIREITA</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};