
import { User } from '@/types';

export interface MarketItem {
    id: string;
    type: 'plan' | 'boost';
    name: string;
    cost: number;
    icon: string;
    color: string;
    details?: Record<string, unknown>; // For boosts
    applyEffect?: (user: User) => any; // Logic for boosts (additive updates)
}
