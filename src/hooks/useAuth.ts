import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'client' | 'freelancer';
  profileImageUrl?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const response = await authApi.getMe();
        return response.data as User;
      } catch (error) {
        return null;
      }
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) => authApi.login(data),
    onSuccess: (response) => {
      const { user, token } = response.data as AuthResponse;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      queryClient.setQueryData(['auth', 'me'], user);
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao fazer login');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      userType: string;
    }) => authApi.register(data),
    onSuccess: (response) => {
      const { user, token } = response.data as AuthResponse;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      queryClient.setQueryData(['auth', 'me'], user);
      toast.success('Conta criada com sucesso!');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao criar conta');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      queryClient.clear();
      toast.success('Logout realizado com sucesso');
      navigate('/');
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}