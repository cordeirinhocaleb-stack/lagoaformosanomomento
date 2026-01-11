import React from 'react';
import { SubEditorProps } from './SubEditorProps';
import { PollEditor } from './PollEditor';

export const QuizEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    return (
        <div>
            <PollEditor settings={settings} style={style} theme={theme} onChange={onChange} />
            <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100">
                <label className="block text-[9px] font-black uppercase text-green-600 mb-2">Resposta Correta (Índice 0-Based)</label>
                <input
                    type="number"
                    value={settings.correctOptionIndex || 0}
                    onChange={(e) => onChange({ correctOptionIndex: parseInt(e.target.value) })}
                    className="w-20 bg-white border border-green-200 rounded-lg px-3 py-2"
                />
            </div>
        </div>
    );
};
