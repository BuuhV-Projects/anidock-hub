import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Input, Label, Textarea, Tabs, TabsContent, TabsList, TabsTrigger } from '@anidock/shared-ui';
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { db, Driver, LocalAnime, LocalEpisode, AnimeIndex } from '../lib/indexedDB';

interface AnimeForm {
  id: string;
  title: string;
  synopsis: string;
  coverUrl: string;
  sourceUrl: string;
}

interface EpisodeForm {
  id: string;
  url: string;
  episodeNumber: number | null;
  title: string;
}

const IndexManual = () => {
  const { driverId } = useParams();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [animes, setAnimes] = useState<AnimeForm[]>([{
    id: crypto.randomUUID(),
    title: '',
    synopsis: '',
    coverUrl: '',
    sourceUrl: ''
  }]);
  const [episodes, setEpisodes] = useState<EpisodeForm[]>([{
    id: crypto.randomUUID(),
    url: '',
    episodeNumber: null,
    title: ''
  }]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDriver();
  }, [driverId]);

  const fetchDriver = async () => {
    try {
      setIsLoading(true);
      await db.init();

      const driverData = await db.getDriver(driverId!);
      if (!driverData) {
        toast.error('Driver não encontrado');
        navigate('/drivers');
        return;
      }

      setDriver(driverData);
    } catch (error: any) {
      console.error('Error fetching driver:', error);
      toast.error('Erro ao carregar driver');
      navigate('/drivers');
    } finally {
      setIsLoading(false);
    }
  };

  const addAnime = () => {
    setAnimes([...animes, {
      id: crypto.randomUUID(),
      title: '',
      synopsis: '',
      coverUrl: '',
      sourceUrl: ''
    }]);
  };

  const removeAnime = (id: string) => {
    setAnimes(animes.filter(a => a.id !== id));
  };

  const updateAnime = (id: string, field: string, value: string) => {
    setAnimes(animes.map(a => 
      a.id === id ? { ...a, [field]: value } : a
    ));
  };

  const addEpisode = () => {
    setEpisodes([...episodes, {
      id: crypto.randomUUID(),
      url: '',
      episodeNumber: null,
      title: ''
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
    if (!driver) return;

    // Validate
    const validAnimes = animes.filter(a => a.title.trim() && a.sourceUrl.trim());
    if (validAnimes.length === 0) {
      toast.error('Adicione pelo menos um anime válido');
      return;
    }

    setIsSaving(true);
    try {
      // Convert to LocalAnime format
      const localAnimes: LocalAnime[] = validAnimes.map(anime => ({
        id: anime.id,
        driverId: driver.id,
        title: anime.title,
        synopsis: anime.synopsis || undefined,
        coverUrl: anime.coverUrl || undefined,
        sourceUrl: anime.sourceUrl,
        episodes: episodes
          .filter(ep => ep.url.trim() && ep.episodeNumber !== null)
          .map(ep => ({
            id: ep.id,
            episodeNumber: ep.episodeNumber!,
            title: ep.title || undefined,
            sourceUrl: ep.url,
            watched: false,
          })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      // Create new index
      const newIndex: AnimeIndex = {
        id: crypto.randomUUID(),
        driverId: driver.id,
        name: `Manual Index - ${driver.name}`,
        sourceUrl: driver.sourceUrl || driver.config.baseUrl,
        totalAnimes: localAnimes.length,
        animes: localAnimes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.saveIndex(newIndex);

      toast.success(`Indexação manual salva com ${localAnimes.length} animes!`);
      setTimeout(() => {
        navigate('/drivers');
      }, 1500);
    } catch (error: any) {
      console.error('Error saving manual index:', error);
      toast.error('Erro ao salvar indexação');
    } finally {
      setIsSaving(false);
    }
  };

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
              Voltar
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar Indexação
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <h2 className="text-3xl font-bold mb-2">Indexação Manual</h2>
        <p className="text-muted-foreground mb-6">
          Driver: {driver?.name}
        </p>

        <Tabs defaultValue="animes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="animes">Animes ({animes.length})</TabsTrigger>
            <TabsTrigger value="episodes">Episódios ({episodes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="animes" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Lista de Animes</h3>
              <Button onClick={addAnime} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Anime
              </Button>
            </div>

            {animes.map((anime, index) => (
              <Card key={anime.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label>Título *</Label>
                      <Input
                        value={anime.title}
                        onChange={(e) => updateAnime(anime.id, 'title', e.target.value)}
                        placeholder="Nome do anime"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>URL do Anime *</Label>
                      <Input
                        type="url"
                        value={anime.sourceUrl}
                        onChange={(e) => updateAnime(anime.id, 'sourceUrl', e.target.value)}
                        placeholder="https://site.com/anime/nome"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>URL da Capa</Label>
                      <Input
                        type="url"
                        value={anime.coverUrl}
                        onChange={(e) => updateAnime(anime.id, 'coverUrl', e.target.value)}
                        placeholder="https://site.com/cover.jpg"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Sinopse</Label>
                      <Textarea
                        value={anime.synopsis}
                        onChange={(e) => updateAnime(anime.id, 'synopsis', e.target.value)}
                        placeholder="Descrição do anime..."
                        className="mt-1 h-24"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAnime(anime.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="episodes" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Lista de Episódios</h3>
              <Button onClick={addEpisode} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Episódio
              </Button>
            </div>

            {episodes.map((episode) => (
              <Card key={episode.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div>
                      <Label>Número *</Label>
                      <Input
                        type="number"
                        value={episode.episodeNumber || ''}
                        onChange={(e) => updateEpisode(episode.id, 'episodeNumber', parseInt(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Título</Label>
                      <Input
                        value={episode.title}
                        onChange={(e) => updateEpisode(episode.id, 'title', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>URL do Episódio *</Label>
                      <Input
                        type="url"
                        value={episode.url}
                        onChange={(e) => updateEpisode(episode.id, 'url', e.target.value)}
                        placeholder="https://site.com/anime/ep-1"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEpisode(episode.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default IndexManual;
