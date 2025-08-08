import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Menu } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

export const Navigation: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AccessFix
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="#features"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Features
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="#how-it-works"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    How It Works
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="#pricing"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Pricing
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="#contact"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Contact
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
              <Button size="sm" className="bg-gradient-primary hover:opacity-90">
                Get Started
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};