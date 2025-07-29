import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { freelancersApi } from '@/lib/api';
import { toast } from 'sonner';

export function useFreelancerSearch(params: any) {
  return useQuery({
    queryKey: ['freelancers', 'search', params],
    queryFn: () => freelancersApi.search(params),
    select: (response) => response.data,
  });
}

export function useFreelancer(id: string) {
  return useQuery({
    queryKey: ['freelancers', id],
    queryFn: () => freelancersApi.getById(id),
    select: (response) => response.data,
    enabled: !!id,
  });
}

export function useFreelancerServices(id: string, params?: any) {
  return useQuery({
    queryKey: ['freelancers', id, 'services', params],
    queryFn: () => freelancersApi.getServices(id, params),
    select: (response) => response.data,
    enabled: !!id,
  });
}

export function useFreelancerReviews(id: string, params?: any) {
  return useQuery({
    queryKey: ['freelancers', id, 'reviews', params],
    queryFn: () => freelancersApi.getReviews(id, params),
    select: (response) => response.data,
    enabled: !!id,
  });
}

export function useCreateOrUpdateFreelancerProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => freelancersApi.createOrUpdateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['freelancers'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast.success('Perfil de freelancer atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao atualizar perfil');
    },
  });
}