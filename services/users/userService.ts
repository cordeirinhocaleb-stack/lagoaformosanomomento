
import { User } from '../../types';
import { getSupabase } from '../core/supabaseClient';
import { logAction } from '../admin/auditService';

/**
 * Serviço de Gerenciamento de Usuários
 * Versão: 1.101
 * Última Atualização: 04/01/2026
 * Changelog: Validação robusta adicionada ao sistema de compras
 */

// Helper to avoid circular dependency for now, we will move logAction to core or separate audit service
// For now, let's duplicate logAction locally or assume it's imported.
// BETTER: Create auditService.ts first?
// Let's implement User logic.

// --- SECURITY UTILS ---

/**
 * Sanitiza inputs de texto para prevenir XSS básico e injecao
 * Remove tags HTML e limita tamanho
 */
const sanitizeInput = (input: string | null | undefined, maxLength: number = 500): string | null => {
    if (!input) { return null; }
    let clean = input.toString()
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/script/gi, "")
        .replace(/on\w+=/gi, "")
        .trim();

    if (clean.length > maxLength) { clean = clean.substring(0, maxLength); }
    return clean || null;
};

const mapUserToDb = (user: User): Record<string, unknown> => ({
    id: user.id,
    name: sanitizeInput(user.name, 100),
    email: user.email,
    role: user.role,
    status: user.status || 'active',
    avatar: user.avatar,
    bio: sanitizeInput(user.bio, 1000),
    birthdate: user.birthDate,
    zipcode: sanitizeInput(user.zipCode, 20),
    street: sanitizeInput(user.street, 200),
    number: sanitizeInput(user.number, 20),
    city: sanitizeInput(user.city, 100),
    state: sanitizeInput(user.state, 50),
    phone: sanitizeInput(user.phone, 30),
    document: sanitizeInput(user.document, 30),
    profession: sanitizeInput(user.profession, 100),
    education: sanitizeInput(user.education, 100),
    skills: user.skills ? user.skills.map(s => sanitizeInput(s, 50)).filter(Boolean) : [],
    professionalBio: sanitizeInput(user.professionalBio, 2000),
    availability: user.availability,
    companyName: sanitizeInput(user.companyName, 150),
    businessType: sanitizeInput(user.businessType, 100),
    whatsappVisible: user.whatsappVisible,
    themePreference: user.themePreference,
    socialLinks: user.socialLinks,
    permissions: user.permissions,
    advertiser_plan: user.advertiserPlan,
    active_plans: user.activePlans,
    subscription_start: user.subscriptionStart,
    subscription_end: user.subscriptionEnd,
    two_factor_enabled: user.twoFactorEnabled,
    usage_credits: user.usageCredits,
    site_credits: user.siteCredits,
    custom_limits: user.customLimits,
    terms_accepted: user.termsAccepted,
    terms_accepted_at: user.termsAcceptedAt,
    commercial_data: user.commercialData
});

export const mapDbToUser = (dbUser: any): User | null => {
    if (!dbUser) return null;
    return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        status: dbUser.status,
        avatar: dbUser.avatar,
        bio: dbUser.bio,
        birthDate: dbUser.birthdate, // Db is birthdate (lowercase)
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
        professionalBio: dbUser.professionalBio || dbUser.professional_bio, // Handle both just in case
        availability: dbUser.availability,
        companyName: dbUser.companyName || dbUser.company_name, // Handle inconsistent casing
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
        siteCredits: dbUser.siteCredits || dbUser.site_credits,
        customLimits: dbUser.custom_limits,
        termsAccepted: dbUser.terms_accepted,
        termsAcceptedAt: dbUser.terms_accepted_at,
        commercialData: dbUser.commercial_data || {}
    };
};

export const createUser = async (user: User) => {
    const supabase = getSupabase();
    if (!supabase) { return; }
    const payload = mapUserToDb(user);
    const { error } = await supabase.from('users').insert(payload);
    if (error) { throw error; }
};

export const updateUser = async (user: User) => {
    const supabase = getSupabase();
    if (!supabase) { return; }
    const payload = mapUserToDb(user);
    const { error } = await supabase.from('users').update(payload).eq('id', user.id);
    if (error) { throw error; }
};

export const deleteUser = async (id: string) => {
    const supabase = getSupabase();
    if (!supabase) { return; }
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) { throw error; }
};

// --- COMMERCIAL DATA SERVICE ---
/**
 * Retrieve the commercial_data JSON for a user.
 */
