import React from 'react';
import { Navigation } from '@/components/navigation';
import { HeroSection } from '@/components/hero-section';
import { ProblemSolutionSection } from '@/components/problem-solution';
import { FeaturesSection } from '@/components/features-section';
import { Footer } from '@/components/footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <ProblemSolutionSection />
      <FeaturesSection />
      <Footer />
    </div>
  );
};

export default Index;
