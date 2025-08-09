import React from 'react';
import { Users, Globe, FileCheck, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  const testimonials = [{
    quote: "Finally, I can read my bank statements independently. This tool has given me back my financial privacy.",
    author: "Sarah M.",
    role: "Screen Reader User"
  }, {
    quote: "Our hospital now makes all patient documents accessible. It's transformed how we serve our community.",
    author: "Dr. James Chen",
    role: "Medical Director"
  }, {
    quote: "As a legal aid lawyer, this saves me hours and ensures all my clients can access their documents.",
    author: "Maria Rodriguez",
    role: "Legal Aid Attorney"
  }];
  return;
};