import {
  Cpu, Database, Globe, Sparkles, Server, Code2,
  Paintbrush, Mail, Shield, Layers
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const prerequisites = [
  { label: 'Node.js 18+', icon: Server },
  { label: 'npm ou bun', icon: Code2 },
  { label: 'Conta Supabase (gratuita)', icon: Database },
];

const stacks = [
  {
    title: 'Frontend',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/20',
    bgColor: 'bg-blue-500/10',
    items: ['React 18', 'TypeScript', 'Tailwind CSS', 'Vite', 'shadcn/ui', 'Recharts'],
  },
  {
    title: 'Backend',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/20',
    bgColor: 'bg-cyan-500/10',
    items: ['PostgreSQL (Supabase)', 'Auth & RLS', 'Edge Functions (Deno)', 'Storage'],
  },
  {
    title: 'Integrações Opcionais',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/20',
    bgColor: 'bg-amber-500/10',
    items: ['IA Generativa (OpenAI-compatível)', 'Resend (e-mails)', 'Docker'],
  },
];

const edgeFunctions = [
  { name: 'generate-action-plan', desc: 'Gera planos de ação com IA' },
  { name: 'generate-policy', desc: 'Gera políticas de segurança' },
  { name: 'generate-report', desc: '6 tipos de relatórios automatizados' },
  { name: 'vendor-risk-analysis', desc: 'Análise de risco de fornecedores' },
  { name: 'assist-due-diligence', desc: 'Assistente de Due Diligence' },
  { name: 'export-policy-pdf', desc: 'Exportação de políticas em PDF' },
  { name: 'send-deadline-notifications', desc: 'Notificações de prazo por e-mail' },
  { name: 'import-data', desc: 'Importação de dados (CSV/Excel)' },
];

const envVars = [
  { name: 'AI_API_KEY', desc: 'Chave da API de IA (OpenAI, etc.)', required: false },
  { name: 'AI_BASE_URL', desc: 'URL base da API de IA', required: false },
  { name: 'RESEND_API_KEY', desc: 'Chave do Resend para e-mails', required: false },
  { name: 'ALLOWED_ORIGINS', desc: 'Origens CORS permitidas', required: false },
];

export function ROICalculatorSection() {
  return (
    <section id="tech-stack" className="py-24 relative overflow-hidden bg-muted/30">
      {/* Background */}
      <div 
        className="absolute bottom-0 right-1/4 w-[600px] h-[600px] opacity-10 dark:opacity-15 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.4), transparent 60%)',
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
            <Layers className="w-4 h-4" />
            <span className="text-sm font-medium">Stack Tecnológica</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-space">
            Requisitos e <span className="text-gradient-cosmic">tecnologias</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Construído com tecnologias modernas e amplamente adotadas. Fácil de entender, contribuir e personalizar.
          </p>
        </div>

        {/* Prerequisites */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {prerequisites.map((pre) => (
            <Badge
              key={pre.label}
              variant="outline"
              className="px-4 py-2.5 text-sm font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
            >
              <pre.icon className="w-4 h-4 mr-2" />
              {pre.label}
            </Badge>
          ))}
        </div>

        {/* Stack Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          {stacks.map((stack) => (
            <div
              key={stack.title}
              className={`bg-card/60 dark:bg-card/40 backdrop-blur-sm border ${stack.borderColor} rounded-2xl p-6 transition-all duration-300 hover:shadow-lg`}
            >
              <h3 className={`text-lg font-bold ${stack.color} mb-4 font-space`}>{stack.title}</h3>
              <ul className="space-y-2">
                {stack.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className={`w-1.5 h-1.5 rounded-full ${stack.bgColor}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Edge Functions & Env Vars */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Edge Functions */}
          <div className="bg-card/60 dark:bg-card/40 backdrop-blur-sm border border-primary/20 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-4 font-space flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" />
              Edge Functions Incluídas
            </h3>
            <div className="space-y-3">
              {edgeFunctions.map((fn) => (
                <div key={fn.name} className="flex items-start gap-3">
                  <code className="text-xs bg-muted/80 px-2 py-1 rounded font-mono text-primary whitespace-nowrap flex-shrink-0">
                    {fn.name}
                  </code>
                  <span className="text-sm text-muted-foreground">{fn.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Environment Variables */}
          <div className="bg-card/60 dark:bg-card/40 backdrop-blur-sm border border-secondary/20 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-4 font-space flex items-center gap-2">
              <Shield className="w-5 h-5 text-secondary" />
              Variáveis de Ambiente Opcionais
            </h3>
            <div className="space-y-3">
              {envVars.map((v) => (
                <div key={v.name} className="flex items-start gap-3">
                  <code className="text-xs bg-muted/80 px-2 py-1 rounded font-mono text-secondary whitespace-nowrap flex-shrink-0">
                    {v.name}
                  </code>
                  <span className="text-sm text-muted-foreground">{v.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
