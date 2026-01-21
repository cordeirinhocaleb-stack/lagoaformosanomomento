
import React from 'react';
import { Advertiser, AdPricingConfig, User } from '../../types';
import AdvertisersManager from './advertisers/AdvertisersManager';

interface AdvertisersTabProps {
  advertisers: Advertiser[];
  adConfig: AdPricingConfig;
  onUpdateAdvertiser: (advertiser: Advertiser) => Promise<Advertiser | null>;
  onDeleteAdvertiser?: (id: string) => void;
  onUpdateAdConfig: (config: AdPricingConfig) => Promise<void> | void;
  userPermissions: User;
  darkMode?: boolean;
}

const AdvertisersTab: React.FC<AdvertisersTabProps> = ({
  advertisers,
  adConfig,
  onUpdateAdvertiser,
  onDeleteAdvertiser,
  onUpdateAdConfig,
  userPermissions,
  darkMode = false
}) => {
  return (
    <AdvertisersManager
      advertisers={advertisers}
      adConfig={adConfig}
      onUpdateAdvertiser={onUpdateAdvertiser}
      onDeleteAdvertiser={onDeleteAdvertiser}
      onUpdateAdConfig={onUpdateAdConfig}
      userPermissions={userPermissions}
      darkMode={darkMode}
    />
  );
};

export default AdvertisersTab;
