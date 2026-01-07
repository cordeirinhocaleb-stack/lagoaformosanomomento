
import { createClient } from '@supabase/supabase-js'

const url = 'https://xlqyccbnlqahyxhfswzh.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhscXljY2JubHFhaHl4aGZzd3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NjYwNTMsImV4cCI6MjA4MjU0MjA1M30.5sFnDeMEtXBSrKGjt4vILrQEdsg4MytlftGp67Ieiio'

const supabase = createClient(url, key)

async function debugContent() {
    console.log('🔍 Debugging Content Visibility...')

    try {
        const { data, error } = await supabase
            .from('news')
            .select('id, title, status, region, category, created_at')
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(10)

        if (error) {
            console.error('❌ Fetch Error:', error.message)
            return
        }

        console.log(`✅ Found ${data.length} PUBLISHED news items.`)
        console.table(data)

    } catch (err) {
        console.error('❌ Unexpected:', err)
    }
}

debugContent()
