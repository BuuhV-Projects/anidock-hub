import { Crown, Cloud, Sparkles, History, Infinity, CheckCircle, XCircle } from "lucide-react";
import { Button, Alert, AlertDescription, AlertTitle } from "@anidock/shared-ui";
import { useAuth } from "@anidock/app-core";
import { useState, useEffect } from "react";
import { supabase } from "@anidock/shared-utils";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export default function PremiumFeatures() {
  const { user, subscriptionStatus, checkSubscription } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isPremium = subscriptionStatus.role === 'premium';
  
  const PREMIUM_PRICE_ID = "price_1SXLgQ5O2lRcfH35ckLj4j6j"; // R$ 14,90/month

  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  // Atualizar status após sucesso no pagamento
  useEffect(() => {
    if (success) {
      // Esperar 2 segundos para o Stripe processar
      setTimeout(() => {
        checkSubscription();
      }, 2000);
    }
  }, [success, checkSubscription]);

  // Limpar os params após 5 segundos
  useEffect(() => {
    if (success || canceled) {
      const timer = setTimeout(() => {
        searchParams.delete('success');
        searchParams.delete('canceled');
        setSearchParams(searchParams, { replace: true });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, canceled, searchParams, setSearchParams]);

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    await checkSubscription();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Mensagem de Sucesso */}
        {success && (
          <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-600">Pagamento realizado com sucesso!</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-400">
              Sua assinatura Premium foi ativada. Aproveite todos os recursos ilimitados do AniDock!
            </AlertDescription>
          </Alert>
        )}

        {/* Mensagem de Cancelamento */}
        {canceled && (
          <Alert className="mb-6 border-orange-500 bg-orange-50 dark:bg-orange-950">
            <XCircle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-600">Checkout cancelado</AlertTitle>
            <AlertDescription className="text-orange-700 dark:text-orange-400">
              Você cancelou o processo de pagamento. Se precisar de ajuda, entre em contato conosco.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Crown className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">AniDock Premium</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Desbloqueie todo o potencial do AniDock
          </p>
          {user && !isPremium && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshStatus}
              disabled={isRefreshing}
              className="mt-4"
            >
              {isRefreshing ? "Atualizando..." : "Atualizar Status da Assinatura"}
            </Button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Free Plan */}
          <div className="border rounded-lg p-6 bg-card">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2">Plano Free</h2>
              <p className="text-3xl font-bold text-primary">R$ 0</p>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <div>
                  <p className="font-medium">Importar Drivers localmente</p>
                  <p className="text-sm text-muted-foreground">Ilimitado, mas só no dispositivo</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <div>
                  <p className="font-medium">Até 3 drivers na nuvem</p>
                  <p className="text-sm text-muted-foreground">Sincronizados entre dispositivos</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <div>
                  <p className="font-medium">Histórico local</p>
                  <p className="text-sm text-muted-foreground">Salvo apenas no dispositivo</p>
                </div>
              </div>
            </div>

            {!isPremium && (
              <Button variant="outline" className="w-full" disabled>
                Plano Atual
              </Button>
            )}
          </div>

          {/* Premium Plan */}
          <div className="border-2 border-primary rounded-lg p-6 bg-card relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm font-semibold">
              POPULAR
            </div>
            
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Crown className="w-6 h-6 text-primary" />
                Plano Premium
              </h2>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-primary">R$ 14,90</p>
                <span className="text-muted-foreground">/mês</span>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2">
                <Infinity className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Drivers ilimitados</p>
                  <p className="text-sm text-muted-foreground">Crie e use quantos quiser</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Cloud className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Sincronização automática</p>
                  <p className="text-sm text-muted-foreground">Todos os seus dados na nuvem</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <History className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Histórico sincronizado</p>
                  <p className="text-sm text-muted-foreground">Continue de onde parou em qualquer dispositivo</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Recomendações com IA</p>
                  <p className="text-sm text-muted-foreground">Sugestões personalizadas baseadas no seu histórico</p>
                </div>
              </div>
            </div>

            {isPremium ? (
              <Button className="w-full" onClick={() => navigate('/subscription')}>
                <Crown className="w-4 h-4 mr-2" />
                Gerenciar Assinatura
              </Button>
            ) : (
              <Button 
                className="w-full"
                onClick={async () => {
                  try {
                    const { data, error } = await supabase.functions.invoke('create-checkout', {
                      body: { priceId: PREMIUM_PRICE_ID }
                    });
                    
                    if (error) {
                      // Check if it's the "already has subscription" error
                      if (data?.hasActiveSubscription) {
                        toast.error('Você já possui uma assinatura Premium ativa!');
                        navigate('/subscription');
                        return;
                      }
                      throw error;
                    }
                    
                    if (data?.url) {
                      window.open(data.url, '_blank');
                    }
                  } catch (error: any) {
                    console.error('Error creating checkout:', error);
                    toast.error(error.message || 'Erro ao criar sessão de checkout');
                  }
                }}
              >
                <Crown className="w-4 h-4 mr-2" />
                Fazer Upgrade
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
