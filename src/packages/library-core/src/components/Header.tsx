import { Button } from '@anidock/shared-ui';
import { Github, Plus } from 'lucide-react';
import React from 'react';
import SearchBar from './SearchBar';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange }) => {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm font-['Orbitron']">A</span>
          </div>
          <h1 className="font-bold text-lg font-['Orbitron'] text-foreground hidden sm:block">
            AniDock <span className="text-primary">Library</span>
          </h1>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <SearchBar value={searchQuery} onChange={onSearchChange} placeholder="Search drivers..." />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-muted-foreground hover:text-foreground hidden sm:flex"
            onClick={() => window.open('https://github.com/BuuhV-Projects/anidock-hub', '_blank')}
          >
            <Github className="w-4 h-4 mr-2" />
            GitHub
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="border-primary/30 text-primary hover:bg-primary/10"
            onClick={() => window.open('https://github.com/BuuhV-Projects/anidock-hub/pulls', '_blank')}
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Suggest Driver</span>
            <span className="sm:hidden">Suggest</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
