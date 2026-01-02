/**
 * Metodologia de Risco - Constantes e funções centralizadas
 * 
 * Fórmula: Risk Score = (Maturidade Alvo - Maturidade Atual) × Peso do Controle
 */

// ============================================================================
// PESOS DE CONTROLE (1-3) - Classificação Fintech
// ============================================================================
export const CONTROL_WEIGHTS = {
  1: {
    label: 'Padrão',
    description: 'Controle importante mas com impacto regulatório indireto',
    color: 'bg-slate-500/10 text-slate-600 border-slate-500/30',
  },
  2: {
    label: 'Elevado',
    description: 'Requisito regulatório BACEN ou impacto em dados sensíveis',
    color: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  },
  3: {
    label: 'Crítico',
    description: 'Exigência legal direta, dados de pagamento ou PII crítico',
    color: 'bg-destructive/10 text-destructive border-destructive/30',
  },
} as const;

export type ControlWeight = keyof typeof CONTROL_WEIGHTS;

// ============================================================================
// THRESHOLDS DE RISK SCORE (Controles)
// ============================================================================
export const RISK_SCORE_THRESHOLDS = {
  LOW: {
    min: 0,
    max: 2,
    label: 'Baixo',
    action: 'Monitoramento',
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
    bgColor: 'bg-emerald-500',
  },
  MEDIUM: {
    min: 3,
    max: 5,
    label: 'Médio',
    action: 'Planejamento',
    color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
    bgColor: 'bg-yellow-500',
  },
  HIGH: {
    min: 6,
    max: 9,
    label: 'Alto',
    action: 'Prioridade alta',
    color: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
    bgColor: 'bg-orange-500',
  },
  CRITICAL: {
    min: 10,
    max: 15,
    label: 'Crítico',
    action: 'Ação imediata',
    color: 'bg-destructive/10 text-destructive border-destructive/30',
    bgColor: 'bg-destructive',
  },
} as const;

export type RiskScoreLevel = keyof typeof RISK_SCORE_THRESHOLDS;

// ============================================================================
// NÍVEIS DE MATURIDADE (0-5)
// ============================================================================
export const MATURITY_LEVELS = {
  0: {
    label: 'Inexistente',
    description: 'Controle não implementado ou desconhecido',
    evidence: 'Nenhuma',
  },
  1: {
    label: 'Inicial',
    description: 'Processo ad-hoc, dependente de indivíduos',
    evidence: 'Ações pontuais documentadas',
  },
  2: {
    label: 'Repetível',
    description: 'Processos básicos estabelecidos, ainda informais',
    evidence: 'Procedimentos informais, emails',
  },
  3: {
    label: 'Definido',
    description: 'Processos documentados e padronizados',
    evidence: 'Políticas, procedimentos formais',
  },
  4: {
    label: 'Gerenciado',
    description: 'Processos medidos e controlados',
    evidence: 'Métricas, relatórios, revisões',
  },
  5: {
    label: 'Otimizado',
    description: 'Melhoria contínua institucionalizada',
    evidence: 'Auditorias, certificações, KPIs',
  },
} as const;

export type MaturityLevelKey = keyof typeof MATURITY_LEVELS;

// ============================================================================
// DESCRIÇÕES DO GAP DE MATURIDADE
// ============================================================================
export const MATURITY_GAP_DESCRIPTIONS: Record<number, string> = {
  0: 'Controle já atende ao objetivo',
  1: 'Melhoria incremental necessária',
  2: 'Melhoria incremental necessária',
  3: 'Esforço significativo requerido',
  4: 'Esforço significativo requerido',
  5: 'Implementação do zero',
};

// ============================================================================
// THRESHOLDS DE RISCO DE NEGÓCIO (Matriz 5x5)
// ============================================================================
export const BUSINESS_RISK_THRESHOLDS = {
  VERY_LOW: {
    min: 1,
    max: 2,
    label: 'Muito Baixo',
    color: 'bg-green-500/80',
    textColor: 'text-green-600',
  },
  LOW: {
    min: 3,
    max: 5,
    label: 'Baixo',
    color: 'bg-lime-500/80',
    textColor: 'text-lime-600',
  },
  MEDIUM: {
    min: 6,
    max: 11,
    label: 'Médio',
    color: 'bg-yellow-500/80',
    textColor: 'text-yellow-600',
  },
  HIGH: {
    min: 12,
    max: 19,
    label: 'Alto',
    color: 'bg-orange-500/80',
    textColor: 'text-orange-600',
  },
  CRITICAL: {
    min: 20,
    max: 25,
    label: 'Crítico',
    color: 'bg-red-500/80',
    textColor: 'text-red-600',
  },
} as const;

