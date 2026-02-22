import { useState } from 'react';
import { Terminal, Database, FileCode, Settings, Play, Container, Copy, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GITHUB_URL } from '@/lib/constants';

function CodeBlock({ code, language = 'bash' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-background/80 dark:bg-background/60 border border-border rounded-lg p-4 text-sm font-mono text-foreground overflow-x-auto">
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
        title="Copiar"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-secondary" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

const steps = [
  {
    icon: Terminal,
    title: '1. Clone o Repositório',
    description: 'Faça o download do código-fonte completo.',
    code: `git clone ${GITHUB_URL}.git\ncd cosmosec`,
    gradient: 'from-primary to-primary/70',
  },
  {
    icon: Database,
    title: '2. Crie um Projeto Supabase',
    description: 'Acesse supabase.com e crie um projeto gratuito. Copie a URL e a Anon Key do painel.',
    code: null,
    link: { url: 'https://supabase.com', label: 'Criar projeto no Supabase →' },
    gradient: 'from-secondary to-secondary/70',
  },
  {
    icon: FileCode,
    title: '3. Execute o Schema SQL',
    description: 'No SQL Editor do Supabase, execute o conteúdo do arquivo de schema para criar todas as tabelas.',
    code: '-- Cole o conteúdo de supabase/schema.sql\n-- no SQL Editor do seu projeto Supabase',
    gradient: 'from-primary to-primary/70',
  },
  {
    icon: Settings,
    title: '4. Configure as Variáveis de Ambiente',
    description: 'Copie o .env.example e preencha com os dados do seu projeto Supabase.',
    code: 'cp .env.example .env\n\n# Edite o .env com:\n# VITE_SUPABASE_URL=https://seu-projeto.supabase.co\n# VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...',
    gradient: 'from-secondary to-secondary/70',
  },
  {
    icon: Play,
    title: '5. Rode o Projeto',
    description: 'Instale as dependências e inicie o servidor de desenvolvimento.',
    code: 'npm install\nnpm run dev',
    gradient: 'from-primary to-primary/70',
  },
];

export function AudienceSection() {
  return (
    <section id="getting-started" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      {/* Nebula */}
      <div
        className="absolute top-1/3 left-1/4 w-[600px] h-[600px] opacity-10 dark:opacity-20 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--secondary) / 0.3), transparent 60%)',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
            <Terminal className="w-4 h-4" />
            <span className="text-sm font-medium">Guia de Instalação</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight font-space">
            Como{' '}
            <span className="text-gradient-cosmic">começar</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Em 5 passos simples você terá a plataforma rodando no seu ambiente.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-3xl mx-auto space-y-6">
          {steps.map((step) => (
            <div
              key={step.title}
              className="group relative bg-card/60 dark:bg-card/40 backdrop-blur-sm border border-primary/20 dark:border-primary/30 rounded-2xl p-6 md:p-8 transition-all duration-500 hover:border-secondary/50 hover:shadow-[0_0_40px_hsl(var(--secondary)/0.1)]"
            >
              <div className="flex items-start gap-4 md:gap-6">
                <div className={`w-12 h-12 bg-gradient-to-br ${step.gradient} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 font-space">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">{step.description}</p>
                  {step.code && <CodeBlock code={step.code} />}
                  {step.link && (
                    <a
                      href={step.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-primary hover:text-secondary font-medium transition-colors mt-2"
                    >
                      {step.link.label}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Docker Alternative */}
        <div className="max-w-3xl mx-auto mt-8">
          <div className="bg-card/60 dark:bg-card/40 backdrop-blur-sm border border-secondary/30 rounded-2xl p-6 md:p-8">
            <div className="flex items-start gap-4 md:gap-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Container className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg md:text-xl font-bold text-foreground font-space">
                    Alternativa: Docker
                  </h3>
                  <Badge variant="outline" className="border-secondary/40 text-secondary text-xs">
                    Opcional
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">
                  Se preferir, rode tudo com Docker Compose em um único comando.
                </p>
                <CodeBlock code="docker compose up --build" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
