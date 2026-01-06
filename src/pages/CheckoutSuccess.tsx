import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Confetti from 'react-confetti';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Rocket, Shield, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { StarField } from '@/components/ui/star-field';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useSubscription } from '@/hooks/useSubscription';

const benefits = [
  'Acesso completo a todos os frameworks',
  'Usuários ilimitados para sua equipe',
  'Planos de ação gerados com IA',
  'Relatórios personalizados',
  'Suporte prioritário',
];

export default function CheckoutSuccess() {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(true);
  const [isVerifying, setIsVerifying] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const { organization } = useOrganization();
  const { checkSubscription, hasAccess, subscriptionStatus } = useSubscription();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Refresh subscription status after successful checkout with retry logic
  const verifySubscription = useCallback(async () => {
    // Wait for webhook to process
    await new Promise(resolve => setTimeout(resolve, 2000));
    await checkSubscription();
    
    // Check if subscription is now active
    if (subscriptionStatus === 'active') {
      setIsVerifying(false);
    } else if (retryCount < 5) {
      // Retry up to 5 times (10 seconds total)
      setRetryCount(prev => prev + 1);
    } else {
      // Stop verifying after max retries
      setIsVerifying(false);
    }
  }, [checkSubscription, subscriptionStatus, retryCount]);

  useEffect(() => {
    verifySubscription();
  }, [retryCount]); // Re-run when retryCount changes

  // Initial verification
  useEffect(() => {
    verifySubscription();
  }, []);

  // Stop confetti after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      <StarField starCount={50} dustCount={20} />
      
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.1}
          colors={['#8b5cf6', '#06b6d4', '#22c55e', '#eab308', '#f43f5e']}
        />
      )}

      {/* Nebula effects */}
      <div 
        className="absolute top-1/4 right-0 w-[600px] h-[600px] opacity-20 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.4), transparent 60%)',
        }}
      />
      <div 
        className="absolute bottom-0 left-1/4 w-[500px] h-[500px] opacity-15 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--secondary) / 0.3), transparent 60%)',
        }}
      />

      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-success to-success/70 mb-6 shadow-glow-md animate-scale-in">
            {isVerifying ? (
              <Loader2 className="w-10 h-10 text-success-foreground animate-spin" />
            ) : (
              <Check className="w-10 h-10 text-success-foreground" />
            )}
          </div>
          
          <Badge className="mb-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
            <Sparkles className="w-3 h-3 mr-1" />
            {isVerifying ? 'Processando...' : 'Assinatura Ativada'}
          </Badge>
          
          <h1 className="text-4xl font-bold text-foreground mb-3 font-space">
            Bem-vindo ao <span className="text-gradient-cosmic">Cora GovSec</span>!
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            {organization?.name 
              ? `A organização "${organization.name}" agora tem acesso completo à plataforma.`
              : 'Sua assinatura foi ativada com sucesso. Aproveite todos os recursos!'}
          </p>
        </div>

        <Card className="border-primary/20 shadow-lg dark:shadow-glow-md mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Rocket className="w-5 h-5 text-primary" />
              O que você pode fazer agora
            </CardTitle>
            <CardDescription>
              Todos estes recursos estão disponíveis para você
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {benefits.map((benefit, index) => (
                <li 
                  key={index} 
                  className="flex items-center gap-3 animate-fade-in"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-success to-success/70 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-success-foreground" />
                  </div>
                  <span className="text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <Button 
            size="lg" 
            variant="cosmic" 
            asChild 
            className="gap-2 group"
          >
            <Link to="/dashboard">
              <Shield className="w-5 h-5" />
              Ir para o Dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            asChild
            className="border-primary/30 hover:border-secondary/50"
          >
            <Link to="/diagnostico">
              Iniciar Diagnóstico
            </Link>
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8 animate-fade-in" style={{ animationDelay: '1s' }}>
          Precisa de ajuda?{' '}
          <Link to="/configuracoes" className="text-primary hover:underline">
            Acesse as configurações
          </Link>
          {' '}ou entre em contato com nosso suporte.
        </p>
      </div>
    </div>
  );
}
