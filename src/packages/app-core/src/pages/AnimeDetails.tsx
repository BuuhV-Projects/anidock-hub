import {
  Badge,
  Button,
  Card,
  Input,
  Textarea,
  VideoPlayerModal,
} from '@anidock/shared-ui';
import { ArrowLeft, BookmarkPlus, Loader2, Play, Star, Tag, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { crawlEpisodes, extractVideoUrl } from '../lib/clientCrawler';
import {
  buildLibraryEntryId,
  db,
  Driver,
  LIBRARY_STATUSES,
  LibraryEntry,
  LibraryStatus,
  LocalAnime,
  LocalEpisode,
  WatchHistoryEntry,
} from '../lib/indexedDB';
import {
  addLibraryTag,
  LIBRARY_STATUS_LABELS_PT,
  removeFromLibrary,
  removeLibraryTag,
  setLibraryNotes,
  setLibraryScore,
  setLibraryStatus,
} from '../lib/library';
import { usePlataform } from '../contexts/plataform/usePlataform';

const AnimeDetails = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const animeUrl = searchParams.get('url');
  const driverId = searchParams.get('driverId');
  const { crawler } = usePlataform();
  
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
  const [libraryEntry, setLibraryEntry] = useState<LibraryEntry | null>(null);
  const [tagDraft, setTagDraft] = useState('');
  const [notesDraft, setNotesDraft] = useState('');

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
      const result = await crawlEpisodes(
        animeUrl, 
        driverData,
        undefined,
        crawler?.fetchHTML ? (url: string) => crawler.fetchHTML(url) : undefined
      );
      
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
  }, [animeUrl, driverId, navigate, crawler]);

  useEffect(() => {
    loadAnimeAndEpisodes();
  }, [loadAnimeAndEpisodes]);

  const refreshLibraryEntry = useCallback(async () => {
    if (!driverId || !animeUrl) {
      return;
    }
    const existing = await db.getLibraryEntry(buildLibraryEntryId(driverId, animeUrl));
    setLibraryEntry(existing ?? null);
    setNotesDraft(existing?.notes ?? '');
  }, [driverId, animeUrl]);

  useEffect(() => {
    refreshLibraryEntry();
  }, [refreshLibraryEntry]);

  const handleSetStatus = async (status: LibraryStatus) => {
    if (!driver || !anime) {
      return;
    }
    try {
      const updated = await setLibraryStatus(driver.id, anime, status);
      setLibraryEntry(updated);
      toast.success(`Marcado como "${LIBRARY_STATUS_LABELS_PT[status]}"`);
    } catch (error) {
      console.error('Error updating library status:', error);
      toast.error('Erro ao salvar status');
    }
  };

  const handleAddTag = async () => {
    if (!libraryEntry) {
      toast.error('Marque um status antes de adicionar tags');
      return;
    }
    const trimmed = tagDraft.trim();
    if (trimmed.length === 0) {
      return;
    }
    try {
      const updated = await addLibraryTag(libraryEntry.id, trimmed);
      if (updated) {
        setLibraryEntry(updated);
      }
      setTagDraft('');
    } catch (error) {
      console.error('Error adding tag:', error);
      toast.error('Erro ao adicionar tag');
    }
  };

  const handleRemoveTag = async (tag: string) => {
    if (!libraryEntry) {
      return;
    }
    try {
      const updated = await removeLibraryTag(libraryEntry.id, tag);
      if (updated) {
        setLibraryEntry(updated);
      }
    } catch (error) {
      console.error('Error removing tag:', error);
      toast.error('Erro ao remover tag');
    }
  };

  const handleSetScore = async (score: number) => {
    if (!libraryEntry) {
      toast.error('Marque um status antes de pontuar');
      return;
    }
    try {
      const nextScore = libraryEntry.score === score ? undefined : score;
      const updated = await setLibraryScore(libraryEntry.id, nextScore);
      if (updated) {
        setLibraryEntry(updated);
      }
    } catch (error) {
      console.error('Error setting score:', error);
      toast.error('Erro ao salvar nota');
    }
  };

  const handleSaveNotes = async () => {
    if (!libraryEntry) {
      toast.error('Marque um status antes de salvar notas');
      return;
    }
    try {
      const updated = await setLibraryNotes(libraryEntry.id, notesDraft);
      if (updated) {
        setLibraryEntry(updated);
      }
      toast.success('Notas salvas');
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Erro ao salvar notas');
    }
  };

  const handleRemoveFromLibrary = async () => {
    if (!libraryEntry) {
      return;
    }
    try {
      await removeFromLibrary(libraryEntry.id);
      setLibraryEntry(null);
      setNotesDraft('');
      toast.success('Removido da biblioteca');
    } catch (error) {
      console.error('Error removing from library:', error);
      toast.error('Erro ao remover da biblioteca');
    }
  };

  const handlePlayEpisode = async (episode: LocalEpisode) => {
    if (!driver || !anime) return;

    toast.loading('Carregando vídeo...');

    try {
      const result = await extractVideoUrl(
        episode.sourceUrl, 
        driver,
        crawler?.fetchHTML ? (url: string) => crawler.fetchHTML(url) : undefined
      );

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

      // Watching an episode is a strong "this is in progress" signal — make
      // sure the library reflects it. We auto-promote when no entry exists
      // yet, or when the user had it on "planned"; we do not override
      // "completed", "paused" or "dropped" which represent intentional
      // user choices.
      const shouldPromoteToWatching =
        !libraryEntry || libraryEntry.status === 'planned';
      if (shouldPromoteToWatching) {
        try {
          const promoted = await setLibraryStatus(driver.id, anime, 'watching');
          setLibraryEntry(promoted);
        } catch (error) {
          console.error('Error auto-promoting library entry to watching:', error);
        }
      }

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

            <Card className="p-6 space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <BookmarkPlus className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Biblioteca</h2>
                </div>
                {libraryEntry && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleRemoveFromLibrary}
                    className="text-muted-foreground hover:text-destructive gap-1 h-8"
                  >
                    <X className="h-3 w-3" />
                    Remover
                  </Button>
                )}
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                  Status
                </p>
                <div className="flex flex-wrap gap-2">
                  {LIBRARY_STATUSES.map(status => {
                    const isActive = libraryEntry?.status === status;
                    return (
                      <Button
                        key={status}
                        size="sm"
                        variant={isActive ? 'default' : 'outline'}
                        onClick={() => handleSetStatus(status)}
                        className="h-8"
                      >
                        {LIBRARY_STATUS_LABELS_PT[status]}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Nota
                </p>
                <div className="flex flex-wrap gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(scoreValue => {
                    const isActive = libraryEntry?.score === scoreValue;
                    return (
                      <Button
                        key={scoreValue}
                        size="sm"
                        variant={isActive ? 'default' : 'outline'}
                        onClick={() => handleSetScore(scoreValue)}
                        className="h-8 w-8 p-0"
                        disabled={!libraryEntry}
                      >
                        {scoreValue}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  Tags
                </p>
                {libraryEntry && libraryEntry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {libraryEntry.tags.map(tag => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="gap-1 cursor-pointer hover:bg-destructive/20"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        {tag}
                        <X className="h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={tagDraft}
                    onChange={event => setTagDraft(event.target.value)}
                    onKeyDown={event => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder={
                      libraryEntry
                        ? 'Nova tag (ex: shounen, romance)'
                        : 'Marque um status para adicionar tags'
                    }
                    disabled={!libraryEntry}
                    className="h-8"
                  />
                  <Button
                    size="sm"
                    onClick={handleAddTag}
                    disabled={!libraryEntry || tagDraft.trim().length === 0}
                    className="h-8"
                  >
                    Adicionar
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                  Notas
                </p>
                <Textarea
                  value={notesDraft}
                  onChange={event => setNotesDraft(event.target.value)}
                  placeholder={
                    libraryEntry
                      ? 'Suas anotações sobre este anime...'
                      : 'Marque um status para escrever notas'
                  }
                  disabled={!libraryEntry}
                  rows={3}
                  className="resize-none"
                />
                {libraryEntry && notesDraft !== (libraryEntry.notes ?? '') && (
                  <Button size="sm" onClick={handleSaveNotes} className="mt-2 h-8">
                    Salvar notas
                  </Button>
                )}
              </div>
            </Card>

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
