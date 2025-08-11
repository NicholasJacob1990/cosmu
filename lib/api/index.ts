"use client";

import { User, Project, Message, Notification, DashboardMetrics } from '@/store/dashboardStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Auth
  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // Dashboard APIs
  async getDashboardData(userId: string, userType: 'client' | 'professional') {
    return this.request<{
      user: User;
      projects: Project[];
      messages: Message[];
      notifications: Notification[];
      metrics: DashboardMetrics;
    }>(`/dashboard/${userType}/${userId}`);
  }

  // Projects
  async getProjects(filters?: {
    status?: string;
    category?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams(filters as any);
    return this.request<{ projects: Project[]; total: number }>(
      `/projects?${params}`
    );
  }

  async getProject(projectId: string) {
    return this.request<Project>(`/projects/${projectId}`);
  }

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async updateProject(projectId: string, updates: Partial<Project>) {
    return this.request<Project>(`/projects/${projectId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteProject(projectId: string) {
    return this.request<void>(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  // Messages
  async getMessages(projectId?: string) {
    const endpoint = projectId 
      ? `/messages?projectId=${projectId}` 
      : '/messages';
    return this.request<Message[]>(endpoint);
  }

  async sendMessage(message: Omit<Message, 'id' | 'createdAt'>) {
    return this.request<Message>('/messages', {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  async markMessageAsRead(messageId: string) {
    return this.request<void>(`/messages/${messageId}/read`, {
      method: 'PUT',
    });
  }

  // Notifications
  async getNotifications(userId: string) {
    return this.request<Notification[]>(`/notifications?userId=${userId}`);
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request<void>(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async clearNotifications(userId: string) {
    return this.request<void>(`/notifications/clear?userId=${userId}`, {
      method: 'DELETE',
    });
  }

  // Metrics & Analytics
  async getMetrics(userId: string, timeRange?: { start: Date; end: Date }) {
    const params = timeRange 
      ? `?start=${timeRange.start.toISOString()}&end=${timeRange.end.toISOString()}`
      : '';
    return this.request<DashboardMetrics>(`/metrics/${userId}${params}`);
  }

  async getAnalytics(userId: string, type: 'performance' | 'trends' | 'predictions') {
    return this.request<any>(`/analytics/${userId}/${type}`);
  }

  // Professional specific
  async getSalesPipeline(professionalId: string) {
    return this.request<any>(`/professionals/${professionalId}/pipeline`);
  }

  async getMarketIntelligence(professionalId: string) {
    return this.request<any>(`/professionals/${professionalId}/market-intelligence`);
  }

  // Client specific
  async getRecommendations(clientId: string) {
    return this.request<any>(`/clients/${clientId}/recommendations`);
  }

  async getPersonalizedDiscovery(clientId: string) {
    return this.request<any>(`/clients/${clientId}/discovery`);
  }
}

export const api = new ApiClient(API_BASE_URL);

// React Query hooks
export { useProjects, useProject } from './hooks/useProjects';
export { useMessages } from './hooks/useMessages';
export { useNotifications } from './hooks/useNotifications';
export { useMetrics } from './hooks/useMetrics';