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
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">

        {/* Solution Section */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Our <span className="bg-gradient-primary bg-clip-text text-transparent">Solution</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Cloud-based AI that analyzes document structure and automatically fixes 
            accessibility issues with a single click—no installation required.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {solutionFeatures.map((feature, index) => (
              <Card key={index} className="text-left bg-card shadow-soft hover:shadow-medium transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
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