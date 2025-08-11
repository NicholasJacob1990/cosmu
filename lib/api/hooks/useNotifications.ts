"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../index';
import { useDashboardStore } from '@/store/dashboardStore';

export const useNotifications = (userId: string) => {
  const setNotifications = useDashboardStore((state) => state.setNotifications);

  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      const notifications = await api.getNotifications(userId);
      // Sync with Zustand store
      setNotifications(notifications);
      return notifications;
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Poll every minute
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  const markNotificationAsRead = useDashboardStore((state) => state.markNotificationAsRead);

  return useMutation({
    mutationFn: (notificationId: string) => 
      api.markNotificationAsRead(notificationId),
    onMutate: async (notificationId) => {
      // Optimistic update
      markNotificationAsRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useClearNotifications = () => {
  const queryClient = useQueryClient();
  const clearNotifications = useDashboardStore((state) => state.clearNotifications);

  return useMutation({
    mutationFn: (userId: string) => api.clearNotifications(userId),
    onMutate: async () => {
      // Optimistic update
      clearNotifications();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};