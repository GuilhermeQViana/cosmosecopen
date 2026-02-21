// Demo Slide Renderers for CosmoSec client presentations
// Each function renders a specific content slide on a 1920x1080 canvas

const W = 1920;
const H = 1080;

const COLORS = {
  deepVoid: '#0B0E14',
  eventHorizon: '#2E5CFF',
  nebula: '#00D4FF',
  celestialDawn: '#F8FAFC',
  darkGray: '#1A1F2E',
  mediumGray: '#2A3040',
  lightGray: '#94A3B8',
};

// ─── Shared Background Helpers (duplicated to keep module self-contained) ───

function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function drawStars(ctx: CanvasRenderingContext2D, count: number, seed = 42) {
  const rand = seededRandom(seed);
  for (let i = 0; i < count; i++) {
    const x = rand() * W, y = rand() * H, r = rand() * 1.8 + 0.3, a = rand() * 0.5 + 0.1;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fill();
  }
}

function drawGlowOrb(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha: number) {
  const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
  grad.addColorStop(0, color.replace(')', `, ${alpha})`).replace('rgb', 'rgba'));
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

function bgDemo(ctx: CanvasRenderingContext2D, seed = 99) {
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, COLORS.deepVoid);
  grad.addColorStop(0.5, '#0D1220');
  grad.addColorStop(1, '#0A1628');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
  drawStars(ctx, 80, seed);
  drawGlowOrb(ctx, W * 0.8, H * 0.15, 400, 'rgb(46,92,255)', 0.05);
  drawGlowOrb(ctx, W * 0.15, H * 0.85, 350, 'rgb(0,212,255)', 0.04);
}

// ─── Layout Helpers ───

function drawHLine(ctx: CanvasRenderingContext2D, y: number, x1: number, x2: number) {
  const g = ctx.createLinearGradient(x1, y, x2, y);
  g.addColorStop(0, 'rgba(46,92,255,0)'); g.addColorStop(0.3, 'rgba(46,92,255,0.4)');
  g.addColorStop(0.7, 'rgba(0,212,255,0.4)'); g.addColorStop(1, 'rgba(0,212,255,0)');
  ctx.strokeStyle = g; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
}

function drawTitle(ctx: CanvasRenderingContext2D, text: string, y = H * 0.12) {
  ctx.font = 'bold 54px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, W / 2, y);
}

function drawSubtitle(ctx: CanvasRenderingContext2D, text: string, y = H * 0.19) {
  ctx.font = '26px "Space Grotesk", sans-serif';
  ctx.fillStyle = COLORS.nebula; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, W / 2, y);
}

function drawFooterLogo(ctx: CanvasRenderingContext2D, logo: HTMLImageElement) {
  ctx.drawImage(logo, W - 100, H - 80, 40, 40);
  ctx.font = '16px "Space Grotesk", sans-serif';
  ctx.fillStyle = COLORS.lightGray; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  ctx.fillText('cosmosec.com.br', W - 120, H - 58);
}

function drawBulletList(ctx: CanvasRenderingContext2D, items: string[], x: number, startY: number, opts: { spacing?: number; fontSize?: number; bulletColor?: string; maxWidth?: number } = {}) {
  const spacing = opts.spacing ?? 52;
  const fontSize = opts.fontSize ?? 26;
  const bulletColor = opts.bulletColor ?? COLORS.nebula;
  const maxWidth = opts.maxWidth ?? 1200;

  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  items.forEach((item, i) => {
    const y = startY + i * spacing;
    // Bullet dot
    ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = bulletColor; ctx.fill();
    // Text
    ctx.font = `${fontSize}px "Space Grotesk", sans-serif`;
    ctx.fillStyle = COLORS.celestialDawn;
    ctx.fillText(item, x + 24, y, maxWidth);
  });
}

