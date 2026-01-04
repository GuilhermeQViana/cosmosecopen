import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sparkles, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuggestedTargetBadgeProps {
  currentTarget: number;
  suggestedTarget: number;
  weight: number;
  currentMaturity: number;
  onAccept?: (target: number) => void;
  compact?: boolean;
}

export function SuggestedTargetBadge({
  currentTarget,
  suggestedTarget,
  weight,
  currentMaturity,
  onAccept,
  compact = false,
}: SuggestedTargetBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);

  const shouldShow = suggestedTarget !== currentTarget;
  const isHigher = suggestedTarget > currentTarget;

  if (!shouldShow) return null;

  const handleAccept = () => {
    onAccept?.(suggestedTarget);
    setIsOpen(false);
  };

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              "text-xs cursor-pointer gap-1 hover:bg-primary/10",
              isHigher ? "border-amber-500/50 text-amber-600" : "border-green-500/50 text-green-600"
            )}
            onClick={handleAccept}
          >
            <Sparkles className="h-3 w-3" />
            Meta: {suggestedTarget}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">IA sugere meta {suggestedTarget}. Clique para aplicar.</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 gap-1 text-xs",
            isHigher ? "text-amber-600 hover:text-amber-700" : "text-green-600 hover:text-green-700"
          )}
        >
          <Sparkles className="h-3 w-3" />
          Sugestão: {suggestedTarget}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">Sugestão de Meta IA</span>
          </div>

          <div className="p-3 rounded-lg bg-muted/50 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Meta Atual:</span>
              <span className="font-medium">{currentTarget}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Meta Sugerida:</span>
              <span className="font-medium text-primary">{suggestedTarget}</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p className="flex items-start gap-1">
              <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>
                {isHigher
                  ? `Controle com peso ${weight} e maturidade ${currentMaturity} deveria ter meta mais alta para adequada proteção.`
                  : `A meta atual pode ser ambiciosa para o contexto. Sugerimos uma meta mais realista.`}
              </span>
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 gap-1"
              onClick={handleAccept}
            >
              <Check className="h-3 w-3" />
              Aceitar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Ignorar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function useSuggestedTarget(
  weight: number,
  currentMaturity: number,
  currentTarget: number
) {
  return useMemo(() => {
    // Logic for suggesting target maturity based on:
    // - Control weight (criticality)
    // - Current maturity level
    // - Industry benchmarks (simplified)

    let suggested = currentTarget;

    // High weight controls should have higher targets
    if (weight >= 3) {
      // Critical controls should aim for at least level 4
      if (currentTarget < 4) {
        suggested = 4;
      }
      // If already at 4 and maturity is catching up, suggest 5
      if (currentTarget === 4 && currentMaturity >= 3) {
        suggested = 5;
      }
    } else if (weight === 2) {
      // Medium weight controls should aim for at least level 3
      if (currentTarget < 3) {
        suggested = 3;
      }
      // If performing well, suggest level 4
      if (currentTarget === 3 && currentMaturity >= 3) {
        suggested = 4;
      }
    } else {
      // Low weight controls: level 3 is usually sufficient
      if (currentTarget > 3 && currentMaturity < 2) {
        // Target might be too ambitious
        suggested = 3;
      }
    }

    // Don't suggest lower than current maturity
    if (suggested < currentMaturity) {
      suggested = Math.min(currentMaturity + 1, 5);
    }

    return suggested;
  }, [weight, currentMaturity, currentTarget]);
}
