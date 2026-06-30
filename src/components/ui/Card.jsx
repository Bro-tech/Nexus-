import React from 'react';
import { cn } from '../../lib/utils';

const Card = React.forwardRef(({ className, children, glass = false, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-3xl p-6 transition-all duration-300",
        glass ? "glass" : "bg-white shadow-sm border border-sage-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
Card.displayName = "Card";

export { Card };
