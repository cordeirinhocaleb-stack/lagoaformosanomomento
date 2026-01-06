
import { ContentBlock } from '@/types';

export type EditorialStyle = 'paragraph' | 'heading' | 'quote' | 'list';

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
  listStyle: 'bullet' | 'ordered' | 'check';
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
