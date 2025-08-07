import React from 'react';
import { Users, Globe, FileCheck, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const ImpactSection: React.FC = () => {
  const impactStats = [
    { icon: Users, number: '2.1M+', label: 'Documents Made Accessible' },
    { icon: Globe, number: '140+', label: 'Countries Served' },
    { icon: FileCheck, number: '99.8%', label: 'Success Rate' },
    { icon: Heart, number: '1.3M+', label: 'Lives Improved' },
  ];

  const testimonials = [
    {
      quote: "Finally, I can read my bank statements independently. This tool has given me back my financial privacy.",
      author: "Sarah M.",
      role: "Screen Reader User"
    },
    {
      quote: "Our hospital now makes all patient documents accessible. It's transformed how we serve our community.",
      author: "Dr. James Chen",
      role: "Medical Director"
    },
    {
      quote: "As a legal aid lawyer, this saves me hours and ensures all my clients can access their documents.",
      author: "Maria Rodriguez",
      role: "Legal Aid Attorney"
    }
  ];

  return (
    <section className="py-20 bg-gradient-hero">
      <div className="container mx-auto px-4">
        {/* Impact Stats */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Real Impact, Real Lives
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12">
            Every document we make accessible represents someone's independence, privacy, and dignity restored.
          </p>

          <div className="grid md:grid-cols-4 gap-8">
            {impactStats.map((stat, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6 text-center text-white">
                  <stat.icon className="w-8 h-8 mx-auto mb-4 text-white" />
                  <div className="text-3xl font-bold mb-2">{stat.number}</div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-white">
                <p className="text-white/90 mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm text-white/70">{testimonial.role}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Join the Accessibility Revolution
          </h3>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Help us create a world where every document is accessible to everyone, regardless of ability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};