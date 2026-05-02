import { Card, Skeleton } from '@anidock/shared-ui';
import {
  ArrowLeft,
  BarChart3,
  Clock,
  Cpu,
  Film,
  Flame,
  Library as LibraryIcon,
  Trophy,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@anidock/shared-ui';
import { db, Driver, LibraryStatus } from '../lib/indexedDB';
import { computeWatchStatistics, WatchStatistics } from '../lib/stats';
import { LIBRARY_STATUS_LABELS_PT } from '../lib/library';
import { usePlataform } from '../contexts/plataform/usePlataform';
import { BrowseHeader } from './components/BrowseHeader';

const HOURS_DECIMAL_PLACES = 1;
const ACTIVITY_DAY_LABEL_INTERVAL = 5;

function formatHours(hours: number): string {
  return hours.toFixed(HOURS_DECIMAL_PLACES);
}

function getMaxActivity(activity: WatchStatistics['activityLast30Days']): number {
  let maxValue = 0;
  for (const bucket of activity) {
    if (bucket.episodesWatched > maxValue) {
      maxValue = bucket.episodesWatched;
    }
  }
  return maxValue;
}

function getStatusColorClass(status: LibraryStatus): string {
  switch (status) {
    case 'watching':
      return 'bg-primary';
    case 'completed':
      return 'bg-emerald-500';
    case 'planned':
      return 'bg-blue-500';
    case 'paused':
      return 'bg-amber-500';
    case 'dropped':
      return 'bg-red-500';
    default:
      return 'bg-muted';
  }
}

const Stats = () => {
  const navigate = useNavigate();
  const { isDesktop } = usePlataform();
  const [stats, setStats] = useState<WatchStatistics | null>(null);
  const [driversById, setDriversById] = useState<Record<string, Driver>>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    try {
      await db.init();
      const [history, library, drivers] = await Promise.all([
        db.getWatchHistory(),
        db.getAllLibraryEntries(),
        db.getAllDrivers(),
      ]);

      const driverMap: Record<string, Driver> = {};
      for (const driver of drivers) {
        driverMap[driver.id] = driver;
      }
      setDriversById(driverMap);

      const computed = computeWatchStatistics(history, library);
      setStats(computed);
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const renderKpiCard = (
    icon: React.ReactNode,
    label: string,
    value: string | number,
    accent: string,
  ) => (
    <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className={accent}>{icon}</div>
        <span className="text-3xl font-bold text-gradient-primary">{value}</span>
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </Card>
  );

  const renderActivityChart = () => {
    if (!stats) {
      return null;
    }
    const maxValue = getMaxActivity(stats.activityLast30Days);
    return (
      <Card className="p-6 border-border/50 bg-card/50">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Atividade dos últimos 30 dias</h3>
        </div>
        {maxValue === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Nenhum episódio assistido nos últimos 30 dias.
          </p>
        ) : (
          <div className="space-y-2">
            <div className="flex items-end gap-1 h-32">
              {stats.activityLast30Days.map(bucket => {
                const heightPercent =
                  bucket.episodesWatched === 0
                    ? 4
                    : (bucket.episodesWatched / maxValue) * 100;
                const isToday = bucket.date === stats.activityLast30Days[stats.activityLast30Days.length - 1].date;
                return (
                  <div
                    key={bucket.date}
                    className={`flex-1 rounded-t transition-all ${
                      bucket.episodesWatched === 0
                        ? 'bg-muted/40'
                        : isToday
                        ? 'bg-primary'
                        : 'bg-primary/60'
                    } hover:bg-primary`}
                    style={{ height: `${heightPercent}%` }}
                    title={`${bucket.date}: ${bucket.episodesWatched} ep.`}
                  />
                );
              })}
            </div>
            <div className="flex gap-1 text-[10px] text-muted-foreground">
              {stats.activityLast30Days.map((bucket, index) => {
                const showLabel = index % ACTIVITY_DAY_LABEL_INTERVAL === 0;
                const dayPart = bucket.date.split('-')[2];
                return (
                  <div key={bucket.date} className="flex-1 text-center">
                    {showLabel ? dayPart : ''}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              Pico: {maxValue} episódios em um único dia.
            </p>
          </div>
        )}
      </Card>
    );
  };

  const renderTopAnimes = () => {
    if (!stats) {
      return null;
    }
    return (
      <Card className="p-6 border-border/50 bg-card/50">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Animes mais assistidos</h3>
        </div>
        {stats.topAnimes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem episódios assistidos ainda.</p>
        ) : (
          <ul className="space-y-3">
            {stats.topAnimes.map((animeCount, index) => (
              <li key={animeCount.animeSourceUrl} className="flex items-center gap-3">
                <span className="text-2xl font-bold text-muted-foreground/40 w-6">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{animeCount.animeTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {animeCount.episodesWatched} episódios
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    );
  };

  const renderTopDrivers = () => {
    if (!stats) {
      return null;
    }
    return (
      <Card className="p-6 border-border/50 bg-card/50">
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Drivers mais usados</h3>
        </div>
        {stats.topDrivers.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem episódios assistidos ainda.</p>
        ) : (
          <ul className="space-y-3">
            {stats.topDrivers.map((driverCount, index) => {
              const driver = driversById[driverCount.driverId];
              const driverName = driver?.name ?? `Driver ${driverCount.driverId.slice(0, 8)}`;
              const driverDomain = driver?.domain ?? '';
              return (
                <li key={driverCount.driverId} className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-muted-foreground/40 w-6">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{driverName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {driverDomain} · {driverCount.episodesWatched} episódios
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    );
  };

  const renderLibraryBreakdown = () => {
    if (!stats) {
      return null;
    }
    if (stats.totalLibraryEntries === 0) {
      return (
        <Card className="p-6 border-border/50 bg-card/50">
          <div className="flex items-center gap-2 mb-4">
            <LibraryIcon className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Biblioteca</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Sua biblioteca está vazia. Marque um anime como assistindo, planejado ou concluído
            para vê-lo aqui.
          </p>
        </Card>
      );
    }
    return (
      <Card className="p-6 border-border/50 bg-card/50">
        <div className="flex items-center gap-2 mb-4">
          <LibraryIcon className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Biblioteca por status</h3>
        </div>
        <div className="space-y-3">
          {stats.libraryByStatus.map(statusCount => {
            const percentage =
              (statusCount.count / stats.totalLibraryEntries) * 100;
            return (
              <div key={statusCount.status}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{LIBRARY_STATUS_LABELS_PT[statusCount.status]}</span>
                  <span className="text-muted-foreground">
                    {statusCount.count} ({percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getStatusColorClass(statusCount.status)} transition-all`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  };

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
            <BarChart3 className="h-7 w-7 text-primary" />
            <div>
              <h1 className="font-display text-2xl font-bold">Estatísticas</h1>
              <p className="text-sm text-muted-foreground">
                Tempo total estimado a 24 minutos por episódio
              </p>
            </div>
          </div>
        </div>

        {isLoading || !stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {renderKpiCard(
                <Film className="h-7 w-7" />,
                'Episódios assistidos',
                stats.totalEpisodesWatched,
                'text-primary',
              )}
              {renderKpiCard(
                <LibraryIcon className="h-7 w-7" />,
                'Animes únicos',
                stats.totalUniqueAnimes,
                'text-primary',
              )}
              {renderKpiCard(
                <Clock className="h-7 w-7" />,
                'Horas assistidas',
                formatHours(stats.totalHoursWatched),
                'text-primary',
              )}
              {renderKpiCard(
                <Flame className="h-7 w-7" />,
                stats.currentStreakDays > 0
                  ? `Streak atual (recorde: ${stats.longestStreakDays})`
                  : `Recorde de streak`,
                stats.currentStreakDays > 0
                  ? `${stats.currentStreakDays}d`
                  : `${stats.longestStreakDays}d`,
                'text-orange-500',
              )}
            </div>

            <div className="mb-6">{renderActivityChart()}</div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {renderTopAnimes()}
              {renderTopDrivers()}
              {renderLibraryBreakdown()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Stats;
