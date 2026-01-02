import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, User, Loader2, CheckCircle2, ArrowLeft, Sparkles } from 'lucide-react';
import { StarField } from '@/components/ui/star-field';
import { CosmoSecLogo } from '@/components/ui/CosmoSecLogo';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!validation.success) {
      toast({
        title: 'Erro de validação',
        description: validation.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setLoading(false);

    if (error) {
      toast({
        title: 'Erro ao entrar',
        description: error.message === 'Invalid login credentials' 
          ? 'E-mail ou senha incorretos' 
          : error.message,
        variant: 'destructive',
      });
    } else {
      navigate('/dashboard');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = signupSchema.safeParse({
      fullName: signupName,
      email: signupEmail,
      password: signupPassword,
      confirmPassword: signupConfirmPassword,
    });

    if (!validation.success) {
      toast({
        title: 'Erro de validação',
        description: validation.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName);
    setLoading(false);

    if (error) {
      if (error.message.includes('already registered')) {
        toast({
          title: 'Usuário já existe',
          description: 'Este e-mail já está cadastrado. Tente fazer login.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erro ao cadastrar',
          description: error.message,
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Conta criada!',
        description: 'Você foi cadastrado com sucesso.',
      });
      navigate('/onboarding');
    }
  };

  const features = [
    'Conformidade com NIST CSF, ISO 27001 e BCB/CMN',
    'Gestão de riscos com matriz 5x5',
    'Cofre de evidências seguro',
    'Planos de ação com IA',
    'Relatórios executivos',
  ];

  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative">
      <StarField starCount={80} dustCount={25} shootingStarCount={2} />
      
      {/* Left Side - Cosmic Visual Hero */}
      <div className="hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Cosmic Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(225,85%,25%)] via-[hsl(225,90%,35%)] to-[hsl(200,85%,30%)]" />
        
        {/* Animated nebula overlay */}
        <div className="absolute inset-0 opacity-30">
          <div 
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl animate-pulse"
            style={{ 
              background: 'radial-gradient(circle, hsl(190 100% 50% / 0.4), transparent 70%)',
              animationDuration: '4s'
            }}
          />
          <div 
            className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl animate-pulse"
            style={{ 
              background: 'radial-gradient(circle, hsl(225 100% 60% / 0.4), transparent 70%)',
              animationDuration: '5s',
              animationDelay: '1s'
            }}
          />
        </div>
        
        {/* Constellation Pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-block group">
            <div className="flex items-center gap-3 p-3 -m-3 rounded-xl transition-all duration-300 hover:bg-white/10">
              <CosmoSecLogo size="lg" showText={true} />
            </div>
          </Link>
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-10">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm mb-6">
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span className="text-cyan-100">Plataforma GRC completa</span>
            </div>
            <h1 className="text-5xl font-bold mb-6 font-space leading-tight">
              Simplifique a<br />
              <span className="bg-gradient-to-r from-cyan-300 to-blue-200 bg-clip-text text-transparent">
                Governança de Segurança
              </span>
            </h1>
            <p className="text-xl text-white/70 max-w-lg leading-relaxed">
              A plataforma completa de GRC para organizações que levam 
              cibersegurança a sério.
            </p>
          </div>

          <ul className="space-y-4">
            {features.map((feature, index) => (
              <li 
                key={index} 
                className="flex items-center gap-4 opacity-0 animate-stagger-fade-up" 
                style={{ animationDelay: `${300 + index * 100}ms`, animationFillMode: 'forwards' }}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 border border-white/20 shadow-lg shadow-cyan-500/20">
                  <CheckCircle2 className="w-4 h-4 text-cyan-300" />
                </div>
                <span className="text-white/90 text-lg">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer Quote with glass effect */}
        <div className="relative z-10">
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
            <blockquote className="border-l-2 border-cyan-400/50 pl-4">
              <p className="text-white/80 italic text-lg">
                "A segurança não é um produto, mas um processo."
              </p>
              <cite className="text-sm text-white/50 mt-3 block font-medium">— Bruce Schneier</cite>
            </blockquote>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex flex-col min-h-screen bg-background relative">
        {/* Subtle gradient overlay for light mode */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
        
        {/* Mobile Header */}
        <div className="lg:hidden p-4 border-b border-border relative z-10">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Voltar</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="flex flex-col items-center mb-8 lg:hidden opacity-0 animate-stagger-fade-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
              <CosmoSecLogo size="xl" />
              <p className="text-muted-foreground text-sm mt-2">Plataforma de Governança, Riscos e Conformidade</p>
            </div>

            <Card className="border-0 shadow-2xl lg:shadow-xl bg-card/80 backdrop-blur-sm lg:border lg:border-border/50 opacity-0 animate-stagger-scale-in" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
              <CardHeader className="pb-4 text-center">
                <CardTitle className="text-2xl font-space">Bem-vindo</CardTitle>
                <CardDescription>
                  Entre ou crie sua conta para continuar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Entrar</TabsTrigger>
                    <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Cadastrar</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">E-mail</Label>
                        <div className="relative group">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="seu@email.com"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary focus:bg-background transition-all"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Senha</Label>
                        <div className="relative group">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input
                            id="login-password"
                            type="password"
                            placeholder="••••••••"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary focus:bg-background transition-all"
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full h-12 text-base font-medium" size="lg" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Entrando...
                          </>
                        ) : (
                          'Entrar'
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name">Nome completo</Label>
                        <div className="relative group">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder="Seu nome"
                            value={signupName}
                            onChange={(e) => setSignupName(e.target.value)}
                            className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary focus:bg-background transition-all"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">E-mail</Label>
                        <div className="relative group">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="seu@email.com"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary focus:bg-background transition-all"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Senha</Label>
                        <div className="relative group">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="••••••••"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary focus:bg-background transition-all"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-confirm">Confirmar senha</Label>
                        <div className="relative group">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input
                            id="signup-confirm"
                            type="password"
                            placeholder="••••••••"
                            value={signupConfirmPassword}
                            onChange={(e) => setSignupConfirmPassword(e.target.value)}
                            className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary focus:bg-background transition-all"
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full h-12 text-base font-medium" size="lg" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Criando conta...
                          </>
                        ) : (
                          'Criar conta'
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <p className="text-center text-sm text-muted-foreground mt-6 opacity-0 animate-stagger-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
              Ao continuar, você concorda com os{' '}
              <a href="#" className="text-primary hover:underline font-medium">Termos de Uso</a>
              {' '}e{' '}
              <a href="#" className="text-primary hover:underline font-medium">Política de Privacidade</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