function drawContentCard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, title: string, items: string[]) {
  // Card bg
  ctx.fillStyle = 'rgba(26,31,46,0.6)';
  ctx.strokeStyle = 'rgba(46,92,255,0.2)';
  ctx.lineWidth = 1;
  const r = 12;
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Title
  ctx.font = 'bold 28px "Space Grotesk", sans-serif';
  ctx.fillStyle = COLORS.nebula; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(title, x + 24, y + 36);

  // Items
  ctx.font = '22px "Space Grotesk", sans-serif';
  ctx.fillStyle = COLORS.celestialDawn;
  items.forEach((item, i) => {
    const iy = y + 76 + i * 34;
    ctx.fillStyle = COLORS.eventHorizon;
    ctx.fillText('›', x + 28, iy);
    ctx.fillStyle = '#CBD5E1';
    ctx.fillText(item, x + 48, iy, w - 72);
  });
}

function drawMetricBlock(ctx: CanvasRenderingContext2D, x: number, y: number, value: string, label: string, desc: string) {
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = 'bold 64px "Space Grotesk", sans-serif';
  ctx.fillStyle = COLORS.nebula;
  ctx.fillText(value, x, y);
  ctx.font = 'bold 22px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(label, x, y + 48);
  ctx.font = '18px "Space Grotesk", sans-serif';
  ctx.fillStyle = COLORS.lightGray;
  ctx.fillText(desc, x, y + 78, 320);
}

// ─── Slide Render Functions ───

function loadLogo(): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image(); img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img); img.onerror = reject;
    img.src = '/brand/cosmosec-logo-static.svg';
  });
}

