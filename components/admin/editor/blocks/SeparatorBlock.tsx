
import React from 'react';

interface SeparatorBlockProps {
  block: any;
  isSelected: boolean;
  onSelect: () => void;
}

const SeparatorBlock: React.FC<SeparatorBlockProps> = ({ block, isSelected, onSelect }) => {
  const settings = block.settings || {};
  const color = settings.color || '#e2e8f0';
  const thickness = settings.thickness || 1;
  const lineStyle = settings.lineStyle || 'solid'; // 'solid', 'dashed', 'dotted', 'double'
  const iconName = settings.iconName || 'fa-star';
  const iconPosition = settings.iconPosition || 'none'; // 'none', 'left', 'center', 'right'
  const iconSize = settings.iconSize || 14;
  const opacity = settings.opacity !== undefined ? settings.opacity : 1;
  
  // New props for vertical
  const orientation = settings.orientation || 'horizontal';
  const height = settings.height || 60;

  const IconComponent = () => (
    <div 
      className="flex items-center justify-center shrink-0 transition-all px-2"
      style={{ color: color, fontSize: `${iconSize}px`, opacity }}
    >
      <i className={`fas ${iconName}`}></i>
    </div>
  );

  const Line = () => (
    <div 
      className="flex-1" 
      style={{ 
        height: lineStyle === 'double' ? `${thickness * 3}px` : `${thickness}px`, 
        borderBottom: lineStyle !== 'double' ? `${thickness}px ${lineStyle} ${color}` : 'none',
        borderTop: lineStyle === 'double' ? `${thickness}px double ${color}` : 'none',
        opacity: opacity,
        borderRadius: '999px'
      }}
    ></div>
  );

  // Renderização Vertical
  if (orientation === 'vertical') {
      return (
        <div 
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className={`py-6 cursor-pointer transition-all relative group flex justify-center ${isSelected ? 'bg-blue-50/5 ring-2 ring-blue-500/20 rounded-2xl' : 'hover:opacity-80'}`}
        >
            <div style={{
                width: `${thickness}px`,
                height: `${height}px`,
                backgroundColor: color,
                opacity: opacity,
                borderRadius: '999px'
            }}></div>

            {isSelected && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[7px] font-black uppercase px-3 py-1 rounded-full shadow-lg tracking-widest z-20 animate-fadeIn whitespace-nowrap">
                Divisor Vertical
                </div>
            )}
        </div>
      );
  }

  // Renderização Horizontal Padrão
  const renderContent = () => {
    switch (iconPosition) {
      case 'left':
        return (
          <div className="flex items-center w-full">
            <IconComponent />
            <Line />
          </div>
        );
      case 'right':
        return (
          <div className="flex items-center w-full">
            <Line />
            <IconComponent />
          </div>
        );
      case 'center':
        return (
          <div className="flex items-center w-full">
            <Line />
            <IconComponent />
            <Line />
          </div>
        );
      case 'none':
      default:
        return <Line />;
    }
  };

  return (
    <div 
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      className={`py-10 cursor-pointer transition-all relative group ${isSelected ? 'bg-blue-50/5 ring-2 ring-blue-500/20 rounded-2xl' : 'hover:opacity-80'}`}
    >
      <div className="max-w-[90%] mx-auto flex items-center justify-center">
        {renderContent()}
      </div>
      
      {isSelected && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[7px] font-black uppercase px-3 py-1 rounded-full shadow-lg tracking-widest z-20 animate-fadeIn whitespace-nowrap">
          Configuração do Divisor
        </div>
      )}
    </div>
  );
};

export default SeparatorBlock;
