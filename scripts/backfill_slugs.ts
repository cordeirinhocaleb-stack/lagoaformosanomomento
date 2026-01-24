
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; // Preferably Service Role Key for writing, but anon might work with RLS policies if user is logged in (hard in script) or if RLS is open.
// BETTER: Ask user for SERVICE_ROLE_KEY or assume it's in env.
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ Missing Supabase Credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const generateSlug = (title: string, date: string, city: string = 'Lagoa Formosa', category: string) => {
    const sanitize = (text: string) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, '-').replace(/-+/g, '-');

    const shortTitle = sanitize(title.split(' ').slice(0, 6).join(' '));
    const dateStr = new Date(date).toLocaleDateString('pt-BR').replace(/\//g, '-');
    const cityStr = sanitize(city);
    const categoryStr = sanitize(category);

    return `${shortTitle}-${dateStr}-${cityStr}-${categoryStr}`;
};

async function runBackfill() {
    console.log("🔄 Starting Slug Backfill...");

    // 1. Fetch all news without slug or where slug is null
    const { data: newsItems, error } = await supabase
        .from('news')
        .select('*')
        .or('slug.is.null,slug.eq.""');

    if (error) {
        console.error("❌ Error fetching news:", error);
        return;
    }

    console.log(`📋 Found ${newsItems.length} news items to update.`);

    let successCount = 0;
    let errorCount = 0;

    for (const news of newsItems) {
        try {
            const newSlug = news.seo?.slug || generateSlug(
                news.title,
                news.created_at || new Date().toISOString(),
                news.city || 'Lagoa Formosa',
                news.category
            );

            console.log(`🔹 Updating: "${news.title.substring(0, 30)}..." -> ${newSlug}`);

            const { error: updateError } = await supabase
                .from('news')
                .update({ slug: newSlug })
                .eq('id', news.id);

            if (updateError) {
                console.error(`   ❌ Failed to update ${news.id}:`, updateError.message);
                errorCount++;
            } else {
                successCount++;
            }
        } catch (e) {
            console.error(`   ❌ Exception for ${news.id}:`, e);
            errorCount++;
        }
    }

    console.log(`\n✅ Backfill Complete.`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);
}

runBackfill();
