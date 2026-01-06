
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
    if (!input) return null;
    let clean = input.toString()
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/script/gi, "")
        .replace(/on\w+=/gi, "")
        .trim();

    if (clean.length > maxLength) clean = clean.substring(0, maxLength);
    return clean || null;
};

const mapUserToDb = (user: User): any => ({
    id: user.id,
    name: sanitizeInput(user.name, 100),
    email: user.email, // Email should be validated elsewhere, not sanitized aggressively here
    role: user.role,
    status: user.status || 'active',
    avatar: user.avatar, // URLs preserved
    bio: sanitizeInput(user.bio, 1000),
    birthdate: user.birthDate,
    zipcode: sanitizeInput(user.zipCode, 20),
    city: sanitizeInput(user.city, 100),
    state: sanitizeInput(user.state, 50),
    phone: sanitizeInput(user.phone, 30),
    document: sanitizeInput(user.document, 30),
    profession: sanitizeInput(user.profession, 100),
    education: sanitizeInput(user.education, 100),
    skills: user.skills ? user.skills.map(s => sanitizeInput(s, 50)).filter(Boolean) : [],
    "professionalBio": sanitizeInput(user.professionalBio, 2000),
    availability: user.availability,
    "companyName": sanitizeInput(user.companyName, 150),
    "businessType": sanitizeInput(user.businessType, 100),
    "whatsappVisible": user.whatsappVisible,
    "themePreference": user.themePreference,
    "socialLinks": user.socialLinks, // Object/JSON, preserved
    permissions: user.permissions,
    advertiser_plan: user.advertiserPlan,
    "activePlans": user.activePlans,
    "subscriptionStart": user.subscriptionStart,
    "subscriptionEnd": user.subscriptionEnd,
    two_factor_enabled: user.twoFactorEnabled,
    "usageCredits": user.usageCredits,
    "siteCredits": user.siteCredits,
    custom_limits: user.customLimits
});

export const createUser = async (user: User) => {
    const supabase = getSupabase();
    if (!supabase) return;
    const payload = mapUserToDb(user);
    const { error } = await supabase.from('users').insert(payload);
    if (error) throw error;
};

export const updateUser = async (user: User) => {
    const supabase = getSupabase();
    if (!supabase) return;
    const payload = mapUserToDb(user);
    const { error } = await supabase.from('users').update(payload).eq('id', user.id);
    if (error) throw error;
};

export const getEmailByUsername = async (username: string): Promise<string | null> => {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase
        .from('users')
        .select('email')
        .or(`name.eq.${username},email.eq.${username}`)
        .maybeSingle();

    if (error) return null;
    return data?.email || null;
};

export const checkEmailExists = async (email: string): Promise<boolean> => {
    const supabase = getSupabase();
    if (!supabase) return false;
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
    if (!supabase) return { success: false, message: "Erro de servidor" };
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return { success: false, message: error.message };
    return { success: true, message: "Link enviado!" };
};

