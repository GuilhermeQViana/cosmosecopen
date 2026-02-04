import { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface ExpandableFeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  highlights: string[];
  extendedDescription?: string;
  index?: number;
}

export function ExpandableFeatureCard({
  icon: Icon,
  title,
  description,
  highlights,
  extendedDescription,
  index = 0,
}: ExpandableFeatureCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card 
      className={cn(
        'bg-card/80 dark:bg-card/60 backdrop-blur-sm transition-all duration-500',
        'border-primary/10 hover:border-primary/30',
        'hover:shadow-lg hover:shadow-primary/5',
        'animate-fade-in',
        isOpen && 'ring-1 ring-primary/20'
      )}
      style={{
        animationDelay: `${index * 75}ms`,
        animationFillMode: 'backwards',
      }}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300',
                'bg-gradient-to-br from-primary/20 to-secondary/20',
                isOpen && 'from-primary/30 to-secondary/30 shadow-lg shadow-primary/20'
              )}>
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            
            <CollapsibleTrigger asChild>
              <button 
                className={cn(
                  'p-2 rounded-lg hover:bg-muted/50 transition-all duration-300',
                  'text-muted-foreground hover:text-foreground'
                )}
              >
                <ChevronDown className={cn(
                  'w-4 h-4 transition-transform duration-300',
                  isOpen && 'rotate-180'
                )} />
              </button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {description}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-2">
            {highlights.map((highlight, hIndex) => (
              <Badge 
                key={hIndex} 
                variant="secondary" 
                className="text-xs bg-primary/10 text-primary border-0"
              >
                {highlight}
              </Badge>
            ))}
          </div>

          <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
            <div className="pt-4 mt-4 border-t border-border">
              {extendedDescription && (
                <p className="text-sm text-muted-foreground mb-4">
                  {extendedDescription}
                </p>
              )}
              
              <div className="flex items-center gap-2 mt-4">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary" asChild>
                  <a href="#contact">
                    Ver na Demo
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </a>
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
}
