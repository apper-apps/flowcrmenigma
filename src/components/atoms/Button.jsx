import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Button = forwardRef(({ 
  variant = "primary", 
  size = "md", 
  icon = null,
  loading = false,
  className = "", 
  children, 
  disabled,
  ...props 
}, ref) => {
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "hover:bg-gray-100 text-gray-700 font-medium px-4 py-2 rounded-lg transition-all duration-200",
    danger: "bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-all duration-200"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        variants[variant],
        sizes[size],
        "inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {loading ? (
        <ApperIcon name="Loader2" size={16} className="animate-spin" />
      ) : icon && (
        <ApperIcon name={icon} size={16} />
      )}
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;