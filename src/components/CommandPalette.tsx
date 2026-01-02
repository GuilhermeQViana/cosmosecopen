import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useControls } from '@/hooks/useControls';
import { useRisks } from '@/hooks/useRisks';
import { useEvidences } from '@/hooks/useEvidences';
import { useActionPlans } from '@/hooks/useActionPlans';
import {
  Shield,
  AlertTriangle,
  FileCheck,
  ListTodo,
  LayoutDashboard,
  Search,
  Settings,
  Users,
  FileText,
  Map,
  ClipboardList,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const navigationItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', group: 'Navegação' },
  { title: 'Diagnóstico de Controles', icon: Shield, path: '/diagnostico', group: 'Navegação' },
  { title: 'Registro de Riscos', icon: AlertTriangle, path: '/riscos', group: 'Navegação' },
  { title: 'Cofre de Evidências', icon: FileCheck, path: '/evidencias', group: 'Navegação' },
  { title: 'Plano de Ação', icon: ListTodo, path: '/plano-acao', group: 'Navegação' },
  { title: 'Relatórios', icon: FileText, path: '/relatorios', group: 'Navegação' },
  { title: 'Mapeamento', icon: Map, path: '/mapeamento', group: 'Navegação' },
  { title: 'Equipe', icon: Users, path: '/equipe', group: 'Navegação' },
  { title: 'Auditoria', icon: ClipboardList, path: '/auditoria', group: 'Navegação' },
  { title: 'Configurações', icon: Settings, path: '/configuracoes', group: 'Navegação' },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  
  const { data: controls = [] } = useControls();
  const { data: risks = [] } = useRisks();
  const { data: evidences = [] } = useEvidences();
  const { data: actionPlans = [] } = useActionPlans();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = useCallback((path: string) => {
    setOpen(false);
    navigate(path);
  }, [navigate]);

  const handleSelectControl = useCallback((controlId: string) => {
    setOpen(false);
    navigate(`/diagnostico?control=${controlId}`);
  }, [navigate]);

  const handleSelectRisk = useCallback((riskId: string) => {
    setOpen(false);
    navigate(`/riscos?risk=${riskId}`);
  }, [navigate]);

  const handleSelectEvidence = useCallback((evidenceId: string) => {
    setOpen(false);
    navigate(`/evidencias?evidence=${evidenceId}`);
  }, [navigate]);

  const handleSelectActionPlan = useCallback((planId: string) => {
    setOpen(false);
    navigate(`/plano-acao?plan=${planId}`);
  }, [navigate]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar em controles, riscos, evidências..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        
        <CommandGroup heading="Navegação">
          {navigationItems.map((item) => (
            <CommandItem
              key={item.path}
              onSelect={() => handleSelect(item.path)}
              className="flex items-center gap-2"
            >
              <item.icon className="h-4 w-4 text-muted-foreground" />
              <span>{item.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        {controls.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={`Controles (${controls.length})`}>
              {controls.slice(0, 5).map((control) => (
                <CommandItem
                  key={control.id}
                  onSelect={() => handleSelectControl(control.id)}
                  className="flex items-center gap-2"
                >
                  <Shield className="h-4 w-4 text-primary" />
                  <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">
                    {control.code}
                  </code>
                  <span className="truncate">{control.name}</span>
                </CommandItem>
              ))}
              {controls.length > 5 && (
                <CommandItem
                  onSelect={() => handleSelect('/diagnostico')}
                  className="text-muted-foreground"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Ver todos os {controls.length} controles...
                </CommandItem>
              )}
            </CommandGroup>
          </>
        )}

        {risks.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={`Riscos (${risks.length})`}>
              {risks.slice(0, 5).map((risk) => {
                const level = risk.inherent_probability * risk.inherent_impact;
                const isCritical = level >= 20;
                return (
                  <CommandItem
                    key={risk.id}
                    onSelect={() => handleSelectRisk(risk.id)}
                    className="flex items-center gap-2"
                  >
                    <AlertTriangle className={`h-4 w-4 ${isCritical ? 'text-destructive' : 'text-[hsl(var(--warning))]'}`} />
                    <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">
                      {risk.code}
                    </code>
                    <span className="truncate flex-1">{risk.title}</span>
                    {isCritical && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                        Crítico
                      </Badge>
                    )}
                  </CommandItem>
                );
              })}
              {risks.length > 5 && (
                <CommandItem
                  onSelect={() => handleSelect('/riscos')}
                  className="text-muted-foreground"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Ver todos os {risks.length} riscos...
                </CommandItem>
              )}
            </CommandGroup>
          </>
        )}

        {evidences.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={`Evidências (${evidences.length})`}>
              {evidences.slice(0, 5).map((evidence) => (
                <CommandItem
                  key={evidence.id}
                  onSelect={() => handleSelectEvidence(evidence.id)}
                  className="flex items-center gap-2"
                >
                  <FileCheck className="h-4 w-4 text-[hsl(var(--success))]" />
                  <span className="truncate">{evidence.name}</span>
                </CommandItem>
              ))}
              {evidences.length > 5 && (
                <CommandItem
                  onSelect={() => handleSelect('/evidencias')}
                  className="text-muted-foreground"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Ver todas as {evidences.length} evidências...
                </CommandItem>
              )}
            </CommandGroup>
          </>
        )}

        {actionPlans.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={`Planos de Ação (${actionPlans.length})`}>
              {actionPlans.slice(0, 5).map((plan) => {
                const isOverdue = plan.due_date && new Date(plan.due_date) < new Date() && plan.status !== 'done';
                return (
                  <CommandItem
                    key={plan.id}
                    onSelect={() => handleSelectActionPlan(plan.id)}
                    className="flex items-center gap-2"
                  >
                    <ListTodo className={`h-4 w-4 ${isOverdue ? 'text-destructive' : 'text-[hsl(var(--info))]'}`} />
                    <span className="truncate flex-1">{plan.title}</span>
                    {isOverdue && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                        Atrasado
                      </Badge>
                    )}
                  </CommandItem>
                );
              })}
              {actionPlans.length > 5 && (
                <CommandItem
                  onSelect={() => handleSelect('/plano-acao')}
                  className="text-muted-foreground"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Ver todos os {actionPlans.length} planos...
                </CommandItem>
              )}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
