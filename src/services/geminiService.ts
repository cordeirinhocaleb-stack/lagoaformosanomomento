
/*
 * SERVIÇO DE CONTEÚDO DETERMINÍSTICO (NO-AI)
 * ------------------------------------------------
 * Este arquivo substitui o antigo serviço de IA.
 * 
 * Agora opera como um agregador de:
 * 1. Feeds RSS (Notícias Externas)
 * 2. Templates Estáticos (Pão Diário)
 * 3. Cálculos Matemáticos (Clima, Fases da Lua)
 * 
 * NÃO INSERIR CHAMADAS A LLMs OU APIs GENERATIVAS AQUI.
 */

import { getSupabase } from './supabaseService';
import { DailyBreadData } from "../types";

// Imagens de Fallback Estáveis
export const CATEGORY_IMAGES: Record<string, string> = {
    'Política': 'https://placehold.co/600x400/1a1a1a/FFF?text=Politica',
    'Agro': 'https://placehold.co/600x400/166534/FFF?text=Agro',
    'Agronegócio': 'https://placehold.co/600x400/166534/FFF?text=Agro',
    'Tecnologia': 'https://placehold.co/600x400/2563eb/FFF?text=Tech',
    'Economia': 'https://placehold.co/600x400/0f172a/FFF?text=Economia',
    'Mundo': 'https://placehold.co/600x400/475569/FFF?text=Mundo',
    'Esporte': 'https://placehold.co/600x400/16a34a/FFF?text=Esporte',
    'Cultura': 'https://placehold.co/600x400/9333ea/FFF?text=Cultura',
    'Pop & Arte': 'https://placehold.co/600x400/9333ea/FFF?text=Cultura',
    'Cotidiano': 'https://placehold.co/600x400/f59e0b/FFF?text=Brasil',
    'Geral': 'https://placehold.co/600x400/000/FFF?text=Noticia',
};

