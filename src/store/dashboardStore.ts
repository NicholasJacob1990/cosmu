import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  type: 'client' | 'professional';
  email: string;
  name: string;
  profileImage?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  subscription: {
    plan: 'free' | 'starter' | 'professional' | 'business';
    expiresAt: Date;
  };
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'in_progress' | 'review' | 'completed' | 'cancelled';
  clientId: string;
  professionalId?: string;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  timeline: {
    startDate: Date;
    endDate: Date;
  };
  category: string;
  skills: string[];
  proposals: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  projectId: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  attachments?: string[];
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'project_update' | 'new_message' | 'proposal_received' | 'payment' | 'system';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

export interface DashboardMetrics {
  totalRevenue: number;
  revenueGrowth: number;
  activeProjects: number;
  completedProjects: number;
  averageRating: number;
  responseTime: number;
  conversionRate: number;
  npsScore: number;
}

interface DashboardState {
  // User data
  user: User | null;
  
  // Projects data
  projects: Project[];
  projectsLoading: boolean;
  projectsError: string | null;
  
  // Messages
  messages: Message[];
  unreadCount: number;
  
  // Notifications
  notifications: Notification[];
  
  // Metrics
  metrics: DashboardMetrics | null;
  
  // Real-time connection
  wsConnected: boolean;
  wsError: string | null;
  
  // UI State
  activeView: string;
  sidebarCollapsed: boolean;
}

interface DashboardActions {
  // User actions
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  
  // Project actions
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  
  // Message actions
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  markMessageAsRead: (messageId: string) => void;
  
  // Notification actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (notificationId: string) => void;
  clearNotifications: () => void;
  
  // Metrics actions
  setMetrics: (metrics: DashboardMetrics) => void;
  updateMetrics: (updates: Partial<DashboardMetrics>) => void;
  
  // WebSocket actions
  setWsConnected: (connected: boolean) => void;
  setWsError: (error: string | null) => void;
  
  // UI actions
  setActiveView: (view: string) => void;
  toggleSidebar: () => void;
  
  // Data fetching
  fetchDashboardData: () => Promise<void>;
  refreshMetrics: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState & DashboardActions>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      projects: [],
      projectsLoading: false,
      projectsError: null,
      messages: [],
      unreadCount: 0,
      notifications: [],
      metrics: null,
      wsConnected: false,
      wsError: null,
      activeView: 'dashboard',
      sidebarCollapsed: false,
      
      // User actions
      setUser: (user) => set({ user }),
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
      
      // Project actions
      setProjects: (projects) => set({ projects, projectsLoading: false, projectsError: null }),
      addProject: (project) => set((state) => ({
        projects: [...state.projects, project]
      })),
      updateProject: (projectId, updates) => set((state) => ({
        projects: state.projects.map(p => 
          p.id === projectId ? { ...p, ...updates } : p
        )
      })),
      deleteProject: (projectId) => set((state) => ({
        projects: state.projects.filter(p => p.id !== projectId)
      })),
      
      // Message actions
      setMessages: (messages) => set({ 
        messages,
        unreadCount: messages.filter(m => !m.read).length
      }),
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, message],
        unreadCount: message.read ? state.unreadCount : state.unreadCount + 1
      })),
      markMessageAsRead: (messageId) => set((state) => ({
        messages: state.messages.map(m => 
          m.id === messageId ? { ...m, read: true } : m
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      })),
      
      // Notification actions
      setNotifications: (notifications) => set({ notifications }),
      addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications]
      })),
      markNotificationAsRead: (notificationId) => set((state) => ({
        notifications: state.notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      })),
      clearNotifications: () => set({ notifications: [] }),
      
      // Metrics actions
      setMetrics: (metrics) => set({ metrics }),
      updateMetrics: (updates) => set((state) => ({
        metrics: state.metrics ? { ...state.metrics, ...updates } : null
      })),
      
      // WebSocket actions
      setWsConnected: (wsConnected) => set({ wsConnected, wsError: null }),
      setWsError: (wsError) => set({ wsError, wsConnected: false }),
      
      // UI actions
      setActiveView: (activeView) => set({ activeView }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      
      // Data fetching
      fetchDashboardData: async () => {
        set({ projectsLoading: true });
        try {
          // This will be replaced with actual API calls
          const mockData = await import('../lib/mockData');
          set({
            projects: mockData.mockProjects,
            messages: mockData.mockMessages,
            notifications: mockData.mockNotifications,
            metrics: mockData.mockMetrics,
            projectsLoading: false,
            projectsError: null
          });
        } catch (error) {
          set({ 
            projectsLoading: false, 
            projectsError: error instanceof Error ? error.message : 'Failed to fetch data' 
          });
        }
      },
      
      refreshMetrics: async () => {
        try {
          // This will be replaced with actual API call
          const mockData = await import('../lib/mockData');
          set({ metrics: mockData.mockMetrics });
        } catch (error) {
          console.error('Failed to refresh metrics:', error);
        }
      }
    }),
    {
      name: 'galaxia-dashboard',
      partialize: (state) => ({
        user: state.user,
        sidebarCollapsed: state.sidebarCollapsed,
        activeView: state.activeView
      })
    }
  )
);