import { Button, Card, VideoPlayerModal } from '@anidock/shared-ui';
import { ArrowLeft, Loader2, Play } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { crawlEpisodes, extractVideoUrl } from '../lib/clientCrawler';
import { db, Driver, LocalAnime, LocalEpisode, WatchHistoryEntry } from '../lib/indexedDB';

const AnimeDetails = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const animeUrl = searchParams.get('url');
  const driverId = searchParams.get('driverId');
  
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

  const loadAnimeAndEpisodes = useCallback(async () => {
    if (!animeUrl || !driverId) {
      toast.error('Dados inválidos');
      navigate('/browse');
      return;
    }

    setIsLoading(true);
    try {
      await db.init();

      // Get driver
      const driverData = await db.getDriver(driverId);
      if (!driverData) {
        toast.error('Driver não encontrado');
        navigate('/browse');
        return;
      }
      setDriver(driverData);

      // Find anime in indexes
      const indexes = await db.getIndexesByDriver(driverId);
      let foundAnime: LocalAnime | null = null;
      
      for (const index of indexes) {
        foundAnime = index.animes.find(a => a.sourceUrl === animeUrl) || null;
        if (foundAnime) break;
      }

      if (!foundAnime) {
        toast.error('Anime não encontrado');
        navigate('/browse');
        return;
      }

      setAnime(foundAnime);

      // Load episodes if already cached
      if (foundAnime.episodes && foundAnime.episodes.length > 0) {
        setEpisodes(foundAnime.episodes);
        setIsLoading(false);
        return;
      }

      // Crawl episodes
      setIsCrawling(true);
      const result = await crawlEpisodes(animeUrl, driverData);
      
      if (result.errors.length > 0) {
        console.warn('Episode crawl errors:', result.errors);
      }

      if (result.episodes.length === 0) {
        toast.error('Nenhum episódio encontrado');
      } else {
        // Update anime with episodes
        foundAnime.episodes = result.episodes;
        
        // Find and update the index
        for (const index of indexes) {
          const animeIndex = index.animes.findIndex(a => a.sourceUrl === animeUrl);
          if (animeIndex !== -1) {
            index.animes[animeIndex] = foundAnime;
            await db.saveIndex(index);
            break;
          }
        }
        
        setEpisodes(result.episodes);
      }
    } catch (error) {
      console.error('Error loading anime:', error);
      toast.error('Erro ao carregar anime');
    } finally {
      setIsLoading(false);
      setIsCrawling(false);
    }
  }, [animeUrl, driverId, navigate]);

  useEffect(() => {
    loadAnimeAndEpisodes();
  }, [loadAnimeAndEpisodes]);

  const handlePlayEpisode = async (episode: LocalEpisode) => {
    if (!driver || !anime) return;

    toast.loading('Carregando vídeo...');

    try {
      const result = await extractVideoUrl(episode.sourceUrl, driver);

      toast.dismiss();

      if (!result.videoUrl) {
        toast.info('Abrindo página do episódio...');
        window.open(episode.sourceUrl, '_blank');
        return;
      }

      // Save to watch history
      const historyEntry: WatchHistoryEntry = {
        id: crypto.randomUUID(),
        animeTitle: anime.title,
        animeCover: anime.coverUrl,
        animeSourceUrl: anime.sourceUrl,
        episodeNumber: episode.episodeNumber,
        episodeTitle: episode.title,
        episodeUrl: episode.sourceUrl,
        driverId: driver.id,
        watchedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await db.saveWatchHistory(historyEntry);

      // Handle different video types
      if (result.videoType === 'external') {
        window.open(result.videoUrl, '_blank');
      } else {
        setCurrentVideoData({
          type: result.videoType,
          url: result.videoUrl
        });
        setCurrentEpisodeTitle(`${anime.title} - Episódio ${episode.episodeNumber}`);
        setIsPlayerModalOpen(true);
      }
    } catch (error) {
      toast.dismiss();
      console.error('Error playing episode:', error);
      toast.error('Erro ao carregar vídeo');
      window.open(episode.sourceUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!anime) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/browse')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-[300px_1fr] gap-8">
          <div>
            {anime.coverUrl && (
              <Card className="overflow-hidden border-border/50">
                <img
                  src={anime.coverUrl}
                  alt={anime.title}
                  className="w-full aspect-[2/3] object-cover"
                />
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gradient-primary mb-4">{anime.title}</h1>
              {anime.synopsis && (
                <p className="text-muted-foreground leading-relaxed">{anime.synopsis}</p>
              )}
            </div>

            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Episódios</h2>
              
              {isCrawling ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Carregando episódios...</p>
                </div>
              ) : episodes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum episódio encontrado
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {episodes.map((episode) => (
                    <Button
                      key={episode.id}
                      variant="outline"
                      className="h-auto py-4 flex-col gap-2"
                      onClick={() => handlePlayEpisode(episode)}
                    >
                      <Play className="h-5 w-5" />
                      <span className="font-semibold">EP {episode.episodeNumber}</span>
                      {episode.title && (
                        <span className="text-xs text-muted-foreground line-clamp-2">
                          {episode.title}
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      <VideoPlayerModal
        isOpen={isPlayerModalOpen}
        onClose={() => {
          setIsPlayerModalOpen(false);
          setCurrentVideoData(null);
        }}
        videoData={currentVideoData}
        episodeTitle={currentEpisodeTitle}
      />
    </div>
  );
};

export default AnimeDetails;
