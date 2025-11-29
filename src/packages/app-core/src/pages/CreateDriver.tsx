import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Label, Progress, Alert, AlertDescription } from '@anidock/shared-ui';
import { Sparkles, ArrowLeft, Loader2, CheckCircle2, Cpu } from 'lucide-react';
import { toast } from 'sonner';
import { db, Driver } from '../lib/indexedDB';
import { generateDriverWithAI, validateAPIKey, type AIConfig, type AIProvider } from '../lib/aiDriver';
import { crawlWithDriver } from '../lib/clientCrawler';
import { getAIKey, saveAIKey } from '../lib/localStorage';
import { useTranslation } from 'react-i18next';

const CreateDriver = () => {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [catalogUrl, setCatalogUrl] = useState('');
  const [aiProvider, setAiProvider] = useState<AIProvider>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [keyValidated, setKeyValidated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');
  const [indexProgress, setIndexProgress] = useState(0);
  const [indexStatus, setIndexStatus] = useState('');
  const [totalAnimes, setTotalAnimes] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const savedKey = getAIKey(aiProvider);
    if (savedKey) {
      setApiKey(savedKey);
      setKeyValidated(true);
    } else {
      setApiKey('');
      setKeyValidated(false);
    }
  }, [aiProvider]);

  const handleValidateKey = async () => {
    if (!apiKey.trim()) {
      toast.error(t('createDriver.errorInsertKey'));
      return;
    }

    setIsValidatingKey(true);
    try {
      const config: AIConfig = {
        provider: aiProvider,
        apiKey: apiKey.trim(),
      };

      const isValid = await validateAPIKey(config);
      
      if (isValid) {
        setKeyValidated(true);
        toast.success(t('settings.saveSuccess', { provider: aiProvider === 'openai' ? 'OpenAI' : 'Gemini' }));
        saveAIKey(aiProvider, apiKey.trim());
      } else {
        toast.error(t('createDriver.keyInvalid'));
      }
    } catch (error) {
      console.error('Error validating key:', error);
      toast.error(t('createDriver.errorValidatingKey'));
    } finally {
      setIsValidatingKey(false);
    }
  };

  const handleGenerate = async () => {
    if (!url.trim()) {
      toast.error(t('createDriver.errorUrl'));
      return;
    }

    if (!catalogUrl.trim()) {
      toast.error(t('createDriver.errorCatalogUrl'));
      return;
    }

    if (!keyValidated) {
      toast.error(t('createDriver.errorValidateKey'));
      return;
    }

    setIsGenerating(true);

    try {
      const config: AIConfig = {
        provider: aiProvider,
        apiKey: apiKey.trim(),
      };

      const driver = await generateDriverWithAI(catalogUrl.trim(), config, setGenerationStatus);
      
      await db.init();
      await db.saveDriver(driver);
      
      toast.success(t('createDriver.successGenerated'));
      setGenerationStatus('');
      
      setIsIndexing(true);
      await generateIndexFromDriver(driver);
      
    } catch (error: any) {
      console.error('Error generating driver:', error);
      toast.error(error.message || t('createDriver.errorGenerating'));
    } finally {
      setIsGenerating(false);
    }
  };

  const generateIndexFromDriver = async (driver: Driver) => {
    try {
      const urlToIndex = driver.catalogUrl || driver.sourceUrl || driver.config.baseUrl;

      const result = await crawlWithDriver(
        urlToIndex,
        driver,
        (progress) => {
          const percent = Math.round((progress.current / progress.total) * 100);
          setIndexProgress(percent);
          setIndexStatus(progress.status);
        }
      );

      if (result.errors.length > 0) {
        console.warn('Indexing errors:', result.errors);
      }

      if (result.animes.length === 0) {
        toast.error(t('createDriver.noAnimesFound'));
        return;
      }

      const animeIndex = {
        id: crypto.randomUUID(),
        driverId: driver.id,
        name: `Index for ${driver.name}`,
        sourceUrl: urlToIndex,
        totalAnimes: result.animes.length,
        animes: result.animes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.saveIndex(animeIndex);

      setTotalAnimes(result.animes.length);
      toast.success(t('createDriver.successIndexed', { count: result.animes.length }));
      
      setTimeout(() => {
        navigate('/drivers');
      }, 2000);
    } catch (error: any) {
      console.error('Error indexing:', error);
      toast.error(t('createDriver.errorIndexing'));
    } finally {
      setIsIndexing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Cpu className="h-8 w-8 text-primary animate-pulse-glow" />
            <h1 className="font-display text-2xl font-bold text-gradient-primary">
              {t('createDriver.title')}
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Alert className="mb-6">
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            {t('createDriver.alertDescription')}
          </AlertDescription>
        </Alert>

        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div>
              <Label>{t('createDriver.aiProvider')}</Label>
              <div className="flex gap-4 mt-2">
                <Button
                  variant={aiProvider === 'openai' ? 'default' : 'outline'}
                  onClick={() => setAiProvider('openai')}
                  disabled={isGenerating}
                >
                  OpenAI
                </Button>
                <Button
                  variant={aiProvider === 'gemini' ? 'default' : 'outline'}
                  onClick={() => setAiProvider('gemini')}
                  disabled={isGenerating}
                >
                  Google Gemini
                </Button>
              </div>
            </div>

            <div>
              <Label>{t('settings.apiKey')}</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="password"
                  placeholder={`${aiProvider === 'openai' ? 'OpenAI' : 'Gemini'} API key`}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={isGenerating || keyValidated}
                />
                <Button
                  onClick={handleValidateKey}
                  disabled={isValidatingKey || keyValidated || !apiKey.trim()}
                  className="shrink-0"
                >
                  {isValidatingKey ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : keyValidated ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    t('createDriver.validate')
                  )}
                </Button>
              </div>
              {keyValidated && (
                <p className="text-sm text-green-600 mt-1">✓ {t('createDriver.validated')}</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <Label htmlFor="url">{t('createDriver.siteUrl')} *</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://exemplo.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isGenerating || isIndexing}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="catalogUrl">{t('createDriver.catalogUrl')} *</Label>
              <Input
                id="catalogUrl"
                type="url"
                placeholder="https://exemplo.com/animes"
                value={catalogUrl}
                onChange={(e) => setCatalogUrl(e.target.value)}
                disabled={isGenerating || isIndexing}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                {t('createDriver.catalogUrlHint')}
              </p>
            </div>

            {(isGenerating || isIndexing) && (
              <div className="space-y-3">
                <div className="text-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {generationStatus || indexStatus}
                  </p>
                </div>
                {isIndexing && (
                  <div className="space-y-2">
                    <Progress value={indexProgress} className="h-2" />
                    <p className="text-sm text-center text-muted-foreground">
                      {totalAnimes > 0 && `${totalAnimes} ${t('createDriver.animesIndexed')}`}
                    </p>
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || isIndexing || !keyValidated}
              className="w-full gap-2"
              size="lg"
            >
              {isGenerating || isIndexing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t('createDriver.generating')}
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  {t('createDriver.generateWithAI')}
                </>
              )}
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default CreateDriver;
