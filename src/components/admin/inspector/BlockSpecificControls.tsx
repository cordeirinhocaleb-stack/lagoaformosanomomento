import React from 'react';
import { ContentBlock } from '@/types';
import { EDITOR_WIDGETS } from '@/components/admin/EditorWidgets';
import { getWidgetStyles } from '@/components/admin/WidgetPresets';

interface BlockSpecificControlsProps {
    block: ContentBlock;
    onChange: (field: string, value: unknown) => void;
    darkMode?: boolean;
}

export const BlockSpecificControls: React.FC<BlockSpecificControlsProps> = ({ block, onChange, darkMode }) => {
    // Helper to get widget/block labels
    const getWidgetLabel = (type: string) => {
        const widget = EDITOR_WIDGETS.find(w => w.id === type);
        return widget?.name || type;
    };

    switch (block.type) {
        case 'paragraph':
        case 'heading':
            return (
                <div className="space-y-4">
                    <div>
                        <label className={`block text-[10px] font-bold uppercase mb-2 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Estilo de Texto</label>
                        <select
                            value={(block.settings.style as string) || 'paragraph'}
                            onChange={(e) => onChange('style', e.target.value)}
                            className={`w-full text-xs font-medium rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 ${darkMode ? 'bg-zinc-800 text-zinc-200 border-zinc-700' : 'bg-white text-zinc-700 border-zinc-200 border'}`}
                        >
                            <option value="paragraph">Parágrafo Padrão</option>
                            <option value="lead">Texto de Destaque (Lead)</option>
                            <option value="quote">Citação (Blockquote)</option>
                            <option value="warning">Aviso Importante</option>
                            <option value="tip">Dica / Sugestão</option>
                        </select>
                    </div>
                </div>
            );

        case 'image':
            return (
                <div className="space-y-4">
                    <div>
                        <label className={`block text-[10px] font-bold uppercase mb-2 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Legenda da Imagem</label>
                        <input
                            type="text"
                            value={(block.content as string) || ''}
                            onChange={(e) => onChange('content', e.target.value)} // 'content' store caption for images sometimes, or we use a separate setting
                            placeholder="Digite uma legenda..."
                            className={`w-full text-xs rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 ${darkMode ? 'bg-zinc-800 text-zinc-200 border-zinc-700' : 'bg-white text-zinc-700 border-zinc-200 border'}`}
                        />
                    </div>
                    <div>
                        <label className={`block text-[10px] font-bold uppercase mb-2 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Layout Visual</label>
                        <select
                            value={(block.settings.layout as string) || 'wide'}
                            onChange={(e) => onChange('layout', e.target.value)}
                            className={`w-full text-xs font-medium rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 ${darkMode ? 'bg-zinc-800 text-zinc-200 border-zinc-700' : 'bg-white text-zinc-700 border-zinc-200 border'}`}
                        >
                            <option value="wide">Largura Total (Wide)</option>
                            <option value="card">Card com Sombra</option>
                            <option value="float-left">Flutuar à Esquerda</option>
                            <option value="float-right">Flutuar à Direita</option>
                        </select>
                    </div>
                </div>
            );

        case 'video':
            return (
                <div className="space-y-4">
                    <div>
                        <label className={`block text-[10px] font-bold uppercase mb-2 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>URL do Vídeo</label>
                        <input
                            type="text"
                            value={(block.content as string) || ''}
                            // For consistency, assuming 'content' holds the URL for simple video blocks
                            disabled
                            className={`w-full text-xs rounded-lg px-3 py-2 outline-none opacity-50 cursor-not-allowed ${darkMode ? 'bg-zinc-800 text-zinc-500 border-zinc-700' : 'bg-zinc-100 text-zinc-400 border-zinc-200 border'}`}
                        />
                        <p className="text-[9px] mt-1 text-zinc-400">Para trocar o vídeo, remova este bloco e adicione outro.</p>
                    </div>
                </div>
            );


        default:
            return (
                <div className={`text-xs text-center p-4 italic ${darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    Sem configurações específicas para este bloco.
                </div>
            );
    }
};
