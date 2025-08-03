import { useMutation } from 'react-query';
import toast from 'react-hot-toast';

interface UploadResponse {
  data: {
    filename: string;
    originalName: string;
    size: number;
    url: string;
  };
}

// Upload image mutation
export const useUploadImage = () => {
  return useMutation({
    mutationFn: async (file: File): Promise<UploadResponse> => {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const response = await fetch('https://movies-app-backend.fly.dev/api/upload/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      // Ensure the URL always starts with a forward slash
      if (result.data?.url && !result.data.url.startsWith('/')) {
        result.data.url = `/${result.data.url}`;
      }
      return result;
    },
    onSuccess: () => {
      toast.success('Image uploaded successfully!');
    },
    onError: (error: any) => {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    },
  });
}; 