export async function renderDemoSlide(ctx: CanvasRenderingContext2D, slideId: string) {
  const logo = await loadLogo();

  switch (slideId) {
    case 'demo-problema': {
      bgDemo(ctx, 101);
      drawTitle(ctx, 'O Problema');
      drawSubtitle(ctx, 'Por que a gestão de segurança precisa evoluir?');
      drawHLine(ctx, H * 0.24, W * 0.2, W * 0.8);
      drawBulletList(ctx, [
        'Auditorias manuais consomem semanas de trabalho',
        'Controles rastreados em planilhas desconexas',
        'Gaps de conformidade só descobertos em auditorias externas',
        'Falta de visibilidade consolidada sobre riscos',
        'Fornecedores sem avaliação estruturada de segurança',
        'Políticas desatualizadas sem workflow de aprovação',
        'Impossível medir evolução da maturidade ao longo do tempo',
        'Equipes sem papéis e permissões bem definidos',
      ], W * 0.2, H * 0.32, { spacing: 56 });
      drawFooterLogo(ctx, logo);
      break;
    }

    case 'demo-solucao': {
      bgDemo(ctx, 102);
      drawTitle(ctx, 'A Solução: CosmoSec');
      drawSubtitle(ctx, 'Plataforma integrada de GRC, VRM e Gestão de Políticas');
      drawHLine(ctx, H * 0.24, W * 0.2, W * 0.8);
      drawBulletList(ctx, [
        'Diagnóstico de maturidade em múltiplos frameworks simultaneamente',
        'Gestão de riscos com matriz de calor e metodologia customizável',
        'Avaliação e qualificação de fornecedores com portal externo',
        'Editor de políticas com fluxo de aprovação multi-nível',
        'Planos de ação com IA generativa para cada gap identificado',
        'Repositório centralizado de evidências com rastreabilidade',
        'Dashboards executivos com métricas em tempo real',
        'Multi-organização, RBAC e trilha completa de auditoria',
      ], W * 0.2, H * 0.32, { spacing: 56 });
      drawFooterLogo(ctx, logo);
      break;
    }

    case 'demo-modulos': {
      bgDemo(ctx, 103);
      drawTitle(ctx, 'Três Módulos Integrados');
      drawSubtitle(ctx, 'Uma visão unificada da sua postura de segurança');
      drawHLine(ctx, H * 0.24, W * 0.2, W * 0.8);

      const cardW = 520, cardH = 440;
      const gap = 40;
      const totalW = cardW * 3 + gap * 2;
      const startX = (W - totalW) / 2;
      const cardY = H * 0.30;

      drawContentCard(ctx, startX, cardY, cardW, cardH, '🛡️  GRC', [
        'Diagnóstico de maturidade',
        'Gestão de riscos e controles',
        'Plano de ação automatizado',
        'Repositório de evidências',
        'Relatórios e auditoria',
        'Mapeamento entre frameworks',
        'Snapshots temporais',
      ]);
      drawContentCard(ctx, startX + cardW + gap, cardY, cardW, cardH, '🔗  VRM', [
        'Cadastro de fornecedores',
        'Avaliação e qualificação',
        'Portal externo do fornecedor',
        'Radar de conformidade',
        'Contratos e SLAs',
        'Due Diligence estruturado',
        'Análise de risco com IA',
      ]);
      drawContentCard(ctx, startX + (cardW + gap) * 2, cardY, cardW, cardH, '📋  Políticas', [
        'Editor rico (TipTap)',
        'Versionamento automático',
        'Fluxo de aprovação multi-nível',
        'Campanhas de aceite',
        'Biblioteca de modelos',
        'Vinculação com controles',
        'Dashboard de conformidade',
      ]);
      drawFooterLogo(ctx, logo);
      break;
    }

    case 'demo-grc': {
      bgDemo(ctx, 104);
      drawTitle(ctx, 'Módulo GRC');
      drawSubtitle(ctx, 'Governança, Riscos e Conformidade de ponta a ponta');
      drawHLine(ctx, H * 0.24, W * 0.2, W * 0.8);

      const cols = 2, cw = 780, ch = 300, gx = 60, gy = 30;
      const sx = (W - (cw * cols + gx)) / 2;
      const sy = H * 0.30;
      const features = [
        { t: 'Diagnóstico de Maturidade', items: ['Avaliação por controle com 5 níveis', 'Filtros avançados e modo auditoria', 'Snapshots para comparação temporal', 'Geração de planos em lote com IA'] },
        { t: 'Gestão de Riscos', items: ['Matriz de calor interativa', 'Metodologia FAIR/ISO 31000 customizável', 'Vinculação de controles mitigadores', 'Timeline de evolução do risco'] },
        { t: 'Evidências & Auditoria', items: ['Upload com pastas hierárquicas', 'Classificação e tags', 'Trilha completa de auditoria', 'Timeline de eventos por sessão'] },
        { t: 'Relatórios & Plano de Ação', items: ['Geração PDF/Excel automatizada', 'Kanban + Calendário de tarefas', 'Notificações de prazos por e-mail', 'Histórico de relatórios gerados'] },
      ];
      features.forEach((f, i) => {
        const col = i % cols, row = Math.floor(i / cols);
        drawContentCard(ctx, sx + col * (cw + gx), sy + row * (ch + gy), cw, ch, f.t, f.items);
      });
      drawFooterLogo(ctx, logo);
      break;
    }

    case 'demo-vrm': {
      bgDemo(ctx, 105);
      drawTitle(ctx, 'Módulo VRM');
      drawSubtitle(ctx, 'Vendor Risk Management — Avaliação completa de terceiros');
      drawHLine(ctx, H * 0.24, W * 0.2, W * 0.8);

      const cols = 2, cw = 780, ch = 300, gx = 60, gy = 30;
      const sx = (W - (cw * cols + gx)) / 2;
      const sy = H * 0.30;
      const features = [
        { t: 'Avaliação & Pipeline', items: ['Pipeline visual de fornecedores', 'Heatmap de risco por categoria', 'Gráficos de tendência temporal', 'Risco inerente calculado'] },
        { t: 'Qualificação', items: ['Templates com perguntas ponderadas', 'Perguntas KO (eliminatórias)', 'Portal externo para o fornecedor', 'Score automático com classificação'] },
        { t: 'Contratos, SLAs & Incidentes', items: ['Gestão de contratos com valores', 'Acompanhamento de SLAs por métrica', 'Registro de incidentes com severidade', 'Ações corretivas por incidente'] },
        { t: 'Due Diligence & IA', items: ['Checklist estruturado por categoria', 'Fluxo de aprovação de DD', 'Análise de risco com IA generativa', 'Classificação automática de criticidade'] },
      ];
      features.forEach((f, i) => {
        const col = i % cols, row = Math.floor(i / cols);
        drawContentCard(ctx, sx + col * (cw + gx), sy + row * (ch + gy), cw, ch, f.t, f.items);
      });
      drawFooterLogo(ctx, logo);
      break;
    }

    case 'demo-politicas': {
      bgDemo(ctx, 106);
      drawTitle(ctx, 'Módulo de Políticas');
      drawSubtitle(ctx, 'Ciclo completo: criação, aprovação, publicação e aceite');
      drawHLine(ctx, H * 0.24, W * 0.2, W * 0.8);

      const cols = 2, cw = 780, ch = 300, gx = 60, gy = 30;
      const sx = (W - (cw * cols + gx)) / 2;
      const sy = H * 0.30;
      const features = [
        { t: 'Editor Rico', items: ['Editor TipTap com tabelas e imagens', 'Versionamento automático a cada salvo', 'Comentários colaborativos', 'Vinculação com controles e riscos'] },
        { t: 'Fluxos de Aprovação', items: ['Workflows multi-nível (até 5)', 'SLA de aprovação configurável', 'Notificação automática a aprovadores', 'Histórico de aprovações e rejeições'] },
        { t: 'Campanhas de Aceite', items: ['Campanha por política publicada', 'Público-alvo por papel ou todos', 'Progresso de aceite em tempo real', 'Registro com IP e timestamp'] },
        { t: 'Biblioteca de Modelos', items: ['Modelos por framework e categoria', 'Preview antes de usar', 'Importar/Exportar DOCX', 'Criar modelos customizados'] },
      ];
      features.forEach((f, i) => {
        const col = i % cols, row = Math.floor(i / cols);
        drawContentCard(ctx, sx + col * (cw + gx), sy + row * (ch + gy), cw, ch, f.t, f.items);
      });
      drawFooterLogo(ctx, logo);
      break;
    }

    case 'demo-ia': {
      bgDemo(ctx, 107);
      drawTitle(ctx, 'Inteligência Artificial');
      drawSubtitle(ctx, 'IA integrada para acelerar conformidade e tomada de decisão');
      drawHLine(ctx, H * 0.24, W * 0.2, W * 0.8);

      const cols = 2, cw = 780, ch = 300, gx = 60, gy = 30;
      const sx = (W - (cw * cols + gx)) / 2;
      const sy = H * 0.30;
      const features = [
        { t: 'Planos de Ação com IA', items: ['Geração individual por controle', 'Geração em lote para todos os gaps', 'Sugestões contextuais baseadas no framework', 'Priorização automática por risco'] },
        { t: 'Escritor de Políticas', items: ['Rascunho gerado por IA', 'Baseado no framework selecionado', 'Customizável após geração', 'Integrado ao editor TipTap'] },
        { t: 'Análise de Risco de Fornecedores', items: ['Avaliação automática de criticidade', 'Top 5 preocupações identificadas', 'Recomendações práticas', 'Score numérico de 0 a 100'] },
        { t: 'Assistente de Implementação', items: ['Guia contextual por controle', 'Passos de implementação sugeridos', 'Exemplos de evidências necessárias', 'Nível de esforço estimado'] },
      ];
      features.forEach((f, i) => {
        const col = i % cols, row = Math.floor(i / cols);
        drawContentCard(ctx, sx + col * (cw + gx), sy + row * (ch + gy), cw, ch, f.t, f.items);
      });
      drawFooterLogo(ctx, logo);
      break;
    }

    case 'demo-beneficios': {
      bgDemo(ctx, 108);
      drawTitle(ctx, 'Impacto Mensurável');
      drawSubtitle(ctx, 'Resultados reais para a sua operação de segurança');
      drawHLine(ctx, H * 0.24, W * 0.2, W * 0.8);

      const metrics = [
        { value: '70%', label: 'Redução de Riscos', desc: 'Gaps identificados e tratados proativamente' },
        { value: '50h+', label: 'Horas Economizadas', desc: 'Automação de auditorias e relatórios mensais' },
        { value: '45+', label: 'Requisitos Regulatórios', desc: 'Frameworks pré-configurados prontos para uso' },
        { value: '100%', label: 'Rastreabilidade', desc: 'Trilha de auditoria completa de todas as ações' },
      ];

      const spacing = W / 5;
      metrics.forEach((m, i) => {
        drawMetricBlock(ctx, spacing * (i + 1), H * 0.45, m.value, m.label, m.desc);
      });

      // Additional benefits below
      drawHLine(ctx, H * 0.68, W * 0.2, W * 0.8);
      drawBulletList(ctx, [
        'Redução de até 60% no tempo de preparação para auditorias externas',
        'Centralização de evidências elimina re-trabalho entre equipes',
        'Dashboards executivos prontos para apresentação à diretoria',
      ], W * 0.22, H * 0.74, { spacing: 48, fontSize: 24 });

      drawFooterLogo(ctx, logo);
      break;
    }

    case 'demo-servicos': {
      bgDemo(ctx, 109);
      drawTitle(ctx, 'Formas de Contratar');
      drawSubtitle(ctx, 'Escolha o modelo ideal para o seu negócio');
      drawHLine(ctx, H * 0.24, W * 0.2, W * 0.8);

      const cw = 760, ch = 520;
      const gap = 80;
      const sx = (W - (cw * 2 + gap)) / 2;
      const cy = H * 0.30;

      // Card 1 - Consultoria
      drawContentCard(ctx, sx, cy, cw, ch, '🎯  Consultoria Completa', [
        'Projeto de adequação end-to-end',
        'Diagnóstico inicial de maturidade',
        'Implementação de controles e processos',
        'Criação de políticas sob medida',
        'Treinamento da equipe interna',
        'Acompanhamento mensal de evolução',
        'Acesso completo à plataforma incluído',
        'Relatórios executivos personalizados',
        'Suporte prioritário durante o projeto',
      ]);

      // Card 2 - SaaS
      drawContentCard(ctx, sx + cw + gap, cy, cw, ch, '☁️  Plataforma SaaS', [
        'Acesso imediato a todos os módulos',
        'Frameworks pré-configurados (NIST, ISO...)',
        'IA para geração de planos e políticas',
        'Multi-organização e RBAC',
        'Portal de fornecedores incluído',
        'Atualizações automáticas contínuas',
        'Suporte por chat e e-mail',
        'R$ 449,90/mês — 7 dias grátis',
        'Sem contrato mínimo de permanência',
      ]);

      drawFooterLogo(ctx, logo);
      break;
    }

    case 'demo-frameworks': {
      bgDemo(ctx, 110);
      drawTitle(ctx, 'Frameworks Suportados');
      drawSubtitle(ctx, 'Conformidade com os principais padrões do mercado');
      drawHLine(ctx, H * 0.24, W * 0.2, W * 0.8);

      const frameworks = [
        { name: 'NIST CSF 2.0', desc: '6 funções, 22 categorias, 106 subcategorias' },
        { name: 'ISO 27001:2022', desc: '4 temas, 93 controles do Anexo A' },
        { name: 'ISO 27701:2019', desc: 'Extensão de privacidade da ISO 27001' },
        { name: 'BCB/CMN 4.893', desc: 'Requisitos de segurança cibernética' },
        { name: 'CIS Controls v8', desc: '18 controles críticos de segurança' },
        { name: 'SOC 2', desc: 'Trust Services Criteria (TSC)' },
        { name: 'LGPD', desc: 'Lei Geral de Proteção de Dados' },
        { name: 'Frameworks Custom', desc: 'Crie seus próprios frameworks e controles' },
      ];

      const cols = 2, rows = 4;
      const cw = 760, ch = 80, gx = 80, gy = 24;
      const sx = (W - (cw * cols + gx)) / 2;
      const sy = H * 0.31;

      frameworks.forEach((fw, i) => {
        const col = i % cols, row = Math.floor(i / cols);
        const x = sx + col * (cw + gx);
        const y = sy + row * (ch + gy);

        ctx.fillStyle = 'rgba(26,31,46,0.5)';
        ctx.strokeStyle = 'rgba(46,92,255,0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x, y, cw, ch, 8);
        ctx.fill(); ctx.stroke();

        ctx.font = 'bold 26px "Space Grotesk", sans-serif';
        ctx.fillStyle = COLORS.nebula; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(fw.name, x + 24, y + ch / 2 - 2);

        ctx.font = '20px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#CBD5E1';
        ctx.fillText(fw.desc, x + 280, y + ch / 2 - 2, cw - 310);
      });

      // Mapeamento note
      ctx.font = '22px "Space Grotesk", sans-serif';
      ctx.fillStyle = COLORS.lightGray; ctx.textAlign = 'center';
      ctx.fillText('✦  Mapeamento automático entre frameworks para reaproveitar controles', W / 2, H * 0.85);

      drawFooterLogo(ctx, logo);
      break;
    }

    case 'demo-pricing': {
      bgDemo(ctx, 111);
      drawTitle(ctx, 'Plano & Investimento');
      drawSubtitle(ctx, 'Tudo incluso em um único plano — sem surpresas');
      drawHLine(ctx, H * 0.24, W * 0.2, W * 0.8);

      // Price block
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = 'bold 72px "Space Grotesk", sans-serif';
      ctx.fillStyle = COLORS.nebula;
      ctx.fillText('R$ 449,90', W / 2, H * 0.36);
      ctx.font = '26px "Space Grotesk", sans-serif';
      ctx.fillStyle = COLORS.lightGray;
      ctx.fillText('/mês  •  7 dias grátis  •  Sem contrato mínimo', W / 2, H * 0.43);

      drawHLine(ctx, H * 0.48, W * 0.25, W * 0.75);

      // Feature columns
      const col1 = [
        'Todos os módulos (GRC + VRM + Políticas)',
        'Frameworks ilimitados',
        'Geração de relatórios PDF/Excel',
        'Inteligência Artificial integrada',
        'Multi-organização',
      ];
      const col2 = [
        'Portal de fornecedores',
        'RBAC com 3 perfis de acesso',
        'Trilha de auditoria completa',
        'Notificações em tempo real',
        'Suporte por chat e e-mail',
      ];

      drawBulletList(ctx, col1, W * 0.18, H * 0.54, { spacing: 46, fontSize: 24 });
      drawBulletList(ctx, col2, W * 0.55, H * 0.54, { spacing: 46, fontSize: 24 });

      drawFooterLogo(ctx, logo);
      break;
    }

    case 'demo-diferencial': {
      bgDemo(ctx, 112);
      drawTitle(ctx, 'Diferenciais Competitivos');
      drawSubtitle(ctx, 'O que faz da CosmoSec a escolha certa');
      drawHLine(ctx, H * 0.24, W * 0.2, W * 0.8);

      const items = [
        { title: 'Multi-Organização', desc: 'Gerencie várias empresas em uma única conta — ideal para consultorias' },
        { title: 'RBAC Granular', desc: 'Três perfis (Admin, Analista, Auditor) com permissões precisas por funcionalidade' },
        { title: 'Trilha de Auditoria', desc: 'Cada ação é registrada com usuário, timestamp e IP — evidência nativa' },
        { title: 'IA Generativa Integrada', desc: 'Planos de ação, políticas e análises gerados por IA sem custo adicional' },
        { title: 'Portal Externo VRM', desc: 'Fornecedores respondem qualificações por link — sem necessidade de conta' },
        { title: 'Notificações em Tempo Real', desc: 'Centro de notificações com alertas de prazos, aprovações e alterações' },
        { title: 'Snapshots Temporais', desc: 'Salve versões do diagnóstico para comparar evolução ao longo do tempo' },
        { title: 'Importação Flexível', desc: 'Importe controles via CSV, dados via JSON e crie frameworks customizados' },
      ];

      const cols = 2, cw = 780, ch = 80, gx = 60, gy = 16;
      const sx = (W - (cw * cols + gx)) / 2;
      const sy = H * 0.30;

      items.forEach((item, i) => {
        const col = i % cols, row = Math.floor(i / cols);
        const x = sx + col * (cw + gx);
        const y = sy + row * (ch + gy);

        ctx.fillStyle = 'rgba(26,31,46,0.4)';
        ctx.strokeStyle = 'rgba(0,212,255,0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(x, y, cw, ch, 8); ctx.fill(); ctx.stroke();

        ctx.font = 'bold 22px "Space Grotesk", sans-serif';
        ctx.fillStyle = COLORS.nebula; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(item.title, x + 20, y + 28);

        ctx.font = '18px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#CBD5E1';
        ctx.fillText(item.desc, x + 20, y + 56, cw - 40);
      });

      drawFooterLogo(ctx, logo);
      break;
    }
  }
}
