import { useState } from 'react';
import { Mail, Calendar, MessageSquare, Building2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function ContactSection() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    company_size: '',
    how_found: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.company) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha nome, email e empresa.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Save to database
      const { error } = await supabase
        .from('contact_requests')
        .insert({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          role: formData.role || null,
          company_size: formData.company_size || null,
          how_found: formData.how_found || null,
          message: formData.message || null,
        });

      if (error) throw error;

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke('send-contact-notification', {
        body: {
          name: formData.name,
          email: formData.email,
          company: formData.company,
          role: formData.role || undefined,
          company_size: formData.company_size || undefined,
          how_found: formData.how_found || undefined,
          message: formData.message || undefined,
        },
      });

      if (emailError) {
        console.error('Error sending notification email:', emailError);
        // Don't fail the submission if email fails - data is already saved
      }

      toast({
        title: 'Mensagem enviada!',
        description: 'Nossa equipe entrará em contato em breve.',
      });

      setFormData({
        name: '',
        email: '',
        company: '',
        role: '',
        company_size: '',
        how_found: '',
        message: '',
      });
    } catch (error) {
      console.error('Error submitting contact:', error);
      toast({
        title: 'Erro ao enviar',
        description: 'Tente novamente ou entre em contato diretamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-muted/30 dark:bg-muted/10 relative overflow-hidden">
      {/* Nebula effects */}
      <div 
        className="absolute top-0 left-1/4 w-[600px] h-[600px] opacity-10 dark:opacity-20 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.3), transparent 60%)',
        }}
      />
      <div 
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] opacity-10 dark:opacity-15 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--secondary) / 0.2), transparent 60%)',
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-primary/30 dark:border-primary/50 text-primary">
            <MessageSquare className="w-3 h-3 mr-1" />
            Fale Conosco
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-space">
            Pronto para <span className="text-gradient-cosmic">transformar sua governança?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Agende uma demonstração personalizada e descubra como a CosmoSec 
            pode acelerar sua jornada de conformidade.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {/* Contact Info Cards */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card/80 dark:bg-card/60 backdrop-blur-sm border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Agende uma Demo</h3>
                    <p className="text-sm text-muted-foreground">
                      Reunião de 30 minutos para conhecer a plataforma e tirar suas dúvidas.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 dark:bg-card/60 backdrop-blur-sm border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Email</h3>
                    <a 
                      href="mailto:contato@cosmosec.com.br" 
                      className="text-sm text-primary hover:text-secondary transition-colors"
                    >
                      contato@cosmosec.com.br
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 dark:bg-card/60 backdrop-blur-sm border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-success to-success/70 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Send className="w-6 h-6 text-success-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Resposta Rápida</h3>
                    <p className="text-sm text-muted-foreground">
                      Preencha o formulário e retornamos em até 24h úteis
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground text-center">
                💡 Resposta em até <span className="text-foreground font-medium">24 horas úteis</span>
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <Card className="lg:col-span-3 bg-card/80 dark:bg-card/60 backdrop-blur-sm border-primary/20 relative z-20">
            <CardContent className="p-6 md:p-8 relative z-20">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo *</Label>
                    <Input
                      id="name"
                      placeholder="Seu nome"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email corporativo *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@empresa.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="company"
                        placeholder="Nome da empresa"
                        className="pl-10"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Cargo</Label>
                    <Input
                      id="role"
                      placeholder="Ex: CISO, Gerente de TI"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_size">Tamanho da empresa</Label>
                    <Select 
                      value={formData.company_size} 
                      onValueChange={(value) => setFormData({ ...formData, company_size: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-50">1-50 funcionários</SelectItem>
                        <SelectItem value="51-200">51-200 funcionários</SelectItem>
                        <SelectItem value="201-500">201-500 funcionários</SelectItem>
                        <SelectItem value="501-1000">501-1000 funcionários</SelectItem>
                        <SelectItem value="1000+">Mais de 1000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="how_found">Como nos conheceu?</Label>
                    <Select 
                      value={formData.how_found} 
                      onValueChange={(value) => setFormData({ ...formData, how_found: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="google">Google</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="indicacao">Indicação</SelectItem>
                        <SelectItem value="evento">Evento/Webinar</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    placeholder="Conte-nos sobre sua necessidade de conformidade, frameworks de interesse, ou qualquer dúvida..."
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <Button 
                  type="submit" 
                  variant="cosmic" 
                  size="lg" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>Enviando...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Solicitar Demonstração
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Ao enviar, você concorda com nossa{' '}
                  <a href="/privacidade" className="text-primary hover:underline">
                    Política de Privacidade
                  </a>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
