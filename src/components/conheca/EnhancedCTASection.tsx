import { Calendar, Mail, Linkedin, ArrowRight, MessageSquare, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function EnhancedCTASection() {
  return (
    <section id="contact" className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-space">
            Pronto para ver tudo isso <span className="text-gradient-cosmic">funcionando</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Agende uma demonstração personalizada e veja como a CosmoSec 
            pode atender às necessidades específicas da sua organização.
          </p>
        </div>

        {/* Main CTA Card */}
        <Card className="max-w-2xl mx-auto bg-card/80 dark:bg-card/60 backdrop-blur-sm border-primary/20 overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
                <Calendar className="w-8 h-8 text-primary-foreground" />
              </div>
              
              <h3 className="text-2xl font-bold text-foreground mb-2 font-space">
                Agende uma Demo
              </h3>
              <p className="text-muted-foreground mb-6">
                Sessão personalizada de 30 minutos com nosso time de especialistas
              </p>
              
              <Button variant="cosmic" size="lg" asChild className="group">
                <Link to="/#contact">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Agendar Agora
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Alternative Contact Options */}
        <div className="mt-10 text-center">
          <p className="text-muted-foreground mb-4">Ou fale diretamente:</p>
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="lg" asChild>
              <a href="mailto:contato@cosmosec.com.br">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="https://www.linkedin.com/company/cosmosecgrc/" target="_blank" rel="noopener noreferrer">
                <Linkedin className="w-4 h-4 mr-2" />
                LinkedIn
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="https://wa.me/5521999253788" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </a>
            </Button>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-10">
          <Button variant="ghost" asChild>
            <Link to="/">
              ← Voltar para Home
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
