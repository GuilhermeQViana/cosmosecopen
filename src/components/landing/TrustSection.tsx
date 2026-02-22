import { useEffect, useState, useRef } from 'react';
import { CheckCircle2, Quote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const frameworks = [
  { label: 'NIST CSF 2.0', description: 'Framework de Cibersegurança' },
  { label: 'ISO 27001:2022', description: 'Gestão de Segurança' },
  { label: 'BCB/CMN 4.893', description: 'Regulação Financeira' },
  { label: 'Gestão de Políticas', description: 'Ciclo de vida completo' },
  { label: 'VRM Integrado', description: 'Gestão de Terceiros', isHighlight: true },
  { label: 'Frameworks Custom', description: 'Criação e importação CSV', isHighlight: true },
];

const metrics = [
  { value: 70, suffix: '%', label: 'Redução de tempo em auditorias' },
  { value: 50, suffix: 'h', label: 'Economia mensal por equipe' },
  { value: 45, suffix: '+', label: 'Requisitos VRM padrão' },
  { value: 6, suffix: '', label: 'Tipos de relatórios automatizados' },
];

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const duration = 2000;
          const increment = value / (duration / 16);
          
          const animate = () => {
            start += increment;
            if (start < value) {
              setDisplayValue(Math.floor(start));
              requestAnimationFrame(animate);
            } else {
              setDisplayValue(value);
            }
          };
          
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-bold text-gradient-cosmic font-space">
      {displayValue}{suffix}
    </div>
  );
}

export function TrustSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-muted/30" />
      
      {/* Nebula Effects */}
      <div 
        className="absolute top-1/2 left-0 w-[500px] h-[500px] opacity-10 dark:opacity-15 blur-3xl pointer-events-none -translate-y-1/2"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.3), transparent 60%)',
        }}
      />
      <div 
        className="absolute top-1/2 right-0 w-[500px] h-[500px] opacity-10 dark:opacity-15 blur-3xl pointer-events-none -translate-y-1/2"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--secondary) / 0.3), transparent 60%)',
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Framework Badges */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-20">
          {frameworks.map((framework) => (
            <Badge 
              key={framework.label}
              variant="outline"
              className={`px-4 py-2.5 text-sm font-medium transition-all duration-300 hover:scale-105 cursor-default ${
                framework.isHighlight 
                  ? 'bg-secondary/10 text-secondary border-secondary/30 hover:bg-secondary/20 hover:border-secondary/50' 
                  : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:border-primary/40'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {framework.label}
            </Badge>
          ))}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-5xl mx-auto mb-20">
          {metrics.map((metric) => (
            <div key={metric.label} className="text-center group">
              <AnimatedNumber value={metric.value} suffix={metric.suffix} />
              <p className="text-sm text-muted-foreground mt-2 group-hover:text-foreground transition-colors">
                {metric.label}
              </p>
            </div>
          ))}
        </div>

        {/* Quote Card */}
        <div className="max-w-3xl mx-auto">
          <div className="relative bg-card/60 dark:bg-card/40 backdrop-blur-sm border border-primary/20 dark:border-primary/30 rounded-2xl p-8 md:p-10">
            {/* Quote Icon */}
            <Quote className="w-10 h-10 text-secondary/30 absolute top-6 left-6" />
            
            <blockquote className="text-lg md:text-xl text-foreground text-center leading-relaxed font-medium pt-4">
              "Governança de segurança acessível para todas as organizações — sem custos, sem barreiras."
            </blockquote>
            
            <p className="text-center text-muted-foreground mt-4 text-sm">
              Plataforma open source de GRC, VRM e Gestão de Políticas
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
