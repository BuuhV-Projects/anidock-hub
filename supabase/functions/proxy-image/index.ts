import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const imageUrl = url.searchParams.get('url');

    if (!imageUrl) {
      return new Response('Missing url parameter', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Fetch the image with no-referrer policy
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'Referer': '',
      }
    });

    if (!imageResponse.ok) {
      return new Response('Failed to fetch image', { 
        status: imageResponse.status,
        headers: corsHeaders 
      });
    }

    // Get image content type
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    
    // Return the image with CORS headers
    return new Response(imageResponse.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      }
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    return new Response('Internal server error', { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
