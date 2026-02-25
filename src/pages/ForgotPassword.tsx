import { useState } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { CosmoSecLogo } from '@/components/ui/CosmoSecLogo';
import { AUTH_ROUTE } from '@/lib/constants';

const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
});

export default function ForgotPassword() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = forgotPasswordSchema.safeParse({ email });
    if (!validation.success) {
      toast({
        title: 'Erro de validação',
        description: validation.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    const origin = import.meta.env.DEV ? 'http://localhost:8080' : window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/redefinir-senha`,
    });

    setLoading(false);

    if (error) {
      toast({
        title: 'Erro ao enviar e-mail',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setEmailSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(222,47%,6%)] p-6 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/">
            <CosmoSecLogo size="xl" />
          </Link>
        </div>

        <Card className="border border-white/10 shadow-2xl bg-[hsl(222,47%,9%)]/80 backdrop-blur-xl">
          <CardHeader className="pb-4 text-center">
            <CardTitle className="text-2xl font-space text-white">
              {emailSent ? 'E-mail enviado!' : 'Esqueceu sua senha?'}
            </CardTitle>
            <CardDescription className="text-blue-300/60">
              {emailSent 
                ? 'Verifique sua caixa de entrada' 
                : 'Digite seu e-mail para receber um link de recuperação'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailSent ? (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-blue-100/80">
                    Enviamos um link de recuperação para:
                  </p>
                  <p className="text-white font-medium">{email}</p>
                </div>
                <p className="text-sm text-blue-300/50">
                  Não recebeu? Verifique sua pasta de spam ou{' '}
                  <button 
                    onClick={() => setEmailSent(false)}
                    className="text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    tente novamente
                  </button>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-blue-100/80 text-sm">E-mail</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50 group-focus-within:text-blue-400 transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-blue-300/40 focus:border-blue-500/50 focus:bg-white/10 focus:ring-blue-500/20 transition-all"
                      required
                    />
                  </div>
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
                      Enviando...
                    </>
                  ) : (
                    'Enviar link de recuperação'
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-white/10">
              <Link 
                to={AUTH_ROUTE} 
                className="flex items-center justify-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para o login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
