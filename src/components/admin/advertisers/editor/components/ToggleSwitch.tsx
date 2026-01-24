import React from 'react';

interface ToggleSwitchProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    label: string;
    darkMode?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
    enabled,
    onChange,
    label,
    darkMode = false,
    size = 'md'
}) => {
    const sizeClasses = {
        sm: 'w-10 h-5',
        md: 'w-12 h-6',
        lg: 'w-14 h-7'
    };

    const dotSizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    const translateClasses = {
        sm: 'translate-x-5',
        md: 'translate-x-6',
        lg: 'translate-x-7'
    };

    return (
        <div className="flex items-center gap-3">
            <button
                type="button"
                onClick={() => onChange(!enabled)}
                className={`
                    relative inline-flex ${sizeClasses[size]} items-center rounded-full 
                    transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 
                    focus:ring-offset-2 focus:ring-green-500
                    ${enabled
                        ? 'bg-green-600'
                        : darkMode ? 'bg-zinc-700' : 'bg-gray-300'
                    }
                `}
            >
                <span
                    className={`
                        ${dotSizeClasses[size]} inline-block rounded-full bg-white shadow-lg 
                        transform transition-transform duration-200 ease-in-out
                        ${enabled ? translateClasses[size] : 'translate-x-0.5'}
                    `}
                />
            </button>
            <span className={`text-sm font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {label}
                <span className={`ml-2 text-xs font-medium ${enabled ? 'text-green-600' : 'text-gray-400'}`}>
                    {enabled ? '✓ Ativo' : '○ Inativo'}
                </span>
            </span>
        </div>
    );
};

export default ToggleSwitch;
