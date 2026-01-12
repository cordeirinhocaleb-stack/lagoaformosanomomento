
import { ContentBlock } from '@/types';

export type EditorialStyle =
  | 'paragraph' | 'heading' | 'quote' | 'list'
  | 'standard_clean' | 'editorial_prose' | 'breaking_brief'
  | 'hero_headline' | 'sub_classic' | 'live_update'
  | 'impact_quote' | 'pull_quote' | 'tweet_style'
  | 'bullets_clean' | 'checklist_flow' | 'numbered_steps'
  | 'newspaper_standard' | 'breaking_alert' | 'police_siren' | 'tech_neon' | 'executive_summary' | 'vintage_letter'
  | 'footnote' | 'checklist_pro' | 'quote_modern_accent' | 'quote_elegant_editorial' | 'quote_breaking_card'
  | 'list_bullets_classic' | 'list_check_circle' | 'list_numbered_modern' | 'list_timeline_vertical' | 'list_cards_shadow'
  | 'divider_minimal' | 'divider_ornamental' | 'divider_dots' | 'separator';

export interface GlobalTextSettings {
  alignment: 'left' | 'center' | 'right' | 'justify';
  fontSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  marginTop: string;
  marginBottom: string;
}

export interface ImpactQuoteSettings {
  type: 'quote';
  borderPosition: 'left' | 'right' | 'none';
  borderWidth: 4 | 8 | 12 | 16;
  borderTone: 'themeDefault' | 'muted' | 'accent';
  backgroundSubtle: boolean;
  bigQuotes: boolean;
  quoteSize: 'sm' | 'md' | 'lg' | 'xl';
  author?: string;
  authorAlign: 'left' | 'right' | 'center';
}

export interface NewspaperStandardSettings {
  columnWidth: 'full' | 'prose';
  paragraphGap: 'compact' | 'normal' | 'relaxed';
  dropCap: boolean;
  dropCapLines: 2 | 3 | 4;
  hyphenation: 'off' | 'on';
  justify: boolean;
}

export interface ParagraphSettings {
  type: 'paragraph';
  dropCap: boolean;
  lineHeight: string;
  indent: boolean;
}

export interface HeadingSettings {
  type: 'heading';
  uppercase: boolean;
  italic: boolean;
  weight: 'normal' | 'bold' | 'black';
}

export interface QuoteSettings {
  type: 'quote';
  borderSide: 'left' | 'right' | 'none';
  showIcon: boolean;
}

export interface ListSettings {
  type: 'list';
  listStyle: 'bullet' | 'ordered' | 'check' | 'square';
  spacing: 'tight' | 'normal' | 'wide';
}

export type PerStyleSettings =
  | ParagraphSettings
  | HeadingSettings
  | QuoteSettings
  | ListSettings
  | ImpactQuoteSettings;

export interface EditorialTextSettings {
  global: GlobalTextSettings;
  perStyle: PerStyleSettings;
}

export interface TextBlockProps {
  block: ContentBlock;
  isSelected: boolean;
  onUpdate: (content: string) => void;
  onSelect: () => void;
  isMobileFormattingOpen?: boolean; // Novo
  onToggleMobileFormatting?: (isOpen: boolean) => void; // Novo
}
