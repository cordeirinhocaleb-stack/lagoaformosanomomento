
import { createClient } from '@supabase/supabase-js'

const url = 'https://xlqyccbnlqahyxhfswzh.supabase.co'
const key = 'sb_secret_-dpjk86xDRdlopNX4eCHPg_BE4hM_W5'

const supabase = createClient(url, key)

async function seedNews() {
    console.log('🌱 Seeding Test News for Lagoa Formosa...')

    const newsItem = {
        title: 'Teste de Conexão: Lagoa Formosa Online',
        lead: 'Esta é uma notícia de teste gerada automaticamente para validar o carregamento do feed.',
        content: '<p>Se você está vendo esta mensagem, a conexão com o banco de dados e o filtro de cidade (Lagoa Formosa) estão funcionando perfeitamente.</p>',
        category: 'Cotidiano',
        status: 'published',
        author: 'Sistema',
        city: 'Lagoa Formosa',
        region: 'Lagoa Formosa',
        image_url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop', // Imagem genérica válida
        media_type: 'image',
        views: 0,
        is_breaking: false,
        is_featured: true,
        created_at: new Date().toISOString()
    }

    try {
        const { data, error } = await supabase
            .from('news')
            .insert(newsItem)
            .select()

        if (error) {
            console.error('❌ Insert Error:', error.message)
        } else {
            console.log('✅ News Inserted Successfully!')
            console.log('ID:', data[0].id)
            console.log('Please refresh the site to see it.')
        }

    } catch (err) {
        console.error('❌ Unexpected Error:', err)
    }
}

seedNews()
