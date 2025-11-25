import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth/useAuth';
import { Button, Card, Badge, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@anidock/shared-ui';
import { Crown, CreditCard, AlertTriangle, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@anidock/shared-utils';
import { toast } from 'sonner';

export default function ManageSubscription() {
  const { user, subscriptionStatus, checkSubscription } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);

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

  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription');
      
      if (error) throw error;
      
      if (data?.success) {
        toast.success('Assinatura cancelada! Você terá acesso Premium até o fim do período pago.');
        await checkSubscription();
      } else {
        throw new Error(data?.error || 'Erro ao cancelar assinatura');
      }
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      toast.error(error.message || 'Erro ao cancelar assinatura');
    } finally {
      setIsCanceling(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setIsReactivating(true);
    try {
      const { data, error } = await supabase.functions.invoke('reactivate-subscription');
      
      if (error) throw error;
      
      if (data?.success) {
        toast.success('Assinatura reativada com sucesso!');
        await checkSubscription();
      } else {
        throw new Error(data?.error || 'Erro ao reativar assinatura');
      }
    } catch (error: any) {
      console.error('Error reactivating subscription:', error);
      toast.error(error.message || 'Erro ao reativar assinatura');
    } finally {
      setIsReactivating(false);
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
                  {subscriptionStatus.role === 'premium' ? 'Premium' : 'Free'}
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
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Valor</p>
                  <p className="text-sm text-muted-foreground">R$ 14,90/mês</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Subscription Scheduled for Cancellation Warning */}
        {isPremium && subscriptionStatus.cancelAtPeriodEnd && (
          <Card className="p-6 mb-6 border-warning bg-warning/10">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-warning mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Assinatura Agendada para Cancelamento</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Sua assinatura Premium está agendada para cancelar quando o período atual terminar.
                  Você ainda tem acesso a todos os benefícios Premium até lá.
                </p>
                <Button 
                  onClick={handleReactivateSubscription} 
                  disabled={isReactivating}
                  variant="default"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isReactivating ? 'Reativando...' : 'Reativar Assinatura'}
                </Button>
              </div>
            </div>
          </Card>
        )}

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

        {/* Cancel Subscription - Only show if not already scheduled */}
        {isPremium && !subscriptionStatus.cancelAtPeriodEnd && (
          <Card className="p-6 border-destructive/50 bg-destructive/5">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-destructive mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Cancelar Assinatura</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Ao cancelar, você perderá acesso aos benefícios Premium quando o período atual terminar.
                  Seus dados serão mantidos, mas limitados ao plano gratuito.
                </p>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isCanceling}>
                      <XCircle className="h-4 w-4 mr-2" />
                      {isCanceling ? 'Cancelando...' : 'Cancelar Assinatura'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação agendará o cancelamento da sua assinatura Premium para o final do período atual.
                        Você continuará com acesso Premium até lá, e depois voltará ao plano gratuito com as seguintes limitações:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Máximo de 3 drivers na nuvem</li>
                          <li>Histórico apenas local (sem sincronização)</li>
                          <li>Sem recomendações com IA</li>
                        </ul>
                        <p className="mt-2 font-semibold">Você pode reativar sua assinatura a qualquer momento antes do período acabar.</p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Manter Premium</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancelSubscription}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Sim, Cancelar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
