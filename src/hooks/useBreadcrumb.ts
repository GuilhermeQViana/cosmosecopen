import { useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useControls } from './useControls';
import { useRisks } from './useRisks';
import { useEvidences } from './useEvidences';
import { useActionPlans } from './useActionPlans';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/diagnostico': 'Diagnóstico de Controles',
  '/riscos': 'Registro de Riscos',
  '/evidencias': 'Cofre de Evidências',
  '/plano-acao': 'Plano de Ação',
  '/relatorios': 'Relatórios',
  '/mapeamento': 'Mapeamento',
  '/equipe': 'Gestão de Equipe',
  '/auditoria': 'Auditoria',
  '/configuracoes': 'Configurações',
  '/selecionar-framework': 'Seleção de Framework',
  '/selecionar-organizacao': 'Seleção de Organização',
  '/onboarding': 'Onboarding',
};

export function useBreadcrumb(): BreadcrumbItem[] {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const { data: controls = [] } = useControls();
  const { data: risks = [] } = useRisks();
  const { data: evidences = [] } = useEvidences();
  const { data: actionPlans = [] } = useActionPlans();

  return useMemo(() => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/dashboard' },
    ];

    const pathname = location.pathname;
    const baseTitle = routeTitles[pathname];

    if (baseTitle) {
      items.push({ label: baseTitle, href: pathname });
    }

    // Add context-specific items based on query params
    const controlId = searchParams.get('control');
    const riskId = searchParams.get('risk');
    const evidenceId = searchParams.get('evidence');
    const planId = searchParams.get('plan');

    if (controlId && pathname === '/diagnostico') {
      const control = controls.find(c => c.id === controlId);
      if (control) {
        items.push({ label: control.code });
      }
    }

    if (riskId && pathname === '/riscos') {
      const risk = risks.find(r => r.id === riskId);
      if (risk) {
        items.push({ label: risk.code });
      }
    }

    if (evidenceId && pathname === '/evidencias') {
      const evidence = evidences.find(e => e.id === evidenceId);
      if (evidence) {
        items.push({ label: evidence.name });
      }
    }

    if (planId && pathname === '/plano-acao') {
      const plan = actionPlans.find(p => p.id === planId);
      if (plan) {
        items.push({ label: plan.title });
      }
    }

    return items;
  }, [location.pathname, searchParams, controls, risks, evidences, actionPlans]);
}
