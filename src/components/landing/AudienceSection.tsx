import { useState } from 'react';
import { Terminal, Database, FileCode, Settings, Play, Container, Copy, Check, UserCog, Rocket, Server, Cloud, Download } from 'lucide-react';
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
      <pre className="bg-background/80 dark:bg-background/60 border border-border rounded-lg p-4 text-xs sm:text-sm font-mono text-foreground overflow-x-auto whitespace-pre-wrap break-all sm:whitespace-pre sm:break-normal">
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
    description: 'Acesse supabase.com e crie um projeto gratuito. Copie a URL, a Anon Key e o Project ID (Settings → API).',
    code: null,
    link: { url: 'https://supabase.com', label: 'Criar projeto no Supabase →' },
    gradient: 'from-secondary to-secondary/70',
  },
  {
    icon: FileCode,
    title: '3. Execute o Schema SQL',
    description: 'No SQL Editor do Supabase, execute o conteúdo do arquivo de schema para criar todas as tabelas, funções e políticas RLS.',
    code: '-- Cole o conteúdo de supabase/schema.sql\n-- no SQL Editor do seu projeto Supabase',
    gradient: 'from-primary to-primary/70',
  },
  {
    icon: Settings,
    title: '4. Configure as Variáveis de Ambiente',
    description: 'Copie o .env.example e preencha com os dados do seu projeto Supabase.',
    code: 'cp .env.example .env\n\n# Edite o .env com:\n# VITE_SUPABASE_URL=https://seu-projeto.supabase.co\n# VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...\n# VITE_SUPABASE_PROJECT_ID=seu-project-id',
    gradient: 'from-secondary to-secondary/70',
  },
  {
    icon: Play,
    title: '5. Rode o Projeto',
    description: 'Instale as dependências e inicie o servidor de desenvolvimento.',
    code: 'npm install\nnpm run dev\n\n# Acesse http://localhost:5173',
    gradient: 'from-primary to-primary/70',
  },
  {
    icon: UserCog,
    title: '6. Crie seu Super Admin',
    description: 'Após cadastrar-se na aplicação, execute o SQL abaixo no SQL Editor do Supabase para obter permissões administrativas completas.',
    code: "INSERT INTO public.super_admins (user_id)\nSELECT id FROM auth.users\nWHERE email = 'seu-email@exemplo.com';",
    gradient: 'from-secondary to-secondary/70',
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
            Em 6 passos simples você terá a plataforma rodando no seu ambiente.
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

        {/* Docker Section */}
        <div className="max-w-3xl mx-auto mt-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 mb-4">
              <Container className="w-4 h-4" />
              <span className="text-sm font-medium">Deploy com Docker</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground font-space">
              Alternativa: <span className="text-gradient-cosmic">Docker</span>
            </h3>
          </div>

          {/* Option 1: Full Self-Hosted */}
          <div className="bg-card/60 dark:bg-card/40 backdrop-blur-sm border border-secondary/30 rounded-2xl p-6 md:p-8 mb-6">
            <div className="flex items-start gap-4 md:gap-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Server className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h4 className="text-lg md:text-xl font-bold text-foreground font-space">
                    Opção 1: Self-Hosted Completo
                  </h4>
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-500 text-xs">
                    Recomendado
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">
                  Sobe <strong>toda a infraestrutura</strong> com um único comando: banco de dados, autenticação, API REST, painel de administração e frontend. Não precisa de conta externa.
                </p>
                <CodeBlock code={`# 1. Clone o repositório\ngit clone ${GITHUB_URL}.git && cd cosmosec\n\n# 2. Configure as variáveis\ncp .env.docker .env.local\n\n# 3. Suba tudo\ndocker compose up --build\n\n# Acesse:\n#   Frontend → http://localhost\n#   Studio   → http://localhost:3001\n#   API      → http://localhost:8000`} />
                <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Após subir:</strong> Acesse o Studio em{' '}
                    <code className="text-secondary">localhost:3001</code> para gerenciar o banco, ou cadastre-se diretamente na aplicação e execute o SQL de Super Admin.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Option 2: Imagem Docker Pronta */}
          <div className="bg-card/60 dark:bg-card/40 backdrop-blur-sm border border-primary/20 rounded-2xl p-6 md:p-8 mb-6">
            <div className="flex items-start gap-4 md:gap-6">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Container className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h4 className="text-lg md:text-xl font-bold text-foreground font-space">
                    Opção 2: Imagem Docker Pronta
                  </h4>
                  <Badge variant="outline" className="border-violet-500/40 text-violet-500 text-xs">
                    Mais Fácil
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">
                  Baixe a imagem pré-construída do Docker Hub. <strong>Não precisa clonar o repositório nem buildar</strong> — só configure as variáveis e rode.
                </p>
                <a
                  href="https://hub.docker.com/r/guilherme0045/cosmosecopen"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 mb-4 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  <Download className="w-4 h-4" />
                  Baixar no Docker Hub
                </a>
                <CodeBlock code={`# 1. Baixe a imagem\ndocker pull guilherme0045/cosmosecopen:latest\n\n# 2. Rode com suas credenciais Supabase\ndocker run -d -p 80:80 \\\n  -e VITE_SUPABASE_URL=https://seu-projeto.supabase.co \\\n  -e VITE_SUPABASE_PUBLISHABLE_KEY=eyJ... \\\n  -e VITE_SUPABASE_PROJECT_ID=seu-project-id \\\n  guilherme0045/cosmosecopen:latest\n\n# Frontend disponível em http://localhost`} />
                <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Dica:</strong> Também disponibilizamos um{' '}
                    <code className="text-secondary">docker-compose.prebuilt.yml</code> no repositório para facilitar ainda mais.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Option 3: Frontend + Supabase Cloud */}
          <div className="bg-card/60 dark:bg-card/40 backdrop-blur-sm border border-primary/20 rounded-2xl p-6 md:p-8">
            <div className="flex items-start gap-4 md:gap-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h4 className="text-lg md:text-xl font-bold text-foreground font-space">
                    Opção 3: Frontend + Supabase Cloud
                  </h4>
                  <Badge variant="outline" className="border-cyan-500/40 text-cyan-500 text-xs">
                    Produção
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">
                  Sobe apenas o frontend via Docker. Requer um projeto Supabase Cloud configurado (passos 2–4 acima).
                </p>
                <CodeBlock code={`# Configure o .env com suas credenciais Supabase Cloud\ncp .env.example .env\n\n# Suba apenas o frontend\ndocker compose -f docker-compose.prod.yml up --build\n\n# Frontend disponível em http://localhost:3000`} />
              </div>
            </div>
          </div>
        </div>

        {/* Edge Functions Deploy */}
        <div className="max-w-3xl mx-auto mt-8">
          <div className="bg-card/60 dark:bg-card/40 backdrop-blur-sm border border-primary/30 rounded-2xl p-6 md:p-8">
            <div className="flex items-start gap-4 md:gap-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="text-lg md:text-xl font-bold text-foreground font-space">
                    Deploy das Edge Functions
                  </h3>
                  <Badge variant="outline" className="border-amber-500/40 text-amber-500 text-xs">
                    Opcional
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">
                  Para funcionalidades como IA generativa, envio de e-mails e exportação de relatórios, faça o deploy das Edge Functions com o Supabase CLI. Funcionalidades básicas (CRUD, auth, dashboard) funcionam sem elas.
                </p>
                <CodeBlock code={`# Instale o Supabase CLI\nnpm install -g supabase\n\n# Linke ao seu projeto\nsupabase link --project-ref SEU_PROJECT_ID\n\n# Deploy de todas as funções\nsupabase functions deploy\n\n# Configure os secrets necessários\nsupabase secrets set AI_API_KEY=sua-chave\nsupabase secrets set RESEND_API_KEY=sua-chave`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
