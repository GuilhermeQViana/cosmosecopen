import { Shield, Building2, Brain, FileText, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface TourNavigationProps {
  sections: Section[];
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

const sectionIcons: Record<string, React.ElementType> = {
  grc: Shield,
  vrm: Building2,
  policies: FileText,
  advanced: Brain,
  contact: MessageSquare,
};

export function TourNavigation({ sections, activeSection, onNavigate }: TourNavigationProps) {
  return (
    <nav className="hidden lg:flex fixed left-8 top-1/2 -translate-y-1/2 z-40">
      <div className="bg-card/80 backdrop-blur-md border border-primary/20 rounded-xl p-4 shadow-lg">
        <div className="flex flex-col gap-2">
          {sections.map((section) => {
            const Icon = section.icon || sectionIcons[section.id] || Shield;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => onNavigate(section.id)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <Icon className={cn(
                  'w-4 h-4 transition-colors',
                  isActive && 'text-primary'
                )} />
                <span className="whitespace-nowrap">{section.label}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary ml-auto" />
                )}
              </button>
            );
          })}
          
          <div className="border-t border-border my-2" />
          
          <Button 
            size="sm" 
            className="w-full"
            onClick={() => onNavigate('contact')}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Falar Conosco
          </Button>
        </div>
      </div>
    </nav>
  );
}
