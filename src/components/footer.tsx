import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Shield, Mail, MapPin } from 'lucide-react';
export const Footer: React.FC = () => {
  return <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold">DocWise</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Making documents accessible for everyone, everywhere. 
              Empowering independence through technology.
            </p>
          </div>

          {/* Product */}
          

          {/* Resources */}
          

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>writetoadvaitv@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Global • Remote First</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        
      </div>
    </footer>;
};