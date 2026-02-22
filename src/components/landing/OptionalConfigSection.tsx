import { Brain, Mail, Globe, Paintbrush } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const configs = [
  {
    icon: Brain,
    title: 'IA Generativa',
    description: 'Conecte qualquer API compatível com OpenAI para gerar planos de ação, políticas e relatórios automaticamente.',
    gradient: 'from-amber-500 to-orange-400',
    vars: [
      { name: 'AI_API_KEY', example: 'sk-...' },
      { name: 'AI_BASE_URL', example: 'https://api.openai.com/v1' },
    ],
  },
  {
    icon: Mail,
    title: 'Envio de E-mails',
    description: 'Configure o Resend para enviar notificações de prazo, convites de equipe e lembretes automaticamente.',
    gradient: 'from-violet-500 to-purple-400',
    vars: [
      { name: 'RESEND_API_KEY', example: 're_...' },
      { name: 'EMAIL_FROM', example: 'App <noreply@seudominio.com>' },
    ],
  },
  {
    icon: Globe,
    title: 'CORS Personalizado',
    description: 'Defina as origens permitidas para as Edge Functions do seu deploy em produção.',
    gradient: 'from-green-500 to-emerald-400',
    vars: [
      { name: 'ALLOWED_ORIGINS', example: 'https://seudominio.com' },
    ],
  },
  {
    icon: Paintbrush,
    title: 'Branding e Personalização',
    description: 'Troque logo, cores, nome e contatos editando os arquivos de configuração.',
    gradient: 'from-pink-500 to-rose-400',
    files: [
      { name: 'src/lib/constants.ts', desc: 'Nome, emails, URLs' },
      { name: 'tailwind.config.ts', desc: 'Cores e tema' },
      { name: 'public/brand/', desc: 'Logos e ícones' },
    ],
  },
];

export function OptionalConfigSection() {
  return (
    <section id="config" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary mb-6">
            <Brain className="w-4 h-4" />
            <span className="text-sm font-medium">Configurações Opcionais</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight font-space">
            Personalize ao{' '}
            <span className="text-gradient-cosmic">seu gosto</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A plataforma funciona sem nenhuma integração externa. Ative apenas o que precisar.
          </p>
        </div>

        {/* Config Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {configs.map((config) => (
            <div
              key={config.title}
              className="group bg-card/60 dark:bg-card/40 backdrop-blur-sm border border-primary/20 dark:border-primary/30 rounded-2xl p-6 transition-all duration-500 hover:border-secondary/50 hover:shadow-[0_0_30px_hsl(var(--secondary)/0.1)]"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <config.icon className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-lg font-bold text-foreground mb-2 font-space">{config.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{config.description}</p>

              {config.vars && (
                <div className="space-y-2">
                  {config.vars.map((v) => (
                    <div key={v.name} className="flex items-center gap-2">
                      <code className="text-[11px] bg-muted/80 px-2 py-0.5 rounded font-mono text-primary">
                        {v.name}
                      </code>
                    </div>
                  ))}
                </div>
              )}

              {config.files && (
                <div className="space-y-2">
                  {config.files.map((f) => (
                    <div key={f.name} className="flex items-start gap-2">
                      <code className="text-[11px] bg-muted/80 px-2 py-0.5 rounded font-mono text-secondary whitespace-nowrap">
                        {f.name}
                      </code>
                      <span className="text-xs text-muted-foreground">{f.desc}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
