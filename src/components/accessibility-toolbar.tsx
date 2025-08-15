import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, 
  Type, 
  Eye, 
  Focus,
  RotateCcw
} from 'lucide-react';

interface AccessibilityToolbarProps {
  className?: string;
}

export const AccessibilityToolbar: React.FC<AccessibilityToolbarProps> = ({ className = '' }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [extraLargeText, setExtraLargeText] = useState(false);
  const [enhancedFocus, setEnhancedFocus] = useState(false);

  // Callback to parent when enhanced focus changes
  React.useEffect(() => {
    if (enhancedFocus) {
      document.body.classList.add('focus-enhanced');
      // Dispatch custom event for focus mode
      window.dispatchEvent(new CustomEvent('focusModeChange', { detail: { enabled: true } }));
    } else {
      document.body.classList.remove('focus-enhanced');
      window.dispatchEvent(new CustomEvent('focusModeChange', { detail: { enabled: false } }));
    }
  }, [enhancedFocus]);

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
    document.body.classList.toggle('high-contrast', !highContrast);
  };

  const toggleLargeText = () => {
    if (extraLargeText) {
      setExtraLargeText(false);
      document.body.classList.remove('xl-text');
    }
    setLargeText(!largeText);
    document.body.classList.toggle('large-text', !largeText);
  };

  const toggleExtraLargeText = () => {
    if (largeText) {
      setLargeText(false);
      document.body.classList.remove('large-text');
    }
    setExtraLargeText(!extraLargeText);
    document.body.classList.toggle('xl-text', !extraLargeText);
  };

  const toggleEnhancedFocus = () => {
    setEnhancedFocus(!enhancedFocus);
    document.body.classList.toggle('focus-enhanced', !enhancedFocus);
  };

  const resetAll = () => {
    setHighContrast(false);
    setLargeText(false);
    setExtraLargeText(false);
    setEnhancedFocus(false);
    document.body.classList.remove('high-contrast', 'large-text', 'xl-text', 'focus-enhanced');
  };

  return (
    <div className={`bg-card border rounded-lg p-4 shadow-soft ${className}`}>
      <h3 className="text-sm font-semibold text-foreground mb-3">Accessibility Options</h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={highContrast ? "default" : "outline"}
          size="sm"
          onClick={toggleHighContrast}
          className="text-xs"
          aria-pressed={highContrast}
          aria-label="Toggle high contrast mode"
        >
          <Palette className="w-3 h-3 mr-1" />
          High Contrast
        </Button>
        
        <Button
          variant={largeText ? "default" : "outline"}
          size="sm"
          onClick={toggleLargeText}
          className="text-xs"
          aria-pressed={largeText}
          aria-label="Toggle large text size"
        >
          <Type className="w-3 h-3 mr-1" />
          Large Text
        </Button>
        
        <Button
          variant={extraLargeText ? "default" : "outline"}
          size="sm"
          onClick={toggleExtraLargeText}
          className="text-xs"
          aria-pressed={extraLargeText}
          aria-label="Toggle extra large text size"
        >
          <Type className="w-3 h-3 mr-1" />
          XL Text
        </Button>
        
        <Button
          variant={enhancedFocus ? "default" : "outline"}
          size="sm"
          onClick={toggleEnhancedFocus}
          className="text-xs"
          aria-pressed={enhancedFocus}
          aria-label="Toggle enhanced focus indicators"
        >
          <Focus className="w-3 h-3 mr-1" />
          Enhanced Focus
        </Button>

        <Separator orientation="vertical" className="h-6" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={resetAll}
          className="text-xs"
          aria-label="Reset all accessibility options"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Reset
        </Button>
      </div>
    </div>
  );
};