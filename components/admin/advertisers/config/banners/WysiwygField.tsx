
import React, { useRef, useEffect } from 'react';

interface WysiwygFieldProps { 
    label: string; 
    value: string; 
    onChange: (val: string) => void; 
    multiline?: boolean;
    fontFamily?: string;
}

export const WysiwygField: React.FC<WysiwygFieldProps> = ({ label, value, onChange, multiline, fontFamily }) => {
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
        if (editorRef.current) editorRef.current.focus();
    };

    return (
        <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-black focus-within:ring-0 transition-all shadow-sm group">
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100 group-focus-within:bg-white transition-colors">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-focus-within:text-red-600">{label}</span>
                <div className="flex gap-1 bg-gray-200 p-0.5 rounded-lg">
                    <button onClick={() => execCmd('bold')} className="w-6 h-6 rounded hover:bg-white text-xs font-bold transition-all" title="Negrito">B</button>
                    <button onClick={() => execCmd('italic')} className="w-6 h-6 rounded hover:bg-white text-xs italic transition-all" title="Itálico">I</button>
                    <div className="w-px h-3 bg-gray-300 mx-0.5 self-center"></div>
                    <button onClick={() => execCmd('foreColor', '#dc2626')} className="w-6 h-6 rounded hover:bg-white flex items-center justify-center transition-all" title="Vermelho">
                        <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                    </button>
                    <button onClick={() => execCmd('foreColor', '#facc15')} className="w-6 h-6 rounded hover:bg-white flex items-center justify-center transition-all" title="Amarelo">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    </button>
                    <button onClick={() => execCmd('foreColor', '#ffffff')} className="w-6 h-6 rounded hover:bg-white flex items-center justify-center transition-all" title="Branco">
                        <div className="w-3 h-3 bg-white border border-gray-300 rounded-full"></div>
                    </button>
                    <button onClick={() => execCmd('removeFormat')} className="w-6 h-6 rounded hover:bg-red-100 text-red-500 text-[10px] transition-all" title="Limpar Estilo"><i className="fas fa-eraser"></i></button>
                </div>
            </div>
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onBlur={handleInput}
                className={`p-4 outline-none ${multiline ? 'min-h-[100px]' : 'min-h-[50px]'} text-lg md:text-xl font-bold text-gray-800`}
                style={{ 
                    fontFamily: fontFamily || 'inherit',
                    backgroundColor: '#ffffff' 
                }}
            />
        </div>
    );
};
