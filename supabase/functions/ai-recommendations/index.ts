import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Verificar se é premium
    const { data: roleData } = await supabase
      .from('user_subscriptions')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || roleData.role === 'free') {
      return new Response(
        JSON.stringify({ error: 'Este recurso é exclusivo para usuários Premium' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { catalogAnimes } = await req.json();

    // Buscar histórico do usuário
    const { data: watchHistory } = await supabase
      .from('watch_history')
      .select('anime_title, episode_number')
      .eq('user_id', user.id)
      .order('watched_at', { ascending: false })
      .limit(20);

    if (!watchHistory || watchHistory.length === 0) {
      return new Response(
        JSON.stringify({ 
          recommendations: [],
          message: 'Assista alguns animes primeiro para receber recomendações personalizadas!' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Preparar contexto para a IA
    const watchedAnimes = watchHistory.map(h => h.anime_title).filter((v, i, a) => a.indexOf(v) === i);
    const catalogTitles = catalogAnimes.map((a: any) => ({
      title: a.title,
      synopsis: a.synopsis || 'Sem descrição'
    }));

    const prompt = `Você é um especialista em animes. Baseado no histórico de visualização do usuário, recomende até 5 animes do catálogo dele.

Histórico do usuário (animes assistidos recentemente):
${watchedAnimes.map(title => `- ${title}`).join('\n')}

Catálogo disponível:
${catalogTitles.map((a: any) => `- ${a.title}: ${a.synopsis.slice(0, 150)}...`).join('\n')}

Retorne APENAS um JSON array com os títulos recomendados, ordenados por relevância. Formato:
["Título 1", "Título 2", "Título 3"]

Regras:
1. Recomende APENAS animes que existem no catálogo
2. NÃO recomende animes que o usuário já assistiu
3. Escolha animes similares em tema, gênero ou estilo
4. Máximo de 5 recomendações`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um assistente especializado em recomendações de anime.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI error:', await response.text());
      throw new Error('Falha ao gerar recomendações');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content.trim();
    
    // Parse JSON response
    const recommendations = JSON.parse(aiResponse);

    console.log('AI recommendations generated:', recommendations);

    return new Response(
      JSON.stringify({ 
        recommendations,
        watchedCount: watchedAnimes.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-recommendations:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar recomendações';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
