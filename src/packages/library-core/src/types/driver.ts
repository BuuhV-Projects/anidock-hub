export interface LibraryDriver {
  id: string;
  name: string;
  description: string;
  domain: string;
  author: string;
  version: string;
  animeCount: number;
  downloadCount: number;
  rating: number;
  ratingCount: number;
  status: 'trusted' | 'safe' | 'use-at-own-risk';
  createdAt: string;
  updatedAt: string;
  cdnUrl: string;
  iconUrl?: string;
}

export type SortOption = 'popular' | 'newest' | 'most-downloads' | 'top-rated';
export type StatusFilter = 'all' | 'trusted' | 'safe' | 'use-at-own-risk';
