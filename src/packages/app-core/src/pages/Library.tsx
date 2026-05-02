import {
  Badge,
  Button,
  Card,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@anidock/shared-ui';
import { ArrowLeft, BookmarkX, Library as LibraryIcon, Loader2, Play, Search, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  collectAllTags,
  LIBRARY_STATUS_LABELS_PT,
  removeFromLibrary,
} from '../lib/library';
import {
  db,
  LIBRARY_STATUSES,
  LibraryEntry,
  LibraryStatus,
} from '../lib/indexedDB';
import { usePlataform } from '../contexts/plataform/usePlataform';
import { BrowseHeader } from './components/BrowseHeader';

type StatusTab = LibraryStatus | 'all';

const STATUS_TABS: { value: StatusTab; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'watching', label: LIBRARY_STATUS_LABELS_PT.watching },
  { value: 'planned', label: LIBRARY_STATUS_LABELS_PT.planned },
  { value: 'paused', label: LIBRARY_STATUS_LABELS_PT.paused },
  { value: 'completed', label: LIBRARY_STATUS_LABELS_PT.completed },
  { value: 'dropped', label: LIBRARY_STATUS_LABELS_PT.dropped },
];

const Library = () => {
  const navigate = useNavigate();
  const { isDesktop } = usePlataform();
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      await db.init();
      const allEntries = await db.getAllLibraryEntries();
      setEntries(allEntries);
    } catch (error) {
      console.error('Error loading library entries:', error);
      toast.error('Erro ao carregar biblioteca');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const allTags = useMemo(() => collectAllTags(entries), [entries]);

  const statusCounts = useMemo(() => {
    const counts = new Map<LibraryStatus, number>();
    for (const status of LIBRARY_STATUSES) {
      counts.set(status, 0);
    }
    for (const entry of entries) {
      const previous = counts.get(entry.status) ?? 0;
      counts.set(entry.status, previous + 1);
    }
    return counts;
  }, [entries]);

  const filteredEntries = useMemo(() => {
    const lowerQuery = searchQuery.trim().toLowerCase();
    return entries.filter(entry => {
      if (activeTab !== 'all' && entry.status !== activeTab) {
        return false;
      }
      if (activeTag) {
        const lowerActiveTag = activeTag.toLowerCase();
        const hasTag = entry.tags.some(tag => tag.toLowerCase() === lowerActiveTag);
        if (!hasTag) {
          return false;
        }
      }
      if (lowerQuery.length > 0) {
        const titleMatches = entry.animeTitle.toLowerCase().includes(lowerQuery);
        if (!titleMatches) {
          return false;
        }
      }
      return true;
    });
  }, [entries, activeTab, activeTag, searchQuery]);

  const handleOpenAnime = (entry: LibraryEntry) => {
    navigate(
      `/anime?url=${encodeURIComponent(entry.animeSourceUrl)}&driverId=${entry.driverId}`,
    );
  };

  const handleRemove = async (entry: LibraryEntry) => {
    try {
      await removeFromLibrary(entry.id);
      toast.success('Removido da biblioteca');
      await loadEntries();
    } catch (error) {
      console.error('Error removing library entry:', error);
      toast.error('Erro ao remover da biblioteca');
    }
  };

  const totalEntries = entries.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background">
      <BrowseHeader isDesktop={isDesktop} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-muted-foreground hover:text-foreground gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>

          <div className="flex items-center gap-3">
            <LibraryIcon className="h-7 w-7 text-primary" />
            <div>
              <h1 className="font-display text-2xl font-bold">Biblioteca</h1>
              <p className="text-sm text-muted-foreground">
                {totalEntries} {totalEntries === 1 ? 'item' : 'itens'} salvos
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por título..."
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={value => setActiveTab(value as StatusTab)}
          className="mb-6"
        >
          <TabsList className="flex-wrap h-auto">
            {STATUS_TABS.map(tab => {
              const tabCount =
                tab.value === 'all'
                  ? totalEntries
                  : statusCounts.get(tab.value as LibraryStatus) ?? 0;
              return (
                <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                  {tab.label}
                  <Badge variant="secondary" className="h-5">
                    {tabCount}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {allTags.length > 0 && (
          <div className="mb-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
              Tags
            </p>
            <div className="flex flex-wrap gap-2">
              {activeTag && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveTag(null)}
                  className="gap-1 h-7"
                >
                  <X className="h-3 w-3" />
                  Limpar filtro
                </Button>
              )}
              {allTags.map(tag => {
                const isActive = activeTag?.toLowerCase() === tag.toLowerCase();
                return (
                  <Button
                    key={tag}
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTag(isActive ? null : tag)}
                    className="h-7"
                  >
                    {tag}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredEntries.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <LibraryIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold mb-2">
              {totalEntries === 0
                ? 'Sua biblioteca está vazia'
                : 'Nenhum item corresponde aos filtros'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {totalEntries === 0
                ? 'Abra um anime no Browse e marque o status para começar.'
                : 'Tente trocar a aba ou remover o filtro de tags.'}
            </p>
            {totalEntries === 0 && (
              <Button onClick={() => navigate('/browse')} className="gap-2">
                <Play className="h-4 w-4" />
                Ir para o catálogo
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredEntries.map(entry => (
              <Card
                key={entry.id}
                className="overflow-hidden border-border/50 bg-card/50 hover:border-primary/40 transition-all group"
              >
                <div
                  className="aspect-[2/3] bg-muted relative cursor-pointer"
                  onClick={() => handleOpenAnime(entry)}
                >
                  {entry.animeCover ? (
                    <img
                      src={entry.animeCover}
                      alt={entry.animeTitle}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                      <Play className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {LIBRARY_STATUS_LABELS_PT[entry.status]}
                    </Badge>
                  </div>
                  {entry.score !== undefined && (
                    <div className="absolute top-2 right-2">
                      <Badge className="text-[10px]">{entry.score}/10</Badge>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3
                    className="text-sm font-semibold line-clamp-2 mb-2 cursor-pointer hover:text-primary"
                    onClick={() => handleOpenAnime(entry)}
                    title={entry.animeTitle}
                  >
                    {entry.animeTitle}
                  </h3>
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {entry.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-[10px] px-1.5">
                          {tag}
                        </Badge>
                      ))}
                      {entry.tags.length > 3 && (
                        <Badge variant="outline" className="text-[10px] px-1.5">
                          +{entry.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleOpenAnime(entry)}
                      className="flex-1 h-7 text-xs gap-1"
                    >
                      <Play className="h-3 w-3" />
                      Abrir
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemove(entry)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      title="Remover da biblioteca"
                    >
                      <BookmarkX className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
