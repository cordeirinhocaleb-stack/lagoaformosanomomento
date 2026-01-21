
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
const CATEGORY_IMAGES: Record<string, string> = {
    'Política': 'https://placehold.co/600x400/1a1a1a/FFF?text=Politica',
    'Agronegócio': 'https://placehold.co/600x400/166534/FFF?text=Agro',
    'Tecnologia': 'https://placehold.co/600x400/2563eb/FFF?text=Tech',
    'Economia': 'https://placehold.co/600x400/0f172a/FFF?text=Economia',
    'Mundo': 'https://placehold.co/600x400/475569/FFF?text=Mundo',
    'Esporte': 'https://placehold.co/600x400/16a34a/FFF?text=Esporte',
    'Cultura': 'https://placehold.co/600x400/9333ea/FFF?text=Cultura',
    'Cotidiano': 'https://placehold.co/600x400/f59e0b/FFF?text=Brasil'
};

// --- FUNÇÃO PRINCIPAL (RSS - SEM IA) ---
export const getExternalNews = async () => {
    const supabase = getSupabase();
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

    // 1. Tenta buscar do Banco de Dados (Supabase) primeiro
    if (supabase) {
        try {
            const { data: dbNews } = await supabase
                .from('news')
                .select('*')
                .eq('source', 'rss_automation')
                .gte('createdAt', oneHourAgo);

            if (dbNews && dbNews.length > 0) {
                console.log("📰 [News] Carregado do cache DB.");
                const grouped: Record<string, any[]> = {};

                dbNews.forEach((row: any) => {
                    if (!grouped[row.category]) { grouped[row.category] = []; }
                    grouped[row.category].push({
                        title: row.title,
                        sourceName: row.author || 'RSS',
                        sourceUrl: row.seo?.canonicalUrl || '#',
                        imageUrl: row.image_url || row.imageUrl, // Fix: mapping snake_case from DB
                        category: row.category,
                        theme: ['Política', 'Agronegócio', 'Esporte'].includes(row.category) ? 'green' : 'blue'
                    });
                });

                return grouped;
            }
        } catch (e) {
            console.warn("⚠️ Falha ao ler cache RSS do Supabase:", e);
        }
    }

    // Retorna vazio se não houver cache
    return {};
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
