import { useState } from 'react';
import { useSendDeadlineNotifications } from '@/hooks/useSendDeadlineNotifications';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Bell, Loader2, Mail, Clock } from 'lucide-react';

export function SendDeadlineNotifications() {
  const { sendNotifications, isLoading } = useSendDeadlineNotifications();

  const handleSend = async (daysAhead: number) => {
    await sendNotifications(daysAhead);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-background/50" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Bell className="h-4 w-4 mr-2" />
          )}
          Notificar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Enviar lembretes por email
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleSend(0)} disabled={isLoading}>
          <Clock className="h-4 w-4 mr-2" />
          Prazos para hoje
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSend(1)} disabled={isLoading}>
          <Clock className="h-4 w-4 mr-2" />
          Prazos para amanhã
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSend(3)} disabled={isLoading}>
          <Clock className="h-4 w-4 mr-2" />
          Prazos em 3 dias
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSend(7)} disabled={isLoading}>
          <Clock className="h-4 w-4 mr-2" />
          Prazos em 7 dias
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