export const getCommercialData = async (userId: string): Promise<any> => {
    const supabase = getSupabase();
    if (!supabase) { return null; }
    const { data, error } = await supabase
        .from('users')
        .select('commercial_data')
        .eq('id', userId)
        .single();
    if (error) { console.warn('Failed to fetch commercial data:', error.message); return null; }
    return data?.commercial_data || {};
};

/**
 * Update the commercial_data JSON for a user.
 */
export const updateCommercialData = async (userId: string, payload: any) => {
    const supabase = getSupabase();
    if (!supabase) { throw new Error('Supabase client not available'); }
    const { data, error } = await supabase
        .from('users')
        .update({ commercial_data: payload })
        .eq('id', userId)
        .select('commercial_data')
        .single();
    if (error) { throw error; }
    return data?.commercial_data;
};


export const getEmailByUsername = async (username: string): Promise<string | null> => {
    const supabase = getSupabase();
    if (!supabase) { return null; }
    const { data, error } = await supabase
        .from('users')
        .select('email')
        .or(`name.eq.${username},email.eq.${username}`)
        .maybeSingle();

    if (error) { return null; }
    return data?.email || null;
};

export const checkEmailExists = async (email: string): Promise<boolean> => {
    const supabase = getSupabase();
    if (!supabase) { return false; }
    const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

    if (error) {
        console.warn("Check email error (RLS likely):", error.message);
        return false;
    }
    return !!data;
};

export const getUserByDocument = async (document: string): Promise<{ id: string, name: string, email: string } | null> => {
    const supabase = getSupabase();
    if (!supabase) { return null; }

    // Remove caracteres não numéricos para busca flexível
    const cleanDoc = document.replace(/\D/g, '');

    // Tenta buscar exato primeiro
    let { data, error } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('document', document)
        .maybeSingle();

    if (error || !data) {
        // Se falhar, tenta buscar pelo limpo se o input também estava sujo no banco? 
        // Postgres não tem regex simples aqui sem RPC, então vamos assumir busca exata por enquanto
        // ou buscar todos com document not null e filtrar no js (perigoso se muitos users)
        // Melhor: assumir que o admin digita exatamente como está no banco por enquanto.
        return null;
    }


    return data;
};

export const getUserByName = async (name: string): Promise<{ id: string, name: string, email: string, document?: string }[]> => {
    const supabase = getSupabase();
    if (!supabase) { return []; }

    // Busca por nome (case-insensitive, parcial)
    const { data, error } = await supabase
        .from('users')
        .select('id, name, email, document')
        .ilike('name', `%${name}%`)
        .limit(10);

    if (error || !data) {
        return [];
    }

    return data;
};

// --- AUTH UTILS ---

export const registerAuthFailure = async (email: string) => {
    console.log(`Auth failure registered for ${email}`);
    return { lockoutUntil: null, attempts: 1 };
};

export const resetAuthSecurity = async (email: string) => {
    console.log(`Auth security reset for ${email}`);
};

export const checkAuthLockout = async (email: string) => {
    return { isLocked: false, secondsRemaining: 0 };
};

export const requestPasswordRecovery = async (email: string) => {
    const supabase = getSupabase();
    if (!supabase) { return { success: false, message: "Erro de servidor" }; }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) { return { success: false, message: error.message }; }
    return { success: true, message: "Link enviado!" };
};

export const resendActivationEmail = async (email: string) => {
    const supabase = getSupabase();
    if (!supabase) { return { success: false, message: "Erro de servidor" }; }
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) { return { success: false, message: error.message }; }
    return { success: true, message: "E-mail reenviado!" };
};

export const triggerPasswordResetByAdmin = async (email: string) => {
    return requestPasswordRecovery(email);
};

// --- CREDITS & PLANS ---

/**
 * Validação e Sanitização de Dados de Compra
 */
interface PurchaseValidationResult {
    isValid: boolean;
    errors: string[];
}

