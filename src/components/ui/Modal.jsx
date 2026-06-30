import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

const Modal = ({ isOpen, onClose, title, children, className }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-ocean/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div 
        className={cn(
          "relative w-full max-w-lg rounded-3xl bg-white/90 glass p-6 shadow-2xl transition-all duration-300 transform scale-100 opacity-100",
          className
        )}
      >
        <div className="flex items-center justify-between mb-6">
          {title && <h2 className="text-2xl font-semibold text-ocean">{title}</h2>}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="rounded-full !h-10 !w-10 hover:bg-sage-100/50"
          >
            <X className="h-5 w-5 text-sage-600" />
          </Button>
        </div>
        
        {children}
      </div>
    </div>
  );
};

export { Modal };
