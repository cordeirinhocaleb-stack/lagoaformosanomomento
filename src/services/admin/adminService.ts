
import { User, SupportTicket, SupportMessage, ErrorReport } from '../../types';
import { getSupabase } from '../core/supabaseClient';
import { logAction } from './auditService';

// Helper to manually map DB to User to avoid circular dependencies
const mapDbToUserLocal = (dbUser: any): User => ({
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role,
    status: dbUser.status,
    avatar: dbUser.avatar,
    bio: dbUser.bio,
    birthDate: dbUser.birthdate,
    zipCode: dbUser.zipcode,
    street: dbUser.street,
    number: dbUser.number,
    city: dbUser.city,
    state: dbUser.state,
    phone: dbUser.phone,
    document: dbUser.document,
    profession: dbUser.profession,
    education: dbUser.education,
    skills: dbUser.skills,
    professionalBio: dbUser.professionalBio || dbUser.professional_bio,
    availability: dbUser.availability,
    companyName: dbUser.companyName || dbUser.company_name,
    businessType: dbUser.businessType || dbUser.business_type,
    whatsappVisible: dbUser.whatsappVisible || dbUser.whatsapp_visible,
    themePreference: dbUser.themePreference || dbUser.theme_preference,
    socialLinks: dbUser.socialLinks || dbUser.social_links,
    permissions: dbUser.permissions,
    advertiserPlan: dbUser.advertiser_plan,
    activePlans: dbUser.activePlans || dbUser.active_plans,
    subscriptionStart: dbUser.subscriptionStart || dbUser.subscription_start,
    subscriptionEnd: dbUser.subscriptionEnd || dbUser.subscription_end,
    twoFactorEnabled: dbUser.two_factor_enabled,
    usageCredits: dbUser.usageCredits || dbUser.usage_credits,
    siteCredits: dbUser.siteCredits || dbUser.site_credits || 0, // Ensure it picks up site_credits
    customLimits: dbUser.custom_limits,
    termsAccepted: dbUser.terms_accepted,
    termsAcceptedAt: dbUser.terms_accepted_at,
    commercialData: dbUser.commercial_data || {}
});

// --- ADMIN POS STUFF ---

