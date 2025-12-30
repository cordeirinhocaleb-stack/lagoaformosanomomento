
import React, { useRef, useEffect } from 'react';
import { ContentBlock } from '../../../types';

interface TextBlockProps {
  block: ContentBlock;
  isSelected: boolean;
  onUpdate: (content: string) => void;
  onSelect: () => void;
}

const FONT_MAP: Record<string, string> = {
    sans: 'Inter, sans-serif',
    serif: 'Merriweather, serif',
    mono: 'JetBrains Mono, monospace',
    display: 'Inter, sans-serif'
};

const SIZE_MAP: Record<string, string> = {
    xs: '12px', sm: '14px', md: '18px', lg: '24px', xl: '32px', '2xl': '48px', '3xl': '64px'
};

const TextBlock: React.FC<TextBlockProps> = ({ block, isSelected, onUpdate, onSelect }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const settings = block.settings;
  const isQuote = block.type === 'quote';
  const isList = block.type === 'list';
  const isDropCap = settings.style === 'dropcap';
  
  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== block.content) {
      if (isList && (!block.content || block.content === '')) {
          contentRef.current.innerHTML = '<li>Escreva um item da lista...</li>';
      } else if (!block.content || block.content === '') {
          contentRef.current.innerHTML = isDropCap ? 'Era uma vez...' : '';
      } else {
          contentRef.current.innerHTML = block.content;
      }
    }
  }, [block.id, isList, block.content, isDropCap]);

  const handleInput = () => {
    if (contentRef.current) {
      onUpdate(contentRef.current.innerHTML);
    }
  };

  const getRadius = (r: string) => {
    switch(r) {
        case 'md': return '1rem';
        case 'xl': return '2rem';
        case '3xl': return '3rem';
        case 'full': return '9999px';
        default: return '0px';
    }
  };

  const blockStyle: React.CSSProperties = {
    fontFamily: FONT_MAP[settings.fontFamily || (isDropCap ? 'serif' : 'sans')],
    fontSize: settings.fontSize ? SIZE_MAP[settings.fontSize] : `${settings.thickness || (isQuote ? '24' : '18')}px`,
    textAlign: settings.alignment || 'left',
    color: settings.textColor || (isQuote ? '#4b5563' : '#1f2937'),
    padding: settings.padding || (isQuote ? '32px' : '12px'),
    backgroundColor: settings.backgroundColor || 'transparent',
    boxShadow: settings.boxShadow || 'none',
    borderRadius: getRadius(settings.borderRadius),
    borderWidth: settings.borderWidth || '0px',
    borderStyle: settings.borderStyle || 'none',
    borderColor: settings.borderColor || '#e2e8f0',
    lineHeight: '1.8',
    fontWeight: block.type === 'heading' || settings.fontFamily === 'display' ? '900' : '500',
    fontStyle: isQuote || settings.italic ? 'italic' : 'normal',
    minHeight: '1.5em',
    transition: 'all 0.3s ease'
  };

  const Tag = isList ? (settings.listType === 'ordered' ? 'ol' : 'ul') : 'div';

  return (
    <div 
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      className={`relative transition-all group/text ${isSelected ? 'ring-2 ring-blue-500 rounded-xl' : ''}`}
      style={blockStyle}
    >
      <Tag 
        ref={contentRef}
        contentEditable 
        dir="ltr"
        onInput={handleInput}
        onFocus={onSelect}
        style={{ outline: 'none', background: 'transparent' }}
        data-placeholder={block.type === 'heading' ? 'Manchete do Bloco...' : 'Escreva aqui...'}
        className={`text-left ltr-text ${block.type === 'heading' ? 'uppercase italic tracking-tighter' : ''} ${isList ? 'list-outside ml-4' : ''} ${isDropCap ? 'dropcap-style' : ''}`} 
      />
      
      {settings.highlightColor && settings.highlightColor !== 'transparent' && (
          <div className="absolute inset-0 pointer-events-none opacity-20 -z-10" style={{ backgroundColor: settings.highlightColor }}></div>
      )}

      <style>{`
          .dropcap-style::first-letter {
              float: left;
              font-size: 4.5em;
              line-height: 0.8;
              padding-top: 4px;
              padding-right: 8px;
              padding-left: 3px;
              font-weight: 900;
              color: #dc2626;
              font-family: serif;
          }
      `}</style>
    </div>
  );
};

export default TextBlock;
