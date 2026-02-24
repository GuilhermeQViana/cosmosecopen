import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldOff } from 'lucide-react';

interface TwoFactorDisableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  factorId: string;
  onDisabled: () => void;
}

export function TwoFactorDisableDialog({ open, onOpenChange, factorId, onDisabled }: TwoFactorDisableDialogProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDisable = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    try {
      // Verify current code first
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

      // Unenroll the factor
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId });
      if (unenrollError) {
        toast({ title: 'Erro', description: unenrollError.message, variant: 'destructive' });
        return;
      }

      toast({ title: '2FA desativado', description: 'A autenticação de dois fatores foi removida.' });
      onDisabled();
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setCode(''); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldOff className="h-5 w-5" />
            Desativar Autenticação de Dois Fatores
          </DialogTitle>
          <DialogDescription>
            Digite o código atual do seu app autenticador para confirmar a desativação.
          </DialogDescription>
        </DialogHeader>

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
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleDisable} disabled={code.length !== 6 || loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Desativar 2FA
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
