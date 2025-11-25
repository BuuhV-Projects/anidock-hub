import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth/useAuth';
import { Button, Card, Badge, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@anidock/shared-ui';
import { Crown, Calendar, CreditCard, AlertTriangle, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '@anidock/shared-utils';
import { toast } from 'sonner';

export default function ManageSubscription() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string>('free');
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionDate, setSubscriptionDate] = useState<string>('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    getUserSubscription();
  }, [user]);

  const getUserSubscription = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('role, created_at')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setUserRole(data.role);
        setSubscriptionDate(data.created_at);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast.error('Erro ao carregar dados da assinatura');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user) return;

    try {
      // Update user role to free
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ role: 'free' })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Assinatura cancelada com sucesso');
      setUserRole('free');
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Erro ao cancelar assinatura');
    }
  };

  const isPremium = userRole === 'premium' || userRole === 'premium_plus';
  
  // Calculate next renewal date (30 days from subscription date)
  const getNextRenewalDate = () => {
    if (!subscriptionDate) return 'N/A';
    const date = new Date(subscriptionDate);
    date.setDate(date.getMonth() + 1);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatDate = (dateString: string) => {
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
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Data de início</p>
                  <p className="text-sm text-muted-foreground">{formatDate(subscriptionDate)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Próxima renovação</p>
                  <p className="text-sm text-muted-foreground">{getNextRenewalDate()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Valor</p>
                  <p className="text-sm text-muted-foreground">
                    R$ {userRole === 'premium_plus' ? '24,90' : '14,90'}/mês
                  </p>
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
          <Card className="p-6 border-destructive/50">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-destructive mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Cancelar Assinatura</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Ao cancelar sua assinatura, você perderá acesso aos recursos Premium ao final do período atual.
                  Seus drivers e histórico permanecerão salvos caso você decida reativar no futuro.
                </p>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      Cancelar Assinatura
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Você perderá acesso a:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Drivers ilimitados (limite voltará para 3)</li>
                          <li>Sincronização na nuvem</li>
                          <li>Histórico sincronizado</li>
                          <li>Recomendações com IA</li>
                        </ul>
                        <p className="mt-4 font-semibold">
                          Esta ação não pode ser desfeita automaticamente. Você precisará fazer uma nova assinatura para recuperar o acesso Premium.
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Manter Assinatura</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancelSubscription}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Confirmar Cancelamento
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
