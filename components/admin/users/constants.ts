
import { UserRole } from '../../../types';

export const USER_ROLES: UserRole[] = ['Desenvolvedor', 'Editor-Chefe', 'Repórter', 'Jornalista', 'Estagiário', 'Anunciante'];

export const PERMISSION_SCHEMA = [
    {
        id: 'editorial', label: 'Editorial', icon: 'fa-pen-nib',
        actions: [
            { key: 'editorial_view', label: 'Visualizar Conteúdo', description: 'Permite ver a lista de notícias e acessar detalhes, mas não alterar.' },
            { key: 'editorial_edit', label: 'Criar / Editar Posts', description: 'Capacidade de escrever novas notícias, editar existentes e publicar.' },
            { key: 'editorial_delete', label: 'Excluir Posts (Risco)', description: 'Permite a remoção permanente de notícias do banco de dados.' },
        ]
    },
    {
        id: 'financial', label: 'Comercial & Financeiro', icon: 'fa-wallet',
        actions: [
            { key: 'financial_view', label: 'Visualizar Anunciantes', description: 'Acesso de leitura à lista de parceiros comerciais.' },
            { key: 'financial_edit', label: 'Gerenciar Contratos', description: 'Permite criar, editar e desativar anunciantes e contratos.' },
            { key: 'plans_edit', label: 'Configurar Planos', description: 'Permite alterar preços e benefícios dos planos de mídia.' },
            { key: 'user_plan_edit', label: 'Alterar Plano Usuário', description: 'Permite manipular manualmente a assinatura de um usuário.' },
        ]
    },
    {
        id: 'team', label: 'Gestão de Equipe', icon: 'fa-users',
        actions: [
            { key: 'users_view', label: 'Visualizar Membros', description: 'Permite ver a lista de usuários cadastrados no sistema.' },
            { key: 'users_edit', label: 'Gerenciar Acessos', description: 'Capacidade de alterar cargos, senhas e permissões de acesso.' },
        ]
    },
    {
        id: 'system', label: 'Sistema', icon: 'fa-cogs',
        actions: [
            { key: 'settings_edit', label: 'Configurações Globais', description: 'Acesso a configurações críticas como Modo Manutenção e SEO.' },
            { key: 'logs_view', label: 'Ver Auditoria', description: 'Visualização de logs de segurança e ações dos usuários.' },
        ]
    }
];
