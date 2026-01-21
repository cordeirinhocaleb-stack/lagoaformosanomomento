import { NewsItem } from '../../../types';

export const calculateReadTime = (news: NewsItem) => {
    let text = news.content || "";
    if (news.blocks) {
        text += news.blocks.map(b => typeof b.content === 'string' ? b.content : '').join(" ");
    }
    const cleanText = text.replace(/<[^>]*>?/gm, '');
    const words = cleanText.split(/\s+/).length;
    const minutes = Math.ceil(words / 220);
    return Math.max(1, minutes);
};

export const generateTOC = (news: NewsItem) => {
    const headings: { id: string; text: string }[] = [];
    if (news.blocks) {
        news.blocks.forEach((block, idx) => {
            if (block.type === 'heading') {
                const text = typeof block.content === 'string' ? block.content : '';
                if (text) {
                    headings.push({ id: `heading-block-${idx}`, text });
                }
            }
        });
    }
    if (headings.length === 0 && news.content) {
       const regex = /<h[2-3][^>]*>(.*?)<\/h[2-3]>/gi;
       let match;
       let i = 0;
       while ((match = regex.exec(news.content)) !== null) {
           headings.push({ id: `legacy-h-${i++}`, text: match[1].replace(/<[^>]*>/g, '') });
       }
    }
    return headings;
};