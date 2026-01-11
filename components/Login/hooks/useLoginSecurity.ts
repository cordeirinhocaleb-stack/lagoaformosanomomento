import { useState, useEffect, useCallback } from 'react';



export const useLoginSecurity = () => {
    const [lockoutExpiry, setLockoutExpiry] = useState<number | null>(() => {
        if (typeof window === 'undefined') {return null;}
        const savedSecurity = localStorage.getItem('lfnm_login_security');
        if (savedSecurity) {
            try {
                const { expiry } = JSON.parse(savedSecurity);
                return expiry > Date.now() ? expiry : null;
            } catch {
                localStorage.removeItem('lfnm_login_security');
            }
        }
        return null;
    });

    const [secondsRemaining, setSecondsRemaining] = useState(() => {
        if (typeof window === 'undefined') {return 0;}
        const savedSecurity = localStorage.getItem('lfnm_login_security');
        if (savedSecurity) {
            try {
                const { expiry } = JSON.parse(savedSecurity);
                const now = Date.now();
                return expiry > now ? Math.ceil((expiry - now) / 1000) : 0;
            } catch {
                return 0;
            }
        }
        return 0;
    });

    const [attemptsMade, setAttemptsMade] = useState(() => {
        if (typeof window === 'undefined') {return 0;}
        const savedSecurity = localStorage.getItem('lfnm_login_security');
        if (savedSecurity) {
            try {
                const { attempts } = JSON.parse(savedSecurity);
                return attempts || 0;
            } catch {
                return 0;
            }
        }
        return 0;
    });

    const [isShaking, setIsShaking] = useState(false);

    // Timer
    useEffect(() => {
        if (!secondsRemaining) { return; }
        const timer = setInterval(() => {
            setSecondsRemaining(prev => {
                if (prev <= 1) {
                    setLockoutExpiry(null);
                    setAttemptsMade(0);
                    localStorage.setItem('lfnm_login_security', JSON.stringify({ expiry: 0, attempts: 0 }));
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [secondsRemaining]);

    const triggerShake = useCallback(() => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
    }, []);

    const saveSecurityState = useCallback((expiryTimestamp: string | null, attempts: number) => {
        const expiry = expiryTimestamp ? new Date(expiryTimestamp).getTime() : 0;
        const state = { expiry, attempts };
        localStorage.setItem('lfnm_login_security', JSON.stringify(state));

        if (expiry > Date.now()) {
            setLockoutExpiry(expiry);
            setSecondsRemaining(Math.ceil((expiry - Date.now()) / 1000));
        }

        setAttemptsMade(attempts);
        if (attempts > 0) { triggerShake(); }
    }, [triggerShake]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return {
        lockoutExpiry,
        secondsRemaining,
        attemptsMade,
        isShaking,
        triggerShake,
        saveSecurityState,
        formatTime
    };
};
