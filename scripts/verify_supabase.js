
import { createClient } from '@supabase/supabase-js'

const url = 'https://xlqyccbnlqahyxhfswzh.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhscXljY2JubHFhaHl4aGZzd3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NjYwNTMsImV4cCI6MjA4MjU0MjA1M30.5sFnDeMEtXBSrKGjt4vILrQEdsg4MytlftGp67Ieiio'

const supabase = createClient(url, key)

async function testConnection() {
    console.log('Testing connection to:', url)

    try {
        const { data, error } = await supabase
            .from('news')
            .select('id, title, status, created_at')
            .limit(3)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('❌ Connection Failed:', error.message)
            console.error('Code:', error.code)
            console.error('Details:', error.details)
        } else {
            console.log('✅ Connection Successful!')
            console.log(`Found ${data.length} news items.`)
            if (data.length > 0) {
                console.log('Sample:', data[0])
            }
        }
    } catch (err) {
        console.error('❌ Unexpected Error:', err)
    }
}

testConnection()
