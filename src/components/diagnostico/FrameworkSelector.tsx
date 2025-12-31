import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Framework } from '@/hooks/useFrameworks';
import { Skeleton } from '@/components/ui/skeleton';

interface FrameworkSelectorProps {
  frameworks: Framework[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

export function FrameworkSelector({
  frameworks,
  selectedId,
  onSelect,
  isLoading = false,
}: FrameworkSelectorProps) {
  if (isLoading) {
    return <Skeleton className="h-10 w-[280px]" />;
  }

  return (
    <Select value={selectedId || ''} onValueChange={onSelect}>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Selecione um framework" />
      </SelectTrigger>
      <SelectContent className="bg-popover">
        {frameworks.map((framework) => (
          <SelectItem key={framework.id} value={framework.id}>
            <div className="flex items-center gap-2">
              <span className="font-medium">{framework.code}</span>
              <span className="text-muted-foreground">-</span>
              <span>{framework.name}</span>
              {framework.version && (
                <span className="text-xs text-muted-foreground">
                  v{framework.version}
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
