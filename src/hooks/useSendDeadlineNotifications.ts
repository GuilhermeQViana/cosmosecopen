import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SendNotificationsResult {
  success: boolean;
  plansFound?: number;
  emailsSent?: number;
  emailAddresses?: string[];
  error?: string;
}

export function useSendDeadlineNotifications() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendNotifications = async (daysAhead: number = 3): Promise<SendNotificationsResult> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-deadline-notifications', {
        body: { daysAhead },
      });

      if (error) throw error;

      if (data.success) {
        if (data.emailsSent > 0) {
          toast({
            title: 'Notificações enviadas',
            description: `${data.emailsSent} email(s) enviado(s) para usuários com prazos próximos.`,
          });
        } else {
          toast({
            title: 'Nenhuma notificação enviada',
            description: data.plansFound > 0 
              ? 'Planos encontrados, mas sem usuários atribuídos ou emails configurados.'
              : `Nenhum plano de ação com prazo para ${daysAhead} dias.`,
          });
        }
      }

      return data;
    } catch (error: any) {
      console.error('Error sending deadline notifications:', error);
      toast({
        title: 'Erro ao enviar notificações',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return { sendNotifications, isLoading };
}
