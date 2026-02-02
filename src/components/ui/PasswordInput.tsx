import * as React from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PasswordInputProps extends Omit<React.ComponentProps<"input">, "type"> {
  showIcon?: boolean;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showIcon = true, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="relative group">
        {showIcon && (
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50 group-focus-within:text-blue-400 transition-colors z-10" />
        )}
        <Input
          type={showPassword ? "text" : "password"}
          className={cn(
            showIcon && "pl-11 pr-12",
            !showIcon && "pr-12",
            className
          )}
          ref={ref}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-blue-400/50 hover:text-blue-400 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          <span className="sr-only">
            {showPassword ? "Ocultar senha" : "Mostrar senha"}
          </span>
        </Button>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
