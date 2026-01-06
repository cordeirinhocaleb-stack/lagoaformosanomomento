
import React from 'react';
import { Advertiser, AdPricingConfig, User } from '../../types';
import AdvertisersManager from './advertisers/AdvertisersManager';

interface AdvertisersTabProps {
  advertisers: Advertiser[];
  adConfig: AdPricingConfig;
  onUpdateAdvertiser: (advertiser: Advertiser) => void;
  onUpdateAdConfig: (config: AdPricingConfig) => void;
  userPermissions: User;
}

const AdvertisersTab: React.FC<AdvertisersTabProps> = (props) => {
  return (
    <AdvertisersManager {...props} />
  );
};

export default AdvertisersTab;
