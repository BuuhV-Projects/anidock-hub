import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Badge, Separator } from '@anidock/shared-ui';
import { Clock, Trash2, ExternalLink, Play, Film } from 'lucide-react';
import { getHistory, clearHistory, deleteHistoryItem, getLocalDrivers, type HistoryItem } from '../lib/localStorage';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { supabase } from '@anidock/shared-utils';
import { toast } from 'sonner';

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [groupByDate, setGroupByDate] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const historyData = getHistory();
    setHistory(historyData);
  };

  const handleClearHistory = () => {
    clearHistory();
    loadHistory();
  };

  const handleDeleteItem = (itemId: string) => {
    deleteHistoryItem(itemId);
    loadHistory();
  };

  const handleNavigateToAnime = (item: HistoryItem) => {
    const params = new URLSearchParams({
      id: item.animeId,
      driver: item.driverId,
    });
    if (item.indexId) {
      params.append('index', item.indexId);
    }
    navigate(`/anime?${params.toString()}`);
  };

  const handleNavigateToPlayer = async (item: HistoryItem) => {
    if (item.type === 'episode' && item.episodeUrl) {
      // Extrair vídeo novamente usando a URL original do episódio
      toast.loading('Carregando vídeo...');
      
      try {
        // Buscar o driver para obter o seletor de link externo
        const drivers = getLocalDrivers();
        const driver = drivers.find(d => d.id === item.driverId);
        
        const { data, error } = await supabase.functions.invoke('extract-video-data', {
          body: {
            episode_url: item.episodeUrl,
            external_link_selector: driver?.config?.selectors?.externalLinkSelector
          }
        });

        toast.dismiss();

        if (error) {
          console.error('Error extracting video:', error);
          toast.error('Erro ao carregar vídeo');
          window.open(item.episodeUrl, '_blank');
          return;
        }

        if (!data?.success || !data?.videoUrl) {
          console.log('No video found, opening episode page directly');
          toast.info('Abrindo página do episódio...');
          window.open(item.episodeUrl, '_blank');
          return;
        }

        const finalVideoUrl = data.videoUrl as string;

        // Check video type and handle accordingly
        if (data.type === 'external') {
          toast.info('Abrindo vídeo em nova aba...');
          window.open(finalVideoUrl, '_blank');
          return;
        }

        if (data.type === 'iframe' || data.type === 'video') {
          // Navegar para o player com o vídeo extraído
          const params = new URLSearchParams({
            url: finalVideoUrl,
            title: item.animeTitle,
            ep: String(item.episodeNumber),
            anime: item.animeId,
            driver: item.driverId,
          });
          if (item.indexId) {
            params.append('index', item.indexId);
          }
          navigate(`/player?${params.toString()}`);
          return;
        }

        // Fallback - open episode page
        toast.info('Abrindo página do episódio...');
        window.open(item.episodeUrl, '_blank');
        
      } catch (error) {
        console.error('Error calling extract-video-data:', error);
        toast.dismiss();
        toast.error('Erro ao processar episódio');
        window.open(item.episodeUrl, '_blank');
      }
    }
  };

  const groupHistoryByDate = (items: HistoryItem[]) => {
    const groups: { [key: string]: HistoryItem[] } = {};
    
    items.forEach(item => {
      const date = new Date(item.timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let dateKey: string;
      if (date.toDateString() === today.toDateString()) {
        dateKey = 'Hoje';
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = 'Ontem';
      } else {
        dateKey = format(date, 'dd/MM/yyyy', { locale: ptBR });
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });
    
    return groups;
  };

  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm', { locale: ptBR });
  };

  const renderHistoryItem = (item: HistoryItem) => (
    <Card key={item.id} className="p-4 hover:bg-accent/50 transition-colors">
      <div className="flex gap-4">
        {/* Cover Image */}
        {item.animeCover && (
          <div className="shrink-0 w-16 h-24 rounded-lg overflow-hidden bg-muted">
            <img
              src={item.animeCover}
              alt={item.animeTitle}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate text-sm">
                {item.animeTitle}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={item.type === 'episode' ? 'default' : 'secondary'} className="text-xs">
                  {item.type === 'episode' ? (
                    <>
                      <Play className="h-3 w-3 mr-1" />
                      EP {item.episodeNumber}
                    </>
                  ) : (
                    <>
                      <Film className="h-3 w-3 mr-1" />
                      Visualizado
                    </>
                  )}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatTime(item.timestamp)}
                </span>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteItem(item.id)}
              className="shrink-0 h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            {item.type === 'episode' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigateToPlayer(item)}
                className="gap-2"
              >
                <Play className="h-3 w-3" />
                Assistir Novamente
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigateToAnime(item)}
                className="gap-2"
              >
                <ExternalLink className="h-3 w-3" />
                Ver Anime
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  const groupedHistory = groupByDate ? groupHistoryByDate(history) : null;

  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-display font-bold flex items-center gap-3">
                  <Clock className="h-8 w-8" />
                  Histórico
                </h1>
                <p className="text-muted-foreground mt-2">
                  Acompanhe seus animes e episódios assistidos
                </p>
              </div>
            </div>

            <Card className="p-12 text-center">
              <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Nenhum histórico ainda</h2>
              <p className="text-muted-foreground mb-6">
                Comece a assistir animes para construir seu histórico
              </p>
              <Button onClick={() => navigate('/browse')}>
                Explorar Animes
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-display font-bold flex items-center gap-3">
                <Clock className="h-8 w-8" />
                Histórico
              </h1>
              <p className="text-muted-foreground mt-2">
                {history.length} {history.length === 1 ? 'item' : 'itens'} no histórico
              </p>
            </div>
            
            <Button
              variant="destructive"
              onClick={handleClearHistory}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Limpar Tudo
            </Button>
          </div>

          {/* History List */}
          <div className="space-y-6">
            {groupByDate && groupedHistory ? (
              // Grouped by date
              Object.entries(groupedHistory).map(([date, items]) => (
                <div key={date}>
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      {date}
                    </h2>
                    <Separator className="flex-1" />
                  </div>
                  <div className="space-y-3">
                    {items.map(renderHistoryItem)}
                  </div>
                </div>
              ))
            ) : (
              // Flat list
              <div className="space-y-3">
                {history.map(renderHistoryItem)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
