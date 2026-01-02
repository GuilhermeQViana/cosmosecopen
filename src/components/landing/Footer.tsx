import { Link } from 'react-router-dom';
import { Shield, Github, Linkedin, Twitter } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    produto: [
      { label: 'Funcionalidades', href: '#features' },
      { label: 'Frameworks', href: '#frameworks' },
      { label: 'Como Funciona', href: '#how-it-works' },
      { label: 'Benefícios', href: '#benefits' },
    ],
    empresa: [
      { label: 'Sobre Nós', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Carreiras', href: '#' },
      { label: 'Contato', href: '#' },
    ],
    legal: [
      { label: 'Termos de Uso', href: '#' },
      { label: 'Política de Privacidade', href: '#' },
      { label: 'Segurança', href: '#' },
    ],
  };

  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-12 lg:py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
            <span className="text-xl font-bold text-foreground font-space tracking-wide">
              <span className="text-gradient-cosmic">CosmoSec</span>
            </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              Plataforma completa de Governança, Riscos e Conformidade para segurança cibernética. 
              Simplifique sua jornada de conformidade.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Produto</h4>
            <ul className="space-y-3">
              {footerLinks.produto.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Empresa</h4>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} CosmoSec. Todos os direitos reservados.
          </p>
          <p className="text-sm text-muted-foreground">
            Feito com ❤️ para profissionais de segurança
          </p>
        </div>
      </div>
    </footer>
  );
}