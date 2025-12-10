import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@anidock/shared-ui';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = 'Search drivers...' }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 bg-card/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
      />
    </div>
  );
};

export default SearchBar;