export const resendActivationEmail = async (email: string) => {
    const supabase = getSupabase();
    if (!supabase) return { success: false, message: "Erro de servidor" };
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) return { success: false, message: error.message };
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
const sanitizeNumber = (value: any, defaultValue: number = 0): number => {
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
    details?: any
) => {
    const supabase = getSupabase();
    if (!supabase) return { success: false, message: "Erro de conexão" };

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
            .select('siteCredits, activePlans, advertiserPlan, usageCredits, subscriptionEnd')
            .eq('id', userId)
            .maybeSingle();

        if (userError || !user) {
            console.error('[userPurchaseItem] Erro ao buscar usuário:', userError);
            throw new Error("Usuário não encontrado");
        }

        // 3. VALIDAR SALDO
        const currentCredits = sanitizeNumber(user.siteCredits, 0);

        if (currentCredits < sanitizedCost) {
            return {
                success: false,
                message: `Saldo insuficiente. Necessário C$ ${sanitizedCost.toFixed(2)}, disponível C$ ${currentCredits.toFixed(2)}.`
            };
        }

        // 4. PREPARAR ATUALIZAÇÕES
        const updates: any = {
            siteCredits: currentCredits - sanitizedCost
        };

        // 5. PROCESSAR LÓGICA DO ITEM
        if (itemType === 'plan') {
            const currentPlans = Array.isArray(user.activePlans)
                ? user.activePlans
                : (user.advertiserPlan && user.advertiserPlan !== 'free' ? [user.advertiserPlan] : []);

            // Validar limite de planos únicos (máximo 3 tipos diferentes)
            const uniquePlans = new Set([...currentPlans, itemId]);
            if (uniquePlans.size > 3) {
                return {
                    success: false,
                    message: "Limite de 3 tipos de planos diferentes atingido. Você pode repetir planos existentes, mas não adicionar um 4º tipo."
                };
            }

            const newPlans = [...currentPlans, itemId];
            updates.activePlans = newPlans;
            updates.advertiserPlan = newPlans[0]; // Compatibilidade

            // Gerenciar datas de assinatura
            const now = new Date();
            const endDate = new Date();
            endDate.setDate(now.getDate() + 30); // 30 dias padrão

            if (!user.subscriptionEnd || new Date(user.subscriptionEnd) < now) {
                updates.subscriptionStart = now.toISOString();
                updates.subscriptionEnd = endDate.toISOString();
            } else {
                // Estender assinatura existente
                const currentEnd = new Date(user.subscriptionEnd);
                currentEnd.setDate(currentEnd.getDate() + 30);
                updates.subscriptionEnd = currentEnd.toISOString();
            }

            // Adicionar limites do plano (se fornecidos)
            if (details && typeof details === 'object') {
                const currentUsage = user.usageCredits || {};
                updates.usageCredits = {
                    postsRemaining: sanitizeNumber(currentUsage.postsRemaining, 0) + sanitizeNumber(details.maxProducts, 0),
                    videosRemaining: sanitizeNumber(currentUsage.videosRemaining, 0) + sanitizeNumber(details.videoLimit, 0),
                    featuredDaysRemaining: sanitizeNumber(currentUsage.featuredDaysRemaining, 0),
                    clicksBalance: sanitizeNumber(currentUsage.clicksBalance, 0)
                };
            }

        } else if (itemType === 'boost') {
            // Validar que details existe para boosts
            if (!details || typeof details !== 'object') {
                return { success: false, message: "Detalhes do boost são obrigatórios" };
            }

            const currentUsage = user.usageCredits || {};
            updates.usageCredits = {
                postsRemaining: sanitizeNumber(currentUsage.postsRemaining, 0) + sanitizeNumber(details.posts, 0),
                videosRemaining: sanitizeNumber(currentUsage.videosRemaining, 0) + sanitizeNumber(details.videos, 0),
                featuredDaysRemaining: sanitizeNumber(currentUsage.featuredDaysRemaining, 0) + sanitizeNumber(details.featuredDays, 0),
                bannersRemaining: sanitizeNumber(currentUsage.bannersRemaining, 0) + sanitizeNumber(details.banners, 0),
                popupsRemaining: sanitizeNumber(currentUsage.popupsRemaining, 0) + sanitizeNumber(details.popups, 0),
                jobsRemaining: sanitizeNumber(currentUsage.jobsRemaining, 0) + sanitizeNumber(details.jobs, 0),
                gigsRemaining: sanitizeNumber(currentUsage.gigsRemaining, 0) + sanitizeNumber(details.gigs, 0),
                clicksBalance: sanitizeNumber(currentUsage.clicksBalance, 0)
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
            `Comprou ${itemType} "${itemName}" por C$ ${sanitizedCost.toFixed(2)}`
        );

        // 8. RETORNAR SUCESSO
        return {
            success: true,
            message: "Compra realizada com sucesso!",
            updatedUser: { ...user, ...updates }
        };

    } catch (e: any) {
        console.error("[userPurchaseItem] Erro crítico:", e);
        return {
            success: false,
            message: e.message || "Erro ao processar compra"
        };
    }
};
