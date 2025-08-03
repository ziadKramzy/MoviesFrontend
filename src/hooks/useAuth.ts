import { useMutation, useQueryClient, useQuery } from 'react-query';
import { authApi } from '@/lib/api';
import { SignupData, SigninData } from '@/types/auth';
import toast from 'react-hot-toast';

// Auth query keys
export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
};

// Signup mutation
export const useSignup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: SignupData) => authApi.signup(data),
    onSuccess: (response) => {
      // Update auth context
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Invalidate auth queries
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      
      toast.success('Account created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create account');
    },
  });
};

// Signin mutation
export const useSignin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: SigninData) => authApi.signin(data),
    onSuccess: (response) => {
      // Update auth context
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Invalidate auth queries and force refetch
      queryClient.setQueryData(authKeys.all, {
        user: response.user,
        token: response.token,
        isAuthenticated: true,
      });
      
      // Force a window reload to ensure all components get the new auth state
      window.dispatchEvent(new Event('storage'));
      
      toast.success('Welcome back!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Invalid credentials');
    },
  });
};

// Get user profile
export const useProfile = () => {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: () => authApi.getProfile(),
    enabled: !!localStorage.getItem('token'),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}; 