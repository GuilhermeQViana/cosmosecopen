import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Send, Building2, Eye, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const COMPANY_SIZES = [
  { value: '1-50', label: '1-50 funcionários' },
  { value: '51-200', label: '51-200 funcionários' },
  { value: '201-500', label: '201-500 funcionários' },
  { value: '501-1000', label: '501-1000 funcionários' },
  { value: '1000+', label: 'Mais de 1000 funcionários' },
];

const HOW_FOUND_OPTIONS = [
  { value: 'google', label: 'Google' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'indicacao', label: 'Indicação' },
  { value: 'evento', label: 'Evento/Webinar' },
  { value: 'outro', label: 'Outro' },
];

const DASHBOARD_SCREENSHOTS = [
  { src: '/screenshots/dashboard-1.png', title: 'Dashboard Executivo' },
  { src: '/screenshots/dashboard-2.png', title: 'Métricas de Remediação' },
  { src: '/screenshots/dashboard-3.png', title: 'Mapa de Calor de Riscos' },
  { src: '/screenshots/dashboard-4.png', title: 'Tendências de Conformidade' },
];

function DashboardGallery() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % DASHBOARD_SCREENSHOTS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative mb-6 rounded-xl overflow-hidden border border-primary/20 bg-muted/30">
      <div className="relative h-48">
        {DASHBOARD_SCREENSHOTS.map((shot, i) => (
          <img
            key={shot.src}
            src={shot.src}
            alt={shot.title}
            className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700 ${
              i === current ? 'opacity-80 group-hover:opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
          {DASHBOARD_SCREENSHOTS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === current ? 'bg-primary w-4' : 'bg-muted-foreground/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CTASection() {
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
        message: '' 
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
    <section id="contact" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/50 to-background" />
      
      {/* Nebula Effects */}
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
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 font-space tracking-tight">
            Pronto para <span className="text-gradient-cosmic">transformar sua governança?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Agende uma demonstração personalizada e descubra como a CosmoSec pode acelerar sua jornada de conformidade.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* Left Column - Tour Preview */}
          <Card className="bg-card/60 dark:bg-card/40 backdrop-blur-sm border-primary/20 dark:border-primary/30 overflow-hidden group">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground font-space">Conheça a Plataforma</h3>
                  <p className="text-sm text-muted-foreground">Tour interativo completo</p>
                </div>
              </div>

              {/* Screenshot Gallery */}
              <DashboardGallery />

              <p className="text-muted-foreground mb-6">
                Explore todas as funcionalidades: Dashboard Executivo, Diagnóstico de Controles, 
                Gestão de Riscos e muito mais.
              </p>

              <Button 
                variant="outline" 
                asChild 
                className="w-full border-secondary/30 hover:border-secondary/50 hover:bg-secondary/10 group"
              >
                <Link to="/tour">
                  Ver Tour Completo
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Right Column - Contact Form */}
          <Card className="bg-card/60 dark:bg-card/40 backdrop-blur-sm border-primary/20 dark:border-primary/30">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground font-space">Fale com Especialista</h3>
                  <p className="text-sm text-muted-foreground">Resposta em até 24h úteis</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                {/* Row 1: Nome + Email */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Nome completo <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Seu nome"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-muted/50 pointer-events-auto"
                      required
                      autoComplete="name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email corporativo <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@empresa.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-muted/50"
                      required
                    />
                  </div>
                </div>

                {/* Row 2: Empresa + Cargo */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">
                      Empresa <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="company"
                        placeholder="Nome da empresa"
                        className="pl-10 bg-muted/50"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Cargo</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="role"
                        placeholder="Ex: CISO, Gerente de TI"
                        className="pl-10 bg-muted/50"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Row 3: Tamanho + Como conheceu */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_size">Tamanho da empresa</Label>
                    <Select 
                      value={formData.company_size} 
                      onValueChange={(value) => setFormData({ ...formData, company_size: value })}
                    >
                      <SelectTrigger id="company_size" className="bg-muted/50">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPANY_SIZES.map((size) => (
                          <SelectItem key={size.value} value={size.value}>
                            {size.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="how_found">Como nos conheceu?</Label>
                    <Select 
                      value={formData.how_found} 
                      onValueChange={(value) => setFormData({ ...formData, how_found: value })}
                    >
                      <SelectTrigger id="how_found" className="bg-muted/50">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {HOW_FOUND_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 4: Mensagem */}
                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem (opcional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Conte-nos sobre sua necessidade de conformidade..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="bg-muted/50 min-h-[100px] resize-none"
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
                      Agendar Demonstração
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
