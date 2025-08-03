import { useQuery, useMutation, useQueryClient } from 'react-query';
import { movieApi } from '@/lib/api';
import { CreateMovieData, UpdateMovieData, MovieFilters } from '@/types/movie';
import toast from 'react-hot-toast';

// Query keys
export const movieKeys = {
  all: ['movies'] as const,
  lists: () => [...movieKeys.all, 'list'] as const,
  list: (filters: MovieFilters) => [...movieKeys.lists(), filters] as const,
  details: () => [...movieKeys.all, 'detail'] as const,
  detail: (id: string) => [...movieKeys.details(), id] as const,
  stats: () => [...movieKeys.all, 'stats'] as const,
};

// Get movies with filters
export const useMovies = (filters: MovieFilters = {}) => {
  return useQuery({
    queryKey: movieKeys.list(filters),
    queryFn: () => movieApi.getMovies(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get single movie
export const useMovie = (id: string) => {
  return useQuery({
    queryKey: movieKeys.detail(id),
    queryFn: () => movieApi.getMovie(id),
    enabled: !!id,
  });
};

// Get movie stats
export const useMovieStats = () => {
  return useQuery({
    queryKey: movieKeys.stats(),
    queryFn: () => movieApi.getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create movie mutation
export const useCreateMovie = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateMovieData) => movieApi.createMovie(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: movieKeys.lists() });
      queryClient.invalidateQueries({ queryKey: movieKeys.stats() });
      toast.success('Movie created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create movie');
    },
  });
};

// Update movie mutation
export const useUpdateMovie = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMovieData }) => 
      movieApi.updateMovie(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: movieKeys.lists() });
      queryClient.invalidateQueries({ queryKey: movieKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: movieKeys.stats() });
      toast.success('Movie updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update movie');
    },
  });
};

// Delete movie mutation
export const useDeleteMovie = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => movieApi.deleteMovie(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: movieKeys.lists() });
      queryClient.invalidateQueries({ queryKey: movieKeys.stats() });
      toast.success('Movie deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete movie');
    },
  });
}; 