import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth/useAuth';
import { Button, Input, Card, Badge } from '@anidock/shared-ui';
import { Cpu, Search, Upload, Play, Loader2 } from 'lucide-react';
import { supabase } from '@anidock/shared-utils';
import { getLocalDrivers } from '../lib/localStorage';
import { LocalAnime } from '@anidock/anime-core';
import { toast } from 'sonner';
import { usePlataform } from '../contexts/plataform/usePlataform';
import { BrowseHeader } from './components/BrowseHeader';

const Browse = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [allAnimes, setAllAnimes] = useState<LocalAnime[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { isDesktop } = usePlataform();

  useEffect(() => {
    fetchAnimes();
  }, [user]);

  const fetchAnimes = async () => {
    setIsLoading(true);
    try {
      let animes: LocalAnime[] = [];

      // Load local drivers with indexed data
      const localDrivers = getLocalDrivers().filter(d => d.indexedData && d.indexedData.length > 0);
      localDrivers.forEach(driver => {
        if (driver.indexedData) {
          animes = [...animes, ...driver.indexedData];
        }
      });

      // Load cloud indexes if logged in
      if (user) {
        const { data: cloudIndexes, error } = await supabase
          .from('indexes')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching cloud indexes:', error);
        } else if (cloudIndexes) {
          cloudIndexes.forEach(index => {
            const indexAnimes = (index.index_data as any[]) || [];
            // Add indexId metadata to each anime for proper episode saving
            const animesWithIndexId = indexAnimes.map(anime => ({
              ...anime,
              _indexId: index.id, // Internal metadata for tracking
              _driverId: index.driver_id
            }));
            animes = [...animes, ...animesWithIndexId];
          });
        }
      }

      setAllAnimes(animes);
    } catch (error) {
      console.error('Error loading animes:', error);
      toast.error('Erro ao carregar animes');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAnimes = allAnimes.filter(anime =>
    anime.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <BrowseHeader user={user} navigate={navigate} isDesktop={isDesktop} />

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

        {/* Import CTA for Empty State */}
        {!isLoading && allAnimes.length === 0 && (
          <Card className="glass p-8 border-primary/30 max-w-3xl mx-auto mb-12 glow-cyan">
            <div className="text-center">
              <Upload className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-display font-bold mb-3">
                Comece a Assistir!
              </h3>
              <p className="text-muted-foreground mb-6">
                {user 
                  ? 'Crie drivers e indexe sites de anime para começar a assistir seus favoritos.'
                  : 'Importe drivers compartilhados pela comunidade e comece a assistir seus animes favoritos.'}
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => navigate('/drivers/import')}
                >
                  Importar Driver
                </Button>
                {user ? (
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary/50 hover:bg-primary/10"
                    onClick={() => navigate('/drivers/create')}
                  >
                    Criar Driver
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary/50 hover:bg-primary/10"
                    onClick={() => navigate('/auth')}
                  >
                    Criar Conta
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Animes Grid */}
        {!isLoading && filteredAnimes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {filteredAnimes.length} {filteredAnimes.length === 1 ? 'anime encontrado' : 'animes encontrados'}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredAnimes.map((anime) => (
                <Card
                  key={anime.id}
                  className="glass border-border/50 hover:border-primary/50 transition-all cursor-pointer group overflow-hidden"
                  onClick={() => {
                    // Navigate to anime details page with necessary IDs
                    const params = new URLSearchParams({
                      id: anime.id,
                      driver: anime.driverId || '',
                    });
                    
                    // Add index ID if this anime comes from a cloud index
                    if ((anime as any)._indexId) {
                      params.append('index', String((anime as any)._indexId));
                    }
                    
                    navigate(`/anime?${params.toString()}`);
                  }}
                >
                  <div className="aspect-[2/3] relative overflow-hidden">
                    {anime.coverUrl ? (
                      <img
                        src={anime.coverUrl}
                        alt={anime.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Cpu className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                      <Button size="sm" className="gap-2">
                        <Play className="h-4 w-4" />
                        Assistir
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-bold text-sm line-clamp-2 mb-2">
                      {anime.title}
                    </h3>
                    {anime.episodes && anime.episodes.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {anime.episodes.length} eps
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && allAnimes.length > 0 && filteredAnimes.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-display font-bold mb-3">
              Nenhum resultado encontrado
            </h3>
            <p className="text-muted-foreground">
              Tente buscar com outros termos
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Browse;
