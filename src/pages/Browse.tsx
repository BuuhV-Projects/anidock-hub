import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Cpu, Search, User, Upload } from 'lucide-react';

const Browse = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <Cpu className="h-8 w-8 text-primary animate-pulse-glow" />
              <h1 className="font-display text-2xl font-bold text-gradient-primary">
                AniDock
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/dashboard')}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    className="border-primary/50 hover:bg-primary/10 gap-2"
                  >
                    <User className="h-4 w-4" />
                    Perfil
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => navigate('/auth')}
                  className="border-primary/50 hover:bg-primary/10 gap-2"
                >
                  <User className="h-4 w-4" />
                  Entrar
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-display font-bold text-center mb-6">
            Navegue pela Biblioteca
          </h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar animes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 bg-input border-border text-lg"
            />
          </div>
        </div>

        {/* Import Driver CTA for Non-Authenticated */}
        {!user && (
          <Card className="glass p-8 border-primary/30 max-w-3xl mx-auto mb-12 glow-cyan">
            <div className="text-center">
              <Upload className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-display font-bold mb-3">
                Comece a Assistir!
              </h3>
              <p className="text-muted-foreground mb-6">
                Importe drivers compartilhados pela comunidade e comece a assistir seus animes favoritos.
                Todos os drivers ficam salvos localmente no seu navegador.
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => navigate('/drivers/import')}
                >
                  Importar Driver
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary/50 hover:bg-primary/10"
                  onClick={() => navigate('/auth')}
                >
                  Criar Conta
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Empty State */}
        <div className="text-center py-16">
          <div className="w-24 h-24 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-6">
            <Cpu className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-display font-bold mb-3">
            Nenhum anime encontrado
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {user
              ? 'Comece criando ou importando um driver para indexar seus animes favoritos.'
              : 'Importe um driver para começar a navegar pelos animes disponíveis.'}
          </p>
        </div>
      </main>
    </div>
  );
};

export default Browse;