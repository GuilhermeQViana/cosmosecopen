import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MFAVerification } from '@/components/auth/MFAVerification';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Mail, User, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { CosmoSecLogo } from '@/components/ui/CosmoSecLogo';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { PasswordStrengthIndicator, getPasswordStrength } from '@/components/ui/PasswordStrengthIndicator';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30; // seconds

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [showMFA, setShowMFA] = useState(false);
  const redirectTo = searchParams.get('redirect') || '/selecionar-modulo';

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Rate limiting state
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Lockout countdown
  useEffect(() => {
    if (lockoutEndTime) {
      const interval = setInterval(() => {
        const remaining = Math.ceil((lockoutEndTime - Date.now()) / 1000);
        if (remaining <= 0) {
          setLockoutEndTime(null);
          setLockoutRemaining(0);
          setLoginAttempts(0);
        } else {
          setLockoutRemaining(remaining);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutEndTime]);

  const isLockedOut = lockoutEndTime !== null && Date.now() < lockoutEndTime;

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/selecionar-modulo',
        },
      });
      
      if (error) {
        toast({
          title: 'Erro ao entrar com Google',
          description: error.message,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao entrar com Google',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLockedOut) {
      toast({
        title: 'Muitas tentativas',
        description: `Aguarde ${lockoutRemaining} segundos antes de tentar novamente.`,
        variant: 'destructive',
      });
      return;
    }
    
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
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        setLockoutEndTime(Date.now() + LOCKOUT_DURATION * 1000);
        setLockoutRemaining(LOCKOUT_DURATION);
        toast({
          title: 'Conta bloqueada temporariamente',
          description: `Muitas tentativas falhas. Aguarde ${LOCKOUT_DURATION} segundos.`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erro ao entrar',
          description: error.message === 'Invalid login credentials' 
            ? `E-mail ou senha incorretos. Tentativa ${newAttempts}/${MAX_LOGIN_ATTEMPTS}.`
            : error.message,
          variant: 'destructive',
        });
      }
    } else {
      setLoginAttempts(0);
      // Check if user has MFA enabled
      try {
        const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (data && data.currentLevel === 'aal1' && data.nextLevel === 'aal2') {
          setShowMFA(true);
          return;
        }
      } catch {
        // If MFA check fails, proceed normally
      }
      navigate(redirectTo);
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

    // Check password strength
    const { score } = getPasswordStrength(signupPassword);
    if (score < 4) {
      toast({
        title: 'Senha fraca',
        description: 'Por favor, crie uma senha mais forte seguindo os requisitos.',
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
      navigate('/selecionar-modulo');
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
      {/* Left Side - Cosmic Visual Hero */}
      <div className="hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Deep Space Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(222,47%,8%)] via-[hsl(222,50%,12%)] to-[hsl(210,60%,15%)]" />
        
        {/* Cosmic Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
        
        {/* Cross/Plus Pattern */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%233b82f6' stroke-width='0.5'%3E%3Cpath d='M25 20v10M20 25h10'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '50px 50px',
          }}
        />
        
        {/* Animated nebula blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute top-1/4 -left-20 w-[500px] h-[500px] rounded-full blur-[120px] animate-pulse"
            style={{ 
              background: 'radial-gradient(circle, hsl(217 91% 60% / 0.25), transparent 60%)',
              animationDuration: '6s'
            }}
          />
          <div 
            className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] rounded-full blur-[100px] animate-pulse"
            style={{ 
              background: 'radial-gradient(circle, hsl(199 89% 48% / 0.2), transparent 60%)',
              animationDuration: '8s',
              animationDelay: '2s'
            }}
          />
          <div 
            className="absolute top-2/3 left-1/3 w-[300px] h-[300px] rounded-full blur-[80px] animate-pulse"
            style={{ 
              background: 'radial-gradient(circle, hsl(280 70% 50% / 0.1), transparent 60%)',
              animationDuration: '10s',
              animationDelay: '4s'
            }}
          />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/60 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-block group">
            <div className="flex items-center gap-3 p-3 -m-3 rounded-xl transition-all duration-300 hover:bg-white/5">
              <CosmoSecLogo size="lg" showText={true} />
            </div>
          </Link>
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-10">
          <div>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 text-sm mb-8">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-blue-200 font-medium">Plataforma GRC completa</span>
            </div>
            <h1 className="text-5xl font-bold mb-6 font-space leading-tight tracking-tight">
              <span className="text-white">Simplifique a</span><br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
                Governança de Segurança
              </span>
            </h1>
            <p className="text-xl text-blue-100/60 max-w-lg leading-relaxed">
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
                <div className="w-7 h-7 bg-gradient-to-br from-blue-500/40 to-cyan-500/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 border border-blue-400/40">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
                </div>
                <span className="text-blue-100/80 text-lg">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer Quote */}
        <div className="relative z-10">
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/5 backdrop-blur-md rounded-xl p-6 border border-blue-400/20">
            <blockquote className="border-l-2 border-cyan-400/60 pl-5">
              <p className="text-blue-100/70 italic text-lg leading-relaxed">
                "A segurança não é um produto, mas um processo."
              </p>
              <cite className="text-sm text-blue-300/50 mt-3 block font-medium">— Bruce Schneier</cite>
            </blockquote>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex flex-col min-h-screen bg-[hsl(222,47%,6%)] relative">
        {/* Subtle radial gradient */}
        <div className="absolute inset-0 bg-gradient-radial from-blue-500/5 via-transparent to-transparent pointer-events-none" />
        
        {/* Mobile Header */}
        <div className="lg:hidden p-4 border-b border-white/10 relative z-10">
          <Link to="/" className="flex items-center gap-2 text-blue-300/70 hover:text-blue-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Voltar</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="flex flex-col items-center mb-8 lg:hidden opacity-0 animate-stagger-fade-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
              <CosmoSecLogo size="xl" />
              <p className="text-blue-300/60 text-sm mt-2">Plataforma de Governança, Riscos e Conformidade</p>
            </div>

            <Card className="border border-white/10 shadow-2xl bg-[hsl(222,47%,9%)]/80 backdrop-blur-xl opacity-0 animate-stagger-scale-in" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
              <CardHeader className="pb-4 text-center">
                <CardTitle className="text-2xl font-space text-white">Bem-vindo</CardTitle>
                <CardDescription className="text-blue-300/60">
                  Entre ou crie sua conta para continuar
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Google OAuth Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 mb-4 border-white/20 bg-white/5 hover:bg-white/10 text-white"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading || isLockedOut}
                >
                  {googleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continuar com Google
                    </>
                  )}
                </Button>

                <div className="relative my-6">
                  <Separator className="bg-white/10" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[hsl(222,47%,9%)] px-3 text-xs text-blue-300/50">
                    ou continue com e-mail
                  </span>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="relative z-10">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/5 p-1 relative z-10">
                    <TabsTrigger 
                      value="login" 
                      className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-blue-300/70 transition-all cursor-pointer"
                    >
                      Entrar
                    </TabsTrigger>
                    <TabsTrigger 
                      value="signup" 
                      className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-blue-300/70 transition-all cursor-pointer"
                    >
                      Cadastrar
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="login-email" className="text-blue-100/80 text-sm">E-mail</Label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50 group-focus-within:text-blue-400 transition-colors" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="seu@email.com"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-blue-300/40 focus:border-blue-500/50 focus:bg-white/10 focus:ring-blue-500/20 transition-all"
                            required
                            disabled={isLockedOut}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="login-password" className="text-blue-100/80 text-sm">Senha</Label>
                          <Link 
                            to="/esqueci-senha" 
                            className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                          >
                            Esqueci minha senha
                          </Link>
                        </div>
                        <PasswordInput
                          id="login-password"
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="h-12 bg-white/5 border-white/10 text-white placeholder:text-blue-300/40 focus:border-blue-500/50 focus:bg-white/10 focus:ring-blue-500/20 transition-all"
                          required
                          disabled={isLockedOut}
                        />
                      </div>

                      {isLockedOut && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                          <p className="text-sm text-red-400">
                            Muitas tentativas. Aguarde {lockoutRemaining}s
                          </p>
                        </div>
                      )}

                      <Button 
                        type="submit" 
                        className="w-full h-12 text-base font-semibold bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all" 
                        size="lg" 
                        disabled={loading || isLockedOut}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
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
                        <Label htmlFor="signup-name" className="text-blue-100/80 text-sm">Nome completo</Label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50 group-focus-within:text-blue-400 transition-colors" />
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder="Seu nome"
                            value={signupName}
                            onChange={(e) => setSignupName(e.target.value)}
                            className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-blue-300/40 focus:border-blue-500/50 focus:bg-white/10 focus:ring-blue-500/20 transition-all"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-blue-100/80 text-sm">E-mail</Label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50 group-focus-within:text-blue-400 transition-colors" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="seu@email.com"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-blue-300/40 focus:border-blue-500/50 focus:bg-white/10 focus:ring-blue-500/20 transition-all"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-blue-100/80 text-sm">Senha</Label>
                        <PasswordInput
                          id="signup-password"
                          placeholder="••••••••"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          className="h-12 bg-white/5 border-white/10 text-white placeholder:text-blue-300/40 focus:border-blue-500/50 focus:bg-white/10 focus:ring-blue-500/20 transition-all"
                          required
                        />
                        <PasswordStrengthIndicator password={signupPassword} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-confirm" className="text-blue-100/80 text-sm">Confirmar senha</Label>
                        <PasswordInput
                          id="signup-confirm"
                          placeholder="••••••••"
                          value={signupConfirmPassword}
                          onChange={(e) => setSignupConfirmPassword(e.target.value)}
                          className="h-12 bg-white/5 border-white/10 text-white placeholder:text-blue-300/40 focus:border-blue-500/50 focus:bg-white/10 focus:ring-blue-500/20 transition-all"
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full h-12 text-base font-semibold bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all" 
                        size="lg" 
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
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

            <p className="text-center text-sm text-blue-300/50 mt-6 opacity-0 animate-stagger-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
              Ao continuar, você concorda com os{' '}
              <Link to="/termos" className="text-blue-400 hover:text-blue-300 hover:underline font-medium transition-colors">Termos de Uso</Link>
              {' '}e{' '}
              <Link to="/privacidade" className="text-blue-400 hover:text-blue-300 hover:underline font-medium transition-colors">Política de Privacidade</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
