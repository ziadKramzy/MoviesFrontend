export interface Movie {
  id: string;
  title: string;
  type: 'Movie' | 'TV Show';
  director: string;
  budget: number;
  location: string;
  duration: number;
  year: number;
  description?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface MovieStats {
  totalMovies: number;
  totalTVShows: number;
  totalBudget: number;
  avgBudget: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: PaginationInfo;
  error?: string;
  message?: string;
}

export interface CreateMovieData {
  title: string;
  type: 'Movie' | 'TV Show';
  director: string;
  budget: number;
  location: string;
  duration: number;
  year: number;
  description?: string;
  image?: string;
}

export interface UpdateMovieData extends Partial<CreateMovieData> {}

export interface MovieFilters {
  search?: string;
  type?: 'Movie' | 'TV Show';
  page?: number;
  limit?: number;
} 