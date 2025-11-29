import { Button, Card, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from '@anidock/shared-ui';
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { AnimeIndex, db, Driver, LocalAnime, LocalEpisode } from '../lib/indexedDB';
import { useTranslation } from 'react-i18next';

const EditIndexedAnime = () => {
  const { t } = useTranslation();
  const { driverId } = useParams();
  const [searchParams] = useSearchParams();
  const animeId = searchParams.get('animeId');
  
  const [driver, setDriver] = useState<Driver | null>(null);
  const [indexes, setIndexes] = useState<AnimeIndex[]>([]);
  const [animes, setAnimes] = useState<LocalAnime[]>([]);
  const [selectedAnimeId, setSelectedAnimeId] = useState<string>(animeId || '');
  const [selectedAnime, setSelectedAnime] = useState<LocalAnime | null>(null);
  
  const [animeForm, setAnimeForm] = useState({
    title: '',
    synopsis: '',
    coverUrl: '',
    sourceUrl: ''
  });
  
  const [episodes, setEpisodes] = useState<LocalEpisode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedAnimeId && animes.length > 0) {
      const anime = animes.find(a => a.id === selectedAnimeId);
      if (anime) {
        setSelectedAnime(anime);
        setAnimeForm({
          title: anime.title,
          synopsis: anime.synopsis || '',
          coverUrl: anime.coverUrl || '',
          sourceUrl: anime.sourceUrl
        });
        setEpisodes(anime.episodes || []);
      }
    }
  }, [selectedAnimeId, animes]);

  const fetchDriverAndIndexes = useCallback(async () => {
    try {
      setIsLoading(true);
      await db.init();

      const driverData = await db.getDriver(driverId!);
      if (!driverData) {
        toast.error(t('editIndexedAnime.notFound'));
        navigate('/drivers');
        return;
      }
      setDriver(driverData);

      const indexesData = await db.getIndexesByDriver(driverId!);
      setIndexes(indexesData);

      // Collect all animes from all indexes
      const allAnimes: LocalAnime[] = [];
      indexesData.forEach(index => {
        allAnimes.push(...index.animes);
      });
      setAnimes(allAnimes);

      if (animeId) {
        setSelectedAnimeId(animeId);
      }
    } catch (error: any) {
      console.error('Error fetching driver:', error);
      toast.error(t('editIndexedAnime.loadError'));
      navigate('/drivers');
    } finally {
      setIsLoading(false);
    }
  }, [driverId, navigate, animeId, t]);

  const addEpisode = () => {
    setEpisodes([...episodes, {
      id: crypto.randomUUID(),
      episodeNumber: episodes.length + 1,
      sourceUrl: '',
    }]);
  };

  const removeEpisode = (id: string) => {
    setEpisodes(episodes.filter(ep => ep.id !== id));
  };

  const updateEpisode = (id: string, field: string, value: any) => {
    setEpisodes(episodes.map(ep => 
      ep.id === id ? { ...ep, [field]: value } : ep
    ));
  };

  const handleSave = async () => {
    if (!driver || !selectedAnime) return;

    setIsSaving(true);
    try {
      // Update anime data
      const updatedAnime: LocalAnime = {
        id: selectedAnime.id,
        driverId: driver.id,
        title: animeForm.title,
        sourceUrl: selectedAnime.sourceUrl,
        synopsis: animeForm.synopsis || undefined,
        coverUrl: animeForm.coverUrl || undefined,
        episodes: episodes,
        createdAt: selectedAnime.createdAt,
        updatedAt: new Date().toISOString(),
      };

      // Find and update in indexes
      for (const index of indexes) {
        const animeIndex = index.animes.findIndex(a => a.id === selectedAnime.id);
        if (animeIndex !== -1) {
          index.animes[animeIndex] = updatedAnime;
          await db.saveIndex(index);
          break;
        }
      }

      toast.success(t('editIndexedAnime.saveSuccess'));
      navigate('/drivers');
    } catch (error: any) {
      console.error('Error saving anime:', error);
      toast.error(t('editIndexedAnime.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchDriverAndIndexes();
  }, [fetchDriverAndIndexes]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/drivers')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t('editIndexedAnime.back')}
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !selectedAnime} className="gap-2">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('editIndexedAnime.saving')}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {t('editIndexedAnime.save')}
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h2 className="text-3xl font-bold mb-6">{t('editIndexedAnime.title')}</h2>

        {animes.length > 0 && (
          <Card className="p-6 mb-6">
            <Label htmlFor="animeSelect">{t('editIndexedAnime.selectAnime')}</Label>
            <Select value={selectedAnimeId} onValueChange={setSelectedAnimeId}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder={t('editIndexedAnime.chooseAnime')} />
              </SelectTrigger>
              <SelectContent>
                {animes.map((anime) => (
                  <SelectItem key={anime.id} value={anime.id}>
                    {anime.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>
        )}

        {selectedAnime && (
          <>
            <Card className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">{t('editIndexedAnime.animeInfo')}</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">{t('editIndexedAnime.animeTitle')} {t('editIndexedAnime.required')}</Label>
                  <Input
                    id="title"
                    value={animeForm.title}
                    onChange={(e) => setAnimeForm({...animeForm, title: e.target.value})}
                    className="mt-2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="synopsis">{t('editIndexedAnime.animeSynopsis')}</Label>
                  <Textarea
                    id="synopsis"
                    value={animeForm.synopsis}
                    onChange={(e) => setAnimeForm({...animeForm, synopsis: e.target.value})}
                    className="mt-2 h-32"
                  />
                </div>
                <div>
                  <Label htmlFor="coverUrl">{t('editIndexedAnime.animeCover')}</Label>
                  <Input
                    id="coverUrl"
                    type="url"
                    value={animeForm.coverUrl}
                    onChange={(e) => setAnimeForm({...animeForm, coverUrl: e.target.value})}
                    className="mt-2"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{t('editIndexedAnime.episodes')}</h3>
                <Button onClick={addEpisode} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t('editIndexedAnime.addEpisode')}
                </Button>
              </div>

              <div className="space-y-4">
                {episodes.map((episode) => (
                  <Card key={episode.id} className="p-4 border-border/50">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>{t('editIndexedAnime.episodeNumber')} {t('editIndexedAnime.required')}</Label>
                            <Input
                              type="number"
                              value={episode.episodeNumber || ''}
                              onChange={(e) => updateEpisode(episode.id, 'episodeNumber', parseInt(e.target.value))}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>{t('editIndexedAnime.episodeTitle')}</Label>
                            <Input
                              value={episode.title || ''}
                              onChange={(e) => updateEpisode(episode.id, 'title', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>{t('editIndexedAnime.episodeUrl')} {t('editIndexedAnime.required')}</Label>
                          <Input
                            type="url"
                            value={episode.sourceUrl}
                            onChange={(e) => updateEpisode(episode.id, 'sourceUrl', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEpisode(episode.id)}
                        className="shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default EditIndexedAnime;
