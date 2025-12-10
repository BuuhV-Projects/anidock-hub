import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import DriverCard from '../components/DriverCard';
import GettingStartedGuide from '../components/GettingStartedGuide';
import { mockDrivers } from '../data/mockDrivers';
import { StatusFilter } from '../types/driver';

const Library: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const statusCounts = useMemo(() => ({
    trusted: mockDrivers.filter(d => d.status === 'trusted').length,
    safe: mockDrivers.filter(d => d.status === 'safe').length,
    'use-at-own-risk': mockDrivers.filter(d => d.status === 'use-at-own-risk').length,
  }), []);

  const filteredDrivers = useMemo(() => {
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

    // Default sort by downloads
    result.sort((a, b) => b.downloadCount - a.downloadCount);

    return result;
  }, [searchQuery, statusFilter]);

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1 order-2 lg:order-1">
            {/* Getting Started Guide */}
            <GettingStartedGuide />

            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Showing <span className="text-foreground font-medium">{filteredDrivers.length}</span> drivers
              </p>
            </div>

            {/* Driver grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredDrivers.map((driver) => (
                <DriverCard key={driver.id} driver={driver} />
              ))}
            </div>

            {/* Empty state */}
            {filteredDrivers.length === 0 && (
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
