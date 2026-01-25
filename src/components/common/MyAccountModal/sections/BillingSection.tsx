import React from 'react';
import { User, AdPricingConfig } from '../../../../types';
import UserStorePOS from '../UserStorePOS';

interface BillingSectionProps {
    user: User;
    adConfig?: AdPricingConfig;
    onUpdateUser: (user: User) => void;
}

const BillingSection: React.FC<BillingSectionProps> = ({ user, adConfig, onUpdateUser }) => {
    return (
        <div className="max-w-4xl mx-auto animate-fadeIn">
            <UserStorePOS user={user} adConfig={adConfig} onUpdateUser={onUpdateUser} />
        </div>
    );
};

export default BillingSection;
