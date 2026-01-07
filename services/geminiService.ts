
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
                        imageUrl: row.imageUrl,
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

    // 2. Busca RSS se cache expirou
    console.log("🌍 [News] Buscando novos feeds RSS...");
    const feeds = [
        { key: 'Política', url: 'https://g1.globo.com/rss/g1/politica/', theme: 'green' },
        { key: 'Agronegócio', url: 'https://www.canalrural.com.br/feed/', theme: 'green' },
        { key: 'Tecnologia', url: 'https://g1.globo.com/rss/g1/tecnologia/', theme: 'blue' },
        { key: 'Economia', url: 'https://g1.globo.com/rss/g1/economia/', theme: 'blue' },
        { key: 'Mundo', url: 'https://g1.globo.com/rss/g1/mundo/', theme: 'blue' },
        { key: 'Esporte', url: 'https://ge.globo.com/rss/ge/', theme: 'green' },
        { key: 'Cultura', url: 'https://g1.globo.com/rss/g1/pop-arte/', theme: 'blue' },
        { key: 'Cotidiano', url: 'https://g1.globo.com/rss/g1/brasil/', theme: 'blue' }
    ];

    try {
        // TIMEOUT REDUZIDO PARA 4 SEGUNDOS (Evita travamento de UI "Conectando...")
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 4000));

        const promises = feeds.map(async (feed) => {
            try {
                const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`);
                const data = await res.json();

                if (data.status !== 'ok' || !data.items) { throw new Error("Feed vazio"); }

                const items = data.items.slice(0, 5).map((item: any) => {
                    let img = item.enclosure?.link || item.thumbnail;

                    // Extração de imagem via Regex simples (sem IA)
                    if (!img && item.description) {
                        const imgMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
                        if (imgMatch) { img = imgMatch[1]; }
                    }

                    if (!img) { img = CATEGORY_IMAGES[feed.key]; }

                    // Limpeza de texto básica
                    let cleanDescription = "";
                    if (item.description) {
                        const tempDiv = document.createElement("div");
                        tempDiv.innerHTML = item.description;
                        cleanDescription = tempDiv.textContent || tempDiv.innerText || "";
                        cleanDescription = cleanDescription.replace(/\s+/g, ' ').trim();
                        if (cleanDescription.length > 200) { cleanDescription = cleanDescription.substring(0, 200) + "..."; }
                    }

                    return {
                        title: item.title,
                        sourceName: feed.key === 'Agronegócio' ? 'Canal Rural' : 'G1',
                        sourceUrl: item.link,
                        category: feed.key,
                        imageUrl: img,
                        description: cleanDescription,
                        theme: feed.theme
                    };
                });

                return { key: feed.key, items };
            } catch (feedError) {
                return { key: feed.key, items: [] };
            }
        });

        const results = await Promise.race([Promise.all(promises), timeoutPromise]) as any[];

        const finalData = results.reduce((acc, curr) => {
            if (curr && curr.key) { acc[curr.key] = curr.items; }
            return acc;
        }, {} as Record<string, any[]>);

        // 3. Salvar no Supabase (Cache) - SOMENTE SE HOUVER USUÁRIO AUTENTICADO
        if (supabase) {
            // Verifica sessão atual para evitar erro 401 (Visitantes não podem escrever)
            const { data: { session } } = await supabase.auth.getSession();
            const canWrite = !!session; // Apenas usuários logados podem atualizar o cache

            if (canWrite) {
                const newsToInsert: any[] = [];
                Object.entries(finalData).forEach(([category, items]) => {
                    if (items && Array.isArray(items)) {
                        (items as any[]).forEach(item => {
                            // Gera UUID válido em vez de string com prefixo rss_
                            const entryId = crypto.randomUUID?.() ||
                                '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c: any) =>
                                    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
                                );

                            newsToInsert.push({
                                id: entryId,
                                title: item.title,
                                lead: item.description || item.title,
                                content: `Notícia importada automaticamente. <a href="${item.sourceUrl}" target="_blank">Ler original</a>.`,
                                category: category,
                                author: item.sourceName,
                                author_id: null, // Identificado como snake_case no schema
                                status: 'published',
                                source: 'rss_automation',
                                image_url: item.imageUrl, // Identificado como snake_case no schema
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString(),
                                is_breaking: false,
                                is_featured: false,
                                seo: { canonicalUrl: item.sourceUrl },
                                city: 'Brasil',
                                region: category === 'Mundo' ? 'Global' : 'Brasil',
                                views: 0
                            });
                        });
                    }
                });

                if (newsToInsert.length > 0) {
                    // Async insert (don't block)
                    const saveRSS = async () => {
                        try {
                            const { error } = await (supabase.from('news').insert(newsToInsert) as any);
                            if (error) { console.warn("⚠️ Falha ao salvar cache RSS (provável RLS):", error); }
                            else {
                                console.log("✅ Cache RSS atualizado com sucesso.");

                                // [ROTATION] Cleanup old news (Limit 100)
                                // Only keep the newest 100 items from 'rss_automation'
                                try {
                                    // 1. Get IDs of the newest 100 items
                                    const { data: keepData } = await supabase
                                        .from('news')
                                        .select('id')
                                        .eq('source', 'rss_automation')
                                        .order('created_at', { ascending: false })
                                        .limit(100);

                                    if (keepData && keepData.length === 100) {
                                        const oldestAllowedId = keepData[99].id; // The 100th item
                                        const { data: keepDateData } = await supabase.from('news').select('created_at').eq('id', oldestAllowedId).single();

                                        if (keepDateData) {
                                            // Delete anything OLDER than the 100th item
                                            const { error: deleteError } = await supabase
                                                .from('news')
                                                .delete()
                                                .eq('source', 'rss_automation')
                                                .lt('created_at', keepDateData.created_at);

                                            if (deleteError) { console.warn("⚠️ Falha na rotação de notícias (Cleanup):", deleteError); }
                                            else { console.log("🧹 Rotação concluída: Notícias antigas removidas."); }
                                        }
                                    }
                                } catch (cleanupError) {
                                    console.warn("⚠️ Erro na rotina de limpeza:", cleanupError);
                                }
                            }
                        } catch (err: any) {
                            console.error("❌ Erro crítico ao salvar RSS:", err);
                        }
                    };
                    saveRSS();
                }
            } else {
                console.log("ℹ️ Visitante: Pular atualização de cache RSS (Read-Only).");
            }
        }

        return finalData;

    } catch (e) {
        // Em caso de timeout ou erro, retorna objeto vazio
        return {};
    }
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
        const res = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL');
        const data = await res.json();
        return { rate: parseFloat(data.USDBRL.bid).toFixed(2).replace('.', ',') };
    } catch {
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
