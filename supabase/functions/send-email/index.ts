import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  type: 'welcome' | 'notification' | 'verification' | 'custom';
  data?: {
    name?: string;
    message?: string;
    code?: string;
    html?: string;
  };
}

const getEmailTemplate = (type: string, data: any) => {
  switch (type) {
    case 'verification':
      return `
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
                  <div class="code">${data.code || '000000'}</div>
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
      `;
    
    case 'welcome':
      return `
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
              }
              .content h2 {
                color: #00ffff;
                font-size: 24px;
                margin-bottom: 20px;
              }
              .button {
                display: inline-block;
                background: #00ffff;
                color: #0a0f1a;
                padding: 12px 32px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                margin: 20px 0;
                box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
              }
              .footer {
                text-align: center;
                margin-top: 40px;
                color: #64748b;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">
                <h1>AniDock</h1>
              </div>
              <div class="content">
                <h2>Bem-vindo ao AniDock! 🎌</h2>
                <p>Olá ${data.name || 'Otaku'}!</p>
                <p>Sua conta foi criada com sucesso. Você está no <strong>Plano Free</strong> e pode começar a indexar seus animes favoritos agora mesmo!</p>
                <p>Com o AniDock você pode:</p>
                <ul>
                  <li>Indexar até 100 animes</li>
                  <li>Importar até 3 sites diferentes</li>
                  <li>Usar IA para descrições básicas</li>
                  <li>Compartilhar drivers com amigos</li>
                </ul>
                <a href="https://anidock.buuhvprojects.com" class="button">Começar Agora</a>
                <p>Aproveite sua jornada no mundo dos animes!</p>
              </div>
              <div class="footer">
                <p>© 2024 AniDock - Indexação inteligente de animes</p>
                <p>Este é um email automático, por favor não responda.</p>
              </div>
            </div>
          </body>
        </html>
      `;
    
    case 'notification':
      return `
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
                border: 1px solid rgba(157, 78, 221, 0.2);
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 0 40px rgba(157, 78, 221, 0.1);
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
              }
              .content h2 {
                color: #9d4edd;
                font-size: 24px;
                margin-bottom: 20px;
              }
              .footer {
                text-align: center;
                margin-top: 40px;
                color: #64748b;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">
                <h1>AniDock</h1>
              </div>
              <div class="content">
                <h2>Notificação</h2>
                <p>${data.message || 'Você tem uma nova notificação no AniDock.'}</p>
              </div>
              <div class="footer">
                <p>© 2024 AniDock - Indexação inteligente de animes</p>
              </div>
            </div>
          </body>
        </html>
      `;
    
    case 'custom':
      return data.html || '<p>Email sem conteúdo</p>';
    
    default:
      return '<p>Email sem conteúdo</p>';
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, type, data }: EmailRequest = await req.json();

    console.log('Sending email:', { to, subject, type });

    const html = getEmailTemplate(type, data || {});
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured');
    }

    // Call Resend API directly
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "AniDock <noreply@anidock.buuhvprojects.com>",
        to: [to],
        subject,
        html,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Resend API error:', resendData);
      throw new Error(resendData.message || 'Failed to send email');
    }

    console.log("Email sent successfully:", resendData);

    return new Response(JSON.stringify({ 
      success: true,
      id: resendData.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
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