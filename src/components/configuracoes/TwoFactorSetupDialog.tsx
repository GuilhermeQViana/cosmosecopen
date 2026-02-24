import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { Loader2, QrCode, CheckCircle2, Copy } from 'lucide-react';

interface TwoFactorSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEnabled: () => void;
}

export function TwoFactorSetupDialog({ open, onOpenChange, onEnabled }: TwoFactorSetupDialogProps) {
  const [step, setStep] = useState<'qr' | 'verify' | 'success'>('qr');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [factorId, setFactorId] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    setStep('qr');
    setCode('');
    setEnrolling(true);

    supabase.auth.mfa.enroll({ factorType: 'totp' })
      .then(({ data, error }) => {
        if (error) {
          toast({ title: 'Erro', description: error.message, variant: 'destructive' });
          onOpenChange(false);
          return;
        }
        setQrCode(data.totp.qr_code);
        setSecret(data.totp.secret);
        setFactorId(data.id);
      })
      .catch((err: any) => {
        toast({ title: 'Erro', description: err.message, variant: 'destructive' });
        onOpenChange(false);
      })
      .finally(() => setEnrolling(false));
  }, [open]);

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) {
        toast({ title: 'Erro', description: challengeError.message, variant: 'destructive' });
        return;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      });

      if (verifyError) {
        toast({ title: 'Código inválido', description: 'Verifique o código e tente novamente.', variant: 'destructive' });
        setCode('');
        return;
      }

      setStep('success');
      onEnabled();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    toast({ title: 'Copiado!', description: 'Segredo copiado para a área de transferência.' });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Configurar Autenticação de Dois Fatores
          </DialogTitle>
          <DialogDescription>
            {step === 'qr' && 'Escaneie o QR Code com seu app autenticador (Google Authenticator, Microsoft Authenticator, Authy, etc.)'}
            {step === 'verify' && 'Digite o código de 6 dígitos gerado pelo app'}
            {step === 'success' && '2FA ativado com sucesso!'}
          </DialogDescription>
        </DialogHeader>

        {enrolling ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : step === 'qr' ? (
          <div className="space-y-4">
            {qrCode && (
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <img src={qrCode} alt="QR Code para 2FA" className="w-48 h-48" />
              </div>
            )}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Ou digite o código manualmente:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-muted rounded text-xs font-mono break-all select-all">
                  {secret}
                </code>
                <Button variant="ghost" size="icon" onClick={copySecret}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button className="w-full" onClick={() => setStep('verify')}>
              Já escaneei, continuar
            </Button>
          </div>
        ) : step === 'verify' ? (
          <div className="space-y-6">
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
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep('qr')}>
                Voltar
              </Button>
              <Button className="flex-1" onClick={handleVerify} disabled={code.length !== 6 || loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Verificar e Ativar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              A autenticação de dois fatores foi ativada. Você precisará do código do app autenticador para fazer login.
            </p>
            <Button onClick={() => onOpenChange(false)}>Fechar</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
