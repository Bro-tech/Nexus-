import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

const Button = React.forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'default', 
  isLoading = false,
  children, 
  ...props 
}, ref) => {
  const variants = {
    primary: "bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-purple-500/50",
    secondary: "bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg hover:shadow-cyan-500/50",
    outline: "border-2 border-purple-300 dark:border-purple-700 hover:border-purple-500 text-purple-700 dark:text-purple-300 bg-white/50 dark:bg-transparent hover:bg-purple-50 dark:hover:bg-purple-900/20",
    ghost: "hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-500/50",
  };

  const sizes = {
    default: "h-11 px-6 py-2",
    sm: "h-9 px-4 text-sm",
    lg: "h-14 px-8 text-lg rounded-2xl",
    icon: "h-11 w-11",
  };

  return (
    <button
      ref={ref}
      disabled={isLoading || props.disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300",
        "active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});

Button.displayName = "Button";

export { Button };
