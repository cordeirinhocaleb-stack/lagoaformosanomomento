// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { public_id, resource_type = 'image', cloud_name } = await req.json();

        if (!public_id) {
            throw new Error("Missing public_id");
        }

        const API_KEY = Deno.env.get('CLOUDINARY_API_KEY');
        const API_SECRET = Deno.env.get('CLOUDINARY_API_SECRET');
        const CLOUD_NAME = cloud_name || Deno.env.get('CLOUDINARY_CLOUD_NAME');

        if (!API_KEY || !API_SECRET || !CLOUD_NAME) {
            throw new Error("Missing Cloudinary configuration (API_KEY, API_SECRET or CLOUD_NAME)");
        }

        const timestamp = Math.round(new Date().getTime() / 1000);
        const signatureToSign = `public_id=${public_id}&timestamp=${timestamp}${API_SECRET}`;

        // Create SHA-1 hash for the signature
        const msgUint8 = new TextEncoder().encode(signatureToSign);
        const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        const formData = new FormData();
        formData.append('public_id', public_id);
        formData.append('timestamp', timestamp.toString());
        formData.append('api_key', API_KEY);
        formData.append('signature', signature);

        const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resource_type}/destroy`;

        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: response.status,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
