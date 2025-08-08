import React from 'react';
import { AlertTriangle, CheckCircle2, FileX, FileCheck, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const ProblemSolutionSection: React.FC = () => {
  const problemStats = [
    { icon: FileX, stat: '60%', label: 'Documents are inaccessible' },
    { icon: AlertTriangle, stat: '1.3B', label: 'People affected worldwide' },
    { icon: BarChart3, stat: '85%', label: 'Miss critical information' },
  ];

  const solutionFeatures = [
    {
      icon: CheckCircle2,
      title: 'Smart Tagging',
      description: 'AI identifies and tags headings, paragraphs, and lists for proper structure'
    },
    {
      icon: CheckCircle2,
      title: 'Reading Order Fix',
      description: 'Corrects document flow to ensure logical reading sequence for screen readers'
    },
    {
      icon: CheckCircle2,
      title: 'Form Labels',
      description: 'Automatically adds descriptive labels to form fields and interactive elements'
    },
    {
      icon: CheckCircle2,
      title: 'Voice Summary',
      description: 'Generates audio-friendly summaries and alternative formats'
    },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Solution Section */}
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
            Our <span className="bg-gradient-primary bg-clip-text text-transparent">Solution</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 sm:mb-12">
            Cloud-based AI that analyzes document structure and automatically fixes 
            accessibility issues with a single click—no installation required.
          </p>
          
          <div className="grid sm:grid-cols-2 gap-6 lg:gap-8 text-left">
            {solutionFeatures.map((feature, index) => (
              <Card key={index} className="bg-card shadow-soft hover:shadow-medium transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-success-light rounded-full p-2 flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};