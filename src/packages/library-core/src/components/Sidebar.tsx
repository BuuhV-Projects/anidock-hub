import { Badge, Button, Card, CardContent } from '@anidock/shared-ui';
import { AlertTriangle, BookOpen, CheckCircle, Shield } from 'lucide-react';
import React from 'react';
import { StatusFilter } from '../types/driver';

interface SidebarProps {
  statusFilter: StatusFilter;
  onStatusFilterChange: (filter: StatusFilter) => void;
  statusCounts: {
    trusted: number;
    safe: number;
    'use-at-own-risk': number;
  };
}

const statusItems = [
  { value: 'trusted' as const, label: 'Trusted', icon: Shield, color: 'text-emerald-400', bgColor: 'bg-emerald-500' },
  { value: 'safe' as const, label: 'Safe For Use', icon: CheckCircle, color: 'text-cyan-400', bgColor: 'bg-cyan-500' },
  { value: 'use-at-own-risk' as const, label: 'Use At Own Risk', icon: AlertTriangle, color: 'text-amber-400', bgColor: 'bg-amber-500' },
];

const Sidebar: React.FC<SidebarProps> = ({
  statusFilter,
  onStatusFilterChange,
  statusCounts,
}) => {
  return (
    <div className="w-full lg:w-72 space-y-4">
      {/* Guide Card */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="font-semibold font-['Orbitron'] text-sm">Driver Guide</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            New to AniDock and don't know which driver you should use? Head to this Guide!
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full border-primary/30 text-primary hover:bg-primary/10"
            onClick={() => document.getElementById('getting-started-guide')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Get Started
          </Button>
        </CardContent>
      </Card>

      {/* Status Filter */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <h3 className="font-semibold font-['Orbitron'] text-sm mb-3">Driver Status</h3>
          <div className="space-y-2">
            {statusItems.map((item) => {
              const isActive = statusFilter === item.value;
              const count = statusCounts[item.value];
              
              return (
                <button
                  key={item.value}
                  onClick={() => onStatusFilterChange(isActive ? 'all' : item.value)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-primary/10 border border-primary/30' 
                      : 'hover:bg-muted/50 border border-transparent'
                  }`}
                >
                  <span className={`flex items-center gap-2 text-sm ${item.color}`}>
                    <span className={`w-2 h-2 rounded-full ${item.bgColor}`} />
                    {item.label}
                  </span>
                  <Badge variant="secondary" className="text-xs bg-muted/50">
                    {count}
                  </Badge>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sidebar;
