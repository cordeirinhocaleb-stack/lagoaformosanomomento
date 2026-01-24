
import { User } from './users';
import { Advertiser } from './ads';
import { NewsItem } from './news';

export interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    salary?: string;
    description: string;
    postedAt: string;
    isActive: boolean;
    whatsapp?: string;
}

export interface SystemSettings {
    jobsModuleEnabled: boolean;
    enableOmnichannel: boolean;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    purchasingEnabled?: boolean;
    tickerMessage?: string;
    footer?: {
        phone?: string;
        email?: string;
        socialLinks?: {
            instagram?: string;
            facebook?: string;
            whatsapp?: string;
            youtube?: string;
        };
    };
    supabase?: { // Made optional too just in case
        url: string;
        anonKey: string;
    };
    socialWebhookUrl?: string; // Made optional
    cloudinary?: {
        images?: {
            cloudName: string;
            uploadPreset: string;
        };
        videos?: {
            cloudName: string;
            uploadPreset: string;
        };
        cloudName?: string;
        uploadPreset?: string;
    };
}

export interface AuditLog {
    userId: string;
    userName: string;
    action: string;
    targetId: string;
    details: string;
    timestamp: string;
}

export interface SettingsAuditItem {
    id: string;
    setting_key: string;
    old_value: any;
    new_value: any;
    changed_by: string;
    changed_at: string;
}

export interface ErrorReport {
    id: string;
    message: string;
    stack?: string;
    context?: string;
    userId?: string;
    userName?: string;
    userAgent: string;
    createdAt: string;
    status: 'open' | 'resolved';
}

export interface SupportTicket {
    id: string;
    user_id: string;
    category: string;
    subject: string;
    message?: string;
    status: 'open' | 'in_progress' | 'resolved';
    created_at: string;
    updated_at: string;
    user?: User;
}

export interface SupportMessage {
    id: string;
    ticket_id: string;
    sender_id: string;
    message: string;
    is_admin: boolean;
    created_at: string;
}

export type ActivityStatus = 'pending' | 'success' | 'error' | 'info';
export type ActivityKind = 'upload' | 'distribution' | 'sync' | 'error' | 'process';

export const checkPermission = (user: User | null, permission: string): boolean => {
    if (!user) { return false; }

    // Normalização para evitar erros de digitação/hífen
    const role = (user.role || '').toLowerCase();
    const isHighPrivilege =
        role.includes('admin') ||
        role.includes('chefe') ||
        role.includes('desenvolvedor') ||
        role.includes('dev') ||
        role.includes('editor');

    if (isHighPrivilege) { return true; }

    return !!user.permissions?.[permission];
};

export interface SiteData {
    news: NewsItem[];
    advertisers: Advertiser[];
    users: User[];
    jobs: Job[];
    auditLogs: AuditLog[];
}