export type BusinessRiskLevel = keyof typeof BUSINESS_RISK_THRESHOLDS;

// ============================================================================
// FUNÇÕES DE CÁLCULO
// ============================================================================

/**
 * Calcula o Risk Score de um controle
 * Risk Score = (Maturidade Alvo - Maturidade Atual) × Peso
 */
export function calculateRiskScore(
  currentMaturity: number,
  targetMaturity: number,
  weight: number = 1
): number {
  const gap = Math.max(0, targetMaturity - currentMaturity);
  return gap * Math.min(weight, 3); // Clamp weight to max 3
}

/**
 * Retorna a classificação do Risk Score
 */
export function getRiskScoreClassification(score: number): {
  level: RiskScoreLevel;
  label: string;
  action: string;
  color: string;
  bgColor: string;
} {
  if (score >= RISK_SCORE_THRESHOLDS.CRITICAL.min) {
    return {
      level: 'CRITICAL',
      ...RISK_SCORE_THRESHOLDS.CRITICAL,
    };
  }
  if (score >= RISK_SCORE_THRESHOLDS.HIGH.min) {
    return {
      level: 'HIGH',
      ...RISK_SCORE_THRESHOLDS.HIGH,
    };
  }
  if (score >= RISK_SCORE_THRESHOLDS.MEDIUM.min) {
    return {
      level: 'MEDIUM',
      ...RISK_SCORE_THRESHOLDS.MEDIUM,
    };
  }
  return {
    level: 'LOW',
    ...RISK_SCORE_THRESHOLDS.LOW,
  };
}

/**
 * Retorna a descrição do gap de maturidade
 */
export function getMaturityGapDescription(gap: number): string {
  if (gap <= 0) return MATURITY_GAP_DESCRIPTIONS[0];
  if (gap >= 5) return MATURITY_GAP_DESCRIPTIONS[5];
  return MATURITY_GAP_DESCRIPTIONS[gap] || MATURITY_GAP_DESCRIPTIONS[0];
}

/**
 * Retorna informações do peso do controle
 */
export function getControlWeightInfo(weight: number): {
  label: string;
  description: string;
  color: string;
} {
  const clampedWeight = Math.max(1, Math.min(3, weight)) as ControlWeight;
  return CONTROL_WEIGHTS[clampedWeight];
}

/**
 * Calcula o nível de risco de negócio (Matriz 5x5)
 */
export function calculateBusinessRiskLevel(
  probability: number,
  impact: number
): number {
  return probability * impact;
}

/**
 * Retorna a classificação do risco de negócio
 */
export function getBusinessRiskClassification(level: number): {
  level: BusinessRiskLevel;
  label: string;
  color: string;
  textColor: string;
} {
  if (level >= BUSINESS_RISK_THRESHOLDS.CRITICAL.min) {
    return { level: 'CRITICAL', ...BUSINESS_RISK_THRESHOLDS.CRITICAL };
  }
  if (level >= BUSINESS_RISK_THRESHOLDS.HIGH.min) {
    return { level: 'HIGH', ...BUSINESS_RISK_THRESHOLDS.HIGH };
  }
  if (level >= BUSINESS_RISK_THRESHOLDS.MEDIUM.min) {
    return { level: 'MEDIUM', ...BUSINESS_RISK_THRESHOLDS.MEDIUM };
  }
  if (level >= BUSINESS_RISK_THRESHOLDS.LOW.min) {
    return { level: 'LOW', ...BUSINESS_RISK_THRESHOLDS.LOW };
  }
  return { level: 'VERY_LOW', ...BUSINESS_RISK_THRESHOLDS.VERY_LOW };
}

/**
 * Retorna a cor da célula da matriz de risco
 */
export function getMatrixCellColor(probability: number, impact: number): string {
  const level = probability * impact;
  return getBusinessRiskClassification(level).color;
}
