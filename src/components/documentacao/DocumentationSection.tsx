import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Info, Lightbulb, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface DocumentationSectionProps {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function DocumentationSection({ id, title, description, children, className }: DocumentationSectionProps) {
  return (
    <section id={id} className={cn("scroll-mt-24", className)}>
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-xl font-space">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          {children}
        </CardContent>
      </Card>
    </section>
  );
}

interface DocTipProps {
  children: ReactNode;
  variant?: 'info' | 'tip' | 'warning' | 'success';
  title?: string;
}

export function DocTip({ children, variant = 'info', title }: DocTipProps) {
  const variants = {
    info: {
      icon: Info,
      className: "border-blue-500/30 bg-blue-500/10",
      iconClass: "text-blue-500",
    },
    tip: {
      icon: Lightbulb,
      className: "border-amber-500/30 bg-amber-500/10",
      iconClass: "text-amber-500",
    },
    warning: {
      icon: AlertTriangle,
      className: "border-orange-500/30 bg-orange-500/10",
      iconClass: "text-orange-500",
    },
    success: {
      icon: CheckCircle2,
      className: "border-green-500/30 bg-green-500/10",
      iconClass: "text-green-500",
    },
  };

  const config = variants[variant];
  const Icon = config.icon;

  return (
    <Alert className={cn("my-4", config.className)}>
      <Icon className={cn("h-4 w-4", config.iconClass)} />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}

interface DocFeatureProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export function DocFeature({ icon: Icon, title, description }: DocFeatureProps) {
  return (
    <div className="flex gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h4 className="font-medium text-foreground mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

interface DocStepProps {
  number: number;
  title: string;
  children: ReactNode;
}

export function DocStep({ number, title, children }: DocStepProps) {
  return (
    <div className="flex gap-4 mb-6">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-semibold flex items-center justify-center text-sm">
          {number}
        </div>
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-foreground mb-2">{title}</h4>
        <div className="text-sm text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}

interface DocBadgeListProps {
  items: { label: string; description: string; color?: 'default' | 'destructive' | 'warning' | 'success' }[];
}

export function DocBadgeList({ items }: DocBadgeListProps) {
  const colorClasses = {
    default: "bg-muted text-muted-foreground",
    destructive: "bg-destructive/20 text-destructive",
    warning: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
    success: "bg-green-500/20 text-green-600 dark:text-green-400",
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-3">
          <Badge className={cn("mt-0.5", colorClasses[item.color || 'default'])}>
            {item.label}
          </Badge>
          <span className="text-sm text-muted-foreground">{item.description}</span>
        </div>
      ))}
    </div>
  );
}

interface DocTableProps {
  headers: string[];
  rows: string[][];
}

export function DocTable({ headers, rows }: DocTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50">
            {headers.map((header, i) => (
              <th key={i} className="px-4 py-2 text-left font-medium text-foreground">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-border">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2 text-muted-foreground">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface DocKeyboardShortcutProps {
  keys: string[];
  description: string;
}

export function DocKeyboardShortcut({ keys, description }: DocKeyboardShortcutProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, i) => (
          <span key={i}>
            <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border border-border">
              {key}
            </kbd>
            {i < keys.length - 1 && <span className="mx-1 text-muted-foreground">+</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
