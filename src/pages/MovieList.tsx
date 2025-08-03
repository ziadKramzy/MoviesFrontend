import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, Film, Tv, Calendar, Clock, DollarSign, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDuration } from '@/lib/utils';
import { useMovies, useDeleteMovie } from '@/hooks/useMovies';
import { MovieFilters } from '@/types/movie';

export const MovieList = () => {
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'Movie' | 'TV Show' | ''>('');
  const [page, setPage] = useState(1);

  // Create filters object
  const filters: MovieFilters = useMemo(() => ({
    search: search || undefined,
    type: typeFilter || undefined,
    page,
    limit: 10,
  }), [search, typeFilter, page]);

  // Use React Query hooks
  const { data: moviesData, isLoading, error } = useMovies(filters);
  const deleteMovieMutation = useDeleteMovie();

  const movies = moviesData?.data || [];
  const pagination = moviesData?.pagination;

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page when searching
  };

  const handleTypeFilter = (value: string) => {
    const type = value as 'Movie' | 'TV Show' | '';
    setTypeFilter(type);
    setPage(1); // Reset to first page when filtering
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      deleteMovieMutation.mutate(id);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">Welcome to MovieTracker</h2>
            <p className="text-muted-foreground mb-6">
              Sign in to manage your favorite movies and TV shows
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/signup">Create Account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Movies & TV Shows</h1>
          <p className="text-muted-foreground">
            Manage your collection of favorite movies and TV shows
          </p>
        </div>
        <Button asChild>
          <Link to="/add">
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search movies..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onChange={(e) => handleTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="Movie">Movies</option>
          <option value="TV Show">TV Shows</option>
        </Select>
      </div>

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2 text-destructive">Error Loading Movies</h3>
              <p className="text-muted-foreground mb-4">
                Failed to load movies. Please try again.
              </p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Movies Grid */}
      {isLoading && movies.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading movies...</p>
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-12">
          <Film className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No movies found</h3>
          <p className="text-muted-foreground mb-4">
            {search || typeFilter ? 'Try adjusting your search or filters' : 'Start by adding your first movie'}
          </p>
          {!search && !typeFilter && (
            <Button asChild>
              <Link to="/add">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Movie
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map((movie) => (
            <Card key={movie.id} className="h-full flex flex-col">
              {movie.image ? (
                <div className="h-48 overflow-hidden bg-muted/50">
                  <img
                    src={movie.image}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      // Show fallback when image fails to load
                      const fallback = target.parentElement!.querySelector('.image-fallback');
                      if (fallback) {
                        (fallback as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                  <div className="image-fallback h-48 bg-muted/50 flex items-center justify-center" style={{ display: 'none' }}>
                    <div className="text-muted-foreground text-sm">No image available</div>
                  </div>
                </div>
              ) : (
                <div className="h-48 bg-muted/50 flex items-center justify-center">
                  <div className="text-muted-foreground text-sm">No image available</div>
                </div>
              )}
              <CardHeader className="pb-3 flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{movie.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      {movie.type === 'Movie' ? (
                        <Film className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Tv className="h-4 w-4 text-green-500" />
                      )}
                      <span className="text-sm text-muted-foreground">{movie.type}</span>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/edit/${movie.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(movie.id)}
                      className="text-destructive hover:text-destructive"
                      disabled={deleteMovieMutation.isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 flex-1">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Director:</span>
                    <span className="text-muted-foreground">{movie.director}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{formatCurrency(movie.budget)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{formatDuration(movie.duration)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{movie.year}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{movie.location}</span>
                  </div>
                </div>
                {movie.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {movie.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {pagination?.hasNextPage && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}; 