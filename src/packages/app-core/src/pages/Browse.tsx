import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card, Badge } from '@anidock/shared-ui';
import { Cpu, Search, Upload, Play, Loader2 } from 'lucide-react';
import { db, LocalAnime } from '../lib/indexedDB';
import { toast } from 'sonner';
import { usePlataform } from '../contexts/plataform/usePlataform';
import { BrowseHeader } from './components/BrowseHeader';

const Browse = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [allAnimes, setAllAnimes] = useState<LocalAnime[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { isDesktop } = usePlataform();

    useEffect(() => {
        fetchAnimes();
    }, []);

    const fetchAnimes = async () => {
        setIsLoading(true);
        try {
            await db.init();

            // Load all indexes from IndexedDB
            const indexes = await db.getAllIndexes();
            let animes: LocalAnime[] = [];

            indexes.forEach(index => {
                animes = [...animes, ...index.animes];
            });

            setAllAnimes(animes);
        } catch (error) {
            console.error('Error fetching animes:', error);
            toast.error('Erro ao carregar animes');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredAnimes = allAnimes.filter((anime) =>
        anime.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleWatch = (anime: LocalAnime) => {
        navigate(`/anime?url=${encodeURIComponent(anime.sourceUrl)}&driverId=${anime.driverId}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background">
            <BrowseHeader isDesktop={isDesktop} />

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Pesquisar animes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 h-14 text-lg border-border/50 bg-card/50 backdrop-blur-sm focus:border-primary/50"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : allAnimes.length === 0 ? (
                    <div className="text-center py-20">
                        <Cpu className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-xl font-semibold mb-2">Nenhum anime encontrado</h3>
                        <p className="text-muted-foreground mb-6">
                            Importe um driver para começar a explorar animes
                        </p>
                        <Button onClick={() => navigate('/drivers/import')}>
                            <Upload className="h-4 w-4 mr-2" />
                            Importar Driver
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="mb-6">
                            <p className="text-muted-foreground">
                                {filteredAnimes.length} {filteredAnimes.length === 1 ? 'anime encontrado' : 'animes encontrados'}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {filteredAnimes.map((anime) => (
                                <Card
                                    key={anime.id}
                                    className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all cursor-pointer"
                                    onClick={() => handleWatch(anime)}
                                >
                                    <div className="aspect-[2/3] relative overflow-hidden">
                                        {anime.coverUrl ? (
                                            <img
                                                src={anime.coverUrl}
                                                alt={anime.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                                <Cpu className="h-12 w-12 text-primary/30" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button size="icon" variant="outline" className="border-primary/50">
                                                <Play className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-semibold text-sm line-clamp-2 mb-1">{anime.title}</h3>
                                        {anime.episodes && anime.episodes.length > 0 && (
                                            <Badge variant="outline" className="text-xs">
                                                {anime.episodes.length} {anime.episodes.length === 1 ? 'episódio' : 'episódios'}
                                            </Badge>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Browse;
