import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, Badge } from '@anidock/shared-ui';
import { ArrowLeft, Play, Loader2, ExternalLink } from 'lucide-react';
import { crawlEpisodes } from '@/lib/crawler';
import { 
  getLocalDrivers, 
  getLocalAnime, 
  saveLocalAnime, 
  type LocalAnime, 
  type LocalEpisode, 
  type Driver 
} from '@/lib/localStorage';
import { supabase } from '@anidock/shared-utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { VideoPlayerModal } from '@anidock/shared-ui';

const AnimeDetails = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const animeId = searchParams.get('id');
  const driverId = searchParams.get('driver');
  const indexId = searchParams.get('index');
  
  const [anime, setAnime] = useState<LocalAnime | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [episodes, setEpisodes] = useState<LocalEpisode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCrawling, setIsCrawling] = useState(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [currentVideoData, setCurrentVideoData] = useState<{
    type: 'iframe' | 'video' | null;
    url: string | null;
  } | null>(null);
  const [currentEpisodeTitle, setCurrentEpisodeTitle] = useState('');

  useEffect(() => {
    loadAnimeAndEpisodes();
  }, [animeId, driverId, indexId]);

  const loadAnimeAndEpisodes = async () => {
    if (!animeId || !driverId) {
      toast.error('Dados inválidos');
      navigate('/browse');
      return;
    }

    setIsLoading(true);
    try {
      // STEP 1: Check local cache first (fastest)
      const cachedAnime = getLocalAnime(animeId);
      if (cachedAnime && cachedAnime.episodes && cachedAnime.episodes.length > 0) {
        console.log('Loading from local cache:', animeId);
        setAnime(cachedAnime);
        setEpisodes(cachedAnime.episodes);
        
        // Still need to get driver info
        const localDriver = getLocalDrivers().find(d => d.id === driverId);
        if (localDriver) {
          setDriver(localDriver);
        }
        
        setIsLoading(false);
        return;
      }

      // STEP 2: Find anime from local drivers or cloud indexes
      let foundAnime: LocalAnime | null = null;
      let foundDriver: Driver | null = null;

      // Check local drivers
      const localDrivers = getLocalDrivers();
      for (const localDriver of localDrivers) {
        if (localDriver.id === driverId && localDriver.indexedData) {
          foundAnime = localDriver.indexedData.find(a => a.id === animeId) || null;
          foundDriver = localDriver;
          break;
        }
      }

      // STEP 3: Check cloud indexes if logged in and not found locally
      if (!foundAnime && user && indexId) {
        const { data: index, error: indexError } = await supabase
          .from('indexes')
          .select('*, drivers(*)')
          .eq('id', parseInt(indexId))
          .eq('user_id', user.id)
          .single();

        if (!indexError && index) {
          const indexAnimes = (index.index_data as any[]) || [];
          foundAnime = indexAnimes.find(a => a.id === animeId) || null;
          
          if (index.drivers) {
            foundDriver = {
              id: String(index.drivers.id),
              name: index.drivers.name,
              domain: index.drivers.domain,
              version: '1.0.0',
              author: 'AniDock',
              config: index.drivers.config as any,
              isLocal: false,
              createdAt: index.drivers.created_at,
              updatedAt: index.drivers.updated_at,
              sourceUrl: index.drivers.source_url || undefined,
              totalAnimes: index.drivers.total_animes || undefined,
              lastIndexedAt: index.drivers.last_indexed_at || undefined,
            };
          }
        }
      }

      if (!foundAnime || !foundDriver) {
        toast.error('Anime não encontrado');
        navigate('/browse');
        return;
      }

      setAnime(foundAnime);
      setDriver(foundDriver);

      // Check if episodes already exist
      if (foundAnime.episodes && foundAnime.episodes.length > 0) {
        setEpisodes(foundAnime.episodes);
        setIsLoading(false);
      } else {
        // STEP 4: Crawl episodes if not already crawled
        await crawlAnimeEpisodes(foundAnime, foundDriver);
      }
    } catch (error) {
      console.error('Error loading anime:', error);
      toast.error('Erro ao carregar anime');
      setIsLoading(false);
    }
  };

  const crawlAnimeEpisodes = async (animeData: LocalAnime, driverData: Driver) => {
    if (!user) {
      // If not logged in, fallback to client-side crawl
      setIsCrawling(true);
      try {
        const { episodes: crawledEpisodes, errors } = await crawlEpisodes(
          animeData.sourceUrl,
          driverData,
          animeData.id,
          indexId ? parseInt(indexId) : undefined,
          animeData.episodes
        );

        if (errors.length > 0) {
          console.warn('Errors during crawl:', errors);
        }

        if (crawledEpisodes.length === 0) {
          toast.error('Nenhum episódio encontrado nesta página');
        } else {
          toast.success(`${crawledEpisodes.length} episódios encontrados`);
          
          // Save to local cache
          const updatedAnime = {
            ...animeData,
            episodes: crawledEpisodes,
            updatedAt: new Date().toISOString()
          };
          saveLocalAnime(updatedAnime);
          console.log('Saved anime to local cache:', updatedAnime.id);
        }

        setEpisodes(crawledEpisodes);
      } catch (error) {
        console.error('Error crawling episodes:', error);
        toast.error('Erro ao buscar episódios');
      } finally {
        setIsCrawling(false);
        setIsLoading(false);
      }
      return;
    }

    // If logged in, use backend crawl
    setIsCrawling(true);
    try {
      const { data, error } = await supabase.functions.invoke('crawl-episodes', {
        body: {
          anime_id: animeData.id,
          index_id: indexId ? parseInt(indexId) : null,
          anime_url: animeData.sourceUrl,
          driver_id: driverData.id
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        toast.error('Erro ao buscar episódios via backend');
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.success) {
        const { episodes: crawledEpisodes, cached, errors } = data;

        if (errors && errors.length > 0) {
          console.warn('Errors during crawl:', errors);
        }

        if (crawledEpisodes.length === 0) {
          toast.error('Nenhum episódio encontrado nesta página');
        } else {
          if (cached) {
            toast.success(`${crawledEpisodes.length} episódios carregados (cache)`);
          } else {
            toast.success(`${crawledEpisodes.length} episódios indexados e salvos`);
          }
          
          // Save to local cache
          const updatedAnime = {
            ...animeData,
            episodes: crawledEpisodes,
            updatedAt: new Date().toISOString()
          };
          saveLocalAnime(updatedAnime);
          console.log('Saved anime to local cache:', updatedAnime.id);
        }

        setEpisodes(crawledEpisodes);
      }
    } catch (error) {
      console.error('Error crawling episodes:', error);
      toast.error('Erro ao buscar episódios');
    } finally {
      setIsCrawling(false);
      setIsLoading(false);
    }
  };

  const handleWatchEpisode = async (episode: LocalEpisode) => {
    const episodeTitle = `${anime?.title} - Episódio ${episode.episodeNumber}`;
    
    toast.loading('Carregando vídeo...');
    
    try {
      const { data, error } = await supabase.functions.invoke('extract-video-data', {
        body: {
          episode_url: episode.sourceUrl,
          external_link_selector: driver?.config?.selectors?.externalLinkSelector
        }
      });

      toast.dismiss();

      if (error) {
        console.error('Error extracting video:', error);
        toast.error('Erro ao carregar vídeo');
        window.open(episode.sourceUrl, '_blank');
        return;
      }

      if (!data?.success || !data?.videoUrl) {
        console.log('No video found, opening episode page directly');
        toast.info('Abrindo página do episódio...');
        window.open(episode.sourceUrl, '_blank');
        return;
      }

      // Check video type and handle accordingly
      if (data.type === 'external') {
        // External link - open in new tab
        toast.info('Abrindo vídeo em nova aba...');
        window.open(data.videoUrl, '_blank');
        return;
      }

      if (data.type === 'iframe' || data.type === 'video') {
        // Embedded player - open in modal
        setCurrentEpisodeTitle(episodeTitle);
        setCurrentVideoData({
          type: data.type,
          url: data.videoUrl
        });
        setIsPlayerModalOpen(true);
        toast.success('Player carregado!');
        return;
      }

      // Fallback - open episode page
      toast.info('Abrindo página do episódio...');
      window.open(episode.sourceUrl, '_blank');
      
    } catch (error) {
      console.error('Error calling extract-video-data:', error);
      toast.dismiss();
      toast.error('Erro ao processar episódio');
      window.open(episode.sourceUrl, '_blank');
    }
  };

  if (isLoading || isCrawling) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            {isCrawling ? 'Buscando episódios...' : 'Carregando...'}
          </p>
        </div>
      </div>
    );
  }

  if (!anime) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/browse')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Anime Info */}
          <div className="grid md:grid-cols-[300px_1fr] gap-8 mb-12">
            <div className="space-y-4">
              {anime.coverUrl ? (
                <img
                  src={anime.coverUrl}
                  alt={anime.title}
                  referrerPolicy="no-referrer"
                  className="w-full rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-muted rounded-lg flex items-center justify-center">
                  <Play className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => window.open(anime.sourceUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
                Ver no Site Original
              </Button>
            </div>

            <div>
              <h1 className="font-display text-4xl font-bold mb-4">
                {anime.title.length > 200 ? `${anime.title.slice(0, 200)}...` : anime.title}
              </h1>
              {anime.synopsis && (
                <p className="text-muted-foreground mb-6">
                  {anime.synopsis}
                </p>
              )}
              <div className="flex gap-2">
                <Badge variant="secondary">
                  {episodes.length} episódios
                </Badge>
                {driver && (
                  <Badge variant="outline">
                    {driver.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Episodes List */}
          <div>
            <h2 className="font-display text-2xl font-bold mb-6">
              Episódios
            </h2>

            {episodes.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  Nenhum episódio encontrado. O site pode não ter episódios disponíveis ou os seletores do driver precisam ser ajustados.
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {episodes.map((episode) => (
                  <Card
                    key={episode.id}
                    className="p-4 hover:border-primary/50 transition-all cursor-pointer group"
                    onClick={() => handleWatchEpisode(episode)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Play className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">
                            EP {episode.episodeNumber}
                          </Badge>
                          {episode.title && (
                            <h3 className="font-semibold">
                              {episode.title}
                            </h3>
                          )}
                        </div>
                      </div>
                      <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <VideoPlayerModal
        isOpen={isPlayerModalOpen}
        onClose={() => setIsPlayerModalOpen(false)}
        videoData={currentVideoData}
        episodeTitle={currentEpisodeTitle}
      />
    </div>
  );
};

export default AnimeDetails;
