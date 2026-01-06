import React, { useState, useEffect, useCallback } from 'react';
import { applyMaskByType, isValidCharForType } from '../../utils/masks';
import { validate } from '../../utils/validators';
import { sanitizeText, limitText } from '../../services/sanitizationService';

/**
 * Componente Input com Máscara Automática e Validação
 * Bloqueia caracteres inválidos e formata em tempo real
 */

export interface MaskedInputProps {
    type: 'cpf' | 'cnpj' | 'phone' | 'cep' | 'date' | 'currency' | 'percentage' | 'number' | 'text' | 'email' | 'alphabetic';
    value: string;
    onChange: (value: string) => void;
    onValidation?: (isValid: boolean, message?: string) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    showValidationIcon?: boolean;
    maxLength?: number;
    className?: string;
    label?: string;
    showCharCounter?: boolean;
}

const MaskedInput: React.FC<MaskedInputProps> = ({
    type,
    value,
    onChange,
    onValidation,
    placeholder,
    required = false,
    disabled = false,
    showValidationIcon = true,
    maxLength = 250,
    className = '',
    label,
    showCharCounter = false,
}) => {
    const [displayValue, setDisplayValue] = useState(value);
    const [isValid, setIsValid] = useState(true);
    const [validationMessage, setValidationMessage] = useState<string>('');
    const [touched, setTouched] = useState(false);

    // Atualiza display quando value externo muda
    useEffect(() => {
        if (type !== 'text' && type !== 'alphabetic' && type !== 'email') {
            setDisplayValue(applyMaskByType(value, type));
        } else {
            setDisplayValue(value);
        }
    }, [value, type]);

    // Valida quando valor muda
    useEffect(() => {
        if (!touched || !value) {
            setIsValid(true);
            setValidationMessage('');
            return;
        }

        const validationResult = validate(value, type);
        setIsValid(validationResult.isValid);
        setValidationMessage(validationResult.message || '');

        if (onValidation) {
            onValidation(validationResult.isValid, validationResult.message);
        }
    }, [value, type, touched, onValidation]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        // Limita caracteres para campos de texto
        if (type === 'text' || type === 'alphabetic') {
            const limited = limitText(sanitizeText(newValue), maxLength);
            setDisplayValue(limited);
            onChange(limited);
            return;
        }

        // Aplica máscara para outros tipos
        const masked = applyMaskByType(newValue, type);
        setDisplayValue(masked);

        // Extrai valor limpo (sem máscara) para onChange
        const cleanValue = newValue.replace(/\D/g, '');
        onChange(cleanValue);
    }, [type, maxLength, onChange]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        const char = e.key;

        // Permite teclas de controle
        if (char === 'Backspace' || char === 'Delete' || char === 'Tab' || char === 'Escape' || char === 'Enter') {
            return;
        }

        // Permite Ctrl+C, Ctrl+V, etc
        if (e.ctrlKey || e.metaKey) {
            return;
        }

        // Valida caractere
        if (!isValidCharForType(char, type, displayValue)) {
            e.preventDefault();
        }
    }, [type, displayValue]);

    const handleBlur = () => {
        setTouched(true);
    };

    const getBorderColor = () => {
        if (!touched || !value) return 'border-gray-300 dark:border-zinc-600';
        return isValid
            ? 'border-green-500 dark:border-green-600'
            : 'border-red-500 dark:border-red-600';
    };

    const getIconColor = () => {
        return isValid ? 'text-green-500' : 'text-red-500';
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-zinc-300">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <input
                    type="text"
                    value={displayValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyPress}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    className={`
            w-full px-3 py-2 pr-10 rounded-md border-2 transition-colors
            ${getBorderColor()}
            ${disabled ? 'bg-gray-100 dark:bg-zinc-800 cursor-not-allowed' : 'bg-white dark:bg-zinc-900'}
            text-gray-900 dark:text-zinc-100
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${className}
          `}
                />

                {showValidationIcon && touched && value && (
                    <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${getIconColor()}`}>
                        {isValid ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        )}
                    </div>
                )}
            </div>

            {/* Mensagem de validação */}
            {touched && !isValid && validationMessage && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {validationMessage}
                </p>
            )}

            {/* Contador de caracteres */}
            {showCharCounter && (type === 'text' || type === 'alphabetic') && (
                <p className={`mt-1 text-xs text-right ${value.length > maxLength * 0.9
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-gray-500 dark:text-zinc-500'
                    }`}>
                    {value.length}/{maxLength}
                </p>
            )}
        </div>
    );
};

export default MaskedInput;
