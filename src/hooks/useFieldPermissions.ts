import { useState, useEffect } from 'react';
import { getSupabase } from '../services/supabaseService';

/**
 * Field-Level Permission
 */
export interface FieldPermission {
    canView: boolean;
    canEdit: boolean;
    maskType: 'full' | 'partial_cpf' | 'partial_cnpj' | 'partial_email' | 'partial_phone' | 'hidden';
}

/**
 * Permissões padrão por role
 * Fallback caso não exista no banco
 */
const DEFAULT_PERMISSIONS: Record<string, FieldPermission> = {
    // Admin: acesso total
    'Admin_users_cpf': { canView: true, canEdit: true, maskType: 'full' },
    'Admin_users_email': { canView: true, canEdit: true, maskType: 'full' },
    'Admin_users_phone': { canView: true, canEdit: true, maskType: 'full' },
    'Admin_users_role': { canView: true, canEdit: true, maskType: 'full' },

    // Desenvolvedor: acesso total + campos técnicos
    'Desenvolvedor_users_cpf': { canView: true, canEdit: true, maskType: 'full' },
    'Desenvolvedor_users_email': { canView: true, canEdit: true, maskType: 'full' },
    'Desenvolvedor_users_role': { canView: true, canEdit: true, maskType: 'full' },

    // Jornalista: visualização limitada, sem edição de roles
    'Jornalista_users_cpf': { canView: true, canEdit: false, maskType: 'partial_cpf' },
    'Jornalista_users_email': { canView: true, canEdit: false, maskType: 'full' },
    'Jornalista_users_phone': { canView: true, canEdit: false, maskType: 'partial_phone' },
    'Jornalista_users_role': { canView: true, canEdit: false, maskType: 'full' },

    // Anunciante: pode editar próprios dados
    'Anunciante_users_cpf': { canView: true, canEdit: false, maskType: 'partial_cpf' },
    'Anunciante_users_email': { canView: true, canEdit: true, maskType: 'full' },
    'Anunciante_users_phone': { canView: true, canEdit: true, maskType: 'full' },
    'Anunciante_users_role': { canView: true, canEdit: false, maskType: 'full' },

    // Leitor: visualização muito limitada
    'Leitor_users_cpf': { canView: false, canEdit: false, maskType: 'hidden' },
    'Leitor_users_email': { canView: true, canEdit: true, maskType: 'partial_email' },
    'Leitor_users_phone': { canView: true, canEdit: true, maskType: 'partial_phone' },
    'Leitor_users_role': { canView: true, canEdit: false, maskType: 'full' },
};

/**
 * Hook para consultar permissões de campo baseado no role
 */
export const useFieldPermissions = (
    userRole: string,
    tableName: string,
    fieldName: string
): FieldPermission => {
    const [permission, setPermission] = useState<FieldPermission>({
        canView: true,
        canEdit: true,
        maskType: 'full',
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPermissions = async () => {
            try {
                const supabase = getSupabase();
                if (!supabase) {
                    // Fallback para permissões padrão
                    const key = `${userRole}_${tableName}_${fieldName}`;
                    setPermission(DEFAULT_PERMISSIONS[key] || {
                        canView: true,
                        canEdit: false,
                        maskType: 'full',
                    });
                    setLoading(false);
                    return;
                }

                // Consulta permissões no banco
                const { data, error } = await supabase
                    .from('field_permissions')
                    .select('can_view, can_edit, mask_type')
                    .eq('role', userRole)
                    .eq('table_name', tableName)
                    .eq('field_name', fieldName)
                    .single();

                if (error) {
                    // Se não encontrar, usa permissões padrão
                    const key = `${userRole}_${tableName}_${fieldName}`;
                    setPermission(DEFAULT_PERMISSIONS[key] || {
                        canView: true,
                        canEdit: false,
                        maskType: 'full',
                    });
                } else if (data) {
                    setPermission({
                        canView: data.can_view,
                        canEdit: data.can_edit,
                        maskType: data.mask_type as any,
                    });
                }
            } catch (err) {
                console.error('Erro ao carregar permissões:', err);
                // Fallback
                const key = `${userRole}_${tableName}_${fieldName}`;
                setPermission(DEFAULT_PERMISSIONS[key] || {
                    canView: true,
                    canEdit: false,
                    maskType: 'full',
                });
            } finally {
                setLoading(false);
            }
        };

        if (userRole && tableName && fieldName) {
            loadPermissions();
        }
    }, [userRole, tableName, fieldName]);

    return permission;
};

/**
 * Hook otimizado para carregar permissões de múltiplos campos de uma vez
 */
export const useMultiFieldPermissions = (
    userRole: string,
    tableName: string,
    fieldNames: string[]
): Record<string, FieldPermission> => {
    const [permissions, setPermissions] = useState<Record<string, FieldPermission>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPermissions = async () => {
            try {
                const supabase = getSupabase();
                if (!supabase) {
                    // Fallback
                    const defaultPerms: Record<string, FieldPermission> = {};
                    fieldNames.forEach(field => {
                        const key = `${userRole}_${tableName}_${field}`;
                        defaultPerms[field] = DEFAULT_PERMISSIONS[key] || {
                            canView: true,
                            canEdit: false,
                            maskType: 'full',
                        };
                    });
                    setPermissions(defaultPerms);
                    setLoading(false);
                    return;
                }

                // Consulta batch
                const { data, error } = await supabase
                    .from('field_permissions')
                    .select('field_name, can_view, can_edit, mask_type')
                    .eq('role', userRole)
                    .eq('table_name', tableName)
                    .in('field_name', fieldNames);

                const permsMap: Record<string, FieldPermission> = {};

                if (!error && data) {
                    data.forEach((item: any) => {
                        permsMap[item.field_name] = {
                            canView: item.can_view,
                            canEdit: item.can_edit,
                            maskType: item.mask_type,
                        };
                    });
                }

                // Preenche campos não encontrados com padrões
                fieldNames.forEach(field => {
                    if (!permsMap[field]) {
                        const key = `${userRole}_${tableName}_${field}`;
                        permsMap[field] = DEFAULT_PERMISSIONS[key] || {
                            canView: true,
                            canEdit: false,
                            maskType: 'full',
                        };
                    }
                });

                setPermissions(permsMap);
            } catch (err) {
                console.error('Erro ao carregar permissões:', err);
                // Fallback
                const defaultPerms: Record<string, FieldPermission> = {};
                fieldNames.forEach(field => {
                    const key = `${userRole}_${tableName}_${field}`;
                    defaultPerms[field] = DEFAULT_PERMISSIONS[key] || {
                        canView: true,
                        canEdit: false,
                        maskType: 'full',
                    };
                });
                setPermissions(defaultPerms);
            } finally {
                setLoading(false);
            }
        };

        if (userRole && tableName && fieldNames.length > 0) {
            loadPermissions();
        }
    }, [userRole, tableName, JSON.stringify(fieldNames)]);

    return permissions;
};
