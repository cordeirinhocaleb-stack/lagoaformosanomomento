
import React from 'react';
import { AdPricingConfig } from '../../../../../types';
import PlacementsEditor from '../placements/PlacementsEditor';

interface PlacementsPanelProps {
  config: AdPricingConfig;
  onChange: (newConfig: AdPricingConfig) => void;
}

const PlacementsPanel: React.FC<PlacementsPanelProps> = ({ config, onChange }) => {
  return (
    <PlacementsEditor 
        plans={config.plans} 
        onChange={(newPlans) => onChange({ ...config, plans: newPlans })}
    />
  );
};

export default PlacementsPanel;
