import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/ImageUpload';
import { CreateMovieData } from '@/types/movie';
import { useMovie, useCreateMovie, useUpdateMovie } from '@/hooks/useMovies';

const movieSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['Movie', 'TV Show']),
  director: z.string().min(1, 'Director is required'),
  budget: z.number().min(0, 'Budget must be positive'),
  location: z.string().min(1, 'Location is required'),
  duration: z.number().min(1, 'Duration must be positive'),
  year: z.number().min(1900, 'Year must be after 1900').max(new Date().getFullYear() + 10, 'Year cannot be too far in the future'),
  description: z.string().optional(),
  image: z.string().optional(),
});

type MovieFormData = z.infer<typeof movieSchema>;

export const MovieForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);

  // React Query hooks
  const { data: movie, isLoading: isLoadingMovie } = useMovie(id || '');
  const createMovieMutation = useCreateMovie();
  const updateMovieMutation = useUpdateMovie();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<MovieFormData>({
    resolver: zodResolver(movieSchema),
    defaultValues: {
      type: 'Movie',
      budget: 0,
      duration: 0,
      year: new Date().getFullYear(),
      image: '',
    },
  });

  const watchedImage = watch('image');

  // Set form values when movie data is loaded
  if (movie && !loading) {
    setValue('title', movie.title);
    setValue('type', movie.type);
    setValue('director', movie.director);
    setValue('budget', movie.budget);
    setValue('location', movie.location);
    setValue('duration', movie.duration);
    setValue('year', movie.year);
    setValue('description', movie.description || '');
    setValue('image', movie.image || '');
    setLoading(true);
  }

  const onSubmit = async (data: MovieFormData) => {
    try {
      const movieData = {
        ...data,
        image: data.image || undefined,
      };

      if (id) {
        updateMovieMutation.mutate({ id, data: movieData });
      } else {
        createMovieMutation.mutate(movieData as CreateMovieData);
      }
      
      navigate('/');
    } catch (error: any) {
      console.error('Failed to save movie:', error);
    }
  };

  if (isLoadingMovie) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <CardTitle>{id ? 'Edit Movie' : 'Add New Movie'}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title *
              </label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Enter movie title"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Type */}
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">
                Type *
              </label>
              <Select {...register('type')}>
                <option value="Movie">Movie</option>
                <option value="TV Show">TV Show</option>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type.message}</p>
              )}
            </div>

            {/* Director */}
            <div className="space-y-2">
              <label htmlFor="director" className="text-sm font-medium">
                Director *
              </label>
              <Input
                id="director"
                {...register('director')}
                placeholder="Enter director name"
              />
              {errors.director && (
                <p className="text-sm text-destructive">{errors.director.message}</p>
              )}
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <label htmlFor="budget" className="text-sm font-medium">
                Budget *
              </label>
              <Input
                id="budget"
                type="number"
                {...register('budget', { valueAsNumber: true })}
                placeholder="Enter budget"
              />
              {errors.budget && (
                <p className="text-sm text-destructive">{errors.budget.message}</p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">
                Location *
              </label>
              <Input
                id="location"
                {...register('location')}
                placeholder="Enter filming location"
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location.message}</p>
              )}
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label htmlFor="duration" className="text-sm font-medium">
                Duration (minutes) *
              </label>
              <Input
                id="duration"
                type="number"
                {...register('duration', { valueAsNumber: true })}
                placeholder="Enter duration in minutes"
              />
              {errors.duration && (
                <p className="text-sm text-destructive">{errors.duration.message}</p>
              )}
            </div>

            {/* Year */}
            <div className="space-y-2">
              <label htmlFor="year" className="text-sm font-medium">
                Year *
              </label>
              <Input
                id="year"
                type="number"
                {...register('year', { valueAsNumber: true })}
                placeholder="Enter release year"
              />
              {errors.year && (
                <p className="text-sm text-destructive">{errors.year.message}</p>
              )}
            </div>

            {/* Image Upload */}
            <ImageUpload
              onImageUpload={(imageUrl) => setValue('image', imageUrl)}
              currentImageUrl={watchedImage}
            />

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Enter movie description"
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={createMovieMutation.isLoading || updateMovieMutation.isLoading}
            >
              {createMovieMutation.isLoading || updateMovieMutation.isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {id ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {id ? 'Update Movie' : 'Add Movie'}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}; 