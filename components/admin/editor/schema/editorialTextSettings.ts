
import { ContentBlock } from '@/types';

/**
 * Definição dos estilos editoriais suportados pelo TextBlock
 */
export type EditorialStyle = 'paragraph' | 'heading' | 'quote' | 'list';

/**
 * Configurações globais de layout e tipografia comuns a todos os estilos de texto
 */
export interface GlobalTextSettings {
  alignment: 'left' | 'center' | 'right' | 'justify';
  fontSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  marginTop: string;
  marginBottom: string;
}

/**
 * Configurações específicas para o estilo Citação de Impacto (impact_quote)
 */
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

/**
 * Configurações específicas para o estilo Jornal Padrão (newspaper_standard)
 */
export interface NewspaperStandardSettings {
  columnWidth: 'full' | 'prose';
  paragraphGap: 'compact' | 'normal' | 'relaxed';
  dropCap: boolean;
  dropCapLines: 2 | 3 | 4;
  hyphenation: 'off' | 'on';
  justify: boolean;
}

/**
 * Configurações específicas para Parágrafos
 */
export interface ParagraphSettings {
  type: 'paragraph';
  dropCap: boolean;
  lineHeight: string;
  indent: boolean;
}

/**
 * Configurações específicas para Manchetes/Títulos
 */
export interface HeadingSettings {
  type: 'heading';
  uppercase: boolean;
  italic: boolean;
  weight: 'normal' | 'bold' | 'black';
}

/**
 * Configurações específicas para Citações/Aspas (Legado/Simples)
 */
export interface QuoteSettings {
  type: 'quote';
  borderSide: 'left' | 'right' | 'none';
  showIcon: boolean;
}

/**
 * Configurações específicas para Listas
 */
export interface ListSettings {
  type: 'list';
  listStyle: 'bullet' | 'ordered' | 'check';
  spacing: 'tight' | 'normal' | 'wide';
}

/**
 * União de configurações por estilo
 */
export type PerStyleSettings = 
  | ParagraphSettings 
  | HeadingSettings 
  | QuoteSettings 
  | ListSettings
  | ImpactQuoteSettings;

/**
 * Estrutura completa de configuração editorial de um bloco de texto
 */
export interface EditorialTextSettings {
  global: GlobalTextSettings;
  perStyle: PerStyleSettings;
}

/**
 * Retorna as configurações padrão baseadas no tipo de bloco
 * @param style O tipo do bloco (paragraph, heading, quote, list)
 */
export const getDefaultSettings = (style: EditorialStyle): EditorialTextSettings => {
  const globalDefaults: GlobalTextSettings = {
    alignment: 'left',
    fontSize: 'md',
    marginTop: '0px',
    marginBottom: '24px',
  };

  const newspaperDefaults: NewspaperStandardSettings = {
    columnWidth: 'full',
    paragraphGap: 'normal',
    dropCap: false,
    dropCapLines: 2,
    hyphenation: 'off',
    justify: false
  };

  const impactQuoteDefaults: ImpactQuoteSettings = {
    type: 'quote',
    borderPosition: 'left',
    borderWidth: 8,
    borderTone: 'accent',
    backgroundSubtle: true,
    bigQuotes: true,
    quoteSize: 'lg',
    author: '',
    authorAlign: 'right'
  };

  switch (style) {
    case 'heading':
      return {
        global: { ...globalDefaults, fontSize: '2xl', marginBottom: '32px' },
        perStyle: { type: 'heading', uppercase: true, italic: true, weight: 'black' } as any,
      };
    case 'quote':
      return {
        global: { ...globalDefaults, fontSize: 'xl', alignment: 'center', marginBottom: '40px' },
        perStyle: impactQuoteDefaults,
      };
    case 'list':
      return {
        global: { ...globalDefaults, marginBottom: '24px' },
        perStyle: { type: 'list', listStyle: 'bullet', spacing: 'normal' } as any,
      };
    case 'paragraph':
    default:
      return {
        global: globalDefaults,
        perStyle: { 
            type: 'paragraph', 
            dropCap: false, 
            lineHeight: '1.8', 
            indent: false,
            newspaper_standard: newspaperDefaults 
        } as any,
      };
  }
};
