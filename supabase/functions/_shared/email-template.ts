/**
 * Template de email centralizado da CosmoSec.
 * Garante consistência visual em todos os emails transacionais.
 */

interface EmailTemplateOptions {
  /** Emoji exibido no topo */
  emoji: string;
  /** Título principal do email */
  title: string;
  /** Cor de destaque do header (CSS gradient) */
  accentColor?: string;
  /** Conteúdo HTML do corpo do email */
  bodyHtml: string;
  /** Ano para o copyright (default: ano atual) */
  year?: number;
}

/**
 * Gera o HTML completo de um email com o layout padrão CosmoSec.
 * 
 * @example
 * ```ts
 * const html = buildEmailHtml({
 *   emoji: '🚀',
 *   title: 'Bem-vindo ao CosmoSec!',
 *   bodyHtml: '<p style="color: #e2e8f0;">Conteúdo aqui</p>',
 * });
 * ```
 */
export function buildEmailHtml(options: EmailTemplateOptions): string {
  const {
    emoji,
    title,
    accentColor = 'rgba(124, 58, 237, 0.2)',
    bodyHtml,
    year = new Date().getFullYear(),
  } = options;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a1a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, ${accentColor} 0%, transparent 100%);">
              <div style="font-size: 48px; margin-bottom: 16px;">${emoji}</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">${title}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; background: rgba(0, 0, 0, 0.2); border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
                &copy; ${year} CosmoSec. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Gera um botão CTA estilizado para emails.
 */
export function emailButton(text: string, href: string, gradient = 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', textColor = '#ffffff'): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
    <tr>
      <td align="center">
        <a href="${href}" style="display: inline-block; background: ${gradient}; color: ${textColor}; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">${text}</a>
      </td>
    </tr>
  </table>`;
}

/**
 * Gera uma caixa de destaque (info box) para emails.
 */
export function emailInfoBox(title: string, contentHtml: string, accentColor = '#a78bfa', bgColor = 'rgba(124, 58, 237, 0.1)', borderColor = 'rgba(124, 58, 237, 0.3)'): string {
  return `<div style="background: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 12px; padding: 24px; margin: 24px 0;">
    <h3 style="color: ${accentColor}; font-size: 14px; font-weight: 600; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 0.5px;">${title}</h3>
    ${contentHtml}
  </div>`;
}

/**
 * Gera parágrafo de saudação padrão.
 */
export function emailGreeting(name: string, highlightColor = '#a78bfa'): string {
  return `<p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
    Olá <strong style="color: ${highlightColor};">${name}</strong>,
  </p>`;
}

/**
 * Gera parágrafo de texto padrão.
 */
export function emailText(text: string): string {
  return `<p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">${text}</p>`;
}

/**
 * Gera texto secundário (muted).
 */
export function emailMutedText(text: string): string {
  return `<p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 20px 0;">${text}</p>`;
}
