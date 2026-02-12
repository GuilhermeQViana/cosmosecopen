import { Shield, Building2, Brain, FileText, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ModuleCard {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  featureCount: number;
}

const modules: ModuleCard[] = [
  {
    id: 'grc',
    icon: Shield,
    title: 'GRC Frameworks',
    subtitle: 'Governança e Conformidade',
    featureCount: 6,
  },
  {
    id: 'vrm',
    icon: Building2,
    title: 'VRM Fornecedores',
    subtitle: 'Riscos de Terceiros',
    featureCount: 12,
  },
  {
    id: 'policies',
    icon: FileText,
    title: 'Gestão de Políticas',
    subtitle: 'Aprovações e Aceite',
    featureCount: 6,
  },
  {
    id: 'advanced',
    icon: Brain,
    title: 'Recursos Avançados',
    subtitle: 'IA, Relatórios e Automação',
    featureCount: 8,
  },
];

interface QuickNavigationCardsProps {
  onNavigate: (sectionId: string) => void;
}

export function QuickNavigationCards({ onNavigate }: QuickNavigationCardsProps) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
      {modules.map((module, index) => (
        <Card
          key={module.id}
          onClick={() => onNavigate(module.id)}
          className={cn(
            'cursor-pointer group transition-all duration-300',
            'hover:scale-105 hover:shadow-xl hover:shadow-primary/10',
            'border-primary/20 hover:border-primary/40',
            'bg-card/60 backdrop-blur-sm'
          )}
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300',
                'bg-gradient-to-br from-primary/20 to-secondary/20',
                'group-hover:from-primary/30 group-hover:to-secondary/30',
                'group-hover:shadow-lg group-hover:shadow-primary/20'
              )}>
                <module.icon className="w-6 h-6 text-primary" />
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            
            <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
              {module.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {module.subtitle}
            </p>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                {module.featureCount} recursos
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
