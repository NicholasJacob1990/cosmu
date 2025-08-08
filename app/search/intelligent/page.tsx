'use client';

import IntelligentSearch from '@/components/search/IntelligentSearch';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Suspense } from 'react';

function SearchContent() {
  return <IntelligentSearch />;
}

export default function IntelligentSearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }>
          <SearchContent />
        </Suspense>
      </main>
      
      <Footer />
    </div>
  );
}