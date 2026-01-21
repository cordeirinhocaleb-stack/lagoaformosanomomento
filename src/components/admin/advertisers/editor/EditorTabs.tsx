
import React from 'react';

export type EditorTabId = 'geral' | 'vitrine' | 'banners' | 'popup';

interface EditorTabsProps {
  activeTab: EditorTabId;
  onChange: (tab: EditorTabId) => void;
}

const EditorTabs: React.FC<EditorTabsProps> = ({ activeTab, onChange }) => {
  const tabs: { id: EditorTabId; label: string; icon: string; desc?: string }[] = [
    { id: 'geral', label: 'Cadastro', icon: 'fa-file-contract', desc: 'Dados & Contrato' },
    { id: 'vitrine', label: 'Página & Ofertas', icon: 'fa-pen-nib', desc: 'Visual & Produtos' },
    { id: 'banners', label: 'Banners Home', icon: 'fa-panorama', desc: 'Publicidade Topo' },
    { id: 'popup', label: 'Popup Promo', icon: 'fa-bullhorn', desc: 'Marketing Direto' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-8">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative group px-2 md:px-6 py-4 rounded-2xl flex flex-col md:flex-row items-center md:justify-center gap-2 md:gap-4 transition-all border ${activeTab === tab.id
            ? 'bg-black text-white border-black shadow-xl scale-[1.02]'
            : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200 hover:bg-gray-50'
            }`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm md:text-base transition-colors ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
            }`}>
            <i className={`fas ${tab.icon}`}></i>
          </div>

          <div className="text-center md:text-left">
            <span className={`block text-[10px] md:text-xs font-black uppercase tracking-widest ${activeTab === tab.id ? 'text-white' : 'text-gray-900'}`}>
              {tab.label}
            </span>
            <span className={`hidden md:block text-[9px] font-medium ${activeTab === tab.id ? 'text-white/60' : 'text-gray-400'}`}>
              {tab.desc}
            </span>
          </div>

          {activeTab === tab.id && (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-black rotate-45"></div>
          )}
        </button>
      ))}
    </div>
  );
};

export default EditorTabs;
