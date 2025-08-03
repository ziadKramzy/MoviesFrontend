import axios from 'axios';
import { Movie, MovieStats, CreateMovieData, UpdateMovieData, MovieFilters, ApiResponse, PaginationInfo } from '@/types/movie';
import { AuthResponse, SignupData, SigninData, User } from '@/types/auth';

// Use environment variable for production, relative path for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : '/api';
console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
  xsrfHeaderName: 'X-XSRF-TOKEN',
  xsrfCookieName: 'XSRF-TOKEN',
});

// Add CSRF token to all requests
api.interceptors.request.use(config => {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];
    
  if (token) {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
  }
  
  return config;
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  // Sign up
  signup: async (data: SignupData): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/signup', data);
    return response.data.data;
  },

  // Sign in
  signin: async (data: SigninData): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/signin', data);
    return response.data.data;
  },

  // Get user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/auth/profile');
    return response.data.data;
  },
};

export const movieApi = {
  // Get all movies with pagination and filters
  getMovies: async (filters: MovieFilters = {}): Promise<{ data: Movie[]; pagination: PaginationInfo }> => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.type) params.append('type', filters.type);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await api.get<ApiResponse<Movie[]>>(`/movies?${params.toString()}`);
    
    // Process the movies to ensure image URLs are properly formatted
    const processedMovies = response.data.data.map(movie => ({
      ...movie,
      // Only modify the image URL if it exists and doesn't already have a full URL
      image: movie.image 
        ? movie.image.startsWith('http') 
          ? movie.image 
          : `https://movies-app-backend.fly.dev${movie.image}`
        : undefined
    }));

    return {
      data: processedMovies,
      pagination: response.data.pagination!
    };
  },

  // Get movie by ID
  getMovie: async (id: string): Promise<Movie> => {
    const response = await api.get<ApiResponse<Movie>>(`/movies/${id}`);
    const movie = response.data.data;
    
    // Process the movie to ensure image URL is properly formatted
    return {
      ...movie,
      image: movie.image 
        ? movie.image.startsWith('http') 
          ? movie.image 
          : `https://movies-app-backend.fly.dev${movie.image}`
        : undefined
    };
  },

  // Create new movie
  createMovie: async (data: CreateMovieData): Promise<Movie> => {
    const response = await api.post<ApiResponse<Movie>>('/movies', data);
    const movie = response.data.data;
    
    // Process the movie to ensure image URL is properly formatted
    return {
      ...movie,
      image: movie.image 
        ? movie.image.startsWith('http') 
          ? movie.image 
          : `https://movies-app-backend.fly.dev${movie.image}`
        : undefined
    };
  },

  // Update movie
  updateMovie: async (id: string, data: UpdateMovieData): Promise<Movie> => {
    const response = await api.put<ApiResponse<Movie>>(`/movies/${id}`, data);
    const movie = response.data.data;
    
    // Process the movie to ensure image URL is properly formatted
    return {
      ...movie,
      image: movie.image 
        ? movie.image.startsWith('http') 
          ? movie.image 
          : `https://movies-app-backend.fly.dev${movie.image}`
        : undefined
    };
  },

  // Delete movie
  deleteMovie: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/movies/${id}`);
  },

  // Get movie statistics
  getStats: async (): Promise<MovieStats> => {
    const response = await api.get<ApiResponse<MovieStats>>('/movies/stats');
    return response.data.data;
  },
};

export default api; 