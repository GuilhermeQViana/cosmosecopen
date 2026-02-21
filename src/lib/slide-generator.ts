// Slide Generator - Canvas 2D API for 1920x1080 presentation slides

const COLORS = {
  deepVoid: '#0B0E14',
  eventHorizon: '#2E5CFF',
  nebula: '#00D4FF',
  celestialDawn: '#F8FAFC',
  darkGray: '#1A1F2E',
  mediumGray: '#2A3040',
  lightGray: '#94A3B8',
};

const W = 1920;
const H = 1080;

// ─── Utility Helpers ───────────────────────────────────────────

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function drawStars(ctx: CanvasRenderingContext2D, count: number, seed = 42) {
  const rand = seededRandom(seed);
  for (let i = 0; i < count; i++) {
    const x = rand() * W;
    const y = rand() * H;
    const r = rand() * 1.8 + 0.3;
    const alpha = rand() * 0.5 + 0.1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fill();
  }
}

function drawConstellationLines(ctx: CanvasRenderingContext2D, seed = 77) {
  const rand = seededRandom(seed);
  ctx.strokeStyle = 'rgba(46, 92, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 12; i++) {
    const x1 = rand() * W;
    const y1 = rand() * H;
    const x2 = x1 + (rand() - 0.5) * 400;
    const y2 = y1 + (rand() - 0.5) * 300;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

function drawOrbitalCircles(ctx: CanvasRenderingContext2D) {
  const circles = [
    { x: W * 0.15, y: H * 0.2, r: 180 },
    { x: W * 0.85, y: H * 0.75, r: 220 },
    { x: W * 0.5, y: H * 0.5, r: 320 },
  ];
  circles.forEach(c => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

function drawCyberGrid(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = 'rgba(46, 92, 255, 0.07)';
  ctx.lineWidth = 1;
  const spacing = 60;
  for (let x = 0; x <= W; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y <= H; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  // Accent intersections
  ctx.fillStyle = 'rgba(0, 212, 255, 0.15)';
  for (let x = 0; x <= W; x += spacing * 3) {
    for (let y = 0; y <= H; y += spacing * 3) {
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawGlowOrb(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha: number) {
  const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
  grad.addColorStop(0, color.replace(')', `, ${alpha})`).replace('rgb', 'rgba'));
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

function drawHorizontalLine(ctx: CanvasRenderingContext2D, y: number, xStart: number, xEnd: number) {
  const grad = ctx.createLinearGradient(xStart, y, xEnd, y);
  grad.addColorStop(0, 'rgba(46, 92, 255, 0)');
  grad.addColorStop(0.3, 'rgba(46, 92, 255, 0.4)');
  grad.addColorStop(0.7, 'rgba(0, 212, 255, 0.4)');
  grad.addColorStop(1, 'rgba(0, 212, 255, 0)');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(xStart, y);
  ctx.lineTo(xEnd, y);
  ctx.stroke();
}

// ─── Background Variants ────────────────────────────────────────

function bgDeepVoid(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = COLORS.deepVoid;
  ctx.fillRect(0, 0, W, H);
  drawStars(ctx, 200);
  drawConstellationLines(ctx);
  drawOrbitalCircles(ctx);
}

function bgGradientDiagonal(ctx: CanvasRenderingContext2D) {
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, COLORS.deepVoid);
  grad.addColorStop(0.5, '#0D1220');
  grad.addColorStop(1, '#0A1628');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  drawStars(ctx, 100, 99);
  drawGlowOrb(ctx, W * 0.8, H * 0.2, 400, 'rgb(46, 92, 255)', 0.06);
  drawGlowOrb(ctx, W * 0.2, H * 0.8, 350, 'rgb(0, 212, 255)', 0.05);
}

function bgCyberGrid(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = COLORS.deepVoid;
  ctx.fillRect(0, 0, W, H);
  drawCyberGrid(ctx);
  drawStars(ctx, 60, 33);
  drawGlowOrb(ctx, W * 0.5, H * 0.5, 500, 'rgb(46, 92, 255)', 0.04);
}

function bgLight(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = COLORS.celestialDawn;
  ctx.fillRect(0, 0, W, H);
  // Subtle blue accents
  ctx.strokeStyle = 'rgba(46, 92, 255, 0.06)';
  ctx.lineWidth = 1;
  for (let y = 80; y < H; y += 80) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  drawGlowOrb(ctx, W * 0.85, H * 0.15, 300, 'rgb(46, 92, 255)', 0.04);
  drawGlowOrb(ctx, W * 0.1, H * 0.9, 250, 'rgb(0, 212, 255)', 0.03);
}

// ─── Text Helpers ───────────────────────────────────────────────

interface TextOptions {
  font?: string;
  color?: string;
  align?: CanvasTextAlign;
  maxWidth?: number;
}

function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, opts: TextOptions = {}) {
  ctx.font = opts.font || '32px "Space Grotesk", sans-serif';
  ctx.fillStyle = opts.color || '#FFFFFF';
  ctx.textAlign = opts.align || 'center';
  ctx.textBaseline = 'middle';
  if (opts.maxWidth) {
    ctx.fillText(text, x, y, opts.maxWidth);
  } else {
    ctx.fillText(text, x, y);
  }
}

function drawPlaceholder(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, w: number, h: number, isDark = true) {
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';
  ctx.lineWidth = 1;
  ctx.setLineDash([8, 4]);
  ctx.strokeRect(x - w / 2, y - h / 2, w, h);
  ctx.setLineDash([]);
  drawText(ctx, text, x, y, {
    font: '20px "Space Grotesk", sans-serif',
    color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)',
  });
}

// ─── Logo Loading ───────────────────────────────────────────────

function loadLogo(): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = '/brand/cosmosec-logo-static.svg';
  });
}

function drawLogoOnCanvas(ctx: CanvasRenderingContext2D, logo: HTMLImageElement, x: number, y: number, size: number) {
  ctx.drawImage(logo, x - size / 2, y - size / 2, size, size);
}

// ─── Slide Type Definitions ─────────────────────────────────────

export interface SlideDefinition {
  id: string;
  name: string;
  category: 'fundos' | 'capas' | 'transicao' | 'finalizacao' | 'demo';
  description: string;
}

export const SLIDE_DEFINITIONS: SlideDefinition[] = [
  // Fundos
  { id: 'bg-deep-void', name: 'Deep Void + Constelações', category: 'fundos', description: 'Fundo escuro com estrelas e linhas de constelação' },
  { id: 'bg-gradient', name: 'Gradiente Azul-Cyan', category: 'fundos', description: 'Gradiente diagonal sutil com orbes luminosos' },
  { id: 'bg-cyber-grid', name: 'Grid Cybersec', category: 'fundos', description: 'Grade geométrica estilo cybersecurity' },
  { id: 'bg-light', name: 'Fundo Claro', category: 'fundos', description: 'Fundo branco com detalhes azuis para slides de dados' },
  // Capas
  { id: 'cover-empresa', name: 'Capa — Empresas', category: 'capas', description: 'Logo + subtítulo GRC para apresentação a empresas' },
  { id: 'cover-consultor', name: 'Capa — Consultores', category: 'capas', description: 'Logo + subtítulo para consultores independentes' },
  // Transição
  { id: 'trans-number', name: 'Número de Seção', category: 'transicao', description: 'Número grande + área para título da seção' },
  { id: 'trans-icon', name: 'Ícone + Título', category: 'transicao', description: 'Área central para ícone com título abaixo' },
  { id: 'trans-minimal', name: 'Linha Decorativa', category: 'transicao', description: 'Slide minimalista com linha gradiente e título' },
  // Finalização
  { id: 'end-thanks', name: 'Obrigado', category: 'finalizacao', description: 'Slide de agradecimento com logo e contato' },
  { id: 'end-next', name: 'Próximos Passos', category: 'finalizacao', description: 'CTA com 3 bullet points e próximos passos' },
  // Demonstração
  { id: 'demo-problema', name: 'O Problema', category: 'demo', description: 'Dores do mercado: auditorias manuais, planilhas, gaps' },
  { id: 'demo-solucao', name: 'A Solução', category: 'demo', description: 'CosmoSec como plataforma unificada GRC + VRM + Políticas' },
  { id: 'demo-modulos', name: 'Três Módulos', category: 'demo', description: 'Visão geral dos módulos GRC, VRM e Políticas' },
  { id: 'demo-grc', name: 'Módulo GRC', category: 'demo', description: 'Diagnóstico, Riscos, Evidências, Plano de Ação' },
  { id: 'demo-vrm', name: 'Módulo VRM', category: 'demo', description: 'Avaliação, Qualificação, Contratos, Due Diligence' },
  { id: 'demo-politicas', name: 'Módulo Políticas', category: 'demo', description: 'Editor, Workflows, Campanhas de Aceite, Templates' },
  { id: 'demo-ia', name: 'Inteligência Artificial', category: 'demo', description: 'IA para planos de ação, políticas e análise de risco' },
  { id: 'demo-beneficios', name: 'Impacto Mensurável', category: 'demo', description: 'Métricas: 70% redução de riscos, 50h economizadas' },
  { id: 'demo-servicos', name: 'Formas de Contratar', category: 'demo', description: 'Consultoria Completa vs. Plataforma SaaS' },
  { id: 'demo-frameworks', name: 'Frameworks Suportados', category: 'demo', description: 'NIST, ISO 27001, BCB/CMN, CIS, Custom' },
  { id: 'demo-pricing', name: 'Plano & Investimento', category: 'demo', description: 'R$ 449,90/mês com tudo incluso' },
  { id: 'demo-diferencial', name: 'Diferenciais', category: 'demo', description: 'Multi-org, RBAC, trilha de auditoria, IA integrada' },
];

// ─── Render Each Slide ──────────────────────────────────────────

async function renderSlide(ctx: CanvasRenderingContext2D, slideId: string) {
  const logo = await loadLogo();

  switch (slideId) {
    // ── Backgrounds ──
    case 'bg-deep-void':
      bgDeepVoid(ctx);
      break;

    case 'bg-gradient':
      bgGradientDiagonal(ctx);
      break;

    case 'bg-cyber-grid':
      bgCyberGrid(ctx);
      break;

    case 'bg-light':
      bgLight(ctx);
      break;

    // ── Covers ──
    case 'cover-empresa': {
      bgGradientDiagonal(ctx);
      drawLogoOnCanvas(ctx, logo, W / 2, H * 0.32, 180);
      drawText(ctx, 'CosmoSec', W / 2, H * 0.50, { font: 'bold 72px "Space Grotesk", sans-serif', color: '#FFFFFF' });
      drawText(ctx, 'Plataforma Integrada de GRC e Gestão de Riscos', W / 2, H * 0.58, {
        font: '28px "Space Grotesk", sans-serif',
        color: COLORS.nebula,
      });
      drawHorizontalLine(ctx, H * 0.64, W * 0.3, W * 0.7);
      drawPlaceholder(ctx, '[Nome da Empresa]', W / 2, H * 0.74, 600, 60);
      drawText(ctx, 'Proposta Comercial', W / 2, H * 0.84, {
        font: '22px "Space Grotesk", sans-serif',
        color: COLORS.lightGray,
      });
      break;
    }

    case 'cover-consultor': {
      bgDeepVoid(ctx);
      drawLogoOnCanvas(ctx, logo, W / 2, H * 0.30, 160);
      drawText(ctx, 'CosmoSec', W / 2, H * 0.47, { font: 'bold 68px "Space Grotesk", sans-serif', color: '#FFFFFF' });
      drawText(ctx, 'Solução para Consultores Independentes', W / 2, H * 0.55, {
        font: '28px "Space Grotesk", sans-serif',
        color: COLORS.nebula,
      });
      drawHorizontalLine(ctx, H * 0.61, W * 0.3, W * 0.7);
      drawPlaceholder(ctx, '[Seu Nome / Consultoria]', W / 2, H * 0.72, 600, 60);
      drawPlaceholder(ctx, '[Contato / Website]', W / 2, H * 0.83, 500, 50);
      break;
    }

    // ── Transitions ──
    case 'trans-number': {
      bgGradientDiagonal(ctx);
      drawText(ctx, '01', W * 0.15, H * 0.48, {
        font: 'bold 220px "Space Grotesk", sans-serif',
        color: 'rgba(46, 92, 255, 0.15)',
        align: 'left',
      });
      drawHorizontalLine(ctx, H * 0.52, W * 0.38, W * 0.85);
      drawPlaceholder(ctx, '[Título da Seção]', W * 0.62, H * 0.44, 500, 60);
      drawText(ctx, 'Adicione uma breve descrição da seção aqui', W * 0.62, H * 0.58, {
        font: '22px "Space Grotesk", sans-serif',
        color: COLORS.lightGray,
      });
      break;
    }

    case 'trans-icon': {
      bgDeepVoid(ctx);
      // Placeholder circle for icon
      ctx.beginPath();
      ctx.arc(W / 2, H * 0.38, 60, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
      drawText(ctx, '🛡️', W / 2, H * 0.38, { font: '48px sans-serif' });
      drawPlaceholder(ctx, '[Título da Seção]', W / 2, H * 0.56, 600, 60);
      drawText(ctx, 'Substitua o ícone e o título no PowerPoint', W / 2, H * 0.66, {
        font: '20px "Space Grotesk", sans-serif',
        color: COLORS.lightGray,
      });
      break;
    }

    case 'trans-minimal': {
      bgGradientDiagonal(ctx);
      drawHorizontalLine(ctx, H * 0.48, W * 0.15, W * 0.85);
      drawPlaceholder(ctx, '[Título da Seção]', W / 2, H * 0.40, 700, 60);
      drawText(ctx, 'Slide de transição minimalista', W / 2, H * 0.56, {
        font: '22px "Space Grotesk", sans-serif',
        color: COLORS.lightGray,
      });
      // Small logo bottom-right
      drawLogoOnCanvas(ctx, logo, W - 80, H - 60, 40);
      break;
    }

    // ── Endings ──
    case 'end-thanks': {
      bgGradientDiagonal(ctx);
      drawLogoOnCanvas(ctx, logo, W / 2, H * 0.28, 120);
      drawText(ctx, 'Obrigado!', W / 2, H * 0.45, { font: 'bold 80px "Space Grotesk", sans-serif', color: '#FFFFFF' });
      drawHorizontalLine(ctx, H * 0.54, W * 0.35, W * 0.65);
      drawPlaceholder(ctx, '[Seu Nome]', W / 2, H * 0.64, 400, 50);
      drawPlaceholder(ctx, '[email@empresa.com]', W / 2, H * 0.73, 400, 50);
      // QR code placeholder
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(W / 2 - 55, H * 0.80, 110, 110);
      ctx.setLineDash([]);
      drawText(ctx, 'QR Code', W / 2, H * 0.85, {
        font: '14px "Space Grotesk", sans-serif',
        color: 'rgba(255,255,255,0.3)',
      });
      break;
    }

    case 'end-next': {
      bgDeepVoid(ctx);
      drawText(ctx, 'Próximos Passos', W / 2, H * 0.15, { font: 'bold 56px "Space Grotesk", sans-serif', color: '#FFFFFF' });
      drawHorizontalLine(ctx, H * 0.22, W * 0.3, W * 0.7);

      const bullets = [
        { num: '01', placeholder: '[Primeiro passo — ex: Agendar demo técnica]' },
        { num: '02', placeholder: '[Segundo passo — ex: Configurar ambiente piloto]' },
        { num: '03', placeholder: '[Terceiro passo — ex: Iniciar onboarding da equipe]' },
      ];
      bullets.forEach((b, i) => {
        const y = H * 0.35 + i * (H * 0.16);
        drawText(ctx, b.num, W * 0.18, y, {
          font: 'bold 48px "Space Grotesk", sans-serif',
          color: COLORS.eventHorizon,
          align: 'right',
        });
        drawPlaceholder(ctx, b.placeholder, W * 0.55, y, 700, 55);
      });

      drawLogoOnCanvas(ctx, logo, W - 80, H - 60, 40);
      drawText(ctx, 'cosmosec.com.br', W - 130, H - 30, {
        font: '16px "Space Grotesk", sans-serif',
        color: COLORS.lightGray,
        align: 'right',
      });
      break;
    }
  }
}

// ─── Public API ──────────────────────────────────────────────────

export async function generateSlideToCanvas(canvas: HTMLCanvasElement, slideId: string) {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, W, H);
  await renderSlide(ctx, slideId);
}

export async function generatePreview(canvas: HTMLCanvasElement, slideId: string) {
  // Render at full res then the canvas CSS will scale it down
  await generateSlideToCanvas(canvas, slideId);
}

export async function downloadSlide(slideId: string, name: string) {
  const canvas = document.createElement('canvas');
  await generateSlideToCanvas(canvas, slideId);
  return new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cosmosec-${slideId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      resolve();
    }, 'image/png');
  });
}

export async function downloadAllSlides() {
  for (const slide of SLIDE_DEFINITIONS) {
    await downloadSlide(slide.id, slide.name);
    // Small delay between downloads
    await new Promise(r => setTimeout(r, 300));
  }
}
