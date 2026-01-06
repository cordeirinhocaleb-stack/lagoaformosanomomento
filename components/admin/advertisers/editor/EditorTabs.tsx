
import React from 'react';

export type EditorTabId = 'geral' | 'vitrine' | 'produtos' | 'cupons' | 'popup';

interface EditorTabsProps {
  activeTab: EditorTabId;
  onChange: (tab: EditorTabId) => void;
}

const EditorTabs: React.FC<EditorTabsProps> = ({ activeTab, onChange }) => {
  const tabs: { id: EditorTabId; label: string; icon: string }[] = [
    { id: 'geral', label: 'Dados Gerais', icon: 'fa-file-contract' },
    { id: 'vitrine', label: 'Vitrine & Mídia', icon: 'fa-store' },
    { id: 'produtos', label: 'Produtos', icon: 'fa-tags' },
    { id: 'cupons', label: 'Cupons', icon: 'fa-ticket' },
    { id: 'popup', label: 'Popup Promo', icon: 'fa-bullhorn' }, // Nova aba
  ];

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-6 py-4 rounded-2xl flex items-center gap-3 transition-all whitespace-nowrap ${
            activeTab === tab.id
              ? 'bg-black text-white shadow-lg scale-105'
              : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100 hover:text-gray-600'
          }`}
        >
          <i className={`fas ${tab.icon} text-xs ${activeTab === tab.id ? 'text-red-500' : ''}`}></i>
          <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default EditorTabs;
