import { Button, Card, Input, Label, Badge } from '@anidock/shared-ui';
import { ArrowLeft, Loader2, Save, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { db, Driver } from '../lib/indexedDB';
import { useTranslation } from 'react-i18next';
import { fetchHTML } from '../lib/clientCrawler';

const EditDriver = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { driverId } = useParams();

  const [driver, setDriver] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationHtml, setValidationHtml] = useState<string>('');

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

  const [selectorCounts, setSelectorCounts] = useState<Record<string, number>>({});

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
      toast.error(t('editDriver.loadError'));
      navigate('/drivers');
    } finally {
      setIsLoading(false);
    }
  }, [driverId, navigate, t]);

  const validateSelectors = useCallback(async () => {
    if (!driver?.sourceUrl) {
      toast.error(t('createDriver.validation.noUrl'));
      return;
    }

    setIsValidating(true);
    try {
      const html = await fetchHTML(driver.sourceUrl);
      setValidationHtml(html);

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const counts: Record<string, number> = {};
      Object.entries(selectors).forEach(([key, selector]) => {
        if (selector) {
          try {
            const elements = doc.querySelectorAll(selector);
            counts[key] = elements.length;
          } catch {
            counts[key] = 0;
          }
        }
      });

      setSelectorCounts(counts);
      toast.success(t('createDriver.validation.success'));
    } catch (error) {
      console.error('Validation error:', error);
      toast.error(t('createDriver.validation.error'));
    } finally {
      setIsValidating(false);
    }
  }, [driver?.sourceUrl, selectors, t]);

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

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">{t('editDriver.animeListSelectors')}</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="animeList">{t('editDriver.animeContainer')}</Label>
                  {selectorCounts.animeList !== undefined && (
                    <Badge variant={selectorCounts.animeList > 0 ? "default" : "destructive"} className="gap-1">
                      {selectorCounts.animeList > 0 ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {selectorCounts.animeList} {t('createDriver.validation.elementsFound')}
                    </Badge>
                  )}
                </div>
                <Input
                  id="animeList"
                  value={selectors.animeList}
                  onChange={(e) => setSelectors({ ...selectors, animeList: e.target.value })}
                  placeholder=".anime-item, article.anime"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="animeTitle">{t('editDriver.animeTitle')} {t('editDriver.required')}</Label>
                  {selectorCounts.animeTitle !== undefined && (
                    <Badge variant={selectorCounts.animeTitle > 0 ? "default" : "destructive"} className="gap-1">
                      {selectorCounts.animeTitle > 0 ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {selectorCounts.animeTitle} {t('createDriver.validation.elementsFound')}
                    </Badge>
                  )}
                </div>
                <Input
                  id="animeTitle"
                  value={selectors.animeTitle}
                  onChange={(e) => setSelectors({ ...selectors, animeTitle: e.target.value })}
                  placeholder="h2.title, .anime-title"
                  required
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="animeUrl">{t('editDriver.animeUrl')} {t('editDriver.required')}</Label>
                  {selectorCounts.animeUrl !== undefined && (
                    <Badge variant={selectorCounts.animeUrl > 0 ? "default" : "destructive"} className="gap-1">
                      {selectorCounts.animeUrl > 0 ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {selectorCounts.animeUrl} {t('createDriver.validation.elementsFound')}
                    </Badge>
                  )}
                </div>
                <Input
                  id="animeUrl"
                  value={selectors.animeUrl}
                  onChange={(e) => setSelectors({ ...selectors, animeUrl: e.target.value })}
                  placeholder="a, .anime-link"
                  required
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="animeImage">{t('editDriver.animeImage')}</Label>
                  {selectorCounts.animeImage !== undefined && (
                    <Badge variant={selectorCounts.animeImage > 0 ? "default" : "destructive"} className="gap-1">
                      {selectorCounts.animeImage > 0 ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {selectorCounts.animeImage} {t('createDriver.validation.elementsFound')}
                    </Badge>
                  )}
                </div>
                <Input
                  id="animeImage"
                  value={selectors.animeImage}
                  onChange={(e) => setSelectors({ ...selectors, animeImage: e.target.value })}
                  placeholder="img.cover, .anime-image"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">{t('editDriver.episodeSelectors')}</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="episodeList">{t('editDriver.episodeContainer')} {t('editDriver.required')}</Label>
                  {selectorCounts.episodeList !== undefined && (
                    <Badge variant={selectorCounts.episodeList > 0 ? "default" : "destructive"} className="gap-1">
                      {selectorCounts.episodeList > 0 ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {selectorCounts.episodeList} {t('createDriver.validation.elementsFound')}
                    </Badge>
                  )}
                </div>
                <Input
                  id="episodeList"
                  value={selectors.episodeList}
                  onChange={(e) => setSelectors({ ...selectors, episodeList: e.target.value })}
                  placeholder=".episode, .ep-item"
                  required
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="episodeNumber">{t('editDriver.episodeNumber')} {t('editDriver.required')}</Label>
                  {selectorCounts.episodeNumber !== undefined && (
                    <Badge variant={selectorCounts.episodeNumber > 0 ? "default" : "destructive"} className="gap-1">
                      {selectorCounts.episodeNumber > 0 ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {selectorCounts.episodeNumber} {t('createDriver.validation.elementsFound')}
                    </Badge>
                  )}
                </div>
                <Input
                  id="episodeNumber"
                  value={selectors.episodeNumber}
                  onChange={(e) => setSelectors({ ...selectors, episodeNumber: e.target.value })}
                  placeholder=".ep-number, .number"
                  required
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="episodeUrl">{t('editDriver.episodeUrl')} {t('editDriver.required')}</Label>
                  {selectorCounts.episodeUrl !== undefined && (
                    <Badge variant={selectorCounts.episodeUrl > 0 ? "default" : "destructive"} className="gap-1">
                      {selectorCounts.episodeUrl > 0 ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {selectorCounts.episodeUrl} {t('createDriver.validation.elementsFound')}
                    </Badge>
                  )}
                </div>
                <Input
                  id="episodeUrl"
                  value={selectors.episodeUrl}
                  onChange={(e) => setSelectors({ ...selectors, episodeUrl: e.target.value })}
                  placeholder="a, .ep-link"
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
