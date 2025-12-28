import { GoogleGenAI, Type } from "@google/genai";

// Este serviço garante velocidade máxima e carregamento instantâneo.

const CACHE_KEY = 'lfnm_brazil_news_cache_v2'; // Versão alterada para invalidar cache antigo
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos

/**
 * Notícias estáticas de segurança (Fallback)
 * Garante que o site NUNCA apareça vazio na primeira visita.
 */
export const STATIC_BRAZIL_NEWS = [
  { title: "Governo Federal projeta crescimento do PIB acima do esperado para este semestre", sourceName: "Economia", sourceUrl: "https://g1.globo.com/economia/", category: "Brasil" },
  { title: "Congresso avança em votação de pautas prioritárias para o desenvolvimento regional", sourceName: "Política", sourceUrl: "https://g1.globo.com/politica/", category: "Brasília" },
  { title: "Safra recorde de grãos impulsiona exportações do agronegócio brasileiro", sourceName: "Agro", sourceUrl: "https://globorural.globo.com/", category: "Economia" },
  { title: "Ministério da Saúde anuncia nova campanha nacional de vacinação", sourceName: "Saúde", sourceUrl: "https://www.gov.br/saude", category: "Serviço" },
  { title: "Novas tecnologias 5G chegam a mais municípios do interior do país", sourceName: "Tecnologia", sourceUrl: "https://g1.globo.com/tecnologia/", category: "Inovação" },
  { title: "Banco Central mantém estabilidade na taxa de juros visando controle da inflação", sourceName: "Mercado", sourceUrl: "https://www.cnnbrasil.com.br/economia/", category: "Finanças" }
];

/**
 * Busca notícias nacionais de Política via RSS com Timeout e Fallback Agressivo
 */
export const getBrazilNationalNews = async () => {
  const now = Date.now();
  const saved = localStorage.getItem(CACHE_KEY);
  
  // 1. Verifica Cache
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Só usa o cache se não estiver vazio e estiver dentro do tempo
      if (parsed.data && parsed.data.length > 0 && (now - parsed.timestamp < CACHE_DURATION)) {
        return parsed.data;
      }
    } catch (e) {
      localStorage.removeItem(CACHE_KEY);
    }
  }

  const feeds = [
    { name: 'G1', url: 'https://g1.globo.com/rss/g1/politica/', category: 'Brasília' },
    { name: 'CNN', url: 'https://www.cnnbrasil.com.br/politica/feed/', category: 'Política' }
  ];

  try {
    // 2. Cria uma promessa de Timeout de 5 segundos
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout")), 5000)
    );

    // 3. Executa a busca real
    const fetchPromise = Promise.all(feeds.map(async (feed) => {
      try {
        // Usa serviço alternativo se o principal falhar, ou tenta carregar direto
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`);
        
        if (!response.ok) throw new Error('API Error');
        
        const data = await response.json();
        
        if (data.status !== 'ok' || !data.items) return [];

        return (data.items || []).slice(0, 4).map((item: any) => ({
          title: item.title,
          sourceName: feed.name,
          sourceUrl: item.link,
          category: feed.category
        }));
      } catch (err) { 
        return []; 
      }
    }));

    // 4. Corrida entre o Fetch e o Timeout
    // Se a API demorar, o timeout ganha e usamos o estático imediatamente
    const allNewsRaw = await Promise.race([fetchPromise, timeoutPromise]) as any[][];
    
    const result = allNewsRaw.flat().filter(item => item && item.title);

    // Se falhou tudo (array vazio), retorna estático
    if (result.length === 0) {
      return STATIC_BRAZIL_NEWS;
    }

    // Sucesso: Salva no cache
    localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: now, data: result }));
    return result;

  } catch (e) {
    // Erro de Timeout ou Rede: Retorna Estático instantaneamente
    // Não limpa o cache antigo se existir, tenta usar ele como backup secundário
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if(parsed.data.length > 0) return parsed.data;
        } catch {}
    }
    return STATIC_BRAZIL_NEWS;
  }
};

/**
 * Clima Direto (Dados Estáticos Otimizados para Lagoa Formosa)
 * CEP: 38720-000
 */
export const getCurrentWeather = async () => {
  // Simulação simples de fase da lua baseada no dia (apenas visual)
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

/**
 * Cotação do Dólar via API de Economia (Resposta em Milissegundos)
 */
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
 * Pão Diário (Banco de Dados Local - Carregamento Instantâneo)
 */
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

// --- FUNÇÃO AUXILIAR DE TEMPLATE (FALLBACK) ---
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

/**
 * Adaptação de Conteúdo para Redes Sociais (Com Inteligência Artificial Gemini)
 * Tenta usar IA para gerar textos personalizados. Se falhar ou sem chave, usa templates.
 */
export const adaptContentForSocialMedia = async (title: string, lead: string, category: string) => {
  try {
    // Tenta obter a chave da API do ambiente. 
    // Em produção, isso deve vir de process.env.API_KEY configurado no servidor ou build.
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      console.warn("API_KEY não encontrada. Usando templates locais.");
      return generateFallbackSocialContent(title, lead, category);
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Prompt Otimizado para Social Media Manager
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
    
    // Fallback caso a IA retorne vazio
    if (!json.instagram) throw new Error("IA retornou resposta vazia");

    return {
       instagram_feed: json.instagram,
       instagram_stories: `NO MOMENTO:\n${title}\n\n👆 TOQUE NO LINK PARA LER 👆`, // Stories geralmente é visual, mantemos padrão
       facebook: json.facebook,
       whatsapp: json.whatsapp,
       linkedin: json.linkedin
    };

  } catch (error) {
    console.error("Erro na geração via Gemini:", error);
    return generateFallbackSocialContent(title, lead, category);
  }
};