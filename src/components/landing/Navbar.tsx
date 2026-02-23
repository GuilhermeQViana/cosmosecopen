import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CosmoSecLogo } from '@/components/ui/CosmoSecLogo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { cn } from '@/lib/utils';
import { GITHUB_URL, AUTH_ROUTE } from '@/lib/constants';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? Math.min(100, (window.scrollY / docHeight) * 100) : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#platform', label: 'Plataforma' },
    { href: '#getting-started', label: 'Como Começar' },
    { href: '#tech-stack', label: 'Stack' },
    { href: '#faq', label: 'FAQ' },
  ];

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm'
          : 'bg-transparent'
      )}
    >
      {/* Scroll Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]">
        <div 
          className="h-full bg-gradient-to-r from-primary via-secondary to-primary transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <CosmoSecLogo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Theme Toggle + CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            <Button variant="outline" size="sm" asChild className="border-primary/30 hover:border-secondary/50">
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 mr-1.5" />
                GitHub
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to={AUTH_ROUTE}>Entrar</Link>
            </Button>
            <Button size="sm" variant="cosmic" asChild>
              <a href="#getting-started">Começar Agora</a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">Alternar tema</span>
                <ThemeToggle />
              </div>
              <Button variant="ghost" asChild className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                <Link to={AUTH_ROUTE}>Entrar</Link>
              </Button>
              <Button variant="outline" asChild className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-1.5" />
                  GitHub
                </a>
              </Button>
              <Button variant="cosmic" asChild className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                <a href="#getting-started">Começar Agora</a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
