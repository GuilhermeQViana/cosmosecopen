import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck } from 'lucide-react';
import { CosmoSecLogo } from '@/components/ui/CosmoSecLogo';

interface MFAVerificationProps {
  onVerified: () => void;
  onCancel: () => void;
}

export function MFAVerification({ onVerified, onCancel }: MFAVerificationProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleVerify = async () => {
    if (code.length !== 6) return;

    setLoading(true);
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.totp?.[0];

      if (!totpFactor) {
        toast({ title: 'Erro', description: 'Fator TOTP não encontrado.', variant: 'destructive' });
        return;
      }

      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id,
      });

      if (challengeError) {
        toast({ title: 'Erro', description: challengeError.message, variant: 'destructive' });
        return;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challenge.id,
        code,
      });

      if (verifyError) {
        toast({ title: 'Código inválido', description: 'Verifique o código e tente novamente.', variant: 'destructive' });
        setCode('');
        return;
      }

      onVerified();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message || 'Erro inesperado', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(222,47%,6%)] relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-1/4 -left-20 w-[500px] h-[500px] rounded-full blur-[120px] animate-pulse"
          style={{ background: 'radial-gradient(circle, hsl(217 91% 60% / 0.15), transparent 60%)', animationDuration: '6s' }}
        />
      </div>

      <Card className="w-full max-w-md border border-white/10 shadow-2xl bg-[hsl(222,47%,9%)]/80 backdrop-blur-xl relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <CosmoSecLogo size="lg" />
          </div>
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl font-space text-white">Verificação em Duas Etapas</CardTitle>
          <CardDescription className="text-blue-300/60">
            Digite o código de 6 dígitos do seu app autenticador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={code} onChange={setCode}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full"
              onClick={handleVerify}
              disabled={code.length !== 6 || loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Verificar
            </Button>
            <Button variant="ghost" className="w-full text-muted-foreground" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
