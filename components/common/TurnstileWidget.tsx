import React from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

interface TurnstileWidgetProps {
    onVerify: (token: string) => void;
    options?: {
        theme?: 'light' | 'dark' | 'auto';
        size?: 'normal' | 'compact' | 'flexible';
    };
}

const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({ onVerify, options }) => {
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

    if (!siteKey) {
        console.error('Turnstile Site Key missing in environment variables.');
        return null;
    }

    return (
        <div className="flex justify-center my-4 overflow-hidden rounded-xl">
            <Turnstile
                siteKey={siteKey}
                onSuccess={onVerify}
                options={{
                    theme: options?.theme || 'light',
                    size: options?.size || 'normal',
                }}
            />
        </div>
    );
};

export default TurnstileWidget;