export const adminPurchaseForUser = async (adminId: string, userId: string, itemType: 'plan' | 'boost', itemId: string, cost: number, itemName: string, details?: any) => {
    const supabase = getSupabase();
    if (!supabase) { return { success: false, message: "Erro de conexão" }; }

    try {
        // 1. Get current user
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*') // Get all fields to ensure full mapping
            .eq('id', userId)
            .single();

        if (userError || !user) { throw new Error("Usuário não encontrado"); }

        const currentCredits = user.site_credits || 0;

        if (currentCredits < cost) {
            return { success: false, message: `Saldo insuficiente. Usuário tem C$ ${currentCredits.toFixed(2)}.` };
        }

        const updates: any = {
            site_credits: currentCredits - cost
        };

        console.log("POS DEBUG: Calc", { current: currentCredits, cost, new: currentCredits - cost });

        if (itemType === 'plan') {
            // ... existing plan logic ...
            // Plan logic
            const now = new Date();
            const endDate = new Date();
            // Default to monthly for POS for now, or use logic passed in - extending for 30 days
            endDate.setDate(now.getDate() + 30);

            // Handle Multiple Plans
            const currentPlans = user.active_plans || (user.advertiser_plan && user.advertiser_plan !== 'free' ? [user.advertiser_plan] : []);

            // Check limit of UNIQUE plans (User can have unlimited same-plan stacks, but max 3 different types)
            const uniquePlans = new Set([...currentPlans, itemId]);
            if (uniquePlans.size > 3) {
                return { success: false, message: "Limite de 3 tipos de planos diferentes atingido. Você pode repetir planos existentes, mas não adicionar um 4º tipo." };
            }

            // Append new plan
            // If the plan includes feature credits (e.g., videoLimit, maxProducts), merge them into usage_credits
            const planFeatures = details?.features as Record<string, number> | undefined;
            if (planFeatures) {
                const currentUsage = user.usage_credits || {};
                updates.usage_credits = {
                    ...currentUsage,
                    videosRemaining: (currentUsage.videosRemaining || 0) + (planFeatures.videoLimit || 0),
                    postsRemaining: (currentUsage.postsRemaining || 0) + (planFeatures.maxProducts || 0),
                    // Merge any other numeric feature keys
                    ...Object.entries(planFeatures).reduce((acc, [key, value]) => {
                        if (key !== 'videoLimit' && key !== 'maxProducts') {
                            acc[key] = ((currentUsage as any)[key] || 0) + (value as number);
                        }
                        return acc;
                    }, {} as Record<string, number>)
                };
            }
            const newPlans = [...currentPlans, itemId];

            updates.active_plans = newPlans;
            updates.activePlans = newPlans; // Confirmed column exists

            updates.advertiser_plan = newPlans[0];
            // updates.advertiserPlan = newPlans[0]; // REMOVED: Column does not exist, causing Pgrst204

            // Only update dates if user had no active subscription before
            const subEnd = user.subscription_end || user.subscriptionEnd;
            const nowIso = now.toISOString();

            if (!subEnd || new Date(subEnd) < now) {
                updates.subscription_start = nowIso;
                updates.subscriptionStart = nowIso; // Confirmed exists

                updates.subscription_end = endDate.toISOString();
                updates.subscriptionEnd = endDate.toISOString(); // Confirmed exists
            } else {
                // Extend existing subscription
                const currentEnd = new Date(subEnd);
                currentEnd.setDate(currentEnd.getDate() + 30);
                const extendedIso = currentEnd.toISOString();

                updates.subscription_end = extendedIso;
                updates.subscriptionEnd = extendedIso;
            }

            // Apply Plan Features to Usage Credits (Consumables)
            if (details?.features) {
                const features = details?.features;
                const currentUsage = user.usage_credits || user.usageCredits || {};

                const newUsage = {
                    ...currentUsage,
                    // Add video limit to existing balance (Refill/Stack logic)
                    videosRemaining: (currentUsage.videosRemaining || 0) + (features.videoLimit || 0),
                    postsRemaining: (currentUsage.postsRemaining || 0) + (features.maxProducts || 0),
                    // Merge any other numeric feature keys
                    ...Object.entries(features).reduce((acc, [key, value]) => {
                        if (key !== 'videoLimit' && key !== 'maxProducts' && typeof value === 'number') {
                            acc[key] = ((currentUsage as any)[key] || 0) + value;
                        }
                        return acc;
                    }, {} as Record<string, number>)
                };

                updates.usage_credits = newUsage;
                // updates.usageCredits = newUsage; // REMOVED: Column does not exist
            }

            // Apply Commercial Data Updates (Socials, Contracts, Locations)
            if (details?.commercialDataUpdates) {
                const newCommercialData = details.commercialDataUpdates;
                const existingCommercialData = user.commercial_data || {};

                // CRITICAL: Deep additive merge to prevent data loss
                const mergedData: any = { ...existingCommercialData };

                // 1. Sum Social Publications
                if (newCommercialData.socialPublications) {
                    mergedData.socialPublications = mergedData.socialPublications || {};
                    Object.keys(newCommercialData.socialPublications).forEach(platform => {
                        mergedData.socialPublications[platform] =
                            (mergedData.socialPublications[platform] || 0) +
                            (newCommercialData.socialPublications[platform] || 0);
                    });
                }

                // 2. Merge Display Locations (boolean OR)
                if (newCommercialData.displayLocations) {
                    mergedData.displayLocations = mergedData.displayLocations || {};
                    Object.keys(newCommercialData.displayLocations).forEach(location => {
                        mergedData.displayLocations[location] =
                            mergedData.displayLocations[location] ||
                            newCommercialData.displayLocations[location];
                    });
                }

                // 3. Sum Video Limit
                if (newCommercialData.videoLimit) {
                    mergedData.videoLimit = (mergedData.videoLimit || 0) + newCommercialData.videoLimit;
                }

                // 4. Preserve/Update Contract Info
                if (newCommercialData.contract) {
                    mergedData.contract = { ...mergedData.contract, ...newCommercialData.contract };
                }
                if (newCommercialData.renewalInfo) {
                    mergedData.renewalInfo = { ...mergedData.renewalInfo, ...newCommercialData.renewalInfo };
                }

                mergedData.updatedAt = new Date().toISOString();
                updates.commercial_data = mergedData;
            }
        } else if (itemType === 'boost' && details) { // ... existing boost logic
            // Boost logic
            const currentUsage = user.usage_credits || user.usageCredits || {};
            const newUsage = {
                ...currentUsage,
                postsRemaining: (currentUsage.postsRemaining || 0) + (details.posts || 0),
                videosRemaining: (currentUsage.videosRemaining || 0) + (details.videos || 0),
                featuredDaysRemaining: (currentUsage.featuredDaysRemaining || 0) + (details.featuredDays || 0),
                clicksBalance: (currentUsage.clicksBalance || 0) + (details.clicks || 0),
                bannersRemaining: (currentUsage.bannersRemaining || 0) + (details.banners || 0),
                popupsRemaining: (currentUsage.popupsRemaining || 0) + (details.popups || 0),
                jobsRemaining: (currentUsage.jobsRemaining || 0) + (details.jobs || 0),
                gigsRemaining: (currentUsage.gigsRemaining || 0) + (details.gigs || 0),
            };

            updates.usage_credits = newUsage;

            // Apply Commercial Data Updates (Crucial for Boosts display in Subscription Panel)
            if (details.commercialDataUpdates) {
                const newCommercialData = details.commercialDataUpdates;
                const existingCommercialData = user.commercial_data || {};

                // CRITICAL: Deep additive merge to prevent data loss
                const mergedData: any = { ...existingCommercialData };

                // 1. Sum Social Publications
                if (newCommercialData.socialPublications) {
                    mergedData.socialPublications = mergedData.socialPublications || {};
                    Object.keys(newCommercialData.socialPublications).forEach(platform => {
                        mergedData.socialPublications[platform] =
                            (mergedData.socialPublications[platform] || 0) +
                            (newCommercialData.socialPublications[platform] || 0);
                    });
                }

                // 2. Merge Display Locations (boolean OR)
                if (newCommercialData.displayLocations) {
                    mergedData.displayLocations = mergedData.displayLocations || {};
                    Object.keys(newCommercialData.displayLocations).forEach(location => {
                        mergedData.displayLocations[location] =
                            mergedData.displayLocations[location] ||
                            newCommercialData.displayLocations[location];
                    });
                }

                // 3. Sum Video Limit
                if (newCommercialData.videoLimit) {
                    mergedData.videoLimit = (mergedData.videoLimit || 0) + newCommercialData.videoLimit;
                }

                mergedData.updatedAt = new Date().toISOString();
                updates.commercial_data = mergedData;
            }
        }

        console.log("POS DEBUG: Payload for DB update:", updates);

        const { data: updatedData, error: updateError } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId)
            .select('*')
            .single();

        if (updatedData) {
            console.log("POS DEBUG: DB Update Successful. Commercial Data:", updatedData.commercial_data);
        }

        if (updateError) {
            console.error("Update Error:", updateError);
            throw new Error(`Erro ao atualizar banco de dados: ${updateError.message}`);
        }

        if (!updatedData) {
            throw new Error("Falha Crítica: Atualização não retornou dados. Verifique permissões (RLS).");
        }

        console.log("POS DEBUG: DB Returned Data:", updatedData);

        await logAction(adminId, "Admin", "admin_pos_sale", userId, `Vendeu ${itemName} para usuário por C$ ${cost}`);

        // Map the ACTUAL updated data from DB
        const mappedUser = mapDbToUserLocal(updatedData);

        return { success: true, message: "Venda realizada com sucesso!", updatedUser: mappedUser };

    } catch (e: any) {
        console.error("POS error:", e);
        return { success: false, message: e.message || "Erro ao processar venda" };
    }
};

