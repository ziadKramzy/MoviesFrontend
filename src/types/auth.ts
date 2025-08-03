export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  _count?: {
    movies: number;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SignupData {
  email: string;
  username: string;
  password: string;
}

export interface SigninData {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
} 