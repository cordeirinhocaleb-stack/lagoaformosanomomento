/**
 * Tipos para componentes de User Subscription
 * @module types/admin/subscription
 */

export interface UserResources {
    postsRemaining: number;
    videosRemaining: number;
    featuredDaysRemaining: number;
    bannersRemaining: number;
    popupsRemaining: number;
    jobsRemaining: number;
    gigsRemaining: number;
}

export interface CreditUpdate {
    field: keyof UserResources;
    value: number;
}

export interface SubscriptionDates {
    start: string | null;
    end: string | null;
}

export interface ActivePlan {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
}

export interface UserAdvertisement {
    id: string;
    title: string;
    type: 'banner' | 'popup' | 'sponsored';
    status: 'active' | 'paused' | 'expired';
    impressions: number;
    clicks: number;
}