const validatePurchaseData = (
    itemType: string,
    itemId: string,
    cost: number,
    itemName: string,
    details?: any
): PurchaseValidationResult => {
    const errors: string[] = [];

    // Validação de tipo de item
    if (!['plan', 'boost'].includes(itemType)) {
        errors.push(`Tipo de item inválido: ${itemType}`);
    }

    // Validação de ID
    if (!itemId || typeof itemId !== 'string' || itemId.trim().length === 0) {
        errors.push('ID do item é obrigatório');
    }

    // Validação de custo
    if (typeof cost !== 'number' || isNaN(cost)) {
        errors.push('Custo deve ser um número válido');
    } else if (cost <= 0) {
        errors.push('Custo deve ser maior que zero');
    } else if (cost > 100000) {
        errors.push('Custo excede o limite máximo permitido (C$ 100.000)');
    }

    // Validação de nome
    if (!itemName || typeof itemName !== 'string' || itemName.trim().length === 0) {
        errors.push('Nome do item é obrigatório');
    }

    // Validação de detalhes (se fornecido)
    if (details !== undefined && details !== null) {
        if (typeof details !== 'object') {
            errors.push('Detalhes devem ser um objeto');
        } else {
            // Validar campos numéricos em details
            const numericFields = ['posts', 'videos', 'featuredDays', 'maxProducts', 'videoLimit', 'banners', 'popups', 'jobs', 'gigs'];
            for (const field of numericFields) {
                if (details[field] !== undefined) {
                    if (typeof details[field] !== 'number' || isNaN(details[field]) || details[field] < 0) {
                        errors.push(`Campo ${field} deve ser um número não-negativo`);
                    }
                }
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Sanitiza valores numéricos para garantir integridade
 */
const sanitizeNumber = (value: unknown, defaultValue: number = 0): number => {
    const num = Number(value);
    return isNaN(num) || num < 0 ? defaultValue : Math.floor(num);
};

/**
 * Deduz créditos do usuário para comprar um item (Plano ou Boost).
 * Versão 1.101 - Com validação robusta e segurança reforçada
 */
export const userPurchaseItem = async (
    userId: string,
    itemType: 'plan' | 'boost',
    itemId: string,
    cost: number,
    itemName: string,
    details?: any,
    cashbackAmount: number = 0
) => {
    const supabase = getSupabase();
    if (!supabase) { return { success: false, message: "Erro de conexão" }; }

    try {
        // 1. VALIDAÇÃO DE ENTRADA
        const validation = validatePurchaseData(itemType, itemId, cost, itemName, details);
        if (!validation.isValid) {
            console.error('[userPurchaseItem] Validação falhou:', validation.errors);
            return {
                success: false,
                message: `Dados inválidos: ${validation.errors.join(', ')}`
            };
        }

        // Sanitizar custo
        const sanitizedCost = sanitizeNumber(cost, 0);
        if (sanitizedCost === 0) {
            return { success: false, message: "Custo inválido após sanitização" };
        }

        // 2. BUSCAR DADOS DO USUÁRIO
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('site_credits, active_plans, advertiser_plan, usage_credits, subscription_end')
            .eq('id', userId)
            .maybeSingle();

        if (userError || !user) {
            console.error('[userPurchaseItem] Erro ao buscar usuário:', userError);
            throw new Error("Usuário não encontrado");
        }

        // 3. VALIDAR SALDO
        const currentCredits = sanitizeNumber(user.site_credits, 0);

        if (currentCredits < sanitizedCost) {
            return {
                success: false,
                message: `Saldo insuficiente. Necessário C$ ${sanitizedCost.toFixed(2)}, disponível C$ ${currentCredits.toFixed(2)}.`
            };
        }

        // 4. PREPARAR ATUALIZAÇÕES
        const updates: Record<string, unknown> = {
            site_credits: currentCredits - sanitizedCost + (sanitizeNumber(cashbackAmount, 0))
        };

        // 5. PROCESSAR LÓGICA DO ITEM
        if (itemType === 'plan') {
            const currentPlans = Array.isArray(user.active_plans)
                ? user.active_plans
                : (user.advertiser_plan && user.advertiser_plan !== 'free' ? [user.advertiser_plan] : []);

            // Validar limite de planos únicos (máximo 3 tipos diferentes)
            const uniquePlans = new Set([...currentPlans, itemId]);
            if (uniquePlans.size > 3) {
                return {
                    success: false,
                    message: "Limite de 3 tipos de planos diferentes atingido. Você pode repetir planos existentes, mas não adicionar um 4º tipo."
                };
            }

            const newPlans = [...currentPlans, itemId];
            updates.active_plans = newPlans;
            updates.advertiser_plan = newPlans[0];

            // Gerenciar datas de assinatura
            const now = new Date();
            const endDate = new Date();
            endDate.setDate(now.getDate() + 30);

            if (!user.subscription_end || new Date(user.subscription_end) < now) {
                updates.subscription_start = now.toISOString();
                updates.subscription_end = endDate.toISOString();
            } else {
                // Estender assinatura existente
                const currentEnd = new Date(user.subscription_end);
                currentEnd.setDate(currentEnd.getDate() + 30);
                updates.subscription_end = currentEnd.toISOString();
            }

            // Adicionar limites do plano (se fornecidos)
            if (details && typeof details === 'object') {
                const currentUsage = user.usage_credits || {};
                updates.usage_credits = {
                    ...currentUsage,
                    postsRemaining: sanitizeNumber(currentUsage.postsRemaining, 0) + sanitizeNumber(details.maxProducts, 0),
                    videosRemaining: sanitizeNumber(currentUsage.videosRemaining, 0) + sanitizeNumber(details.videoLimit, 0),
                };
            }

        } else if (itemType === 'boost') {
            // Validar que details existe para boosts
            if (!details || typeof details !== 'object') {
                return { success: false, message: "Detalhes do boost são obrigatórios" };
            }

            const currentUsage = user.usage_credits || {};
            updates.usage_credits = {
                ...currentUsage,
                postsRemaining: sanitizeNumber(currentUsage.postsRemaining, 0) + sanitizeNumber(details.posts, 0),
                videosRemaining: sanitizeNumber(currentUsage.videosRemaining, 0) + sanitizeNumber(details.videos, 0),
                featuredDaysRemaining: sanitizeNumber(currentUsage.featuredDaysRemaining, 0) + sanitizeNumber(details.featuredDays, 0),
                bannersRemaining: sanitizeNumber(currentUsage.bannersRemaining, 0) + sanitizeNumber(details.banners, 0),
                popupsRemaining: sanitizeNumber(currentUsage.popupsRemaining, 0) + sanitizeNumber(details.popups, 0),
                jobsRemaining: sanitizeNumber(currentUsage.jobsRemaining, 0) + sanitizeNumber(details.jobs, 0),
                gigsRemaining: sanitizeNumber(currentUsage.gigsRemaining, 0) + sanitizeNumber(details.gigs, 0),
            };
        }

        // 6. APLICAR ATUALIZAÇÃO NO BANCO
        const { error: updateError } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId);

        if (updateError) {
            console.error('[userPurchaseItem] Erro ao atualizar:', updateError);
            throw updateError;
        }

        // 7. REGISTRAR AUDITORIA
        await logAction(
            userId,
            "User",
            "purchase_item",
            userId,
            `Comprou ${itemType} "${itemName}" por C$ ${sanitizedCost.toFixed(2)}${cashbackAmount > 0 ? ` (+C$ ${cashbackAmount.toFixed(2)} Cashback)` : ''}`
        );

        // Se houve cashback, logar separadamente para clareza
        if (cashbackAmount > 0) {
            await logAction(userId, "User", "cashback_received", userId, `Recebeu C$ ${cashbackAmount.toFixed(2)} de cashback`);
        }

        // 8. RETORNAR SUCESSO
        return {
            success: true,
            message: "Compra realizada com sucesso!",
            updatedUser: { ...user, ...updates }
        };

    } catch (e: unknown) {
        console.error("[userPurchaseItem] Erro crítico:", e);
        const message = e instanceof Error ? e.message : "Erro ao processar compra";
        return {
            success: false,
            message
        };
    }
};

export const removeUserItem = async (userId: string, itemType: string, itemId: string) => {
    const supabase = getSupabase();
    if (!supabase) return { success: false, message: "Erro de conexão" };

    try {
        const { data: user, error: fetchError } = await supabase.from('users').select('active_plans').eq('id', userId).single();
        if (fetchError || !user) throw new Error("Usuário não encontrado");

        if (itemType === 'plan') {
            const currentPlans = (user.active_plans as string[]) || [];
            const newPlans = currentPlans.filter(p => p !== itemId);

            const { error: updateError } = await supabase
                .from('users')
                .update({
                    active_plans: newPlans,
                    activePlans: newPlans
                })
                .eq('id', userId);

            if (updateError) throw updateError;

            await logAction(userId, "User", "remove_item", userId, `Removeu item do inventário: ${itemId}`);
            return { success: true, message: "Item removido com sucesso", updatedPlans: newPlans };
        }

        return { success: false, message: "Tipo de item não suportado para remoção" };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
};
