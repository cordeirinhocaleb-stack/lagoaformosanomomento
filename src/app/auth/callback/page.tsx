'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppControllerContext } from '@/providers/AppControllerProvider';
import LoadingScreen from '@/components/common/LoadingScreen';
import { getSupabase } from '@/services/supabaseService';

export default function AuthCallbackPage() {
    const router = useRouter();
    const ctrl = useAppControllerContext();
    const { user } = ctrl;

    useEffect(() => {
        let attempts = 0;

        // 1. If user is already loaded via global listener, redirect home immediately
        if (user) {
            console.log("✅ [CALLBACK] User profile confirmed in global state. Redirecting home.");
            router.push('/');
            return;
        }

        const checkSessionAndSync = async () => {
            attempts++;
            const sb = getSupabase();
            if (sb) {
                const { data: { session }, error } = await sb.auth.getSession();
                if (error) {
                    console.error("❌ [CALLBACK] Error getting session:", error);
                }

                if (session) {
                    console.log(`⏳ [CALLBACK] Session detected (#${attempts}). Waiting for profile sync...`);
                    // We stay here and wait for the 'user' dependency to trigger the redirect above.
                } else {
                    console.log(`ℹ️ [CALLBACK] No session found yet (#${attempts})...`);
                }
            } else {
                console.log("⏳ [CALLBACK] Waiting for Supabase init...");
            }
        };

        const timer = setInterval(checkSessionAndSync, 1000);

        // Safety timeout - redirect home anyway after 6s if we have a session but profile is stuck
        const safetyTimer = setTimeout(async () => {
            const sb = getSupabase();
            const { data: { session } } = sb ? await sb.auth.getSession() : { data: { session: null } };

            if (session) {
                console.warn("🚀 [CALLBACK] Timeout reached but session exists. Forcing redirect home.");
                router.push('/');
            } else if (attempts > 5) {
                console.warn("⚠️ [CALLBACK] No session found after 6s. Redirecting home anyway.");
                router.push('/');
            }
        }, 6000);

        return () => {
            clearInterval(timer);
            clearTimeout(safetyTimer);
        };
    }, [user, router]);

    return (
        <LoadingScreen
            onFinished={() => { }}
        />
    );
}
