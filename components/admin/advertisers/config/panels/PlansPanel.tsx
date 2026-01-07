
import React from 'react';
import { AdPricingConfig, User } from '../../../../../types';
import PlansEditor from '../plans/PlansEditor';

interface PlansPanelProps {
  config: AdPricingConfig;
  onChange: (newConfig: AdPricingConfig) => void;
  currentUser: User;
  darkMode?: boolean;
}

const PlansPanel: React.FC<PlansPanelProps> = ({ config, onChange, currentUser, darkMode = false }) => {
  return (
    <PlansEditor
      plans={config.plans}
      onChange={(newPlans) => onChange({ ...config, plans: newPlans })}
      currentUser={currentUser}
      darkMode={darkMode}
    />
  );
};

export default PlansPanel;
