import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import DriverCard from '../components/DriverCard';
import { mockDrivers } from '../data/mockDrivers';
import { StatusFilter, SortOption } from '../types/driver';

const Library: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('popular');

  const statusCounts = useMemo(() => ({
    trusted: mockDrivers.filter(d => d.status === 'trusted').length,
    safe: mockDrivers.filter(d => d.status === 'safe').length,
    'use-at-own-risk': mockDrivers.filter(d => d.status === 'use-at-own-risk').length,
  }), []);

  const filteredAndSortedDrivers = useMemo(() => {
    let result = [...mockDrivers];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        d => d.name.toLowerCase().includes(query) || 
             d.description.toLowerCase().includes(query) ||
             d.domain.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(d => d.status === statusFilter);
    }

    // Sort
    switch (sortOption) {
      case 'popular':
        result.sort((a, b) => b.downloadCount - a.downloadCount);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'most-downloads':
        result.sort((a, b) => b.downloadCount - a.downloadCount);
        break;
      case 'top-rated':
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }, [searchQuery, statusFilter, sortOption]);

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1 order-2 lg:order-1">
            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Showing <span className="text-foreground font-medium">{filteredAndSortedDrivers.length}</span> drivers
              </p>
            </div>

            {/* Driver grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredAndSortedDrivers.map((driver) => (
                <DriverCard key={driver.id} driver={driver} />
              ))}
            </div>

            {/* Empty state */}
            {filteredAndSortedDrivers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No drivers found matching your criteria.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="order-1 lg:order-2">
            <Sidebar
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              sortOption={sortOption}
              onSortOptionChange={setSortOption}
              statusCounts={statusCounts}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2024 AniDock Library. Community-driven driver repository.</p>
            <div className="flex items-center gap-4">
              <a href="https://github.com/BuuhV-Projects/anidock-hub" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                GitHub
              </a>
              <a href="https://github.com/BuuhV-Projects/anidock-hub/releases" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                Download AniDock
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Library;
