
import React from 'react';
import { Advertiser, AdPricingConfig, User } from '../../types';
import AdvertisersManager from './advertisers/AdvertisersManager';

interface AdvertisersTabProps {
  advertisers: Advertiser[];
  adConfig: AdPricingConfig;
  onUpdateAdvertiser: (advertiser: Advertiser) => void;
  onUpdateAdConfig: (config: AdPricingConfig) => void;
  userPermissions: User;
  darkMode?: boolean;
}

const AdvertisersTab: React.FC<AdvertisersTabProps> = ({
  advertisers,
  adConfig,
  onUpdateAdvertiser,
  onUpdateAdConfig,
  userPermissions,
  darkMode = false
}) => {
  return (
    <AdvertisersManager
      advertisers={advertisers}
      adConfig={adConfig}
      onUpdateAdvertiser={onUpdateAdvertiser}
      onUpdateAdConfig={onUpdateAdConfig}
      userPermissions={userPermissions}
      darkMode={darkMode}
    />
  );
};

export default AdvertisersTab;
