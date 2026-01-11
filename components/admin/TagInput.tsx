import React, { useState, useRef, useEffect } from 'react';
import { searchTags, incrementTagUsage, Tag } from '../../services/content/tagService';

interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
    // maxTags será tratado internamente como 3 custom + 1 cidade
}

const REGIONAL_CITIES = [
    'Lagoa Formosa', 'Patos de Minas', 'Presidente Olegário',
    'Carmo do Paranaíba', 'Rio Paranaíba', 'Arapuá',
    'Matutina', 'Tiros', 'São Gotardo', 'Guimarânia'
];

const TagInput: React.FC<TagInputProps> = ({ tags, onChange }) => {
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [dbSuggestions, setDbSuggestions] = useState<Tag[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Separar tags existentes em Cidade e Custom
    const cityTag = tags.find(t => REGIONAL_CITIES.includes(t));
    const customTags = tags.filter(t => !REGIONAL_CITIES.includes(t));

    // Limits
    const MAX_CUSTOM_TAGS = 3;

    // Sugestões (apenas cidades se não tiver cidade selecionada, ou nada se já tiver)
    // Se digitando, filtra cidades.
    const filteredCities = REGIONAL_CITIES.filter(city =>
        !cityTag && // Só sugere cidades se não tem cidade
        city.toLowerCase().includes(inputValue.toLowerCase())
    );

    // DB Autocomplete Effect
    useEffect(() => {
        const fetchTags = async () => {
            if (inputValue.length < 2) {
                setDbSuggestions([]);
                return;
            }
            // Don't search if it matches a city exactly (already handled)
            if (REGIONAL_CITIES.some(c => c.toLowerCase() === inputValue.toLowerCase())) { return; }

            const results = await searchTags(inputValue);
            // Filter out already selected tags
            setDbSuggestions(results.filter(r => !tags.includes(r.name)));
        };

        const timer = setTimeout(fetchTags, 300);
        return () => clearTimeout(timer);
    }, [inputValue, tags]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const addTag = (tag: string) => {
        // Verifica se é cidade
        const isCity = REGIONAL_CITIES.includes(tag);

        if (isCity) {
            if (cityTag) {
                const newTags = tags.filter(t => t !== cityTag).concat(tag);
                onChange(newTags);
            } else {
                onChange([...tags, tag]);
            }
        } else {
            // É custom (#)
            if (customTags.length >= MAX_CUSTOM_TAGS) { return; }
            if (tags.includes(tag)) { return; }

            onChange([...tags, tag]);
            // Save/Increment usage in DB background
            incrementTagUsage(tag);
        }

        setInputValue('');
        setDbSuggestions([]);
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const removeTag = (tagToRemove: string) => {
        onChange(tags.filter(t => t !== tagToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (inputValue.trim()) {
                addTag(inputValue.trim());
            }
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            // Remove a última tag
            const lastTag = tags[tags.length - 1];
            removeTag(lastTag);
        }
    };

    return (
        <div className="w-full relative" ref={containerRef}>
            <div
                className={`flex flex-wrap items-center gap-2 bg-white border-l-[6px] border-red-600 pl-4 py-2 min-h-[50px] transition-all hover:bg-zinc-50`}
                onClick={() => inputRef.current?.focus()}
            >
                {/* CIDADE TAG (Destaque) */}
                {cityTag && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black text-white shadow-md animate-fadeIn">
                        <i className="fas fa-map-marker-alt text-[8px] text-red-500 mr-1"></i>
                        {cityTag}
                        <button
                            onClick={(e) => { e.stopPropagation(); removeTag(cityTag); }}
                            className="w-4 h-4 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 transition-colors ml-1"
                        >
                            <i className="fas fa-times text-[8px]"></i>
                        </button>
                    </span>
                )}

                {/* CUSTOM TAGS */}
                {customTags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-md animate-fadeIn">
                        <span className="opacity-50 mr-px">#</span>{tag}
                        <button
                            onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                            className="w-4 h-4 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 transition-colors ml-1"
                        >
                            <i className="fas fa-times text-[8px]"></i>
                        </button>
                    </span>
                ))}

                {/* INPUT */}
                {(customTags.length < MAX_CUSTOM_TAGS || !cityTag) && (
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => { setInputValue(e.target.value); setShowSuggestions(true); }}
                        onFocus={() => setShowSuggestions(true)}
                        onKeyDown={handleKeyDown}
                        placeholder={
                            tags.length === 0 ? "Cidade + 3 Tags (#)..." :
                                (!cityTag ? "Adicionar Cidade..." :
                                    (customTags.length < MAX_CUSTOM_TAGS ? "Adicionar #..." : ""))
                        }
                        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm font-bold text-zinc-700 uppercase placeholder:text-zinc-300 placeholder:normal-case placeholder:font-normal"
                        readOnly={customTags.length >= MAX_CUSTOM_TAGS && !!cityTag}
                    />
                )}

                {/* STATUS LIMITS */}
                <div className="ml-auto pr-2 flex gap-2 text-[9px] font-black uppercase text-zinc-300">
                    <span>{cityTag ? '1/1 Cidade' : '0/1 Cidade'}</span>
                    <span>•</span>
                    <span>{customTags.length}/{MAX_CUSTOM_TAGS} #</span>
                </div>
            </div>

            {/* DROPDOWN - Lógica separada para Cidade vs Custom */}
            {showSuggestions && inputValue.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 bg-white shadow-xl max-h-60 overflow-y-auto border-t border-zinc-100 animate-slideDown">

                    {/* SEÇÃO CIDADES */}
                    {!cityTag && filteredCities.length > 0 && (
                        <>
                            <div className="px-4 py-2 text-[9px] font-black uppercase text-zinc-400 tracking-widest bg-zinc-50 sticky top-0">
                                Cidades (Selecione 1)
                            </div>
                            {filteredCities.map(city => (
                                <div
                                    key={city}
                                    onClick={() => addTag(city)}
                                    className="px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-black hover:text-white cursor-pointer transition-colors uppercase border-b border-zinc-50 flex justify-between group"
                                >
                                    <span>{city}</span>
                                    <i className="fas fa-map-marker-alt text-zinc-300 group-hover:text-red-500"></i>
                                </div>
                            ))}
                        </>
                    )}

                    {/* SEÇÃO DB SUGGESTIONS */}
                    {customTags.length < MAX_CUSTOM_TAGS && dbSuggestions.length > 0 && (
                        <>
                            <div className="px-4 py-2 text-[9px] font-black uppercase text-zinc-400 tracking-widest bg-zinc-50">
                                Sugestões Populares (#)
                            </div>
                            {dbSuggestions.map(suggestion => (
                                <div
                                    key={suggestion.id}
                                    onClick={() => addTag(suggestion.name)}
                                    className="px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-gray-100 cursor-pointer transition-colors border-b border-zinc-50 flex justify-between items-center"
                                >
                                    <span className="uppercase">#{suggestion.name}</span>
                                    <span className="text-[9px] bg-zinc-100 px-2 py-0.5 rounded-full text-zinc-400">
                                        {suggestion.usage_count} usos
                                    </span>
                                </div>
                            ))}
                        </>
                    )}

                    {/* SEÇÃO CUSTOM NEW */}
                    {customTags.length < MAX_CUSTOM_TAGS && inputValue.trim().length > 0 && !REGIONAL_CITIES.includes(inputValue) && (
                        <>
                            <div className="px-4 py-2 text-[9px] font-black uppercase text-zinc-400 tracking-widest bg-zinc-50">
                                Criar Nova Tag
                            </div>
                            <div
                                onClick={() => addTag(inputValue)}
                                className="px-4 py-3 text-xs font-black text-red-600 hover:bg-red-50 cursor-pointer transition-colors border-t border-zinc-100 flex items-center gap-2"
                            >
                                <i className="fas fa-plus bg-red-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px]"></i>
                                <span>ADICIONAR: &quot;#{inputValue.toUpperCase()}&quot;</span>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Default Suggestions if Empty */}
            {showSuggestions && inputValue.length === 0 && !cityTag && (
                <div className="absolute top-full left-0 right-0 z-50 bg-white shadow-xl max-h-60 overflow-y-auto border-t border-zinc-100 animate-slideDown">
                    <div className="px-4 py-2 text-[9px] font-black uppercase text-zinc-400 tracking-widest bg-zinc-50 sticky top-0">
                        Cidades da Região
                    </div>
                    {filteredCities.map(city => (
                        <div
                            key={city}
                            onClick={() => addTag(city)}
                            className="px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-black hover:text-white cursor-pointer transition-colors uppercase border-b border-zinc-50 flex justify-between group"
                        >
                            <span>{city}</span>
                            <i className="fas fa-map-marker-alt text-zinc-300 group-hover:text-red-500"></i>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TagInput;
