import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, proposalsApi } from '@/lib/api';
import { toast } from 'sonner';

export function useProjectSearch(params: any) {
  return useQuery({
    queryKey: ['projects', 'search', params],
    queryFn: () => projectsApi.search(params),
    select: (response) => response.data,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsApi.getById(id),
    select: (response) => response.data,
    enabled: !!id,
  });
}

export function useProjectProposals(id: string, params?: any) {
  return useQuery({
    queryKey: ['projects', id, 'proposals', params],
    queryFn: () => projectsApi.getProposals(id, params),
    select: (response) => response.data,
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => projectsApi.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projeto criado com sucesso!');
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao criar projeto');
    },
  });
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => projectsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'search'] });
      toast.success('Projeto atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao atualizar projeto');
    },
  });
}

export function useCreateProposal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => proposalsApi.create(data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId, 'proposals'] });
      toast.success('Proposta enviada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao enviar proposta');
    },
  });
}