
import React, { useRef, useEffect } from 'react';

interface WysiwygFieldProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
    multiline?: boolean;
    fontFamily?: string;
    darkMode?: boolean;
}

export const WysiwygField: React.FC<WysiwygFieldProps> = ({ label, value, onChange, multiline, fontFamily, darkMode = false }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    // Sincroniza o conteúdo inicial ou externo
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            if (!editorRef.current.innerHTML) {
                editorRef.current.innerHTML = value;
            }
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCmd = (cmd: string, arg?: string) => {
        document.execCommand(cmd, false, arg);
        if (editorRef.current) { editorRef.current.focus(); }
    };

    return (
        <div className={`border-2 rounded-xl overflow-hidden focus-within:ring-0 transition-all shadow-sm group ${darkMode ? 'bg-zinc-900 border-white/10 focus-within:border-white' : 'bg-white border-gray-200 focus-within:border-black'}`}>
            <div className={`flex items-center justify-between px-3 py-2 border-b transition-colors ${darkMode ? 'bg-white/5 border-white/5 group-focus-within:bg-zinc-900' : 'bg-gray-50 border-gray-100 group-focus-within:bg-white'}`}>
                <span className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-gray-500 group-focus-within:text-red-500' : 'text-gray-400 group-focus-within:text-red-600'}`}>{label}</span>
                <div className={`flex gap-1 p-0.5 rounded-lg ${darkMode ? 'bg-black' : 'bg-gray-200'}`}>
                    <button onClick={() => execCmd('bold')} className={`w-6 h-6 rounded text-xs font-bold transition-all ${darkMode ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-white'}`} title="Negrito">B</button>
                    <button onClick={() => execCmd('italic')} className={`w-6 h-6 rounded text-xs italic transition-all ${darkMode ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-white'}`} title="Itálico">I</button>
                    <div className={`w-px h-3 mx-0.5 self-center ${darkMode ? 'bg-white/10' : 'bg-gray-300'}`}></div>
                    <button onClick={() => execCmd('foreColor', '#dc2626')} className={`w-6 h-6 rounded flex items-center justify-center transition-all ${darkMode ? 'hover:bg-white/10' : 'hover:bg-white'}`} title="Vermelho">
                        <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                    </button>
                    <button onClick={() => execCmd('foreColor', '#facc15')} className={`w-6 h-6 rounded flex items-center justify-center transition-all ${darkMode ? 'hover:bg-white/10' : 'hover:bg-white'}`} title="Amarelo">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    </button>
                    <button onClick={() => execCmd('foreColor', '#ffffff')} className={`w-6 h-6 rounded flex items-center justify-center transition-all ${darkMode ? 'hover:bg-white/10' : 'hover:bg-white'}`} title="Branco">
                        <div className="w-3 h-3 bg-white border border-gray-300 rounded-full"></div>
                    </button>
                    <button onClick={() => execCmd('removeFormat')} className={`w-6 h-6 rounded text-[10px] transition-all ${darkMode ? 'hover:bg-red-500/20 text-red-500' : 'hover:bg-red-100 text-red-500'}`} title="Limpar Estilo"><i className="fas fa-eraser"></i></button>
                </div>
            </div>
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onBlur={handleInput}
                className={`p-4 outline-none ${multiline ? 'min-h-[100px]' : 'min-h-[50px]'} text-lg md:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}
                style={{
                    fontFamily: fontFamily || 'inherit',
                    backgroundColor: darkMode ? 'transparent' : '#ffffff'
                }}
            />
        </div>
    );
};
