
import { User, SupportTicket, SupportMessage, ErrorReport } from '../../types';
import { getSupabase } from '../core/supabaseClient';
import { logAction } from './auditService';

// --- ADMIN POS STUFF ---

export const adminPurchaseForUser = async (adminId: string, userId: string, itemType: 'plan' | 'boost', itemId: string, cost: number, itemName: string, boostDetails?: any) => {
    const supabase = getSupabase();
    if (!supabase) return { success: false, message: "Erro de conexão" };

    try {
        // 1. Get current user
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (userError || !user) throw new Error("Usuário não encontrado");

        const currentCredits = user.siteCredits || 0;

        if (currentCredits < cost) {
            return { success: false, message: `Saldo insuficiente. Usuário tem C$ ${currentCredits.toFixed(2)}.` };
        }

        const updates: any = {
            site_credits: currentCredits - cost
        };

        if (itemType === 'plan') {
            // Plan logic
            const now = new Date();
            const endDate = new Date();
            // Default to monthly for POS for now, or use logic passed in - extending for 30 days
            endDate.setDate(now.getDate() + 30);

            // Handle Multiple Plans
            const currentPlans = user.active_plans || user.activePlans || (user.advertiser_plan && user.advertiser_plan !== 'free' ? [user.advertiser_plan] : []);

            // Check limit of UNIQUE plans (User can have unlimited same-plan stacks, but max 3 different types)
            const uniquePlans = new Set([...currentPlans, itemId]);
            if (uniquePlans.size > 3) {
                return { success: false, message: "Limite de 3 tipos de planos diferentes atingido. Você pode repetir planos existentes, mas não adicionar um 4º tipo." };
            }

            // Append new plan
            const newPlans = [...currentPlans, itemId];

            updates.active_plans = newPlans;
            updates.advertiser_plan = newPlans[0]; // Primary plan link

            // Only update dates if user had no active subscription before
            const subEnd = user.subscription_end || user.subscriptionEnd;
            if (!subEnd || new Date(subEnd) < now) {
                updates.subscription_start = now.toISOString();
                updates.subscription_end = endDate.toISOString();
            }
        } else if (itemType === 'boost' && boostDetails) {
            // Boost logic
            const currentUsage = user.usage_credits || user.usageCredits || {};
            updates.usage_credits = {
                ...currentUsage,
                postsRemaining: (currentUsage.postsRemaining || 0) + (boostDetails.posts || 0),
                videosRemaining: (currentUsage.videosRemaining || 0) + (boostDetails.videos || 0),
                featuredDaysRemaining: (currentUsage.featuredDaysRemaining || 0) + (boostDetails.featuredDays || 0),
                clicksBalance: (currentUsage.clicksBalance || 0) + (boostDetails.clicks || 0),
            };
        }

        const { error: updateError } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId);

        if (updateError) throw updateError;

        await logAction(adminId, "Admin", "admin_pos_sale", userId, `Vendeu ${itemName} para usuário por C$ ${cost}`);

        return { success: true, message: "Venda realizada com sucesso!", updatedUser: { ...user, ...updates } };

    } catch (e: any) {
        console.error("POS error:", e);
        return { success: false, message: e.message || "Erro ao processar venda" };
    }
};

// --- ERROR REPORTS ---

export const sendErrorReport = async (error: any, context?: string, user?: User | null) => {
    const supabase = getSupabase();
    if (!supabase) return;
    const report: any = {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        context,
        user_id: user?.id,
        user_name: user?.name,
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString(),
        status: 'open'
    };
    await supabase.from('error_reports').insert(report);
};

export const getErrorReports = async (): Promise<ErrorReport[]> => {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data } = await supabase.from('error_reports').select('*').order('createdAt', { ascending: false });
    return data || [];
};

export const resolveErrorReport = async (id: string) => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from('error_reports').update({ status: 'resolved' }).eq('id', id);
};

// --- SUPPORT SYSTEM ---

export const createSupportTicket = async (userId: string, category: string, subject: string, message: string) => {
    const supabase = getSupabase();
    if (!supabase) return { success: false, message: "Erro de conexão" };

    try {
        const { data: ticket, error: ticketError } = await supabase
            .from('support_tickets')
            .insert({ user_id: userId, category, subject, status: 'open' })
            .select()
            .single();

        if (ticketError) throw ticketError;

        const { error: msgError } = await supabase
            .from('support_messages')
            .insert({
                ticket_id: ticket.id,
                sender_id: userId,
                message,
                is_admin: false
            });

        if (msgError) throw msgError;
        return { success: true, ticket };
    } catch (e: any) {
        console.error("Error creating ticket:", e);
        return { success: false, message: e.message };
    }
};

export const getUserTickets = async (userId: string): Promise<SupportTicket[]> => {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    return (data || []) as SupportTicket[];
};

export const getAllTickets = async (): Promise<SupportTicket[]> => {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('support_tickets')
        .select('*, user:users(name, email, avatar)')
        .order('created_at', { ascending: false });

    if (error) {
        const { data: simpleData } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
        return (simpleData || []) as SupportTicket[];
    }
    return (data || []).map((t: any) => ({ ...t, user: t.user })) as SupportTicket[];
};

export const getTicketMessages = async (ticketId: string): Promise<SupportMessage[]> => {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
    return (data || []) as SupportMessage[];
};

export const addTicketMessage = async (ticketId: string, senderId: string, message: string, isAdmin: boolean) => {
    const supabase = getSupabase();
    if (!supabase) return { success: false };
    const { error } = await supabase
        .from('support_messages')
        .insert({ ticket_id: ticketId, sender_id: senderId, message, is_admin: isAdmin });
    if (error) return { success: false, message: error.message };
    await supabase
        .from('support_tickets')
        .update({ updated_at: new Date().toISOString(), status: isAdmin ? 'in_progress' : 'open' })
        .eq('id', ticketId);
    return { success: true };
};

export const updateTicketStatus = async (ticketId: string, status: 'open' | 'in_progress' | 'resolved') => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from('support_tickets').update({ status }).eq('id', ticketId);
};

export const getOpenTicketsCount = async (): Promise<number> => {
    const supabase = getSupabase();
    if (!supabase) return 0;
    const { count } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .in('status', ['open', 'in_progress']);
    return count || 0;
};

export const getPendingTicketsUsers = async (): Promise<{ userId: string, userName: string, avatar: string, count: number }[]> => {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('support_tickets')
        .select('user_id, users(name, avatar, email)')
        .in('status', ['open', 'in_progress']);

    if (error || !data) return [];
    const userMap = new Map<string, { userId: string, userName: string, avatar: string, count: number }>();
    data.forEach((t: any) => {
        if (!t.users) return;
        const uid = t.user_id;
        if (userMap.has(uid)) {
            userMap.get(uid)!.count++;
        } else {
            userMap.set(uid, {
                userId: uid,
                userName: t.users.name || t.users.email || 'Usuário',
                avatar: t.users.avatar || '',
                count: 1
            });
        }
    });
    return Array.from(userMap.values());
};
