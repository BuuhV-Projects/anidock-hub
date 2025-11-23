import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@anidock/shared-ui'button';
import { Card } from '@anidock/shared-ui'card';
import { Badge } from '@anidock/shared-ui'badge';
import { ArrowLeft, ExternalLink, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription } from '@anidock/shared-ui'alert';

const Player = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const episodeUrl = searchParams.get('url');
  const animeTitle = searchParams.get('title');
  const episodeNumber = searchParams.get('ep');
  const animeId = searchParams.get('anime');
  const driverId = searchParams.get('driver');
  const indexId = searchParams.get('index');
  
  const [iframeError, setIframeError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset states when URL changes
    setIframeError(false);
    setIsLoading(true);
  }, [episodeUrl]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIframeError(true);
    setIsLoading(false);
  };

  const handleOpenExternal = () => {
    if (episodeUrl) {
      window.open(episodeUrl, '_blank');
    }
  };

  const handleBackToAnime = () => {
    if (animeId && driverId) {
      const params = new URLSearchParams({
        id: animeId,
        driver: driverId,
      });
      if (indexId) {
        params.append('index', indexId);
      }
      navigate(`/anime?${params.toString()}`);
    } else {
      navigate('/browse');
    }
  };

  if (!episodeUrl) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">URL do episódio não encontrada</h2>
          <p className="text-muted-foreground mb-6">
            Não foi possível carregar o episódio. Tente novamente.
          </p>
          <Button onClick={() => navigate('/browse')}>
            Voltar para Browse
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              onClick={handleBackToAnime}
              className="gap-2 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>

            <div className="flex-1 min-w-0">
              {animeTitle && (
                <div className="text-center">
                  <h1 className="font-display font-bold text-sm sm:text-base truncate">
                    {animeTitle}
                  </h1>
                  {episodeNumber && (
                    <Badge variant="secondary" className="mt-1">
                      Episódio {episodeNumber}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={handleOpenExternal}
              className="gap-2 shrink-0"
              size="sm"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Abrir Externa</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Player Area */}
      <main className="flex-1 flex flex-col p-4">
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
          {/* Error Alert */}
          {iframeError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                O site bloqueou a reprodução embarcada. 
                <Button 
                  variant="link" 
                  className="px-2 h-auto py-0 text-destructive-foreground underline"
                  onClick={handleOpenExternal}
                >
                  Clique aqui para abrir em uma nova aba
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {isLoading && !iframeError && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Carregando player...</p>
              </div>
            </div>
          )}

          {/* Iframe Player */}
          {!iframeError && (
            <div className="relative flex-1 bg-black rounded-lg overflow-hidden shadow-2xl">
              <iframe
                src={episodeUrl}
                className="w-full h-full min-h-[400px] sm:min-h-[500px] md:min-h-[600px]"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                title={`${animeTitle} - Episódio ${episodeNumber}`}
              />
            </div>
          )}

          {/* Info Card for Error State */}
          {iframeError && (
            <Card className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <ExternalLink className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-3">
                Player Bloqueado
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Este site não permite reprodução embarcada por questões de segurança. 
                Você pode assistir abrindo o episódio em uma nova aba.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={handleOpenExternal} size="lg" className="gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Assistir em Nova Aba
                </Button>
                <Button 
                  onClick={handleBackToAnime} 
                  size="lg" 
                  variant="outline"
                  className="gap-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Voltar
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>

      {/* Navigation Footer (optional - for next/prev episode) */}
      <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <Button variant="ghost" size="sm" disabled className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Episódio Anterior
            </Button>
            <span>Use as setas para navegar</span>
            <Button variant="ghost" size="sm" disabled className="gap-2">
              Próximo Episódio
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Player;
