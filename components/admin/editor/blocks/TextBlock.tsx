
import React, { useRef, useEffect, useState } from 'react';
import { ContentBlock, EditorialStyle } from '../../../../types';

interface TextBlockProps {
  block: ContentBlock;
  isSelected: boolean;
  onUpdate: (content: string) => void;
  onSelect: () => void;
}

const TextBlock: React.FC<TextBlockProps> = ({ block, isSelected, onUpdate, onSelect }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<{ x: number, y: number } | null>(null);
  
  const style = block.settings.editorialStyle || 'newspaper_standard';
  const sets = block.settings;

  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== block.content) {
      contentRef.current.innerHTML = block.content || '';
    }
  }, [block.id, block.content]);

  const handleInput = () => {
    if (contentRef.current) onUpdate(contentRef.current.innerHTML);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect();
    setMenuPos({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const close = () => setMenuPos(null);
    if (menuPos) window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [menuPos]);

  const applyCommand = (cmd: string, val?: string) => {
    document.execCommand('styleWithCSS', false, "true");
    document.execCommand(cmd, false, val);
    handleInput();
    setMenuPos(null);
  };

  // MOTOR DE ESTILOS CAMALEÃO
  const getStyleClasses = () => {
    let base = "outline-none p-6 transition-all duration-500 rounded-3xl relative ";
    
    switch (style) {
      case 'newspaper_standard':
        base += "font-serif text-zinc-800 leading-relaxed text-xl";
        break;
      case 'breaking_alert':
        base += `font-black uppercase tracking-tighter text-white p-10 ${sets.backgroundColor === 'black' ? 'bg-black' : 'bg-red-600'} ${sets.pulseEnabled ? 'animate-pulse' : ''} shadow-2xl`;
        break;
      case 'impact_quote':
        base += "italic font-serif text-3xl text-zinc-700 bg-zinc-50/50 py-12 border-l-[16px] border-red-600";
        break;
      case 'footnote':
        base += "text-sm text-zinc-400 border-t border-zinc-100 pt-6 mt-4 font-medium italic";
        break;
      case 'hero_headline':
        base += `text-5xl md:text-7xl font-[1000] uppercase italic tracking-tighter leading-[0.85] text-zinc-900 ${sets.isUppercase ? 'uppercase' : ''}`;
        break;
      case 'checklist_pro':
        base += "space-y-4 text-lg font-bold text-zinc-700 lfnm-checklist";
        break;
      case 'police_siren':
        base += `font-black p-8 text-2xl tracking-tight border-y-8 border-black ${sets.zebraStripes ? 'bg-[repeating-linear-gradient(45deg,#facc15,#facc15_20px,#000_20px,#000_40px)] text-white' : 'bg-yellow-400 text-black'}`;
        break;
      case 'tech_neon':
        base += "font-mono p-8 bg-zinc-900 border border-white/10 rounded-xl shadow-inner";
        break;
      case 'vintage_letter':
        base += `p-12 font-serif border-2 border-dashed border-zinc-300 shadow-sm italic ${sets.paperTexture ? 'bg-[#fdf6e3]' : 'bg-white'}`;
        break;
      case 'executive_summary':
        base += "bg-blue-50 border-2 border-blue-100 p-10 rounded-[2.5rem] text-blue-900 font-medium";
        break;
    }

    if (sets.alignment === 'center') base += " text-center";
    if (sets.alignment === 'right') base += " text-right";
    return base;
  };

  const getDynamicInlineStyles = (): React.CSSProperties => {
    const s: React.CSSProperties = {};
    if (style === 'hero_headline' && sets.shadowDepth) {
      s.textShadow = `${sets.shadowDepth}px ${sets.shadowDepth}px 0px rgba(0,0,0,0.1)`;
    }
    if (style === 'tech_neon' && sets.neonColor) {
      s.color = sets.neonColor;
      s.textShadow = `0 0 12px ${sets.neonColor}60`;
    }
    if (sets.fontSize) s.fontSize = `${sets.fontSize}px`;
    return s;
  };

  return (
    <div 
      className={`group/text relative transition-all ${isSelected ? 'ring-4 ring-blue-500/20' : ''}`}
      onContextMenu={handleContextMenu}
    >
      {style === 'executive_summary' && <div className="absolute top-6 left-10 text-[8px] font-black uppercase text-blue-400 tracking-widest">Resumo LFNM</div>}
      
      <div
        ref={contentRef}
        contentEditable
        onInput={handleInput}
        onFocus={onSelect}
        style={getDynamicInlineStyles()}
        className={getStyleClasses()}
        data-placeholder="Clique com botão direito p/ formatar texto."
      />

      {menuPos && (
        <div 
          className="fixed z-[9999] bg-white border border-zinc-200 shadow-2xl rounded-2xl p-2 flex gap-1 animate-fadeInUp"
          style={{ top: menuPos.y, left: menuPos.x }}
          onMouseDown={e => e.stopPropagation()}
        >
          <button onClick={() => applyCommand('bold')} className="w-8 h-8 rounded hover:bg-zinc-100 font-bold">B</button>
          <button onClick={() => applyCommand('italic')} className="w-8 h-8 rounded hover:bg-zinc-100 italic">I</button>
          <button onClick={() => applyCommand('hiliteColor', '#fef08a')} className="w-8 h-8 rounded hover:bg-yellow-100 text-yellow-600"><i className="fas fa-highlighter"></i></button>
          <button onClick={() => applyCommand('foreColor', '#dc2626')} className="w-8 h-8 rounded hover:bg-red-50 text-red-600"><i className="fas fa-font"></i></button>
        </div>
      )}

      <style>{`
        .lfnm-checklist li { list-style: none; position: relative; padding-left: 2rem; }
        .lfnm-checklist li::before { content: '✓'; position: absolute; left: 0; color: #16a34a; font-weight: 900; }
        [contenteditable=true]:empty:before { content: attr(data-placeholder); color: #cbd5e1; font-style: italic; opacity: 0.5; }
      `}</style>
    </div>
  );
};

export default TextBlock;
