'use client';

import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  userType: 'client' | 'professional' | 'healthcare';
  className?: string;
}

export function DashboardLayout({ children, userType, className }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800",
      className
    )}>
      <div className="flex h-screen">
        {/* Sidebar */}
        <DashboardSidebar collapsed={sidebarCollapsed} userType={userType} />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <DashboardHeader 
            onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            userName="Dr. João Silva"
          />
          
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}