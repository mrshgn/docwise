import React from 'react';
export const HeaderBar: React.FC = () => {
  return <header className="bg-card border-b border-border shadow-soft">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            
            <h1 className="text-lg font-semibold text-foreground">DocWise</h1>
          </div>
          
        </div>
      </div>
    </header>;
};