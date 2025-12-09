import {
  Button,
  Card,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@anidock/shared-ui';
import { ArrowLeft, Loader2, Plus, Link as LinkIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { db, Driver, AnimeIndex, LocalAnime } from '../lib/indexedDB';
import { fetchHTML } from '../lib/clientCrawler';

const AddAnime = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedDriverId = searchParams.get('driverId');

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>(preselectedDriverId || '');
  const [animeUrl, setAnimeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true);
  const [preview, setPreview] = useState<{
    title: string;
    synopsis: string;
    coverUrl: string;
    episodeCount: number;
  } | null>(null);

  const loadDrivers = useCallback(async () => {
    try {
      setIsLoadingDrivers(true);
      await db.init();
      const driversList = await db.getAllDrivers();
      setDrivers(driversList);
      
      if (preselectedDriverId && driversList.find(d => d.id === preselectedDriverId)) {
        setSelectedDriverId(preselectedDriverId);
      } else if (driversList.length === 1) {
        setSelectedDriverId(driversList[0].id);
      }
    } catch (error) {
      console.error('Error loading drivers:', error);
      toast.error(t('addAnime.loadDriversError'));
    } finally {
      setIsLoadingDrivers(false);
    }
  }, [preselectedDriverId, t]);

  useEffect(() => {
    loadDrivers();
  }, [loadDrivers]);

  const extractAnimeData = async (url: string, driver: Driver): Promise<LocalAnime | null> => {
    try {
      const html = await fetchHTML(url);
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const { selectors } = driver.config;

      // Extract title from anime page
      let title = '';
      if (selectors.animePageTitle) {
        const titleEl = doc.querySelector(selectors.animePageTitle);
        title = titleEl?.textContent?.trim() || '';
      }
      if (!title) {
        // Fallback to document title
        title = doc.title?.trim() || '';
      }

      // Extract synopsis
      let synopsis = '';
      if (selectors.animeSynopsis) {
        const synopsisEl = doc.querySelector(selectors.animeSynopsis);
        synopsis = synopsisEl?.textContent?.trim() || '';
      }

      // Extract cover image (might be on the anime page)
      let coverUrl = '';
      if (selectors.animeImage) {
        const imageEl = doc.querySelector(selectors.animeImage) as HTMLImageElement;
        coverUrl = imageEl?.src || imageEl?.getAttribute('data-src') || '';
        if (coverUrl && !coverUrl.startsWith('http')) {
          coverUrl = new URL(coverUrl, driver.config.baseUrl).href;
        }
      }

      // Extract episodes
      const episodes: { id: string; episodeNumber: number; title?: string; sourceUrl: string; watched?: boolean }[] = [];
      if (selectors.episodeList) {
        const episodeElements = doc.querySelectorAll(selectors.episodeList);
        episodeElements.forEach((element, index) => {
          try {
            // Extract episode number
            const numberEl = selectors.episodeNumber ? element.querySelector(selectors.episodeNumber) : null;
            const numberText = numberEl?.textContent?.trim();
            const episodeNumber = numberText ? parseInt(numberText.replace(/\D/g, '')) : index + 1;

            // Extract episode URL
            const urlEl = element.querySelector(selectors.episodeUrl) as HTMLAnchorElement;
            let sourceUrl = urlEl?.getAttribute('href') || '';
            if (sourceUrl && !sourceUrl.startsWith('http')) {
              sourceUrl = new URL(sourceUrl, driver.config.baseUrl).href;
            }

            if (!sourceUrl) return;

            // Extract episode title
            const titleEl = selectors.episodeTitle ? element.querySelector(selectors.episodeTitle) : null;
            const epTitle = titleEl?.textContent?.trim();

            episodes.push({
              id: `ep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              episodeNumber: episodeNumber || index + 1,
              title: epTitle,
              sourceUrl,
              watched: false,
            });
          } catch (err) {
            console.error('Error parsing episode:', err);
          }
        });
      }

      if (!title) {
        toast.error(t('addAnime.noTitleFound'));
        return null;
      }

      return {
        id: crypto.randomUUID(),
        driverId: driver.id,
        title,
        synopsis,
        coverUrl,
        sourceUrl: url,
        episodes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error extracting anime data:', error);
      throw error;
    }
  };

  const handlePreview = async () => {
    if (!selectedDriverId) {
      toast.error(t('addAnime.selectDriverFirst'));
      return;
    }
    if (!animeUrl.trim()) {
      toast.error(t('addAnime.enterUrlFirst'));
      return;
    }

    setIsLoading(true);
    setPreview(null);

    try {
      const driver = drivers.find(d => d.id === selectedDriverId);
      if (!driver) {
        toast.error(t('addAnime.driverNotFound'));
        return;
      }

      const animeData = await extractAnimeData(animeUrl.trim(), driver);
      if (animeData) {
        setPreview({
          title: animeData.title,
          synopsis: animeData.synopsis || '',
          coverUrl: animeData.coverUrl || '',
          episodeCount: animeData.episodes.length,
        });
        toast.success(t('addAnime.previewSuccess'));
      }
    } catch (error) {
      console.error('Error previewing anime:', error);
      toast.error(t('addAnime.previewError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAnime = async () => {
    if (!selectedDriverId) {
      toast.error(t('addAnime.selectDriverFirst'));
      return;
    }
    if (!animeUrl.trim()) {
      toast.error(t('addAnime.enterUrlFirst'));
      return;
    }

    setIsLoading(true);

    try {
      const driver = drivers.find(d => d.id === selectedDriverId);
      if (!driver) {
        toast.error(t('addAnime.driverNotFound'));
        return;
      }

      const animeData = await extractAnimeData(animeUrl.trim(), driver);
      if (!animeData) {
        return;
      }

      // Get or create index for this driver
      await db.init();
      const existingIndexes = await db.getIndexesByDriver(driver.id);
      
      let index: AnimeIndex;
      if (existingIndexes.length > 0) {
        index = existingIndexes[0];
        
        // Check if anime already exists
        const existingAnime = index.animes.find(a => a.sourceUrl === animeUrl.trim());
        if (existingAnime) {
          toast.error(t('addAnime.animeAlreadyExists'));
          return;
        }
        
        // Add new anime to existing index
        index.animes.push(animeData);
        index.totalAnimes = index.animes.length;
        index.updatedAt = new Date().toISOString();
      } else {
        // Create new index
        index = {
          id: crypto.randomUUID(),
          driverId: driver.id,
          name: driver.name,
          sourceUrl: driver.sourceUrl || driver.catalogUrl || '',
          totalAnimes: 1,
          animes: [animeData],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      await db.saveIndex(index);
      toast.success(t('addAnime.addSuccess', { title: animeData.title }));
      navigate('/browse');
    } catch (error) {
      console.error('Error adding anime:', error);
      toast.error(t('addAnime.addError'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingDrivers) {
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
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <LinkIcon className="h-8 w-8 text-primary" />
            <h1 className="font-display text-2xl font-bold text-gradient-primary">
              {t('addAnime.title')}
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-display font-bold mb-3">
            {t('addAnime.subtitle')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('addAnime.description')}
          </p>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <Label htmlFor="driver" className="text-base mb-2 block">
                {t('addAnime.selectDriver')}
              </Label>
              <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('addAnime.selectDriverPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {drivers.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {t('addAnime.noDriversAvailable')}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="animeUrl" className="text-base mb-2 block">
                {t('addAnime.animeUrl')}
              </Label>
              <Input
                id="animeUrl"
                type="url"
                value={animeUrl}
                onChange={(e) => setAnimeUrl(e.target.value)}
                placeholder={t('addAnime.animeUrlPlaceholder')}
              />
              <p className="text-sm text-muted-foreground mt-2">
                {t('addAnime.animeUrlHint')}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handlePreview}
                disabled={isLoading || !selectedDriverId || !animeUrl.trim()}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('addAnime.loading')}
                  </>
                ) : (
                  t('addAnime.preview')
                )}
              </Button>
              <Button
                onClick={handleAddAnime}
                disabled={isLoading || !selectedDriverId || !animeUrl.trim()}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('addAnime.adding')}
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('addAnime.addButton')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {preview && (
          <Card className="mt-6 p-6">
            <h3 className="font-display font-bold text-lg mb-4">
              {t('addAnime.previewTitle')}
            </h3>
            <div className="flex gap-4">
              {preview.coverUrl && (
                <img
                  src={preview.coverUrl}
                  alt={preview.title}
                  className="w-24 h-36 object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2">{preview.title}</h4>
                {preview.synopsis && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-3">
                    {preview.synopsis}
                  </p>
                )}
                <p className="text-sm text-primary">
                  {t('addAnime.episodesFound', { count: preview.episodeCount })}
                </p>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};

export default AddAnime;
