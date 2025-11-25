import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth/useAuth';
import { Button, Card, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, Skeleton } from '@anidock/shared-ui';
import { Cpu, Plus, Database, Zap, LogOut, Crown, User, Settings, Sparkles } from 'lucide-react';
import { supabase } from '@anidock/shared-utils';
import { toast } from 'sonner';
import { getHistory, getLocalDrivers } from '../lib/localStorage';

interface Recommendation {
  title: string;
  reason: string;
}

const Dashboard = () => {
  const { user, signOut, subscriptionStatus } = useAuth();
  const navigate = useNavigate();
  const [driversCount, setDriversCount] = useState(0);
  const [animesCount, setAnimesCount] = useState(0);
  const [userRole, setUserRole] = useState<string>('Free');
  const [isLoading, setIsLoading] = useState(true);
  const [canCreateMoreDrivers, setCanCreateMoreDrivers] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchStats = async () => {
      try {
        // Fetch drivers count and total animes
        const { data: driversData, error: dError } = await supabase
          .from('drivers')
          .select('total_animes')
          .eq('user_id', user.id);

        if (dError) {
          console.error('Error fetching drivers:', dError);
        } else {
          setDriversCount(driversData?.length || 0);
          // Sum total_animes from all drivers
          const totalAnimes = driversData?.reduce((sum, driver) => sum + (driver.total_animes || 0), 0) || 0;
          setAnimesCount(totalAnimes);
        }

        // Fetch user role
        const { data: roleData, error: roleError } = await supabase
          .rpc('get_user_role', { _user_id: user.id });

        if (roleError) {
          console.error('Error fetching role:', roleError);
        } else {
          const roleMap = {
            free: 'Free',
            premium: 'Premium',
            premium_plus: 'Premium+'
          };
          const role = roleData as keyof typeof roleMap;
          setUserRole(roleMap[role] || 'Free');
          
          // Check if user can create more drivers (free users limited to 3)
          if (role === 'free' && driversData) {
            setCanCreateMoreDrivers(driversData.length < 3);
          } else {
            setCanCreateMoreDrivers(true);
          }
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('Erro ao carregar estatísticas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user, navigate]);

  // Fetch AI recommendations for Premium users
  useEffect(() => {
    if (!user || subscriptionStatus.role !== 'premium') return;

    const fetchRecommendations = async () => {
      setIsLoadingRecommendations(true);
      try {
        // Verificar cache de recomendações
        const cachedData = localStorage.getItem('ai-recommendations-cache');
        if (cachedData) {
          const { recommendations: cachedRecs, timestamp } = JSON.parse(cachedData);
          const cacheDate = new Date(timestamp);
          const now = new Date();
          
          // Verificar se ainda é o mesmo dia (virada de dia = meia-noite)
          const isSameDay = 
            cacheDate.getDate() === now.getDate() &&
            cacheDate.getMonth() === now.getMonth() &&
            cacheDate.getFullYear() === now.getFullYear();
          
          if (isSameDay && cachedRecs && cachedRecs.length > 0) {
            console.log('Usando recomendações em cache');
            setRecommendations(cachedRecs);
            setIsLoadingRecommendations(false);
            return;
          }
        }
        
        console.log('Buscando novas recomendações da IA');
        
        // Get local history
        const localHistory = getHistory()
          .filter(item => item.type === 'episode')
          .map(item => ({
            animeTitle: item.animeTitle,
            episodeNumber: item.episodeNumber
          }))
          .slice(0, 20);

        // Get all available animes from local drivers
        const localDrivers = getLocalDrivers();
        const availableAnimes: string[] = [];
        localDrivers.forEach(driver => {
          if (driver.indexedData && Array.isArray(driver.indexedData)) {
            driver.indexedData.forEach(anime => {
              if (anime.title) availableAnimes.push(anime.title);
            });
          }
        });

        console.log('Sending to AI:', { 
          historyCount: localHistory.length, 
          animesCount: availableAnimes.length 
        });

        const { data, error } = await supabase.functions.invoke('ai-recommendations', {
          body: {
            watchHistory: localHistory,
            availableAnimes: availableAnimes
          }
        });
        
        if (error) {
          console.error('Error fetching recommendations:', error);
          return;
        }
        
        if (data?.recommendations && data.recommendations.length > 0) {
          setRecommendations(data.recommendations);
          
          // Salvar no cache com timestamp atual
          localStorage.setItem('ai-recommendations-cache', JSON.stringify({
            recommendations: data.recommendations,
            timestamp: new Date().toISOString()
          }));
          console.log('Recomendações salvas em cache');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, [user, subscriptionStatus.role]);

  // Scroll to recommendations if hash is present
  useEffect(() => {
    if (window.location.hash === '#recommendations') {
      setTimeout(() => {
        document.getElementById('recommendations')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cpu className="h-8 w-8 text-primary animate-pulse-glow" />
              <h1 className="font-display text-2xl font-bold text-gradient-primary">
                AniDock
              </h1>
            </div>

            <nav className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-muted-foreground hover:text-foreground"
              >
                Início
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/browse')}
                className="text-muted-foreground hover:text-foreground"
              >
                Navegar
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-primary/50 hover:bg-primary/10 gap-2"
                  >
                    <User className="h-4 w-4" />
                    Perfil
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  {(userRole === 'Premium' || userRole === 'Premium+') ? (
                    <DropdownMenuItem onClick={() => navigate('/subscription')}>
                      <Crown className="h-4 w-4 mr-2" />
                      Gerenciar Assinatura
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => navigate('/premium')}>
                      <Crown className="h-4 w-4 mr-2" />
                      Planos Premium
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-display font-bold mb-2">
            Bem-vindo de volta! 🎌
          </h2>
          <p className="text-muted-foreground">
            Gerencie seus drivers e animes indexados
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="glass p-6 border-border/50 hover:border-primary/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">
                  {isLoading ? '...' : driversCount}
                </p>
                <p className="text-sm text-muted-foreground">Drivers Ativos</p>
              </div>
            </div>
          </Card>

          <Card className="glass p-6 border-border/50 hover:border-secondary/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center">
                <Zap className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">
                  {isLoading ? '...' : animesCount}
                </p>
                <p className="text-sm text-muted-foreground">Animes Indexados</p>
              </div>
            </div>
          </Card>

          <Card 
            className="glass p-6 border-border/50 hover:border-accent/50 transition-all cursor-pointer"
            onClick={() => navigate(userRole === 'Free' ? '/premium' : '/subscription')}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                {userRole === 'Free' ? <Crown className="h-6 w-6 text-accent" /> : <Cpu className="h-6 w-6 text-accent" />}
              </div>
              <div className="flex-1">
                <p className="text-2xl font-display font-bold">
                  {isLoading ? '...' : userRole}
                </p>
                <p className="text-sm text-muted-foreground">
                  {userRole === 'Free' ? 'Fazer upgrade' : 'Gerenciar assinatura'}
                </p>
              </div>
              {userRole === 'Free' && (
                <Crown className="h-5 w-5 text-primary opacity-50" />
              )}
            </div>
          </Card>
        </div>

        {/* AI Recommendations for Premium Users */}
        {subscriptionStatus.role === 'premium' && (
          <Card id="recommendations" className="glass p-8 border-border/50 mb-8 scroll-mt-20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold">
                  Recomendações com IA
                </h3>
                <p className="text-sm text-muted-foreground">
                  Baseado no seu histórico de visualização
                </p>
              </div>
            </div>

            {isLoadingRecommendations ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all cursor-pointer"
                    onClick={() => navigate('/browse')}
                  >
                    <h4 className="font-semibold text-foreground mb-1">
                      {rec.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {rec.reason}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">
                  Assista alguns animes para receber recomendações personalizadas!
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="glass p-8 border-border/50">
            <h3 className="text-xl font-display font-bold mb-4">
              Criar Novo Driver
            </h3>
            <p className="text-muted-foreground mb-6">
              Use nossa IA para criar um driver customizado a partir de qualquer site de anime.
            </p>
            {!canCreateMoreDrivers && (
              <p className="text-sm text-destructive mb-4">
                Limite de 3 drivers atingido. Faça upgrade para Premium!
              </p>
            )}
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan w-full gap-2"
              onClick={() => navigate('/drivers/create')}
              disabled={!canCreateMoreDrivers}
            >
              <Plus className="h-5 w-5" />
              Criar Driver
            </Button>
          </Card>

          <Card className="glass p-8 border-border/50">
            <h3 className="text-xl font-display font-bold mb-4">
              Importar Driver
            </h3>
            <p className="text-muted-foreground mb-6">
              Importe drivers compartilhados pela comunidade ou amigos.
            </p>
            {!canCreateMoreDrivers && (
              <p className="text-sm text-destructive mb-4">
                Limite de 3 drivers atingido. Faça upgrade para Premium!
              </p>
            )}
            <Button
              size="lg"
              variant="outline"
              className="border-primary/50 hover:bg-primary/10 w-full gap-2"
              onClick={() => navigate('/drivers/import')}
              disabled={!canCreateMoreDrivers}
            >
              <Database className="h-5 w-5" />
              Importar Driver
            </Button>
          </Card>

          <Card className="glass p-8 border-border/50">
            <h3 className="text-xl font-display font-bold mb-4">
              Meus Drivers
            </h3>
            <p className="text-muted-foreground mb-6">
              Gerencie, exporte e compartilhe os drivers que você criou.
            </p>
            <Button
              size="lg"
              variant="outline"
              className="border-secondary/50 hover:bg-secondary/10 w-full gap-2"
              onClick={() => navigate('/drivers')}
            >
              <Cpu className="h-5 w-5" />
              Ver Drivers
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;