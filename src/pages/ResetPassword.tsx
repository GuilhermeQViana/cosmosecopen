import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { CosmoSecLogo } from '@/components/ui/CosmoSecLogo';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { PasswordStrengthIndicator, getPasswordStrength } from '@/components/ui/PasswordStrengthIndicator';

const resetPasswordSchema = z.object({
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

export default function ResetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSessionValid(!!session);
    };
    checkSession();

    // Listen for auth state changes (recovery link clicked)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setSessionValid(true);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!validation.success) {
      toast({
        title: 'Erro de validação',
        description: validation.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    // Check password strength
    const { score } = getPasswordStrength(password);
    if (score < 4) {
      toast({
        title: 'Senha fraca',
        description: 'Por favor, crie uma senha mais forte.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      toast({
        title: 'Erro ao redefinir senha',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setSuccess(true);
      // Sign out and redirect to login after 3 seconds
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate('/auth');
      }, 3000);
    }
  };

  // Loading state while checking session
  if (sessionValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(222,47%,6%)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Invalid session state
  if (!sessionValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(222,47%,6%)] p-6 relative">
        <div className="absolute inset-0 bg-gradient-radial from-blue-500/5 via-transparent to-transparent pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="flex justify-center mb-8">
            <Link to="/">
              <CosmoSecLogo size="xl" />
            </Link>
          </div>

          <Card className="border border-white/10 shadow-2xl bg-[hsl(222,47%,9%)]/80 backdrop-blur-xl">
            <CardHeader className="pb-4 text-center">
              <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <CardTitle className="text-2xl font-space text-white">
                Link inválido ou expirado
              </CardTitle>
              <CardDescription className="text-blue-300/60">
                Este link de recuperação não é mais válido
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-blue-100/70 text-sm">
                Links de recuperação expiram após 1 hora. Solicite um novo link.
              </p>
              <Link to="/esqueci-senha">
                <Button className="w-full h-12 text-base font-semibold bg-blue-500 hover:bg-blue-600 text-white">
                  Solicitar novo link
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(222,47%,6%)] p-6 relative">
      <div className="absolute inset-0 bg-gradient-radial from-blue-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <Link to="/">
            <CosmoSecLogo size="xl" />
          </Link>
        </div>

        <Card className="border border-white/10 shadow-2xl bg-[hsl(222,47%,9%)]/80 backdrop-blur-xl">
          <CardHeader className="pb-4 text-center">
            <CardTitle className="text-2xl font-space text-white">
              {success ? 'Senha redefinida!' : 'Redefinir senha'}
            </CardTitle>
            <CardDescription className="text-blue-300/60">
              {success 
                ? 'Você será redirecionado para o login' 
                : 'Crie uma nova senha segura'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-blue-100/80">
                  Sua senha foi atualizada com sucesso.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-blue-300/50">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Redirecionando...
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-blue-100/80 text-sm">Nova senha</Label>
                  <PasswordInput
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-blue-300/40 focus:border-blue-500/50 focus:bg-white/10 focus:ring-blue-500/20 transition-all"
                    required
                  />
                  <PasswordStrengthIndicator password={password} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-blue-100/80 text-sm">Confirmar nova senha</Label>
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                      Redefinindo...
                    </>
                  ) : (
                    'Redefinir senha'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
