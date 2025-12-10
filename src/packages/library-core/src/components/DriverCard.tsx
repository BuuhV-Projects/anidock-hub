import React from 'react';
import { Download, Star, Calendar, ExternalLink, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, Button, Badge } from '@anidock/shared-ui';
import { LibraryDriver } from '../types/driver';

interface DriverCardProps {
  driver: LibraryDriver;
}

const statusConfig = {
  trusted: {
    label: 'Trusted',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    icon: Shield,
  },
  safe: {
    label: 'Safe For Use',
    color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    icon: CheckCircle,
  },
  'use-at-own-risk': {
    label: 'Use At Own Risk',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    icon: AlertTriangle,
  },
};

const DriverCard: React.FC<DriverCardProps> = ({ driver }) => {
  const status = statusConfig[driver.status];
  const StatusIcon = status.icon;

  const handleInstall = () => {
    // Opens the CDN URL to download the driver JSON
    window.open(driver.cdnUrl, '_blank');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(driver.cdnUrl);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_hsl(180_100%_50%/0.15)]">
      <CardContent className="p-5">
        {/* Header with status and anime count */}
        <div className="flex items-center justify-between mb-4">
          <Badge variant="outline" className={`${status.color} border flex items-center gap-1.5 text-xs font-medium`}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="text-primary font-semibold">{formatNumber(driver.animeCount)}</span> animes
          </span>
        </div>

        {/* Driver info */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 border border-border/50 flex items-center justify-center text-primary font-bold text-lg font-['Orbitron']">
            {driver.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate font-['Orbitron'] group-hover:text-primary transition-colors">
              {driver.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {driver.description}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(driver.updatedAt)}
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-foreground font-medium">{driver.rating.toFixed(1)}</span>
            <span>({driver.ratingCount})</span>
          </span>
          <span className="flex items-center gap-1 text-primary">
            <Download className="w-3.5 h-3.5" />
            {formatNumber(driver.downloadCount)}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={handleInstall}
            className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 hover:border-primary/50 transition-all"
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Install
          </Button>
          <Button 
            onClick={handleCopy}
            variant="outline" 
            className="border-border/50 hover:border-muted-foreground/50 text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Copy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DriverCard;
