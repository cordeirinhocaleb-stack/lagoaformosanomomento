
import React, { useState } from 'react';
import { ContentBlock } from '@/types';
import { CurrentTextPanel } from './panels/CurrentTextPanel';
import { HeadlinePanel } from './panels/HeadlinePanel';
import { QuotePanel } from './panels/QuotePanel';
import { ListPanel } from './panels/ListPanel';
import { DividerPanel } from './panels/DividerPanel';

interface InspectorTextBlockProps {
    block: ContentBlock;
    onUpdate: (updatedBlock: ContentBlock) => void;
    darkMode?: boolean;
}

const SectionHeader = ({ title, icon, color = "text-blue-600", darkMode = false }: { title: string, icon: string, color?: string, darkMode?: boolean }) => (
    <div className={`flex items-center justify-between mb-4 border-b pb-2 ${darkMode ? 'border-white/5' : 'border-zinc-100'}`}>
        <div className="flex items-center gap-2">
            <i className={`fas ${icon} ${color} text-xs`} aria-hidden="true"></i>
            <h4 className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-zinc-400' : 'text-zinc-900'}`}>{title}</h4>
        </div>
    </div>
);

export const InspectorTextBlock: React.FC<InspectorTextBlockProps> = ({ block, onUpdate, darkMode = false }) => {
    const currentVariant = block.settings?.editorialVariant || 'newspaper_standard';
    const perStyle = block.settings?.perStyle || {};
    const [openDivider, setOpenDivider] = useState<'before' | 'after' | null>(null);

    const updateVariantStyle = (variant: string, newVal: any) => {
        const currentVariantData = perStyle[variant] || {};
        onUpdate({
            ...block,
            settings: {
                ...block.settings,
                perStyle: {
                    ...perStyle,
                    [variant]: { ...currentVariantData, ...newVal }
                }
            }
        });
    };

    const renderPanel = () => {
        // PARAGRAPH
        if (['standard_clean', 'editorial_prose', 'breaking_brief', 'footnote', 'tech_neon'].includes(currentVariant)) {
            return <CurrentTextPanel variant={currentVariant} data={perStyle[currentVariant]} onChange={val => updateVariantStyle(currentVariant, val)} darkMode={darkMode} />;
        }
        // HEADING
        if (['hero_headline', 'sub_classic', 'live_update', 'breaking_alert', 'police_siren'].includes(currentVariant)) {
            return <HeadlinePanel variant={currentVariant} data={perStyle[currentVariant]} onChange={val => updateVariantStyle(currentVariant, val)} darkMode={darkMode} />;
        }
        // QUOTE
        if (['impact_quote', 'pull_quote', 'tweet_style', 'vintage_letter', 'quote_modern_accent', 'quote_elegant_editorial', 'quote_breaking_card'].includes(currentVariant)) {
            return <QuotePanel variant={currentVariant} data={perStyle[currentVariant]} onChange={val => updateVariantStyle(currentVariant, val)} darkMode={darkMode} />;
        }
        // LIST
        if (['bullets_clean', 'checklist_flow', 'numbered_steps', 'checklist_pro', 'bullets_square', 'timeline_dots', 'list_bullets_classic', 'list_check_circle', 'list_numbered_modern', 'list_timeline_vertical', 'list_cards_shadow'].includes(currentVariant)) {
            return <ListPanel variant={currentVariant} data={perStyle[currentVariant]} onChange={val => updateVariantStyle(currentVariant, val)} darkMode={darkMode} />;
        }
        if (currentVariant === 'executive_summary') {
            const es = perStyle.executive_summary || { mode: 'card', title: 'Resumo', icon: 'info', density: 'normal' };
            return (
                <div className="space-y-4">
                    <div className={`p-5 border rounded-[2rem] space-y-4 animate-slideUp ${darkMode ? 'bg-zinc-900 border-white/5' : 'bg-white border-zinc-100'}`}>
                        <SectionHeader title="Executivo / Info" icon="fa-file-lines" color="text-zinc-900" darkMode={darkMode} />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[8px] font-black uppercase text-zinc-400 mb-1 block">Modo</label>
                                <select value={es.mode} onChange={e => updateVariantStyle('executive_summary', { mode: e.target.value })} className={`w-full border rounded-lg p-2 text-[10px] font-bold outline-none ${darkMode ? 'bg-black border-white/10 text-white focus:border-red-600' : 'bg-zinc-50 border-zinc-100 text-zinc-900 focus:border-blue-500'}`}>
                                    <option value="card">CARD (BOX)</option>
                                    <option value="bullets">BULLETS (LISTA)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[8px] font-black uppercase text-zinc-400 mb-1 block">Densidade</label>
                                <select value={es.density} onChange={e => updateVariantStyle('executive_summary', { density: e.target.value })} className={`w-full border rounded-lg p-2 text-[10px] font-bold outline-none ${darkMode ? 'bg-black border-white/10 text-white focus:border-red-600' : 'bg-zinc-50 border-zinc-100 text-zinc-900 focus:border-blue-500'}`}>
                                    <option value="compact">COMPACTO</option>
                                    <option value="normal">NORMAL</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[8px] font-black uppercase text-zinc-400 mb-1 block">Ícone Título</label>
                                <select value={es.icon} onChange={e => updateVariantStyle('executive_summary', { icon: e.target.value })} className={`w-full border rounded-lg p-2 text-[10px] font-bold outline-none ${darkMode ? 'bg-black border-white/10 text-white focus:border-red-600' : 'bg-zinc-50 border-zinc-100 text-zinc-900 focus:border-blue-500'}`}>
                                    <option value="none">NENHUM</option>
                                    <option value="info">INFO</option>
                                    <option value="check">CHECK</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[8px] font-black uppercase text-zinc-400 mb-1 block">Título</label>
                                <input type="text" value={es.title || ''} onChange={e => updateVariantStyle('executive_summary', { title: e.target.value })} className={`w-full border rounded-lg px-2 py-2 text-[10px] font-bold outline-none ${darkMode ? 'bg-black border-white/10 text-white focus:border-red-600' : 'bg-zinc-50 border-zinc-100 text-zinc-900 focus:border-blue-500'}`} placeholder="Resumo" />
                            </div>
                        </div>
                    </div>
                    <DividerPanel
                        side="dividerBefore"
                        data={es.dividerBefore}
                        isOpen={openDivider === 'before'}
                        onToggle={() => setOpenDivider(openDivider === 'before' ? null : 'before')}
                        onChange={val => updateVariantStyle('executive_summary', { dividerBefore: { ...(es.dividerBefore || {}), ...val } })}
                    />
                    <DividerPanel
                        side="dividerAfter"
                        data={es.dividerAfter}
                        isOpen={openDivider === 'after'}
                        onToggle={() => setOpenDivider(openDivider === 'after' ? null : 'after')}
                        onChange={val => updateVariantStyle('executive_summary', { dividerAfter: { ...(es.dividerAfter || {}), ...val } })}
                    />
                </div>
            );
        }
        return null;
    };

    return (
        <div className={`mt-6 p-5 border rounded-[2rem] space-y-4 animate-slideUp ${darkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-zinc-100'}`}>
            {renderPanel()}
        </div>
    );
};
