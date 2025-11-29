import { Badge, Button, Card } from '@anidock/shared-ui';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { ArrowLeft, Clock, Film, Play, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { db, WatchHistoryEntry } from '../lib/indexedDB';

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<WatchHistoryEntry[]>([]);
  const [groupByDate, _] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      await db.init();
      const historyData = await db.getWatchHistory();
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading history:', error);
      toast.error('Erro ao carregar histórico');
    }
  };

  const handleClearHistory = async () => {
    try {
      await db.init();
      const allHistory = await db.getWatchHistory();
      
      for (const entry of allHistory) {
        await db.deleteWatchHistoryEntry(entry.id);
      }
      
      await loadHistory();
      toast.success('Histórico limpo com sucesso');
    } catch (error) {
      console.error('Error clearing history:', error);
      toast.error('Erro ao limpar histórico');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await db.init();
      await db.deleteWatchHistoryEntry(itemId);
      await loadHistory();
      toast.success('Item removido do histórico');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Erro ao remover item');
    }
  };

  const handleNavigateToAnime = (item: WatchHistoryEntry) => {
    const params = new URLSearchParams({
      url: item.animeSourceUrl,
      driverId: item.driverId || '',
    });
    navigate(`/anime?${params.toString()}`);
  };

  const handleReplayEpisode = (item: WatchHistoryEntry) => {
    // Navigate to the episode URL to replay it
    const params = new URLSearchParams({
      url: item.episodeUrl,
      driverId: item.driverId || '',
    });
    navigate(`/anime?${params.toString()}`);
  };

  const groupHistoryByDate = () => {
    if (!groupByDate) return { 'Todos': history };

    const grouped: Record<string, WatchHistoryEntry[]> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    history.forEach(item => {
      const itemDate = new Date(item.watchedAt);
      itemDate.setHours(0, 0, 0, 0);

      let key: string;
      if (itemDate.getTime() === today.getTime()) {
        key = 'Hoje';
      } else if (itemDate.getTime() === yesterday.getTime()) {
        key = 'Ontem';
      } else {
        key = format(itemDate, "dd 'de' MMMM", { locale: ptBR });
      }

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    return grouped;
  };

  const groupedHistory = groupHistoryByDate();

  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/browse')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>

          <div className="text-center py-20">
            <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Nenhum histórico encontrado</h3>
            <p className="text-muted-foreground mb-6">
              Comece a assistir animes para ver seu histórico aqui
            </p>
            <Button onClick={() => navigate('/browse')}>
              Explorar Catálogo
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/browse')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gradient-primary">Histórico</h1>
              <p className="text-muted-foreground">
                {history.length} {history.length === 1 ? 'item' : 'itens'} no histórico
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleClearHistory}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Limpar Histórico
          </Button>
        </div>

        <div className="space-y-8">
          {Object.entries(groupedHistory).map(([date, items]) => (
            <div key={date}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                {date}
              </h2>

              <div className="grid gap-4">
                {items.map((item) => (
                  <Card
                    key={item.id}
                    className="p-4 border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all"
                  >
                    <div className="flex gap-4">
                      <div className="w-24 h-32 flex-shrink-0 rounded overflow-hidden bg-muted">
                        {item.animeCover ? (
                          <img
                            src={item.animeCover}
                            alt={item.animeTitle}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3
                              className="font-semibold text-lg mb-1 cursor-pointer hover:text-primary transition-colors line-clamp-1"
                              onClick={() => handleNavigateToAnime(item)}
                            >
                              {item.animeTitle}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">
                                Episódio {item.episodeNumber}
                              </Badge>
                              {item.episodeTitle && (
                                <span className="text-sm text-muted-foreground line-clamp-1">
                                  {item.episodeTitle}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(item.watchedAt), "HH:mm", { locale: ptBR })}
                          </span>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReplayEpisode(item)}
                              className="gap-2"
                            >
                              <Play className="h-3 w-3" />
                              Assistir
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;
