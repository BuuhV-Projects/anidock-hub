import { Crown, Cloud, Sparkles, History, Infinity } from "lucide-react";
import { Button } from "@anidock/shared-ui";
import { useAuth } from "@anidock/app-core";
import { useState, useEffect } from "react";
import { supabase } from "@anidock/shared-utils/integrations/supabase/client";

export default function PremiumFeatures() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string>('free');

  useEffect(() => {
    if (user) {
      getUserRole();
    }
  }, [user]);

  const getUserRole = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (data) {
      setUserRole(data.role);
    }
  };

  const isPremium = userRole === 'premium' || userRole === 'premium_plus';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Crown className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">AniDock Premium</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Desbloqueie todo o potencial do AniDock
          </p>
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
              <Button className="w-full" disabled>
                <Crown className="w-4 h-4 mr-2" />
                Plano Ativo
              </Button>
            ) : (
              <Button className="w-full">
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
