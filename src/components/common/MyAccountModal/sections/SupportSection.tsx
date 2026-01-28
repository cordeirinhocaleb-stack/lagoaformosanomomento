import React from 'react';
import { User, SystemSettings } from '../../../../types';
import UserSupportSection from '../../../user/UserSupportSection';

interface SupportSectionProps {
    user: User;
    systemSettings?: SystemSettings;
    onOpenTerms?: () => void;
}

const SupportSection: React.FC<SupportSectionProps> = ({ user, systemSettings, onOpenTerms }) => {
    return (
        <div className="max-w-4xl mx-auto animate-fadeIn">
            <UserSupportSection userId={user.id} userName={user.name} />
        </div>
    );
};

export default SupportSection;