// --- ERROR REPORTS ---

export const sendErrorReport = async (error: any, context?: string, user?: User | null) => {
    const supabase = getSupabase();
    if (!supabase) { return; }
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
    if (!supabase) { return []; }
    const { data } = await supabase.from('error_reports').select('*').order('createdAt', { ascending: false });
    return data || [];
};

export const resolveErrorReport = async (id: string) => {
    const supabase = getSupabase();
    if (!supabase) { return; }
    await supabase.from('error_reports').update({ status: 'resolved' }).eq('id', id);
};

// --- SUPPORT SYSTEM ---

export const createSupportTicket = async (userId: string, category: string, subject: string, message: string) => {
    const supabase = getSupabase();
    if (!supabase) { return { success: false, message: "Erro de conexão" }; }

    try {
        const { data: ticket, error: ticketError } = await supabase
            .from('support_tickets')
            .insert({ user_id: userId, category, subject, status: 'open' })
            .select()
            .single();

        if (ticketError) { throw ticketError; }

        const { error: msgError } = await supabase
            .from('support_messages')
            .insert({
                ticket_id: ticket.id,
                sender_id: userId,
                message,
                is_admin: false
            });

        if (msgError) { throw msgError; }
        return { success: true, ticket };
    } catch (e: any) {
        console.error("Error creating ticket:", e);
        return { success: false, message: e.message };
    }
};

