
import { GoogleGenAI, Type } from "@google/genai";
import { getSupabase } from './supabaseService';

// Imagens de Fallback Estáveis (Placehold.co evita problemas de CORS/ORB do Unsplash)
const CATEGORY_IMAGES: Record<string, string> = {
    'Política': 'https://placehold.co/600x400/1a1a1a/FFF?text=Politica',
    'Agronegócio': 'https://placehold.co/600x400/166534/FFF?text=Agro',
    'Tecnologia': 'https://placehold.co/600x400/2563eb/FFF?text=Tech',
    'Economia': 'https://placehold.co/600x400/0f172a/FFF?text=Economia',
    'Mundo': 'https://placehold.co/600x400/475569/FFF?text=Mundo'
};

// --- FUNÇÃO PRINCIPAL ---
export const getExternalNews = async () => {
  const supabase = getSupabase();
  const now = new Date();
  
  // CACHE: Define o limite de tempo para 1 hora atrás
  // Se houver notícias no banco criadas nos últimos 60 minutos, usa elas.
  // Caso contrário, busca novas do RSS.
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

  // 1. Tenta buscar do Banco de Dados (Supabase) primeiro
  if (supabase) {
      try {
        const { data: dbNews } = await supabase
            .from('news')
            .select('*')
            .eq('source', 'rss_automation')
            .gte('createdAt', oneHourAgo); // Busca apenas notícias da última hora
        
        if (dbNews && dbNews.length > 0) {
             console.log("📰 [News] Carregado do cache horário (últimos 60min) do Banco de Dados.");
             const grouped: Record<string, any[]> = {};
             
             dbNews.forEach((row: any) => {
                 if (!grouped[row.category]) grouped[row.category] = [];
                 grouped[row.category].push({
                     title: row.title,
                     sourceName: row.author || 'RSS',
                     sourceUrl: row.seo?.canonicalUrl || '#',
                     imageUrl: row.imageUrl,
                     category: row.category,
                     theme: ['Política', 'Agronegócio'].includes(row.category) ? 'green' : 'blue'
                 });
             });
             
             return grouped;
        }
      } catch (e) {
          console.warn("⚠️ Falha ao ler cache RSS do Supabase:", e);
      }
  }

  // 2. Se não estiver no banco (ou cache expirou), busca dos Feeds RSS
  console.log("🌍 [News] Cache expirado ou vazio. Buscando novos feeds RSS...");
  const feeds = [
      { key: 'Política', url: 'https://g1.globo.com/rss/g1/politica/', theme: 'green' },
      { key: 'Agronegócio', url: 'https://www.canalrural.com.br/feed/', theme: 'green' },
      { key: 'Tecnologia', url: 'https://g1.globo.com/rss/g1/tecnologia/', theme: 'blue' },
      { key: 'Economia', url: 'https://g1.globo.com/rss/g1/economia/', theme: 'blue' },
      { key: 'Mundo', url: 'https://g1.globo.com/rss/g1/mundo/', theme: 'blue' }
  ];

  try {
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 10000));

    const promises = feeds.map(async (feed) => {
        try {
            // Usa api.rss2json.com para converter XML -> JSON
            const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`);
            const data = await res.json();
            
            if (data.status !== 'ok' || !data.items) throw new Error("Feed vazio");

            const items = data.items.slice(0, 5).map((item: any) => {
                let img = item.enclosure?.link || item.thumbnail;
                
                if (!img && item.description) {
                    const imgMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
                    if(imgMatch) img = imgMatch[1];
                }
                if (!img && item.content) {
                    const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
                    if(imgMatch) img = imgMatch[1];
                }
                
                // Fallback para imagem segura se não encontrar ou se falhar
                if (!img) img = CATEGORY_IMAGES[feed.key];

                let sourceName = 'G1';
                if (feed.key === 'Agronegócio') sourceName = 'Canal Rural';
                else if (feed.key === 'Política') sourceName = 'G1 Política';

                return {
                    title: item.title,
                    sourceName: sourceName,
                    sourceUrl: item.link,
                    category: feed.key,
                    imageUrl: img,
                    theme: feed.theme
                };
            });
            
            return { key: feed.key, items };
        } catch (feedError) {
            console.warn(`Erro ao carregar feed de ${feed.key}:`, feedError);
            return { key: feed.key, items: [] }; 
        }
    });

    const results = await Promise.race([Promise.all(promises), timeoutPromise]) as any[];
    
    const finalData = results.reduce((acc, curr) => {
        if(curr && curr.key) {
            acc[curr.key] = curr.items;
        }
        return acc;
    }, {} as Record<string, any[]>);

    // 3. Salvar no Supabase (Cache Horário)
    if (supabase) {
        const newsToInsert: any[] = [];
        Object.entries(finalData).forEach(([category, items]: [string, any[]]) => {
            if (items && items.length > 0) {
                items.forEach(item => {
                    newsToInsert.push({
                        id: `rss_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                        title: item.title,
                        lead: item.title,
                        content: `Notícia importada automaticamente de ${item.sourceName}. <a href="${item.sourceUrl}" target="_blank">Ler original</a>.`,
                        category: category,
                        author: item.sourceName,
                        authorId: 'rss_automator',
                        status: 'published',
                        source: 'rss_automation',
                        imageUrl: item.imageUrl,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        isBreaking: false,
                        isFeatured: false,
                        seo: { canonicalUrl: item.sourceUrl },
                        city: 'Mundo',
                        region: 'Global',
                        views: 0
                    });
                });
            }
        });

        if (newsToInsert.length > 0) {
            console.log(`💾 [DB] Salvando ${newsToInsert.length} novas notícias RSS no Supabase...`);
            supabase.from('news').insert(newsToInsert).then(({ error }) => {
                if(error) console.error("Erro ao salvar RSS no banco:", error.message || JSON.stringify(error));
            });
        }
    }

    return finalData;

  } catch (e) {
    console.warn("RSS Fetch failed globally. Returning empty object.", e);
    return {};
  }
};

