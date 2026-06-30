import React, { useState } from 'react';
import { cn } from '../../lib/utils';

const Input = React.forwardRef(({ className, label, type = "text", error, ...props }, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="w-full relative">
      <div 
        className={cn(
          "relative border rounded-xl px-4 py-2 transition-all duration-200 bg-white",
          isFocused ? "border-sage-400 ring-4 ring-sage-100" : "border-sage-200",
          error && "border-red-400 ring-4 ring-red-50",
          className
        )}
      >
        {label && (
          <label 
            className={cn(
              "absolute left-4 transition-all duration-200 pointer-events-none text-sage-600 bg-white px-1",
              isFocused || props.value || props.defaultValue 
                ? "-top-2.5 text-xs font-medium" 
                : "top-3 text-base text-sage-400"
            )}
          >
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className="w-full h-8 bg-transparent outline-none text-ocean placeholder:text-transparent"
          placeholder={label}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
    </div>
  );
});
Input.displayName = "Input";

export { Input };
