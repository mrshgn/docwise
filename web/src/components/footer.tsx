import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Shield, Mail, MapPin } from 'lucide-react';
export const Footer: React.FC = () => {
  return <footer className="bg-card border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold">AccessFix</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Making documents accessible for everyone, everywhere. 
              Empowering independence through technology.
            </p>
          </div>

          {/* Product */}
          

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#docs" className="hover:text-foreground transition-colors">Documentation</a></li>
              <li><a href="#guides" className="hover:text-foreground transition-colors">Accessibility Guides</a></li>
              <li><a href="#support" className="hover:text-foreground transition-colors">Support</a></li>
              <li><a href="#status" className="hover:text-foreground transition-colors">Status</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>support@accessfix.com</span>
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