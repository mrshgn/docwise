import React from 'react';
import { Users, Globe, FileCheck, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
export const ImpactSection: React.FC = () => {
  const impactStats = [{
    icon: Users,
    number: '2.1M+',
    label: 'Documents Made Accessible'
  }, {
    icon: Globe,
    number: '140+',
    label: 'Countries Served'
  }, {
    icon: FileCheck,
    number: '99.8%',
    label: 'Success Rate'
  }, {
    icon: Heart,
    number: '1.3M+',
    label: 'Lives Improved'
  }];
  return (
    <section className="py-16 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Making a Global Impact
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Empowering organizations worldwide to create accessible content for everyone
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {impactStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="text-center bg-card/50 border border-border/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};