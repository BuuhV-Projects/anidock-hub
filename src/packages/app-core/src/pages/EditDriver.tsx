import { Badge, Button, Card, Switch } from '@anidock/shared-ui';
import { ArrowLeft, Loader2, RefreshCw, Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { usePlataform } from '../contexts/plataform/usePlataform';
import { db, Driver } from '../lib/indexedDB';
import { validateSelectors as validateSelectorsService, type SelectorValidationResult } from '../lib/selectorValidator';
import { SelectorInput } from './components/SelectorInput';

const EditDriver = () => {
  const { t } = useTranslation();
  const { crawler } = usePlataform();
  const navigate = useNavigate();
  const { driverId } = useParams();

  const [driver, setDriver] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [requiresExternalLink, setRequiresExternalLink] = useState(false);

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
    videoPlayer: '',
    externalLinkSelector: '',
  });

  const [validationResult, setValidationResult] = useState<SelectorValidationResult | null>(null);

  const loadDriver = useCallback(async () => {
    if (!driverId) return;
    try {
      await db.init();
      const driverData = await db.getDriver(driverId!);

      if (!driverData) {
        toast.error(t('editDriver.notFound'));
        navigate('/drivers');
        return;
      }

      setDriver(driverData);
      setRequiresExternalLink(driverData.config?.requiresExternalLink || false);

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
          videoPlayer: driverData.config.selectors.videoPlayer || '',
          externalLinkSelector: driverData.config.selectors.externalLinkSelector || '',
        });
      }
    } catch (error: any) {
      console.error('Error loading driver:', error);
      toast.error(t('editDriver.loadError'));
      navigate('/drivers');
    } finally {
      setIsLoading(false);
    }
  }, [driverId, navigate, t]);

  const validateSelectors = useCallback(async () => {
    const urlToValidate = driver?.catalogUrl || driver?.sourceUrl || driver?.config?.baseUrl;
    if (!urlToValidate) {
      toast.error(t('createDriver.validation.noUrl'));
      return;
    }

    setIsValidating(true);
    try {
      const fetchFn = crawler?.fetchHTML || (async (url: string) => {
        const response = await fetch(url);
        return response.text();
      });
      
      const result = await validateSelectorsService(urlToValidate, selectors, fetchFn);
      setValidationResult(result);
      
      if (result.errors.length > 0) {
        result.errors.forEach(error => console.warn('Validation warning:', error));
      }
      
      toast.success(t('createDriver.validation.success'));
    } catch (error) {
      console.error('Validation error:', error);
      toast.error(t('createDriver.validation.error'));
    } finally {
      setIsValidating(false);
    }
  }, [driver?.catalogUrl, driver?.sourceUrl, driver?.config?.baseUrl, selectors, t, crawler]);

  const handleSave = async () => {
    if (!driver) return;

    setIsSaving(true);
    try {
      const updatedDriver: Driver = {
        ...driver,
        config: {
          ...driver.config,
          requiresExternalLink,
          selectors: {
            animeList: selectors.animeList,
            animeTitle: selectors.animeTitle,
            animeUrl: selectors.animeUrl,
            animeImage: selectors.animeImage,
            animeSynopsis: selectors.animeSynopsis,
            animePageTitle: selectors.animePageTitle,
            episodeList: selectors.episodeList,
            episodeNumber: selectors.episodeNumber,
            episodeTitle: selectors.episodeTitle,
            episodeUrl: selectors.episodeUrl,
            videoPlayer: selectors.videoPlayer,
            externalLinkSelector: selectors.externalLinkSelector,
          },
        },
        updatedAt: new Date().toISOString(),
      };

      await db.saveDriver(updatedDriver);

      toast.success(t('editDriver.saveSuccess'));
      navigate('/drivers');
    } catch (error: any) {
      console.error('Error saving driver:', error);
      toast.error(t('editDriver.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    loadDriver();
  }, [loadDriver]);

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
              {t('editDriver.back')}
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('editDriver.saving')}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {t('editDriver.save')}
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

        <Card className="p-6 mb-6 bg-primary/5 border-primary/20">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">{t('createDriver.validation.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('createDriver.validation.description')}</p>
            </div>
            <Button
              onClick={validateSelectors}
              disabled={isValidating}
              variant="outline"
              className="gap-2 shrink-0"
            >
              {isValidating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('createDriver.validation.validating')}
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  {t('createDriver.validation.validate')}
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Validation Info */}
        {validationResult && (
          <div className="p-4 rounded-lg bg-muted/50 space-y-2 text-sm">
            <p className="font-medium">{t('createDriver.validationPages')}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant={validationResult.pages.catalog ? "default" : "destructive"}>
                {t('createDriver.catalogPage')}: {validationResult.pages.catalog ? '✓' : '✗'}
              </Badge>
              <Badge variant={validationResult.pages.anime ? "default" : "secondary"}>
                {t('createDriver.animePage')}: {validationResult.pages.anime ? '✓' : '✗'}
              </Badge>
              <Badge variant={validationResult.pages.episode ? "default" : "secondary"}>
                {t('createDriver.episodePage')}: {validationResult.pages.episode ? '✓' : '✗'}
              </Badge>
            </div>
            {validationResult.errors.length > 0 && (
              <p className="text-destructive text-xs">{validationResult.errors[0]}</p>
            )}
          </div>
        )}

        <div className="space-y-6">
          {/* External Link Configuration */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{t('editDriver.requiresExternalLink')}</h3>
                <p className="text-sm text-muted-foreground">{t('editDriver.requiresExternalLinkDescription')}</p>
              </div>
              <Switch
                checked={requiresExternalLink}
                onCheckedChange={setRequiresExternalLink}
              />
            </div>
          </Card>

          {/* Anime List Selectors */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-2">{t('editDriver.animeListSelectors')}</h3>
            <p className="text-xs text-muted-foreground mb-4">{t('createDriver.validatedOn')}: {t('createDriver.catalogPage')}</p>
            <div className="space-y-4">
              <SelectorInput
                id="animeList"
                label={t('editDriver.animeContainer')}
                value={selectors.animeList}
                onChange={(value) => setSelectors({ ...selectors, animeList: value })}
                placeholder=".anime-item, article.anime"
                count={validationResult?.counts.animeList}
                t={t}
              />
              <SelectorInput
                id="animeTitle"
                label={t('editDriver.animeTitle')}
                value={selectors.animeTitle}
                onChange={(value) => setSelectors({ ...selectors, animeTitle: value })}
                placeholder="h2.title, .anime-title"
                count={validationResult?.counts.animeTitle}
                required
                t={t}
              />
              <SelectorInput
                id="animeUrl"
                label={t('editDriver.animeUrl')}
                value={selectors.animeUrl}
                onChange={(value) => setSelectors({ ...selectors, animeUrl: value })}
                placeholder="a, .anime-link"
                count={validationResult?.counts.animeUrl}
                required
                t={t}
              />
              <SelectorInput
                id="animeImage"
                label={t('editDriver.animeImage')}
                value={selectors.animeImage}
                onChange={(value) => setSelectors({ ...selectors, animeImage: value })}
                placeholder="img.cover, .anime-image"
                count={validationResult?.counts.animeImage}
                t={t}
              />
            </div>
          </Card>

          {/* Anime Page Selectors */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-2">{t('createDriver.animePageSelectors')}</h3>
            <p className="text-xs text-muted-foreground mb-4">{t('createDriver.validatedOn')}: {t('createDriver.animePage')}</p>
            <div className="space-y-4">
              <SelectorInput
                id="animeSynopsis"
                label={t('editDriver.animeSynopsis')}
                value={selectors.animeSynopsis}
                onChange={(value) => setSelectors({ ...selectors, animeSynopsis: value })}
                placeholder=".synopsis, .description"
                count={validationResult?.counts.animeSynopsis}
                t={t}
              />
              <SelectorInput
                id="animePageTitle"
                label={t('editDriver.animePageTitle')}
                value={selectors.animePageTitle}
                onChange={(value) => setSelectors({ ...selectors, animePageTitle: value })}
                placeholder="h1.title, .page-title"
                count={validationResult?.counts.animePageTitle}
                t={t}
              />
            </div>
          </Card>

          {/* Episode Selectors */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-2">{t('editDriver.episodeSelectors')}</h3>
            <p className="text-xs text-muted-foreground mb-4">{t('createDriver.validatedOn')}: {t('createDriver.animePage')}</p>
            <div className="space-y-4">
              <SelectorInput
                id="episodeList"
                label={t('editDriver.episodeContainer')}
                value={selectors.episodeList}
                onChange={(value) => setSelectors({ ...selectors, episodeList: value })}
                placeholder=".episode, .ep-item"
                count={validationResult?.counts.episodeList}
                required
                t={t}
              />
              <SelectorInput
                id="episodeNumber"
                label={t('editDriver.episodeNumber')}
                value={selectors.episodeNumber}
                onChange={(value) => setSelectors({ ...selectors, episodeNumber: value })}
                placeholder=".ep-number, .number"
                count={validationResult?.counts.episodeNumber}
                required
                t={t}
              />
              <SelectorInput
                id="episodeTitle"
                label={t('editDriver.episodeTitle')}
                value={selectors.episodeTitle}
                onChange={(value) => setSelectors({ ...selectors, episodeTitle: value })}
                placeholder=".ep-title, .title"
                count={validationResult?.counts.episodeTitle}
                t={t}
              />
              <SelectorInput
                id="episodeUrl"
                label={t('editDriver.episodeUrl')}
                value={selectors.episodeUrl}
                onChange={(value) => setSelectors({ ...selectors, episodeUrl: value })}
                placeholder="a, .ep-link"
                count={validationResult?.counts.episodeUrl}
                required
                t={t}
              />
            </div>
          </Card>

          {/* Player Selectors */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-2">{t('editDriver.playerSelectors')}</h3>
            <p className="text-xs text-muted-foreground mb-4">{t('createDriver.validatedOn')}: {t('createDriver.episodePage')}</p>
            <div className="space-y-4">
              <SelectorInput
                id="videoPlayer"
                label={t('editDriver.videoPlayer')}
                value={selectors.videoPlayer}
                onChange={(value) => setSelectors({ ...selectors, videoPlayer: value })}
                placeholder="iframe, video, .player"
                count={validationResult?.counts.videoPlayer}
                t={t}
              />
              <SelectorInput
                id="externalLinkSelector"
                label={t('editDriver.externalLinkSelector')}
                value={selectors.externalLinkSelector}
                onChange={(value) => setSelectors({ ...selectors, externalLinkSelector: value })}
                placeholder="a.external-link, .download-link"
                count={validationResult?.counts.externalLinkSelector}
                t={t}
              />
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default EditDriver;
