import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { currentVersion } = await req.json();
    console.log('Checking version. Current:', currentVersion);

    // Get the latest version from database
    const { data: latestVersion, error } = await supabase
      .from('app_versions')
      .select('*')
      .order('release_date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching latest version:', error);
      throw error;
    }

    console.log('Latest version:', latestVersion?.version);

    // Compare versions
    const hasUpdate = latestVersion && currentVersion !== latestVersion.version;

    return new Response(
      JSON.stringify({
        hasUpdate,
        latestVersion: latestVersion?.version,
        currentVersion,
        description: latestVersion?.description,
        downloadUrl: latestVersion?.download_url,
        isCritical: latestVersion?.is_critical,
        releaseDate: latestVersion?.release_date,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in check-app-version:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