// --- FUNÇÃO PRINCIPAL (RSS - SEM IA) ---
export const getExternalNews = async () => {
    const supabase = getSupabase();
    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // 1. Tenta buscar do Banco de Dados (Supabase) primeiro
    if (supabase) {
        try {
            const { data: dbNews } = await supabase
                .from('news')
                .select('*')
                .eq('source', 'rss_automation')
                .gte('createdAt', fortyEightHoursAgo)
                .order('createdAt', { ascending: false });

            if (dbNews && dbNews.length > 0) {
                console.log(`📰 [News] Carregado ${dbNews.length} itens do cache DB.`);
                const grouped: Record<string, any[]> = {};
                const seenTitles = new Set<string>();

                dbNews.forEach((row: any) => {
                    const normalizedTitle = row.title.trim().toLowerCase();
                    if (seenTitles.has(normalizedTitle)) return;
                    seenTitles.add(normalizedTitle);

                    if (!grouped[row.category]) { grouped[row.category] = []; }
                    grouped[row.category].push({
                        id: String(row.id),
                        title: typeof row.title === 'object' ? JSON.stringify(row.title) : String(row.title || 'Sem Título'),
                        sourceName: typeof row.author === 'object' ? 'Redação' : String(row.author || 'RSS'),
                        sourceUrl: typeof row.seo === 'object' ? String(row.seo?.canonicalUrl || '#') : '#',
                        imageUrl: (typeof row.image_url === 'string' ? row.image_url : '') || (typeof row.imageUrl === 'string' ? row.imageUrl : '') || '',
                        category: typeof row.category === 'object' ? 'Geral' : String(row.category || 'Geral'),
                        region: typeof row.region === 'object' ? 'Brasil' : String(row.region || 'Brasil'),
                        city: typeof row.city === 'object' ? 'Brasil' : String(row.city || 'Brasil'),
                        createdAt: String(row.createdAt || new Date().toISOString()),
                        theme: ['Política', 'Agronegócio', 'Esporte'].includes(String(row.category)) ? 'green' : 'blue'
                    });
                });

                return grouped;
            }
        } catch (e) {
            console.warn("⚠️ Falha ao ler cache RSS do Supabase:", e);
        }
    }

    // 2. Retorna dados MOCK como fallback (temporário até ter RSS automation)
    console.log("📰 [News] Usando dados MOCK de notícias externas (fallback)");
    return {
        'Política': [
            { id: 'mock-pol-1', title: 'Congresso aprova nova reforma tributária', sourceName: 'G1', sourceUrl: 'https://g1.globo.com', imageUrl: CATEGORY_IMAGES['Política'], category: 'Política', region: 'Brasil', city: 'Brasil', theme: 'green' },
            { id: 'mock-pol-2', title: 'Governo anuncia pacote de investimentos em infraestrutura', sourceName: 'UOL', sourceUrl: 'https://uol.com.br', imageUrl: CATEGORY_IMAGES['Política'], category: 'Política', region: 'Brasil', city: 'Brasil', theme: 'green' }
        ],
        'Economia': [
            { id: 'mock-eco-1', title: 'Dólar fecha em queda após decisão do Banco Central', sourceName: 'Valor', sourceUrl: 'https://valor.globo.com', imageUrl: CATEGORY_IMAGES['Economia'], category: 'Economia', region: 'Brasil', city: 'Brasil', theme: 'blue' },
            { id: 'mock-eco-2', title: 'Inflação desacelera em dezembro, aponta IBGE', sourceName: 'InfoMoney', sourceUrl: 'https://infomoney.com.br', imageUrl: CATEGORY_IMAGES['Economia'], category: 'Economia', region: 'Brasil', city: 'Brasil', theme: 'blue' }
        ],
        'Tecnologia': [
            { id: 'mock-tech-1', title: 'OpenAI lança nova versão do ChatGPT com recursos avançados', sourceName: 'TechCrunch', sourceUrl: 'https://techcrunch.com', imageUrl: CATEGORY_IMAGES['Tecnologia'], category: 'Tecnologia', region: 'Global', city: 'Mundo', theme: 'blue' },
            { id: 'mock-tech-2', title: 'Apple anuncia novos produtos para 2026', sourceName: 'The Verge', sourceUrl: 'https://theverge.com', imageUrl: CATEGORY_IMAGES['Tecnologia'], category: 'Tecnologia', region: 'Global', city: 'Mundo', theme: 'blue' }
        ],
        'Mundo': [
            { id: 'mock-world-1', title: 'Líderes mundiais se reúnem para discutir mudanças climáticas', sourceName: 'BBC', sourceUrl: 'https://bbc.com', imageUrl: CATEGORY_IMAGES['Mundo'], category: 'Mundo', region: 'Global', city: 'Mundo', theme: 'blue' },
            { id: 'mock-world-2', title: 'Eleições presidenciais movimentam cenário político europeu', sourceName: 'Reuters', sourceUrl: 'https://reuters.com', imageUrl: CATEGORY_IMAGES['Mundo'], category: 'Mundo', region: 'Global', city: 'Mundo', theme: 'blue' }
        ],
        'Agronegócio': [
            { id: 'mock-agro-1', title: 'Safra de soja bate recorde no Brasil', sourceName: 'Canal Rural', sourceUrl: 'https://canalrural.com.br', imageUrl: CATEGORY_IMAGES['Agronegócio'], category: 'Agronegócio', region: 'Brasil', city: 'Brasil', theme: 'green' },
            { id: 'mock-agro-2', title: 'Exportações do agro crescem 15% no primeiro trimestre', sourceName: 'Globo Rural', sourceUrl: 'https://globorural.globo.com', imageUrl: CATEGORY_IMAGES['Agronegócio'], category: 'Agronegócio', region: 'Brasil', city: 'Brasil', theme: 'green' }
        ]
    };
};

// Helper simples para calcular fase da lua (Matemático, sem IA)
const getMoonPhaseForDate = (date: Date) => {
    const synodic = 29.53058867;
    const baseDate = new Date("2000-01-06T18:14:00Z");
    const diffDays = (date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24);
    const cyclePos = diffDays % synodic;

    if (cyclePos < 1.84) { return "Lua Nova"; }
    if (cyclePos < 5.53) { return "Lua Crescente"; }
    if (cyclePos < 9.22) { return "Quarto Crescente"; }
    if (cyclePos < 12.91) { return "Crescente Gibosa"; }
    if (cyclePos < 16.61) { return "Lua Cheia"; }
    if (cyclePos < 20.30) { return "Minguante Gibosa"; }
    if (cyclePos < 23.99) { return "Quarto Minguante"; }
    if (cyclePos < 27.68) { return "Lua Minguante"; }
    return "Lua Nova";
};

export const getCurrentWeather = async () => {
    const today = new Date();
    const forecast: any[] = [];
    const days = ['Hoje', 'Amanhã', 'Qua', 'Qui'];
    const weatherIcons = ['fa-cloud-sun', 'fa-sun', 'fa-cloud-rain', 'fa-cloud'];
    const temps = [28, 29, 27, 25];
    const rain = [12, 0, 65, 20];

    let currentMoon = getMoonPhaseForDate(today);
    let moonChangeInfo = null;

    for (let i = 0; i < 4; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const phase = getMoonPhaseForDate(d);

        if (phase !== currentMoon && !moonChangeInfo && i > 0 && i <= 3) {
            moonChangeInfo = { newPhase: phase, daysFromNow: i, dayLabel: days[i] };
        }

        forecast.push({
            day: days[i],
            temp: temps[i],
            condition: 'Clima',
            icon: weatherIcons[i],
            rainChance: rain[i],
            moonPhase: i === 0 ? currentMoon : phase
        });
    }

    if (moonChangeInfo) { forecast[0].upcomingMoonChange = moonChangeInfo; }
    return forecast;
};

