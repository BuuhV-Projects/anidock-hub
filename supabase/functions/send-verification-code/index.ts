import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: VerificationRequest = await req.json();

    if (!email) {
      throw new Error('Email é obrigatório');
    }

    console.log('Generating verification code for:', email);

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    console.log('Generated code:', code);

    // Clean up old codes for this email
    await supabase
      .from('verification_codes')
      .delete()
      .eq('email', email)
      .eq('type', 'signup')
      .is('verified_at', null);

    // Save code to database
    const { error: insertError } = await supabase
      .from('verification_codes')
      .insert({
        email,
        code,
        type: 'signup',
        expires_at: expiresAt.toISOString()
      });

    if (insertError) {
      console.error('Error saving verification code:', insertError);
      throw insertError;
    }

    console.log('Code saved to database, sending email...');

    // Send email via Resend
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "AniDock <noreply@anidock.buuhvprojects.com>",
        to: [email],
        subject: "Código de Verificação - AniDock 🔐",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                  background: linear-gradient(135deg, #0a0f1a 0%, #1a1f2e 100%);
                  margin: 0;
                  padding: 40px 20px;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background: rgba(26, 31, 46, 0.8);
                  border: 1px solid rgba(0, 255, 255, 0.2);
                  border-radius: 12px;
                  padding: 40px;
                  box-shadow: 0 0 40px rgba(0, 255, 255, 0.1);
                }
                .logo {
                  text-align: center;
                  margin-bottom: 30px;
                }
                .logo h1 {
                  background: linear-gradient(135deg, #00ffff, #9d4edd);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  background-clip: text;
                  font-size: 36px;
                  margin: 0;
                  font-weight: 700;
                }
                .content {
                  color: #e2e8f0;
                  line-height: 1.6;
                  text-align: center;
                }
                .content h2 {
                  color: #00ffff;
                  font-size: 24px;
                  margin-bottom: 20px;
                }
                .code-container {
                  background: rgba(0, 255, 255, 0.1);
                  border: 2px solid #00ffff;
                  border-radius: 8px;
                  padding: 24px;
                  margin: 30px 0;
                  text-align: center;
                }
                .code {
                  font-size: 42px;
                  font-weight: 700;
                  letter-spacing: 8px;
                  color: #00ffff;
                  font-family: 'Courier New', monospace;
                  text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
                }
                .footer {
                  text-align: center;
                  margin-top: 40px;
                  color: #64748b;
                  font-size: 12px;
                }
                .warning {
                  background: rgba(157, 78, 221, 0.1);
                  border-left: 4px solid #9d4edd;
                  padding: 12px;
                  margin: 20px 0;
                  border-radius: 4px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="logo">
                  <h1>AniDock</h1>
                </div>
                <div class="content">
                  <h2>Código de Verificação 🔐</h2>
                  <p>Use o código abaixo para verificar sua conta:</p>
                  
                  <div class="code-container">
                    <div class="code">${code}</div>
                  </div>
                  
                  <p><strong>Este código expira em 60 minutos.</strong></p>
                  
                  <div class="warning">
                    <p style="margin: 0; color: #e2e8f0;">
                      ⚠️ Nunca compartilhe este código com ninguém. Nossa equipe nunca pedirá seu código de verificação.
                    </p>
                  </div>
                  
                  <p style="margin-top: 30px;">
                    Se você não solicitou este código, ignore este email.
                  </p>
                </div>
                <div class="footer">
                  <p>© 2024 AniDock - Indexação inteligente de animes</p>
                  <p>Este é um email automático, por favor não responda.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Resend API error:', resendData);
      throw new Error(resendData.message || 'Erro ao enviar email');
    }

    console.log('Email sent successfully via Resend:', resendData);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Código de verificação enviado com sucesso'
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-verification-code:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);