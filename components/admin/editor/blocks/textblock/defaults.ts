import { EditorialStyle, EditorialTextSettings, GlobalTextSettings, NewspaperStandardSettings, ImpactQuoteSettings } from './types';

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
