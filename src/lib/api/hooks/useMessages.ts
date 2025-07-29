import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../index';
import { Message } from '@/store/dashboardStore';
import { useDashboardStore } from '@/store/dashboardStore';

export const useMessages = (projectId?: string) => {
  return useQuery({
    queryKey: ['messages', projectId],
    queryFn: () => api.getMessages(projectId),
    staleTime: 30 * 1000, // 30 seconds - messages update frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const addMessage = useDashboardStore((state) => state.addMessage);

  return useMutation({
    mutationFn: (message: Omit<Message, 'id' | 'createdAt'>) => 
      api.sendMessage(message),
    onSuccess: (newMessage) => {
      // Update React Query cache
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      
      // Update Zustand store for immediate UI update
      addMessage(newMessage);
    },
  });
};

export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient();
  const markMessageAsRead = useDashboardStore((state) => state.markMessageAsRead);

  return useMutation({
    mutationFn: (messageId: string) => api.markMessageAsRead(messageId),
    onMutate: async (messageId) => {
      // Optimistic update in Zustand
      markMessageAsRead(messageId);
    },
    onSuccess: (_, messageId) => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
    onError: (_, messageId) => {
      // Revert optimistic update on error
      // In a real app, you'd want to restore the previous state
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
};