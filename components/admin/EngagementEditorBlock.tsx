
import React from 'react';
import { ContentBlock } from '../../types';

interface EngagementEditorBlockProps {
  block: ContentBlock;
  onUpdate: (updatedBlock: ContentBlock) => void;
}

const EngagementEditorBlock: React.FC<EngagementEditorBlockProps> = ({ block, onUpdate }) => {
  const { 
    engagementType, 
    backgroundColor = '#FFFFFF', 
    boxShadow = 'none',
    borderRadius = '3xl',
    borderWidth = '2px',
    customIcon = 'fa-bolt-lightning',
    accentColor = '#dc2626',
    padding = '40px'
  } = block.settings;
  
  const content = block.content || {};

  const getRadius = (r: string) => {
    switch(r) {
        case 'md': return '1rem';
        case 'xl': return '2rem';
        case '3xl': return '3rem';
        case 'full': return '9999px';
        default: return '0px';
    }
  };

  const renderPreview = () => {
    switch (engagementType) {
        case 'poll': case 'quiz': case 'ranking':
            return (
                <div className="space-y-2">
                    {content.options?.map((opt: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-100 animate-fadeIn">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }}></div>
                            <span className="text-[10px] font-black uppercase text-zinc-600">{opt.label}</span>
                        </div>
                    ))}
                    {(!content.options || content.options.length === 0) && (
                        <p className="text-[9px] text-zinc-400 uppercase text-center py-4 italic">Nenhuma opção adicionada</p>
                    )}
                </div>
            );
        case 'battle': case 'visual_vote':
            return (
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-zinc-50 rounded-2xl border-2 border-dashed flex flex-col items-center gap-2">
                         <i className="fas fa-image opacity-20"></i>
                         <p className="text-[8px] font-black uppercase">{content.labelA || 'Opção A'}</p>
                    </div>
                    <div className="p-4 bg-zinc-50 rounded-2xl border-2 border-dashed flex flex-col items-center gap-2">
                         <i className="fas fa-image opacity-20"></i>
                         <p className="text-[8px] font-black uppercase">{content.labelB || 'Opção B'}</p>
                    </div>
                </div>
            );
        case 'reactions': case 'thermometer':
            return (
                <div className="flex flex-wrap justify-center gap-4">
                    {content.options?.map((opt: any, i: number) => (
                        <div key={i} className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl shadow-sm border border-zinc-100 animate-fadeIn">
                            {opt.emoji || '❓'}
                        </div>
                    ))}
                </div>
            );
        case 'rating':
            return (
                <div className="flex justify-center gap-2 text-yellow-400 text-2xl">
                    {[1,2,3,4,5].map(i => <i key={i} className="fas fa-star"></i>)}
                </div>
            );
        case 'counter':
            return (
                <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg"><i className="fas fa-heart text-2xl"></i></div>
                    <span className="text-xl font-black">{content.count || 0}</span>
                </div>
            );
        default:
            return <div className="p-8 border-2 border-dashed rounded-2xl text-center text-[10px] font-black uppercase text-zinc-300">Configuração No-Code Ativa</div>;
    }
  };

  return (
    <div 
        className="relative overflow-hidden transition-all"
        style={{ 
            backgroundColor, 
            boxShadow, 
            borderRadius: getRadius(borderRadius),
            borderWidth: borderRadius === 'full' ? '0px' : borderWidth,
            borderStyle: 'solid',
            borderColor: '#f4f4f5',
            padding: padding
        }}
    >
      <div className="relative z-10 space-y-6">
        <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl text-white flex items-center justify-center shadow-lg" style={{ backgroundColor: accentColor }}>
                <i className={`fas ${customIcon} text-2xl`}></i>
            </div>
            <p className="text-lg font-[1000] uppercase text-zinc-900 tracking-tighter leading-tight italic">
                {content.question || 'Clique para definir a pergunta...'}
            </p>
        </div>
        <div className="border-t border-zinc-100 pt-6">
            {renderPreview()}
        </div>
      </div>
    </div>
  );
};

export default EngagementEditorBlock;
