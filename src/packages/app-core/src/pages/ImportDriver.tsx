import { Button, Card, Textarea, Label } from '@anidock/shared-ui';
import { ArrowLeft, Cpu, FileCode, Upload, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { db, Driver } from '../lib/indexedDB';
import { useTranslation } from 'react-i18next';

const ImportDriver = () => {
  const { t } = useTranslation();
  const [driverJson, setDriverJson] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setDriverJson(content);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!driverJson.trim()) {
      toast.error(t('importDriver.pasteFirst'));
      return;
    }

    setIsLoading(true);
    try {
      const driver: Driver = JSON.parse(driverJson);
      
      // Validate driver structure
      if (!driver.id || !driver.name || !driver.config) {
        throw new Error(t('importDriver.invalidDriver'));
      }

      // Initialize IndexedDB
      await db.init();
      
      // Save driver
      await db.saveDriver(driver);
      
      toast.success(t('importDriver.importSuccess', { name: driver.name }));
      navigate('/browse');
    } catch (error) {
      toast.error(t('importDriver.importError'));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadExample = () => {
    const example: Driver = {
      id: crypto.randomUUID(),
      name: 'Exemplo Driver',
      domain: 'exemplo.com',
      version: '1.0.0',
      author: 'AniDock',
      config: {
        requiresExternalLink: false,
        selectors: {
          animeList: 'article.anime',
          animeTitle: 'h2.title',
          animeImage: 'img.cover',
          animeUrl: 'a',
          episodeList: '.episode',
          episodeNumber: '.number',
          episodeUrl: 'a',
        },
        baseUrl: 'https://exemplo.com',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const json = JSON.stringify(example, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'example-driver.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('importDriver.exampleDownloaded'));
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
              {t('importDriver.title')}
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-display font-bold mb-3">
            {t('importDriver.subtitle')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('importDriver.description')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 border-border/50">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">
                {t('importDriver.uploadFile')}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('importDriver.uploadDescription')}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="border-primary/50 hover:bg-primary/10 w-full"
              >
                <FileCode className="h-4 w-4 mr-2" />
                {t('importDriver.chooseFile')}
              </Button>
            </div>
          </Card>

          <Card className="p-6 border-border/50 bg-card/50">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <FileCode className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">
                {t('importDriver.exampleDriver')}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('importDriver.exampleDescription')}
              </p>
              <Button
                onClick={downloadExample}
                variant="outline"
                className="border-primary/50 hover:bg-primary/10 w-full"
              >
                {t('importDriver.downloadExample')}
              </Button>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <Label htmlFor="driverJson" className="text-lg mb-4 block">
            {t('importDriver.pasteJson')}
          </Label>
          <Textarea
            id="driverJson"
            value={driverJson}
            onChange={(e) => setDriverJson(e.target.value)}
            placeholder={t('importDriver.placeholder')}
            className="font-mono text-sm h-64 mb-4"
          />

          <Button
            onClick={handleImport}
            disabled={isLoading || !driverJson.trim()}
            className="w-full gap-2"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {t('importDriver.importing')}
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                {t('importDriver.importButton')}
              </>
            )}
          </Button>
        </Card>
      </main>
    </div>
  );
};

export default ImportDriver;