export const getDollarRate = async () => {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000); // 2 segundos timeout

        const res = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL', {
            signal: controller.signal
        });
        clearTimeout(timeout);

        const data = await res.json();
        return { rate: parseFloat(data.USDBRL.bid).toFixed(2).replace('.', ',') };
    } catch {
        // Retorna valor fixo sem logar erro (API offline)
        return { rate: "5,85" };
    }
};

/**
 * GERA PÃO DIÁRIO (SEM IA)
 * Usa lista estática rotativa baseada no dia do ano
 */
export const generateDailyBreadContent = async (dateStr: string): Promise<DailyBreadData> => {
    // Lista fixa de mensagens inspiradoras
    const messages = [
        { verse: "O Senhor é o meu pastor, nada me faltará.", reference: "Salmos 23:1", reflection: "Deus cuida de cada detalhe da sua vida.", wordOfDay: "CUIDADO", theme: "Provisão" },
        { verse: "Tudo posso naquele que me fortalece.", reference: "Filipenses 4:13", reflection: "A força verdadeira vem do alto.", wordOfDay: "FORÇA", theme: "Fortaleza" },
        { verse: "O amor é paciente, o amor é bondoso.", reference: "1 Coríntios 13:4", reflection: "Pratique a paciência no seu dia a dia.", wordOfDay: "AMOR", theme: "Virtudes" },
        { verse: "No mundo tereis aflições, mas tende bom ânimo.", reference: "João 16:33", reflection: "Não desanime diante dos obstáculos.", wordOfDay: "ÂNIMO", theme: "Coragem" },
        { verse: "A alegria do Senhor é a vossa força.", reference: "Neemias 8:10", reflection: "Sorria, pois Deus está no controle.", wordOfDay: "ALEGRIA", theme: "Felicidade" },
        { verse: "Entrega o teu caminho ao Senhor; confia nele.", reference: "Salmos 37:5", reflection: "Descansar é um ato de fé.", wordOfDay: "CONFIANÇA", theme: "Fé" },
        { verse: "Lâmpada para os meus pés é a tua palavra.", reference: "Salmos 119:105", reflection: "A Bíblia ilumina nossas decisões.", wordOfDay: "LUZ", theme: "Direção" },
        { verse: "Pedi, e dar-se-vos-á; buscai, e encontrareis.", reference: "Mateus 7:7", reflection: "A oração abre portas.", wordOfDay: "BUSCA", theme: "Oração" },
        { verse: "O Senhor te guardará de todo o mal.", reference: "Salmos 121:7", reflection: "Sinta-se protegido hoje.", wordOfDay: "PROTEÇÃO", theme: "Segurança" },
        { verse: "Sede fortes e corajosos.", reference: "Josué 1:9", reflection: "Avance sem medo.", wordOfDay: "CORAGEM", theme: "Vitória" }
    ];

    const date = new Date(dateStr);
    // Usa o dia do ano para selecionar o índice (determinístico)
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    const index = dayOfYear % messages.length;

    return { date: dateStr, ...messages[index] };
};

/**
 * GERA LEGENDAS SOCIAIS (SEM IA)
 * Usa templates de string padronizados
 */
export const adaptContentForSocialMedia = async (title: string, lead: string, category: string) => {
    const cleanLead = lead.substring(0, 150);
    const baseLink = "https://lagoaformosanomomento.com.br/noticia";
    const dateStr = new Date().toLocaleDateString('pt-BR');

    return {
        instagram_feed: `🚨 ${title.toUpperCase()} 🚨\n\n${cleanLead}...\n\n📅 ${dateStr}\n📍 Lagoa Formosa e Região\n\n👉 Leia a matéria completa no link da bio.\n\n#lagoaformosa #noticias #${category.toLowerCase()} #altoparanaiba`,
        instagram_stories: `NO MOMENTO:\n${title}\n\n👆 TOQUE NO LINK PARA LER 👆`,
        facebook: `📰 NOTÍCIA: ${title}\n\n${lead}\n\nConfira todos os detalhes em nosso portal. O que você acha disso? Deixe sua opinião nos comentários!\n\n🔗 ${baseLink}`,
        whatsapp: `*PLANTÃO LAGOA FORMOSA* 🚨\n\n*${title}*\n\n${cleanLead}...\n\nLeia mais clicando aqui: ${baseLink}`,
        linkedin: `📄 Atualização sobre ${category}: ${title}.\n\nPara o setor de ${category} em Lagoa Formosa e região, este acontecimento traz impactos importantes. Confira a análise completa.`
    };
};
