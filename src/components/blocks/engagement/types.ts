
import { ContentBlock } from '../../../types';
import { ColorTheme } from '../../../utils/engagementThemeHelper';
import { InteractionStats } from '../../../services/engagement/engagementService';

export interface WidgetProps {
    block: ContentBlock;
    theme: ColorTheme;
    stats: InteractionStats | null;
    hasInteracted: boolean;
    onInteract: (data: any) => void;
    accentColor: string; // Hex color
    selectedOption: any; // Local state from parent
}
