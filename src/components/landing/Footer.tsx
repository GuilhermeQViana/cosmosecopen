import { Link } from 'react-router-dom';
import { Linkedin, MessageCircle, Github } from 'lucide-react';
import { CosmoSecLogo } from '@/components/ui/CosmoSecLogo';
import { GITHUB_URL, WHATSAPP_URL } from '@/lib/constants';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    produto: [
      { label: 'Plataforma', href: '#platform' },
      { label: 'Como Começar', href: '#getting-started' },
      { label: 'Stack Tecnológica', href: '#tech-stack' },
      { label: 'FAQ', href: '#faq' },
    ],
    comunidade: [
      { label: 'GitHub', href: GITHUB_URL, external: true },
      { label: 'Contribuir', href: `${GITHUB_URL}/blob/main/CONTRIBUTING.md`, external: true },
      { label: 'Issues', href: `${GITHUB_URL}/issues`, external: true },
      { label: 'Releases', href: `${GITHUB_URL}/releases`, external: true },
    ],
    legal: [
      { label: 'Licença MIT', href: `${GITHUB_URL}/blob/main/LICENSE`, external: true },
      { label: 'Termos de Uso', href: '/termos', isRoute: true },
      { label: 'Privacidade', href: '/privacidade', isRoute: true },
    ],
  };

  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-12 lg:py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <CosmoSecLogo size="md" />
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              Plataforma open source de GRC para governança de segurança da informação e gestão de riscos de terceiros.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a 
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://www.linkedin.com/company/cosmosecgrc/" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Produto */}
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

          {/* Comunidade */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Comunidade</h4>
            <ul className="space-y-3">
              {footerLinks.comunidade.map((link) => (
                <li key={link.label}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  {'isRoute' in link && link.isRoute ? (
                    <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} CosmoSec. Licença MIT — Open Source.
          </p>
          <p className="text-sm text-muted-foreground">
            Feito com ❤️ para a comunidade de segurança
          </p>
        </div>
      </div>
    </footer>
  );
}
