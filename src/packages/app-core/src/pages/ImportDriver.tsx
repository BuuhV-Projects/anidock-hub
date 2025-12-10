import React from 'react';
import { Button, Card, Textarea, Label } from '@anidock/shared-ui';
import { ArrowLeft, Cpu, FileCode, Upload, Loader2, Link } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { db, Driver, AnimeIndex, LocalAnime } from '../lib/indexedDB';
import { useTranslation } from 'react-i18next';

interface ImportedDriver extends Driver {
    indexedData?: LocalAnime[];
}

declare global {
    interface Window {
        deepLink?: {
            onImportDriver: (callback: (url: string) => void) => void;
            removeImportDriverListener: () => void;
        };
    }
}

const ImportDriver = () => {
    const { t } = useTranslation();
    const [driverJson, setDriverJson] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingFromUrl, setIsLoadingFromUrl] = useState(false);
    const [driverUrl, setDriverUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const loadDriverFromUrl = useCallback(async (url: string) => {
        setIsLoadingFromUrl(true);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch driver');
            }
            const jsonText = await response.text();
            setDriverJson(jsonText);
            toast.success(t('importDriver.loadedFromUrl'));
        } catch (error) {
            console.error('Error loading driver from URL:', error);
            toast.error(t('importDriver.loadUrlError'));
        } finally {
            setIsLoadingFromUrl(false);
        }
    }, [t]);

    // Handle URL from query params
    useEffect(() => {
        const urlParam = searchParams.get('url');
        if (urlParam) {
            setDriverUrl(urlParam);
            loadDriverFromUrl(urlParam);
        }
    }, [searchParams, loadDriverFromUrl]);

    const handleLoadFromUrl = () => {
        if (!driverUrl.trim()) {
            toast.error(t('importDriver.enterUrl'));
            return;
        }
        loadDriverFromUrl(driverUrl);
    };

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
            const importedDriver: ImportedDriver = JSON.parse(driverJson);

            // Validate driver structure
            if (!importedDriver.id || !importedDriver.name || !importedDriver.config) {
                throw new Error(t('importDriver.invalidDriver'));
            }

            // Initialize IndexedDB
            await db.init();

            // Extract indexedData before saving driver
            const { indexedData, ...driverData } = importedDriver;

            // Save driver (without indexedData)
            await db.saveDriver(driverData as Driver);

            // If there's indexed data, create an AnimeIndex
            if (indexedData && indexedData.length > 0) {
                const animeIndex: AnimeIndex = {
                    id: crypto.randomUUID(),
                    driverId: driverData.id,
                    name: driverData.name,
                    sourceUrl: driverData.sourceUrl || driverData.catalogUrl || '',
                    totalAnimes: indexedData.length,
                    animes: indexedData,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

                await db.saveIndex(animeIndex);
                toast.success(t('importDriver.importSuccessWithAnimes', { name: driverData.name, count: indexedData.length }));
            } else {
                toast.success(t('importDriver.importSuccess', { name: driverData.name }));
            }

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

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {/* Load from URL */}
                    <Card className="p-6 border-border/50 border-primary/30">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                                <Link className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="font-display font-bold text-lg mb-2">
                                {t('importDriver.loadFromUrl')}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                {t('importDriver.loadFromUrlDescription')}
                            </p>
                            <div className="flex flex-col gap-2">
                                <input
                                    type="url"
                                    value={driverUrl}
                                    onChange={(e) => setDriverUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full px-3 py-2 text-sm bg-background border border-border/50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                                <Button
                                    onClick={handleLoadFromUrl}
                                    variant="outline"
                                    className="border-primary/50 hover:bg-primary/10 w-full"
                                    disabled={isLoadingFromUrl}
                                >
                                    {isLoadingFromUrl ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Link className="h-4 w-4 mr-2" />
                                            {t('importDriver.loadUrl')}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Upload file */}
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

                    {/* Download example */}
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
