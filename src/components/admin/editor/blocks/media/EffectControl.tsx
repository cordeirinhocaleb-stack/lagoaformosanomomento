import React from 'react';

interface EffectControlProps {
    label: string;
    icon: string;
    value: number;
    min: number;
    max: number;
    onChange: (v: number) => void;
}

export const EffectControl: React.FC<EffectControlProps> = ({ label, icon, value, min, max, onChange }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-[8px] uppercase font-bold text-zinc-500">
            <span><i className={`fas fa-${icon}`}></i> {label}</span>
            <span>{value}%</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={e => onChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
    </div>
);
