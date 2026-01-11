
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
}

const SectionHeader = ({ title, icon, color = "text-blue-600" }: { title: string, icon: string, color?: string }) => (
    <div className="flex items-center justify-between mb-4 border-b border-zinc-100 pb-2">
        <div className="flex items-center gap-2">
            <i className={`fas ${icon} ${color} text-xs`} aria-hidden="true"></i>
            <h4 className="text-[10px] font-black uppercase text-zinc-900 tracking-widest">{title}</h4>
        </div>
    </div>
);

export const InspectorTextBlock: React.FC<InspectorTextBlockProps> = ({ block, onUpdate }) => {
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
        if (['newspaper_standard', 'footnote', 'tech_neon'].includes(currentVariant)) {
            return <CurrentTextPanel variant={currentVariant} data={perStyle[currentVariant]} onChange={val => updateVariantStyle(currentVariant, val)} />;
        }
        if (['hero_headline', 'breaking_alert', 'police_siren'].includes(currentVariant)) {
            return <HeadlinePanel variant={currentVariant} data={perStyle[currentVariant]} onChange={val => updateVariantStyle(currentVariant, val)} />;
        }
        if (['impact_quote', 'vintage_letter', 'quote_modern_accent', 'quote_elegant_editorial', 'quote_breaking_card'].includes(currentVariant)) {
            return <QuotePanel variant={currentVariant} data={perStyle[currentVariant]} onChange={val => updateVariantStyle(currentVariant, val)} />;
        }
        // CORREÇÃO: Habilita o ListPanel para todas as variantes de lista
        if (['checklist_pro', 'bullets_clean', 'bullets_square', 'numbered_steps', 'timeline_dots', 'list_bullets_classic', 'list_check_circle', 'list_numbered_modern', 'list_timeline_vertical', 'list_cards_shadow'].includes(currentVariant)) {
            return <ListPanel variant={currentVariant} data={perStyle[currentVariant]} onChange={val => updateVariantStyle(currentVariant, val)} />;
        }
        if (currentVariant === 'executive_summary') {
            const es = perStyle.executive_summary || { mode: 'card', title: 'Resumo', icon: 'info', density: 'normal' };
            return (
                <div className="space-y-4">
                    <div className="p-5 bg-white border border-zinc-100 rounded-[2rem] space-y-4 animate-slideUp">
                        <SectionHeader title="Executivo / Info" icon="fa-file-lines" color="text-zinc-900" />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[8px] font-black uppercase text-zinc-400 mb-1 block">Modo</label>
                                <select value={es.mode} onChange={e => updateVariantStyle('executive_summary', { mode: e.target.value })} className="w-full bg-zinc-50 border border-zinc-100 rounded-lg p-2 text-[10px] font-bold">
                                    <option value="card">CARD (BOX)</option>
                                    <option value="bullets">BULLETS (LISTA)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[8px] font-black uppercase text-zinc-400 mb-1 block">Densidade</label>
                                <select value={es.density} onChange={e => updateVariantStyle('executive_summary', { density: e.target.value })} className="w-full bg-zinc-50 border border-zinc-100 rounded-lg p-2 text-[10px] font-bold">
                                    <option value="compact">COMPACTO</option>
                                    <option value="normal">NORMAL</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[8px] font-black uppercase text-zinc-400 mb-1 block">Ícone Título</label>
                                <select value={es.icon} onChange={e => updateVariantStyle('executive_summary', { icon: e.target.value })} className="w-full bg-zinc-50 border border-zinc-100 rounded-lg p-2 text-[10px] font-bold">
                                    <option value="none">NENHUM</option>
                                    <option value="info">INFO</option>
                                    <option value="check">CHECK</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[8px] font-black uppercase text-zinc-400 mb-1 block">Título</label>
                                <input type="text" value={es.title || ''} onChange={e => updateVariantStyle('executive_summary', { title: e.target.value })} className="w-full bg-zinc-50 border border-zinc-100 rounded-lg px-2 py-2 text-[10px] font-bold" placeholder="Resumo" />
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
        <div className="mt-6 p-5 bg-white border border-zinc-100 rounded-[2rem] space-y-4 animate-slideUp">
            {renderPanel()}
        </div>
    );
};
