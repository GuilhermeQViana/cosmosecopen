import { Github, GitPullRequest, Bug, BookOpen, Heart, MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GITHUB_URL, WHATSAPP_URL } from '@/lib/constants';

const contributions = [
  {
    icon: Bug,
    title: 'Reportar Issues',
    description: 'Encontrou um bug ou tem uma sugestão? Abra uma issue no GitHub.',
    link: `${GITHUB_URL}/issues`,
    linkLabel: 'Ver Issues',
  },
  {
    icon: GitPullRequest,
    title: 'Pull Requests',
    description: 'Contribua com código seguindo as convenções do projeto (Conventional Commits).',
    link: `${GITHUB_URL}/pulls`,
    linkLabel: 'Ver PRs',
  },
  {
    icon: BookOpen,
    title: 'Documentação',
    description: 'Leia o CONTRIBUTING.md para entender como contribuir de forma eficaz.',
    link: `${GITHUB_URL}/blob/main/CONTRIBUTING.md`,
    linkLabel: 'Ler Guia',
  },
];

export function CTASection() {
  return (
    <section id="contribute" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/50 to-background" />
      
      {/* Nebula Effects */}
      <div 
        className="absolute top-0 left-1/4 w-[600px] h-[600px] opacity-10 dark:opacity-20 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.3), transparent 60%)',
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary mb-6">
            <Heart className="w-4 h-4" />
            <span className="text-sm font-medium">Comunidade</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 font-space tracking-tight">
            Contribua com o{' '}
            <span className="text-gradient-cosmic">projeto</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            CosmoSec é um projeto open source mantido pela comunidade. Toda contribuição é bem-vinda!
          </p>
        </div>

        {/* Contribution Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          {contributions.map((item) => (
            <a
              key={item.title}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-card/60 dark:bg-card/40 backdrop-blur-sm border border-primary/20 dark:border-primary/30 rounded-2xl p-6 transition-all duration-500 hover:border-secondary/50 hover:shadow-[0_0_30px_hsl(var(--secondary)/0.1)] block"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2 font-space">{item.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
              <span className="text-sm text-primary font-medium group-hover:text-secondary transition-colors flex items-center gap-1">
                {item.linkLabel}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </a>
          ))}
        </div>

        {/* Main CTA */}
        <div className="text-center space-y-6">
          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 px-3 py-1.5">
              ⭐ Star no GitHub
            </Badge>
            <Badge variant="outline" className="border-secondary/30 text-secondary bg-secondary/10 px-3 py-1.5">
              🍴 Fork & Contribua
            </Badge>
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 px-3 py-1.5">
              📄 MIT License
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="cosmic" asChild className="group">
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                <Github className="w-5 h-5 mr-2" />
                Ver no GitHub
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-primary/30 hover:border-secondary/50 hover:bg-secondary/10">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-5 h-5 mr-2" />
                Falar com a Comunidade
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