export const getCurrentWeather = async () => {
  const phases = ['Lua Nova', 'Lua Crescente', 'Lua Cheia', 'Lua Minguante'];
  const dayOfMonth = new Date().getDate();
  const phaseIndex = Math.floor(dayOfMonth / 7.5) % 4;
  const currentMoon = phases[phaseIndex];

  return [
    { day: 'Hoje', temp: 28, condition: 'Parcialmente Nublado', icon: 'fa-cloud-sun', moonPhase: currentMoon },
    { day: 'Amanhã', temp: 29, condition: 'Ensolarado', icon: 'fa-sun' },
    { day: 'Qua', temp: 27, condition: 'Pancadas de Chuva', icon: 'fa-cloud-rain' },
    { day: 'Qui', temp: 25, condition: 'Nublado', icon: 'fa-cloud' }
  ];
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

export const getDailyBiblicalMessage = async () => {
  const messages = [
    { verse: "O Senhor é o meu pastor, nada me faltará.", reference: "Salmos 23:1", reflection: "Deus cuida de cada detalhe da sua vida em Lagoa Formosa.", wordOfDay: "CUIDADO" },
    { verse: "Tudo posso naquele que me fortalece.", reference: "Filipenses 4:13", reflection: "Não desista dos seus projetos, a força vem do alto.", wordOfDay: "FORÇA" },
    { verse: "Onde houver fé, haverá milagres.", reference: "Mateus 17:20", reflection: "Acredite que o melhor está por vir para nossa região.", wordOfDay: "FÉ" },
    { verse: "Seja forte e corajoso! Não desanime.", reference: "Josué 1:9", reflection: "Encare os desafios de hoje com coragem e determinação.", wordOfDay: "CORAGEM" }
  ];
  const dayIndex = new Date().getDate() % messages.length;
  return messages[dayIndex];
};

export const adaptContentForSocialMedia = async (title: string, lead: string, category: string) => {
  try {
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      console.warn("API_KEY não encontrada. Usando templates locais.");
      return generateFallbackSocialContent(title, lead, category);
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `Você é o Social Media Manager do jornal "Lagoa Formosa no Momento".
    Crie legendas para redes sociais baseadas nesta notícia:
    
    Título: ${title}
    Resumo: ${lead}
    Categoria: ${category}
    
    Gere um JSON com os campos:
    - instagram (Casual, use emojis e hashtags relevantes como #LagoaFormosa)
    - facebook (Informativo e engajador para comunidade local)
    - whatsapp (Urgente, curto, estilo "Breaking News" com emojis de alerta)
    - linkedin (Profissional e analítico)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                instagram: { type: Type.STRING },
                facebook: { type: Type.STRING },
                whatsapp: { type: Type.STRING },
                linkedin: { type: Type.STRING }
            }
        }
      }
    });

    const json = JSON.parse(response.text || '{}');
    if (!json.instagram) throw new Error("IA retornou resposta vazia");

    return {
       instagram_feed: json.instagram,
       instagram_stories: `NO MOMENTO:\n${title}\n\n👆 TOQUE NO LINK PARA LER 👆`,
       facebook: json.facebook,
       whatsapp: json.whatsapp,
       linkedin: json.linkedin
    };

  } catch (error: any) {
    // Tratamento robusto de erros para evitar crashes ou logs excessivos
    // Se for erro de cota (429) ou qualquer outro, fallback imediato
    console.warn("⚠️ Gemini API indisponível ou cota excedida. Usando templates locais.", error.message || error);
    return generateFallbackSocialContent(title, lead, category);
  }
};

const generateFallbackSocialContent = (title: string, lead: string, category: string) => {
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
