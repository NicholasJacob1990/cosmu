import { Project, Message, Notification, DashboardMetrics } from '@/store/dashboardStore';

export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Website Redesign for E-commerce Platform',
    description: 'Complete redesign of our online store with modern UI/UX',
    status: 'in_progress',
    clientId: 'client-1',
    professionalId: 'pro-1',
    budget: {
      min: 5000,
      max: 8000,
      currency: 'BRL'
    },
    timeline: {
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-02-15')
    },
    category: 'Web Development',
    skills: ['React', 'Node.js', 'UI/UX Design'],
    proposals: 12,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '2',
    title: 'Mobile App Development - Fitness Tracker',
    description: 'Native iOS and Android app for fitness tracking',
    status: 'active',
    clientId: 'client-2',
    budget: {
      min: 15000,
      max: 25000,
      currency: 'BRL'
    },
    timeline: {
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-04-30')
    },
    category: 'Mobile Development',
    skills: ['React Native', 'Firebase', 'API Integration'],
    proposals: 8,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: '3',
    title: 'Brand Identity Design Package',
    description: 'Complete brand identity including logo, colors, and guidelines',
    status: 'review',
    clientId: 'client-3',
    professionalId: 'pro-2',
    budget: {
      min: 3000,
      max: 4000,
      currency: 'BRL'
    },
    timeline: {
      startDate: new Date('2024-01-05'),
      endDate: new Date('2024-01-25')
    },
    category: 'Design',
    skills: ['Logo Design', 'Branding', 'Adobe Creative Suite'],
    proposals: 15,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-22')
  }
];

export const mockMessages: Message[] = [
  {
    id: 'msg-1',
    projectId: '1',
    senderId: 'client-1',
    receiverId: 'pro-1',
    content: 'Hi, I\'ve reviewed the initial mockups. Can we discuss some changes?',
    read: false,
    createdAt: new Date('2024-01-20T10:30:00')
  },
  {
    id: 'msg-2',
    projectId: '1',
    senderId: 'pro-1',
    receiverId: 'client-1',
    content: 'Of course! I\'m available for a call today at 3 PM or tomorrow morning.',
    read: true,
    createdAt: new Date('2024-01-20T11:15:00')
  },
  {
    id: 'msg-3',
    projectId: '2',
    senderId: 'client-2',
    receiverId: 'pro-3',
    content: 'Please send me your portfolio for mobile app development.',
    read: false,
    createdAt: new Date('2024-01-19T14:20:00')
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    type: 'proposal_received',
    title: 'New Proposal Received',
    message: 'You have received a new proposal for "Website Redesign" project',
    read: false,
    actionUrl: '/projects/1/proposals',
    createdAt: new Date('2024-01-20T09:00:00')
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    type: 'payment',
    title: 'Payment Received',
    message: 'Payment of R$ 2,500 has been processed for milestone 1',
    read: true,
    actionUrl: '/payments',
    createdAt: new Date('2024-01-19T16:30:00')
  },
  {
    id: 'notif-3',
    userId: 'user-1',
    type: 'project_update',
    title: 'Project Status Updated',
    message: 'Your project "Mobile App Development" is now active',
    read: true,
    actionUrl: '/projects/2',
    createdAt: new Date('2024-01-18T12:00:00')
  }
];

export const mockMetrics: DashboardMetrics = {
  totalRevenue: 23400,
  revenueGrowth: 31,
  activeProjects: 8,
  completedProjects: 11,
  averageRating: 4.89,
  responseTime: 1.2,
  conversionRate: 67,
  npsScore: 91
};