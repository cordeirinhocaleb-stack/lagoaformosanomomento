
import { getSupabase } from '../core/supabaseClient';

export interface SiteStats {
    totalVisits: number;
    uniqueVisitors: number;
    mobileVisits: number;
    returningVisits: number;
}

const VISITOR_KEY = 'lfnm_visitor_id';
const LAST_VISIT_KEY = 'lfnm_last_visit';

export const trackVisit = async () => {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
        // 1. Visit Logic
        const now = new Date();
        const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
        const visitorId = localStorage.getItem(VISITOR_KEY) || crypto.randomUUID();

        let isReturning = false;
        let isNewSession = true;

        if (!localStorage.getItem(VISITOR_KEY)) {
            localStorage.setItem(VISITOR_KEY, visitorId);
        } else {
            isReturning = true;
        }

        // Session throttle (e.g., 30 mins)
        if (lastVisit) {
            const lastTime = new Date(lastVisit).getTime();
            if (now.getTime() - lastTime < 30 * 60 * 1000) {
                isNewSession = false;
            }
        }
        localStorage.setItem(LAST_VISIT_KEY, now.toISOString());

        if (!isNewSession) return; // Don't count same session multiple times

        // 2. Device Detection
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // 3. Insert into Supabase
        // We assume a table 'site_visits' exists. If not, this will fail silently in catch.
        await supabase.from('site_visits').insert({
            visitor_id: visitorId,
            is_mobile: isMobile,
            is_returning: isReturning,
            user_agent: navigator.userAgent
        });

    } catch (e) {
        // Fail silently to not impact user experience
        console.warn("Analytics error:", e);
    }
};

export const getSiteStats = async (): Promise<SiteStats> => {
    const supabase = getSupabase();
    if (!supabase) return { totalVisits: 0, uniqueVisitors: 0, mobileVisits: 0, returningVisits: 0 };

    try {
        // We can get counts efficiently using count option
        // 1. Total
        const { count: total } = await supabase.from('site_visits').select('*', { count: 'exact', head: true });

        // 2. Mobile
        const { count: mobile } = await supabase.from('site_visits').select('*', { count: 'exact', head: true }).eq('is_mobile', true);

        // 3. Returning (Re-entry)
        const { count: returning } = await supabase.from('site_visits').select('*', { count: 'exact', head: true }).eq('is_returning', true);

        // 4. Unique (Approximation via distinct visitor_ids or just assume 'returning' logic handles distinction generally)
        // Accurate unique count requires simpler query if table is large, but for now:
        // We can't easily do count(distinct) via standard PostgREST API without RPC.
        // We will approximate Unique = Total - Returning (First visits) OR just rely on basic count if available.
        // A better metric for 'Unique IPs/Visitors' is count of rows where is_returning = false (First time visitors)
        const { count: unique } = await supabase.from('site_visits').select('*', { count: 'exact', head: true }).eq('is_returning', false);

        return {
            totalVisits: total || 0,
            uniqueVisitors: unique || 0, // Fresh visitors effectively
            mobileVisits: mobile || 0,
            returningVisits: returning || 0
        };

    } catch (e) {
        console.warn("Fetch stats error:", e);
        return { totalVisits: 0, uniqueVisitors: 0, mobileVisits: 0, returningVisits: 0 };
    }
};