export const getUserTickets = async (userId: string): Promise<SupportTicket[]> => {
    const supabase = getSupabase();
    if (!supabase) { return []; }
    const { data } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    return (data || []) as SupportTicket[];
};

export const getAllTickets = async (): Promise<SupportTicket[]> => {
    const supabase = getSupabase();
    if (!supabase) { return []; }
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
    if (!supabase) { return []; }
    const { data } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
    return (data || []) as SupportMessage[];
};

export const addTicketMessage = async (ticketId: string, senderId: string, message: string, isAdmin: boolean) => {
    const supabase = getSupabase();
    if (!supabase) { return { success: false }; }
    const { error } = await supabase
        .from('support_messages')
        .insert({ ticket_id: ticketId, sender_id: senderId, message, is_admin: isAdmin });
    if (error) { return { success: false, message: error.message }; }
    await supabase
        .from('support_tickets')
        .update({ updated_at: new Date().toISOString(), status: isAdmin ? 'in_progress' : 'open' })
        .eq('id', ticketId);
    return { success: true };
};

export const updateTicketStatus = async (ticketId: string, status: 'open' | 'in_progress' | 'resolved') => {
    const supabase = getSupabase();
    if (!supabase) { return; }
    await supabase.from('support_tickets').update({ status }).eq('id', ticketId);
};

export const getOpenTicketsCount = async (): Promise<number> => {
    const supabase = getSupabase();
    if (!supabase) { return 0; }
    const { count } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .in('status', ['open', 'in_progress']);
    return count || 0;
};

export const getPendingTicketsUsers = async (): Promise<{ userId: string, userName: string, avatar: string, count: number }[]> => {
    const supabase = getSupabase();
    if (!supabase) { return []; }
    const { data, error } = await supabase
        .from('support_tickets')
        .select('user_id, users(name, avatar, email)')
        .in('status', ['open', 'in_progress']);

    if (error || !data) { return []; }
    const userMap = new Map<string, { userId: string, userName: string, avatar: string, count: number }>();
    data.forEach((t: any) => {
        if (!t.users) { return; }
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
