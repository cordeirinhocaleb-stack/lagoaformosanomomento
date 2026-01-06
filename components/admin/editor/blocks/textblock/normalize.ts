
import { ContentBlock } from '@/types';
import { EditorialStyle, EditorialTextSettings } from './types';
import { getDefaultSettings } from './defaults';

/**
 * Normaliza os dados de um bloco de texto, garantindo que as configurações
 * editoriais e variantes existam, aplicando fallbacks seguros e centralizados.
 */
export const normalizeTextBlockData = (block: ContentBlock) => {
  const type = block.type as EditorialStyle;
  const settings = block.settings || {};

  // 1. Recupera as configurações editoriais base (Global + PerStyle base)
  const editorial: EditorialTextSettings = settings.editorial || getDefaultSettings(type);

  // 2. Determina a variante visual (Oficial do Estúdio)
  let variant = settings.editorialVariant || 'newspaper_standard';
  
  // Fallback de variante baseado no tipo de bloco se não definido
  if (!settings.editorialVariant) {
      if (type === 'list') variant = 'bullets_clean';
      if (type === 'quote') variant = 'impact_quote';
      if (type === 'heading') variant = 'hero_headline';
  }

  // 3. Garante acesso seguro ao objeto de configurações de variantes específicas
  const perStyle = { ...(settings.perStyle || {}) };

  // 4. Injeta fallbacks para a variante ativa
  if (variant === 'newspaper_standard' && !perStyle.newspaper_standard) {
    perStyle.newspaper_standard = { columnWidth: 'full', paragraphGap: 'normal', dropCap: false, dropCapLines: 2, hyphenation: 'off', justify: false };
  } else if (variant === 'impact_quote' && !perStyle.impact_quote) {
    perStyle.impact_quote = { borderPosition: 'left', borderWidth: 8, borderTone: 'accent', backgroundSubtle: true, bigQuotes: true, quoteSize: 'lg', authorAlign: 'right' };
  } else if (variant === 'hero_headline' && !perStyle.hero_headline) {
    perStyle.hero_headline = { shadowDepth: 4, weight: 900, width: 'full' };
  } else if (['bullets_clean', 'bullets_square', 'numbered_steps', 'timeline_dots'].includes(variant)) {
    // UPDATED: Garante que os novos campos de lista tenham valores padrão
    perStyle[variant] = { 
        spacing: perStyle[variant]?.spacing || 'normal',
        markerColor: perStyle[variant]?.markerColor || 'default',
        fontSize: perStyle[variant]?.fontSize || 'normal',
        weight: perStyle[variant]?.weight || 'normal'
    };
  }

  return {
    editorial,
    variant,
    perStyle,
    listType: settings.listType || (variant === 'numbered_steps' ? 'ordered' : 'unordered')
  };
};
