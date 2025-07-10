import React from "react";

// Define props interface for RadioGroup
interface RadioGroupProps {
  className?: string;
  children: React.ReactNode;
  value: string;
  onValueChange?: (value: string) => void;
  [key: string]: any; // For additional props
}

// Define props interface for RadioGroupItem
interface RadioGroupItemProps {
  className?: string;
  value: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  children?: React.ReactNode;
  id?: string;
  [key: string]: any; // For additional props
}

// RadioGroup Component
export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className = "", children, value, onValueChange, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`grid gap-2 ${className}`}
        role="radiogroup"
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement<RadioGroupItemProps>(child)) {
            return React.cloneElement(child, {
              checked: child.props.value === value,
              onCheckedChange: (checked: boolean) => {
                if (checked && onValueChange) {
                  onValueChange(child.props.value);
                }
              },
            });
          }
          return child;
        })}
      </div>
    );
  }
);

RadioGroup.displayName = "RadioGroup";

// RadioGroupItem Component
export const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  ({ className = "", value, checked, onCheckedChange, children, id, ...props }, ref) => {
    // Use `value` in an accessibility attribute to satisfy ESLint
    const handleClick = () => {
      if (onCheckedChange) {
        onCheckedChange(true);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleClick();
      }
    };

    return (
      <div className="flex items-center space-x-2">
        <button
          ref={ref}
          type="button"
          role="radio"
          aria-checked={checked}
          aria-label={value} // Use `value` for accessibility
          tabIndex={checked ? 0 : -1}
          className={`
            aspect-square h-4 w-4 rounded-full border border-gray-300 text-blue-600 
            ring-offset-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 
            focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
            ${checked ? "border-blue-600 bg-blue-600" : "bg-white hover:border-blue-400"}
            ${className}
          `}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          id={id}
          {...props}
        >
          {checked && (
            <div className="flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-white" />
            </div>
          )}
        </button>
        {children && (
          <label
            htmlFor={id}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            {children}
          </label>
        )}
      </div>
    );
  }
);

RadioGroupItem.displayName = "RadioGroupItem";