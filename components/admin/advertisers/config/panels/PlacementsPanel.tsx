
import React from 'react';
import { AdPricingConfig } from '../../../../../types';
import PlacementsEditor from '../placements/PlacementsEditor';

interface PlacementsPanelProps {
  config: AdPricingConfig;
  onChange: (newConfig: AdPricingConfig) => void;
  darkMode?: boolean;
}

const PlacementsPanel: React.FC<PlacementsPanelProps> = ({ config, onChange, darkMode = false }) => {
  return (
    <PlacementsEditor
      plans={config.plans}
      onChange={(newPlans) => onChange({ ...config, plans: newPlans })}
      darkMode={darkMode}
    />
  );
};

export default PlacementsPanel;
