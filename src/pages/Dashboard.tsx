import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Cpu, Plus, Database, Zap, LogOut } from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
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
                <p className="text-2xl font-display font-bold">0</p>
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
                <p className="text-2xl font-display font-bold">0</p>
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
                <p className="text-2xl font-display font-bold">Free</p>
                <p className="text-sm text-muted-foreground">Plano Atual</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="glass p-8 border-border/50">
            <h3 className="text-xl font-display font-bold mb-4">
              Criar Novo Driver
            </h3>
            <p className="text-muted-foreground mb-6">
              Use nossa IA para criar um driver customizado a partir de qualquer site de anime.
            </p>
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan w-full gap-2"
              onClick={() => navigate('/drivers/create')}
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
            <Button
              size="lg"
              variant="outline"
              className="border-primary/50 hover:bg-primary/10 w-full gap-2"
              onClick={() => navigate('/drivers/import')}
            >
              <Database className="h-5 w-5" />
              Importar Driver
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;