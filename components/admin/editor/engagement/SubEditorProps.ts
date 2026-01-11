import { ColorTheme } from '../EngagementColors';

export interface SubEditorProps {
    settings: any;
    style?: string;
    theme?: ColorTheme;
    onChange: (s: any) => void;
}
