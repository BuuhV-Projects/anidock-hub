import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth/useAuth';
import { Button, Card, Badge, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@anidock/shared-ui';
import { Crown, Calendar, CreditCard, AlertTriangle, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '@anidock/shared-utils';
import { toast } from 'sonner';

export default function ManageSubscription() {
  const { user, subscriptionStatus, checkSubscription } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadSubscription();
  }, [user]);

  const loadSubscription = async () => {
    setIsLoading(true);
    await checkSubscription();
    setIsLoading(false);
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Erro ao abrir portal de gerenciamento');
    }
  };

  const isPremium = subscriptionStatus.role === 'premium';
  
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Crown className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Dashboard
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <Crown className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Gerenciar Assinatura</h1>
        </div>

        {/* Current Plan Status */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isPremium ? 'bg-primary/20' : 'bg-muted'
              }`}>
                <Crown className={`h-6 w-6 ${isPremium ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {userRole === 'premium_plus' ? 'Premium+' : userRole === 'premium' ? 'Premium' : 'Free'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isPremium ? 'Plano ativo' : 'Plano básico'}
                </p>
              </div>
            </div>
            <Badge variant={isPremium ? 'default' : 'secondary'}>
              {isPremium ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>

          {isPremium && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Próxima renovação</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(subscriptionStatus.subscriptionEnd)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Valor</p>
                  <p className="text-sm text-muted-foreground">R$ 14,90/mês</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Premium Benefits */}
        {isPremium && (
          <Card className="p-6 mb-6 bg-primary/5">
            <h3 className="font-semibold mb-4">Seus benefícios Premium</h3>
            <div className="grid gap-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Drivers ilimitados</p>
                  <p className="text-sm text-muted-foreground">Crie quantos drivers quiser</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Sincronização na nuvem</p>
                  <p className="text-sm text-muted-foreground">Acesse seus dados em qualquer dispositivo</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Histórico sincronizado</p>
                  <p className="text-sm text-muted-foreground">Continue de onde parou em qualquer lugar</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Recomendações com IA</p>
                  <p className="text-sm text-muted-foreground">Sugestões personalizadas baseadas no seu histórico</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Not Premium - Upgrade CTA */}
        {!isPremium && (
          <Card className="p-8 text-center mb-6 border-primary/20">
            <Crown className="h-16 w-16 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Upgrade para Premium</h3>
            <p className="text-muted-foreground mb-6">
              Desbloqueie todos os recursos e aproveite a experiência completa do AniDock
            </p>
            <Button 
              size="lg"
              onClick={() => navigate('/premium')}
              className="gap-2"
            >
              <Crown className="h-5 w-5" />
              Ver Planos Premium
            </Button>
          </Card>
        )}

        {/* Cancel Subscription */}
        {isPremium && (
          <Card className="p-6 border-primary/50">
            <div className="flex items-start gap-4">
              <CreditCard className="h-6 w-6 text-primary mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Gerenciar Assinatura</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Gerencie sua forma de pagamento, visualize faturas ou cancele sua assinatura diretamente no portal do Stripe.
                </p>
                
                <Button onClick={handleManageSubscription}>
                  Abrir Portal de Gerenciamento
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Precisa de ajuda? Entre em contato com nosso suporte em{' '}
            <a href="mailto:suporte@anidock.com" className="text-primary hover:underline">
              suporte@anidock.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
