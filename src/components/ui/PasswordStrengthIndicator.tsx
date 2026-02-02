import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordRequirement {
  label: string;
  met: boolean;
}

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export function getPasswordStrength(password: string): {
  score: number;
  requirements: PasswordRequirement[];
} {
  const requirements: PasswordRequirement[] = [
    {
      label: "Mínimo 8 caracteres",
      met: password.length >= 8,
    },
    {
      label: "Letra maiúscula",
      met: /[A-Z]/.test(password),
    },
    {
      label: "Letra minúscula",
      met: /[a-z]/.test(password),
    },
    {
      label: "Número",
      met: /[0-9]/.test(password),
    },
    {
      label: "Caractere especial",
      met: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/.test(password),
    },
  ];

  const score = requirements.filter((r) => r.met).length;

  return { score, requirements };
}

export function PasswordStrengthIndicator({
  password,
  className,
}: PasswordStrengthIndicatorProps) {
  const { score, requirements } = getPasswordStrength(password);

  const getStrengthLabel = () => {
    if (score === 0) return { label: "Muito fraca", color: "text-muted-foreground" };
    if (score <= 2) return { label: "Fraca", color: "text-red-500" };
    if (score <= 3) return { label: "Média", color: "text-yellow-500" };
    if (score <= 4) return { label: "Forte", color: "text-green-500" };
    return { label: "Muito forte", color: "text-emerald-500" };
  };

  const getBarColor = (index: number) => {
    if (index >= score) return "bg-white/10";
    if (score <= 2) return "bg-red-500";
    if (score <= 3) return "bg-yellow-500";
    if (score <= 4) return "bg-green-500";
    return "bg-emerald-500";
  };

  const strength = getStrengthLabel();

  if (!password) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Strength bars */}
      <div className="space-y-1.5">
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-300",
                getBarColor(index)
              )}
            />
          ))}
        </div>
        <p className={cn("text-xs font-medium", strength.color)}>
          Força da senha: {strength.label}
        </p>
      </div>

      {/* Requirements checklist */}
      <div className="space-y-1.5">
        {requirements.map((req, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-2 text-xs transition-colors",
              req.met ? "text-green-500" : "text-blue-300/50"
            )}
          >
            {req.met ? (
              <Check className="h-3 w-3" />
            ) : (
              <X className="h-3 w-3" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
