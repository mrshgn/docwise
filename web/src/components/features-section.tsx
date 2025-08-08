import React from 'react';
import { Upload, Cpu, Download, Globe, Shield, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Upload,
      title: 'Drag & Drop Upload',
      description: 'Simply drag your PDF, Word, or PowerPoint files into our secure cloud platform'
    },
    {
      icon: Cpu,
      title: 'AI-Powered Analysis',
      description: 'Advanced AI instantly detects accessibility issues and document structure problems'
    },
    {
      icon: Zap,
      title: 'One-Click Fixes',
      description: 'Automatically fix tagging, reading order, and form labels with a single click'
    },
    {
      icon: Download,
      title: 'Multiple Formats',
      description: 'Download fixed PDFs, HTML versions, or voice-readable summaries'
    },
    {
      icon: Globe,
      title: 'Cloud-Based',
      description: 'No software installation needed. Works on any device with an internet connection'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Enterprise-grade security ensures your sensitive documents remain protected'
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            How It <span className="bg-gradient-accent bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform any document into an accessible format in just three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="relative group hover:shadow-large transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                
                {/* Step number */}
                <div className="absolute top-4 right-4 bg-accent text-accent-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};