import React from 'react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';
import { ArrowRight, Shield, Zap, Users } from 'lucide-react';
import heroImage from '@/assets/hero-accessibility.jpg';
export const HeroSection: React.FC = () => {
  const handleFileUpload = (files: File[]) => {
    console.log('Files uploaded:', files);
    // Here you would typically send files to your analysis service
  };
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-hero opacity-10" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content Column */}
          <div className="space-y-6 lg:space-y-8 animate-fade-in text-center lg:text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-accent-light rounded-full px-4 py-2">
                <Shield className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent">Accessibility First</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Make Every Document
                <span className="bg-gradient-primary bg-clip-text text-transparent"> Accessible</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Transform PDFs, Word docs, and presentations into fully accessible documents. 
                AI-powered analysis and one-click fixes for screen readers and assistive technologies.
              </p>
            </div>

            {/* Key Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 justify-items-center lg:justify-items-start">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium">Instant Analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-success" />
                <span className="text-sm font-medium">One-Click Fixes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Easy to Use</span>
              </div>
            </div>

          </div>

          {/* Upload Column */}
          <div className="space-y-6 animate-scale-in order-first lg:order-last">
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl font-semibold mb-2">Upload Your Document</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Get instant accessibility analysis and fixes
              </p>
            </div>
            
            <FileUpload onFileUpload={handleFileUpload} className="bg-card shadow-large border-2" />
            
            {/* Visual Document Preview */}
            <div className="relative">
              <img src={heroImage} alt="Before and after document accessibility comparison" className="w-full rounded-lg shadow-medium animate-float" />
              <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-card/90 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1 sm:py-2">
                <span className="text-xs sm:text-sm font-medium text-foreground">Live Preview</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};