import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Card } from '@anidock/shared-ui';
import { Cpu, Plus, Database, Zap, LogOut } from 'lucide-react';
import { supabase } from '@anidock/shared-utils';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [driversCount, setDriversCount] = useState(0);
  const [animesCount, setAnimesCount] = useState(0);
  const [userRole, setUserRole] = useState<string>('Free');
  const [isLoading, setIsLoading] = useState(true);
  const [canCreateMoreDrivers, setCanCreateMoreDrivers] = useState(true);

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
              <Button
                variant="outline"
                onClick={signOut}
                className="border-primary/50 hover:bg-primary/10 gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
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

          <Card className="glass p-6 border-border/50 hover:border-accent/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                <Cpu className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">
                  {isLoading ? '...' : userRole}
                </p>
                <p className="text-sm text-muted-foreground">Plano Atual</p>
              </div>
            </div>
          </Card>
        </div>

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