
import { NhostClient } from "@nhost/nhost-js";
import { NewsItem, Advertiser, User, Job } from '../types';

let nhost: NhostClient | null = null;

export const initNhost = (subdomain: string, region: string) => {
  nhost = new NhostClient({
    subdomain,
    region,
  });
  return nhost;
};

export const getNhost = () => nhost;

// Teste de conexão (simples health check ou query pública)
export const checkConnection = async (subdomain: string, region: string) => {
    try {
        const url = `https://${subdomain}.auth.${region}.nhost.run/healthz`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); 

        const res = await fetch(url, { 
            method: 'GET',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return res.status === 200;
    } catch (e) {
        console.warn("Nhost Connection Check Failed:", e);
        return false;
    }
};

// DADOS DE DEMONSTRAÇÃO (FALLBACK)
const MOCK_DATA = {
    news: [
        {
            id: 'mock_news_1',
            status: 'published',
            title: 'Bem-vindo ao Novo Portal Lagoa Formosa no Momento',
            lead: 'Nova interface traz modernidade e recursos exclusivos para a comunidade do Alto Paranaíba.',
            content: '<h2>Sistema Pronto para Uso</h2><p>Se você está vendo esta mensagem, o sistema está rodando em modo de demonstração (fallback).</p>',
            category: 'Cotidiano',
            author: 'Sistema',
            authorId: 'sys_admin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1600',
            imageCredits: 'Unsplash',
            mediaType: 'image',
            city: 'Lagoa Formosa',
            region: 'Alto Paranaíba',
            isBreaking: false,
            isFeatured: true,
            featuredPriority: 5,
            seo: { slug: 'bem-vindo', metaTitle: 'Bem-vindo', metaDescription: 'Notícia de exemplo', focusKeyword: 'portal' },
            source: 'site',
            views: 1250,
            socialDistribution: []
        }
    ] as NewsItem[],
    advertisers: [] as Advertiser[],
    users: [] as User[],
    jobs: [] as Job[]
};

export interface SiteData {
    news: NewsItem[];
    advertisers: Advertiser[];
    users: User[];
    jobs: Job[];
}

// Query Principal para carregar o site
export const fetchSiteData = async (): Promise<{ data: SiteData; source: 'database' | 'mock' | 'missing_tables' }> => {
    if (!nhost) {
        console.log("Nhost não inicializado. Usando dados Mock.");
        return { data: MOCK_DATA, source: 'mock' };
    }

    // CHECK FOR ADMIN SECRET (SUPER ADMIN MODE)
    // Isso permite que o admin veja os dados mesmo se as permissões 'public' estiverem erradas.
    const adminSecret = localStorage.getItem('lfnm_admin_secret');
    const headers: any = {};
    if (adminSecret) {
        headers['x-hasura-admin-secret'] = adminSecret;
    }

    const query = `
      query LoadSiteData {
        news(order_by: {createdAt: desc}) {
          id
          title
          lead
          content
          category
          author
          authorId
          createdAt
          updatedAt
          publishedAt
          imageUrl
          imageCredits
          mediaType
          videoUrl
          galleryUrls
          city
          region
          status
          isBreaking
          isFeatured
          featuredPriority
          seo
          source
          socialDistribution
          views
        }
        advertisers(where: {isActive: {_eq: true}}) {
          id
          name
          category
          plan
          billingCycle
          logoIcon
          logoUrl
          bannerUrl
          startDate
          endDate
          isActive
          views
          clicks
          redirectType
          externalUrl
          internalPage
          coupons
        }
        users {
          id
          name
          email
          role
          status
          avatar
          bio
          socialLinks
        }
        jobs(where: {isActive: {_eq: true}}) {
          id
          title
          company
          location
          type
          salary
          description
          whatsapp
          postedAt
          isActive
        }
      }
    `;

    try {
        const { data, error } = await nhost.graphql.request(query, {}, { headers });
        
        if (error) {
            // Detecção de erro "Tabela não existe" OU "Permissão negada"
            const isSchemaMissingOrDenied = Array.isArray(error) && error.some((e: any) => 
                (e.message && e.message.includes("field")) || 
                (e.message && e.message.includes("not found")) ||
                (e.extensions && e.extensions.code === 'validation-failed')
            );

            if (isSchemaMissingOrDenied) {
                console.warn("⚠️ CONECTADO, MAS TABELAS INACESSÍVEIS (Permissões ou Schema faltando).");
                return { data: MOCK_DATA, source: 'missing_tables' };
            }

            console.error("Erro GraphQL Genérico:", JSON.stringify(error, null, 2));
            return { data: MOCK_DATA, source: 'mock' };
        }

        // Se chegou aqui, a query funcionou.
        return {
            data: {
                news: (data.news as NewsItem[]) || [],
                advertisers: (data.advertisers as Advertiser[]) || [],
                users: (data.users as User[]) || [],
                jobs: (data.jobs as Job[]) || []
            },
            source: 'database'
        };
    } catch (e) {
        console.error("Erro de Conexão Nhost:", e);
        return { data: MOCK_DATA, source: 'mock' };
    }
};
