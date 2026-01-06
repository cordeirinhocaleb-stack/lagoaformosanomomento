
import { UserRole } from '../../../types';

export const USER_ROLES: UserRole[] = ['Desenvolvedor', 'Editor-Chefe', 'Repórter', 'Jornalista', 'Estagiário', 'Anunciante'];

export const PERMISSION_SCHEMA = [
    {
        id: 'editorial', label: 'Editorial', icon: 'fa-pen-nib',
        actions: [
            { key: 'editorial_view', label: 'Visualizar Conteúdo' },
            { key: 'editorial_edit', label: 'Criar / Editar Posts' },
            { key: 'editorial_delete', label: 'Excluir Posts (Risco)' },
        ]
    },
    {
        id: 'financial', label: 'Comercial & Financeiro', icon: 'fa-wallet',
        actions: [
            { key: 'financial_view', label: 'Visualizar Anunciantes' },
            { key: 'financial_edit', label: 'Gerenciar Contratos' },
            { key: 'plans_edit', label: 'Configurar Planos' },
            { key: 'user_plan_edit', label: 'Alterar Plano Usuário' }, // Nova Permissão
        ]
    },
    {
        id: 'team', label: 'Gestão de Equipe', icon: 'fa-users',
        actions: [
            { key: 'users_view', label: 'Visualizar Membros' },
            { key: 'users_edit', label: 'Gerenciar Acessos' },
        ]
    },
    {
        id: 'system', label: 'Sistema', icon: 'fa-cogs',
        actions: [
            { key: 'settings_edit', label: 'Configurações Globais' },
            { key: 'logs_view', label: 'Ver Auditoria' },
        ]
    }
];
