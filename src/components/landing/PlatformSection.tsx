import { useState } from 'react';
import { Shield, Building2, Sparkles, CheckCircle2, ChevronDown, Eye, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ModuleScreenshotGallery, Screenshot } from './ModuleScreenshotGallery';
import { cn } from '@/lib/utils';

interface Platform {
  id: string;
  icon: typeof Shield;
  title: string;
  description: string;
  features: string[];
  gradient: string;
  screenshots: Screenshot[];
}

const platforms: Platform[] = [
  {
    id: 'grc',
    icon: Shield,
    title: 'GRC Frameworks',
    description: 'Diagnóstico completo de controles de segurança com frameworks reconhecidos.',
    features: [
      'NIST CSF 2.0, ISO 27001, BCB/CMN',
      'Risk Score automático',
      'Matriz de riscos integrada',
      'Gestão de evidências',
    ],
    gradient: 'from-primary to-primary/70',
    screenshots: [
      { 
        src: '/screenshots/grc-dashboard-1.png', 
        title: 'Dashboard Executivo', 
        description: 'Visão consolidada com score, alertas e métricas principais' 
      },
      { 
        src: '/screenshots/grc-dashboard-2.png', 
        title: 'Métricas de Remediação', 
        description: 'MTTR, tendência de conformidade e histórico de maturidade' 
      },
      { 
        src: '/screenshots/grc-dashboard-3.png', 
        title: 'Indicadores Personalizáveis', 
        description: 'Mapa de calor, distribuição de riscos e controles por maturidade' 
      },
      { 
        src: '/screenshots/grc-dashboard-4.png', 
        title: 'Atenção Prioritária', 
        description: 'Top ameaças, cobertura por framework e gaps críticos' 
      },
    ],
  },
  {
    id: 'vrm',
    icon: Building2,
    title: 'VRM Fornecedores',
    description: 'Avaliação e monitoramento contínuo de riscos de terceiros.',
    features: [
      '45+ requisitos de avaliação',
      'Radar de conformidade',
      'Workflow de aprovação',
      'Agenda de reavaliação',
    ],
    gradient: 'from-secondary to-secondary/70',
    screenshots: [], // Placeholder - aguardando screenshots do usuário
  },
  {
    id: 'ia',
    icon: Sparkles,
    title: 'IA Generativa',
    description: 'Automação inteligente para acelerar sua jornada de conformidade.',
    features: [
      'Planos de ação automáticos',
      'Guias de implementação',
      'Análise de gaps',
      'Recomendações priorizadas',
    ],
    gradient: 'from-primary via-secondary to-primary',
    screenshots: [],
  },
  {
    id: 'consultoria',
    icon: ClipboardCheck,
    title: 'Consultoria & Auditoria',
    description: 'Gerencie múltiplos clientes em um único painel com padronização e escalabilidade.',
    features: [
      'Painel multi-organizações',
      'Relatórios com branding personalizado',
      'Templates de diagnóstico reutilizáveis',
      'Trilha de auditoria por cliente',
    ],
    gradient: 'from-emerald-500 to-teal-500',
    screenshots: [],
  },
];

export function PlatformSection() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section id="platform" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 font-space tracking-tight">
            Uma Plataforma.{' '}
            <span className="text-gradient-cosmic">Segurança Completa.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Consolide sua governança de segurança, gestão de fornecedores e operações de consultoria em uma única solução.
          </p>
        </div>

        {/* Platform Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {platforms.map((platform) => {
            const isExpanded = expandedId === platform.id;
            const hasScreenshots = platform.screenshots.length > 0;
            
            return (
              <Collapsible
                key={platform.id}
                open={isExpanded}
                onOpenChange={() => toggleExpanded(platform.id)}
              >
                <div
                  className={cn(
                    "group relative bg-card/60 dark:bg-card/40 backdrop-blur-sm border rounded-2xl p-8 transition-all duration-500 overflow-hidden",
                    isExpanded 
                      ? "border-secondary/50 shadow-[0_0_40px_hsl(var(--secondary)/0.2)] ring-1 ring-secondary/20" 
                      : "border-primary/20 dark:border-primary/30 hover:border-secondary/50 hover:shadow-[0_0_40px_hsl(var(--secondary)/0.15)]"
                  )}
                >
                  {/* Glow effect on hover */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle at 50% 0%, hsl(var(--secondary) / 0.1), transparent 60%)',
                    }}
                  />
                  
                  {/* Icon */}
                  <div className={`w-14 h-14 bg-gradient-to-br ${platform.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <platform.icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-foreground mb-3 font-space">
                    {platform.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground mb-6">
                    {platform.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {platform.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Expand Button */}
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={cn(
                        "w-full justify-center gap-2 text-sm transition-colors",
                        hasScreenshots 
                          ? "text-secondary hover:text-secondary hover:bg-secondary/10" 
                          : "text-muted-foreground hover:text-muted-foreground/80 cursor-default"
                      )}
                      disabled={!hasScreenshots}
                    >
                      <Eye className="w-4 h-4" />
                      {hasScreenshots ? 'Ver em Ação' : 'Em breve'}
                      {hasScreenshots && (
                        <ChevronDown 
                          className={cn(
                            "w-4 h-4 transition-transform duration-300",
                            isExpanded && "rotate-180"
                          )} 
                        />
                      )}
                    </Button>
                  </CollapsibleTrigger>

                  {/* Expanded Gallery */}
                  <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                    <ModuleScreenshotGallery 
                      screenshots={platform.screenshots} 
                      moduleId={platform.id} 
                    />
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>
      </div>
    </section>
  );
}
