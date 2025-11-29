import { Button, Card, Input, Label } from '@anidock/shared-ui';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { db, Driver } from '../lib/indexedDB';

const EditDriver = () => {
  const navigate = useNavigate();
  const { driverId } = useParams();
  
  const [driver, setDriver] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [selectors, setSelectors] = useState({
    animeList: '',
    animeTitle: '',
    animeImage: '',
    animeSynopsis: '',
    animeUrl: '',
    animePageTitle: '',
    episodeList: '',
    episodeNumber: '',
    episodeTitle: '',
    episodeUrl: '',
  });

  useEffect(() => {
    if (driverId) {
      loadDriver();
    }
  }, [driverId]);

  const loadDriver = async () => {
    try {
      await db.init();
      const driverData = await db.getDriver(driverId!);

      if (!driverData) {
        toast.error('Driver não encontrado');
        navigate('/drivers');
        return;
      }

      setDriver(driverData);
      
      if (driverData.config?.selectors) {
        setSelectors({
          animeList: driverData.config.selectors.animeList || '',
          animeTitle: driverData.config.selectors.animeTitle || '',
          animeImage: driverData.config.selectors.animeImage || '',
          animeSynopsis: driverData.config.selectors.animeSynopsis || '',
          animeUrl: driverData.config.selectors.animeUrl || '',
          animePageTitle: driverData.config.selectors.animePageTitle || '',
          episodeList: driverData.config.selectors.episodeList || '',
          episodeNumber: driverData.config.selectors.episodeNumber || '',
          episodeTitle: driverData.config.selectors.episodeTitle || '',
          episodeUrl: driverData.config.selectors.episodeUrl || '',
        });
      }
    } catch (error: any) {
      console.error('Error loading driver:', error);
      toast.error('Erro ao carregar driver');
      navigate('/drivers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!driver) return;

    setIsSaving(true);
    try {
      const updatedDriver: Driver = {
        ...driver,
        config: {
          ...driver.config,
          selectors: {
            ...driver.config.selectors,
            ...selectors,
          },
        },
        updatedAt: new Date().toISOString(),
      };

      await db.saveDriver(updatedDriver);

      toast.success('Driver atualizado com sucesso!');
      navigate('/drivers');
    } catch (error: any) {
      console.error('Error saving driver:', error);
      toast.error('Erro ao salvar driver');
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

  if (!driver) {
    return null;
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
                  Salvar
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">{driver.name}</h2>
          <p className="text-muted-foreground">{driver.domain}</p>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Seletores da Lista de Animes</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="animeList">Container de cada anime</Label>
                <Input
                  id="animeList"
                  value={selectors.animeList}
                  onChange={(e) => setSelectors({...selectors, animeList: e.target.value})}
                  placeholder=".anime-item, article.anime"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="animeTitle">Título *</Label>
                <Input
                  id="animeTitle"
                  value={selectors.animeTitle}
                  onChange={(e) => setSelectors({...selectors, animeTitle: e.target.value})}
                  placeholder="h2.title, .anime-title"
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="animeUrl">Link do Anime *</Label>
                <Input
                  id="animeUrl"
                  value={selectors.animeUrl}
                  onChange={(e) => setSelectors({...selectors, animeUrl: e.target.value})}
                  placeholder="a, .anime-link"
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="animeImage">Imagem de Capa</Label>
                <Input
                  id="animeImage"
                  value={selectors.animeImage}
                  onChange={(e) => setSelectors({...selectors, animeImage: e.target.value})}
                  placeholder="img.cover, .anime-image"
                  className="mt-2"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Seletores de Episódios</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="episodeList">Container de cada episódio *</Label>
                <Input
                  id="episodeList"
                  value={selectors.episodeList}
                  onChange={(e) => setSelectors({...selectors, episodeList: e.target.value})}
                  placeholder=".episode, .ep-item"
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="episodeNumber">Número do Episódio *</Label>
                <Input
                  id="episodeNumber"
                  value={selectors.episodeNumber}
                  onChange={(e) => setSelectors({...selectors, episodeNumber: e.target.value})}
                  placeholder=".ep-number, .number"
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="episodeUrl">Link do Episódio *</Label>
                <Input
                  id="episodeUrl"
                  value={selectors.episodeUrl}
                  onChange={(e) => setSelectors({...selectors, episodeUrl: e.target.value})}
                  placeholder="a, .ep-link"
                  className="mt-2"
                  required
                />
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default EditDriver;
