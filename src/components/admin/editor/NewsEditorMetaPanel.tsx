
import React from 'react';
import TagInput from '../TagInput';

interface EditorMetaProps {
    title: string;
    setTitle: (value: string) => void;
    lead: string;
    setLead: (value: string) => void;
    category: string;
    setCategory: (value: string) => void;
    tags: string[];
    setTags: (value: string[]) => void;
}

export const EditorMeta: React.FC<EditorMetaProps> = ({
    title, setTitle,
    lead, setLead,
    category, setCategory,
    tags, setTags
}) => {
    return (
        <div className="mb-4">
            {/* CATEGORIA E METADADOS */}
            <div className="mb-4">
                <TagInput tags={tags} onChange={setTags} />
            </div>
            <div className="mb-8 flex items-center gap-4">
                <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="bg-red-600 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] shadow-xl outline-none hover:bg-red-700 transition-colors cursor-pointer appearance-none text-center"
                >
                    {['Cotidiano', 'Polícia', 'Política', 'Esporte', 'Agro', 'Cultura', 'Saúde', 'Regional'].map(c => (
                        <option key={c} value={c} className="text-black bg-white">{c}</option>
                    ))}
                </select>
                <div className="h-px bg-zinc-200 flex-1"></div>
                <span className="text-[9px] font-black uppercase text-zinc-300 tracking-widest">{new Date().toLocaleDateString()}</span>
            </div>

            {/* MANCHETE (INPUT ESTILIZADO IGUAL HOME) */}
            <textarea
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="DIGITE A MANCHETE AQUI..."
                rows={2}
                className="w-full text-3xl md:text-6xl font-[1000] uppercase italic tracking-tighter text-zinc-900 bg-transparent border-none outline-none focus:ring-0 mb-8 md:mb-10 resize-none leading-[0.9] placeholder:text-zinc-200"
            />

            {/* LEAD (RESUMO) */}
            <div className="relative mb-10 md:mb-14">
                <textarea
                    value={lead}
                    onChange={e => {
                        const val = e.target.value;
                        if (val.length <= 250) {setLead(val);}
                    }}
                    placeholder="Resumo da reportagem (Lead)..."
                    maxLength={250}
                    className="w-full text-lg md:text-2xl font-medium text-zinc-500 bg-white border-l-[6px] border-red-600 pl-6 py-2 outline-none min-h-[100px] resize-none font-serif italic placeholder:text-zinc-200 placeholder:not-italic"
                />
                <div className={`absolute bottom-2 right-2 text-[10px] font-black uppercase tracking-widest pointer-events-none transition-colors ${lead.length >= 240 ? 'text-red-600' : 'text-zinc-300'}`}>
                    {lead.length} / 250
                </div>
            </div>
        </div>
    );
};
