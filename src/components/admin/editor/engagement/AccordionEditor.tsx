import React from 'react';
import { SubEditorProps } from './SubEditorProps';
import { ColorTheme } from '../EngagementColors';

const DEFAULT_THEME: ColorTheme = {
    id: 'default_fallback',
    label: 'Fallback',
    preview: 'bg-gray-500',
    classes: {
        wrapper: 'bg-white',
        text: 'text-zinc-600',
        accent: 'bg-blue-500',
        secondary: 'border-zinc-200',
        button: 'hover:bg-blue-600'
    }
};

interface AccordionItem {
    title: string;
    content: string;
}

export const AccordionEditor = ({ settings, style: _style, theme, onChange }: SubEditorProps) => {
    const activeTheme = theme || DEFAULT_THEME;
    const items = (settings.accordionItems as AccordionItem[]) || [{ title: 'Pergunta 1', content: 'Resposta 1' }];

    const updateItem = (idx: number, field: keyof AccordionItem, val: string) => {
        const newItems = [...items];
        newItems[idx] = { ...newItems[idx], [field]: val };
        onChange({ accordionItems: newItems });
    };
    const addItem = () => onChange({ accordionItems: [...items, { title: '', content: '' }] });
    const removeItem = (idx: number) => onChange({ accordionItems: items.filter((_, i) => i !== idx) });

    return (
        <div className="space-y-3">
            <label className={`block text-[9px] font-black uppercase opacity-60 ${activeTheme.classes.text}`}>Itens do Acordeão</label>
            {items.map((item, idx) => (
                <div key={idx} className={`p-3 rounded-xl border relative mb-2 ${activeTheme.classes.secondary} bg-white/50`}>
                    <button onClick={() => removeItem(idx)} className="absolute top-2 right-2 text-zinc-300 hover:text-red-500"><i className="fas fa-times"></i></button>
                    <input value={item.title} onChange={e => updateItem(idx, 'title', e.target.value)} placeholder="Título/Pergunta" className={`w-full border-none rounded px-2 py-1 text-xs font-bold mb-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} />
                    <textarea value={item.content} onChange={e => updateItem(idx, 'content', e.target.value)} placeholder="Conteúdo/Resposta" className={`w-full border-none rounded px-2 py-1 text-xs h-16 resize-none ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} />
                </div>
            ))}
            <button onClick={addItem} className={`w-full py-2 border-2 border-dashed rounded-xl text-xs font-bold hover:border-current hover:opacity-100 opacity-60 transition-colors ${activeTheme.classes.secondary} ${activeTheme.classes.text}`}>+ Adicionar Item</button>

            {/* Preview */}
            <div className={`mt-4 p-4 rounded-xl border ${activeTheme.classes.wrapper} transition-colors`}>
                <div className={`p-2 rounded-lg bg-black/5 flex justify-between items-center mb-1`}>
                    <span className={`text-xs font-bold ${activeTheme.classes.text}`}>{items[0]?.title || 'Pergunta 1'}</span>
                    <i className={`fas fa-chevron-down opacity-50 ${activeTheme.classes.text}`}></i>
                </div>
                <div className={`p-2 text-[10px] opacity-70 ${activeTheme.classes.text}`}>
                    {items[0]?.content || 'Resposta 1...'}
                </div>
            </div>
        </div>
    );
};
