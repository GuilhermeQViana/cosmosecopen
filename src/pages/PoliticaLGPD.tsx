import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, FileText, UserCheck, Database, Bell } from 'lucide-react';
import { DPO_EMAIL, WHATSAPP_DISPLAY } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarField } from '@/components/ui/star-field';
import { CosmoSecLogo } from '@/components/ui/CosmoSecLogo';

export default function PoliticaLGPD() {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const rights = [
    {
      icon: Eye,
      title: 'Acesso',
      description: 'Solicitar cópia de todos os dados pessoais que tratamos sobre você.'
    },
    {
      icon: FileText,
      title: 'Correção',
      description: 'Corrigir dados incompletos, inexatos ou desatualizados.'
    },
    {
      icon: Database,
      title: 'Portabilidade',
      description: 'Receber seus dados em formato estruturado para transferir a outro serviço.'
    },
    {
      icon: Lock,
      title: 'Eliminação',
      description: 'Solicitar a exclusão de dados desnecessários ou tratados sem base legal.'
    },
    {
      icon: Bell,
      title: 'Informação',
      description: 'Saber com quem compartilhamos seus dados e para quais finalidades.'
    },
    {
      icon: UserCheck,
      title: 'Revogação',
      description: 'Retirar o consentimento a qualquer momento, quando aplicável.'
    },
  ];

  return (
    <div className="min-h-screen bg-background relative">
      <StarField starCount={50} dustCount={15} />
      
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <CosmoSecLogo size="sm" />
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Hero */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-space">Proteção de Dados (LGPD)</CardTitle>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              O CosmoSec está comprometido com a proteção dos seus dados pessoais em conformidade 
              com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
            </p>
            <p className="text-sm text-muted-foreground">Última atualização: {currentDate}</p>
          </CardHeader>
        </Card>

        {/* Seus Direitos */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Seus Direitos como Titular</CardTitle>
            <p className="text-muted-foreground">
              A LGPD garante diversos direitos sobre seus dados pessoais. Você pode exercê-los 
              a qualquer momento entrando em contato conosco.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {rights.map((right, index) => (
                <div key={index} className="flex gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <right.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{right.title}</h4>
                    <p className="text-sm text-muted-foreground">{right.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Como Exercer */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Como Exercer Seus Direitos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-semibold flex items-center justify-center text-sm flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Envie uma solicitação</h4>
                  <p className="text-sm text-muted-foreground">
                    Entre em contato pelo email <a href={`mailto:${DPO_EMAIL}`} className="text-primary hover:underline">{DPO_EMAIL}</a> informando 
                    qual direito deseja exercer.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-semibold flex items-center justify-center text-sm flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Validação de identidade</h4>
                  <p className="text-sm text-muted-foreground">
                    Para sua segurança, podemos solicitar informações adicionais para confirmar sua identidade.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-semibold flex items-center justify-center text-sm flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Prazo de resposta</h4>
                  <p className="text-sm text-muted-foreground">
                    Responderemos sua solicitação em até 15 dias úteis, conforme estabelecido pela LGPD.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bases Legais */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Bases Legais para Tratamento</CardTitle>
            <p className="text-muted-foreground">
              Tratamos seus dados pessoais com base nas seguintes hipóteses legais previstas na LGPD:
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-foreground">Finalidade</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Base Legal (Art. 7º)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="px-4 py-3 text-muted-foreground">Prestação do serviço contratado</td>
                    <td className="px-4 py-3 text-muted-foreground">Execução de contrato (V)</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-3 text-muted-foreground">Processamento de pagamentos</td>
                    <td className="px-4 py-3 text-muted-foreground">Execução de contrato (V)</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-3 text-muted-foreground">Envio de comunicações sobre o serviço</td>
                    <td className="px-4 py-3 text-muted-foreground">Legítimo interesse (IX)</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-3 text-muted-foreground">Segurança e prevenção a fraudes</td>
                    <td className="px-4 py-3 text-muted-foreground">Legítimo interesse (IX)</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-3 text-muted-foreground">Cumprimento de obrigações fiscais</td>
                    <td className="px-4 py-3 text-muted-foreground">Obrigação legal (II)</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-3 text-muted-foreground">Marketing e newsletters</td>
                    <td className="px-4 py-3 text-muted-foreground">Consentimento (I)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Medidas de Segurança */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Medidas de Segurança Implementadas</CardTitle>
            <p className="text-muted-foreground">
              Adotamos medidas técnicas e administrativas aptas a proteger os dados pessoais:
            </p>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <h4 className="font-medium text-foreground mb-2">Técnicas</h4>
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  <li>Criptografia TLS 1.3 em trânsito</li>
                  <li>Criptografia AES-256 em repouso</li>
                  <li>Row-Level Security (RLS)</li>
                  <li>Autenticação multifator disponível</li>
                  <li>Proteção contra senhas vazadas</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <h4 className="font-medium text-foreground mb-2">Administrativas</h4>
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  <li>Controle de acesso baseado em funções</li>
                  <li>Logs de auditoria completos</li>
                  <li>Políticas de segurança documentadas</li>
                  <li>Treinamento de equipe</li>
                  <li>Plano de resposta a incidentes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transferência Internacional */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Transferência Internacional de Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Seus dados podem ser transferidos e armazenados em servidores localizados nos Estados Unidos, 
              através de nossos provedores de infraestrutura (AWS/Supabase). Esta transferência é realizada 
              com base no Art. 33 da LGPD, considerando:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Os provedores adotam cláusulas contratuais padrão aprovadas</li>
              <li>Mantêm certificações de segurança (SOC 2, ISO 27001)</li>
              <li>Garantem nível de proteção adequado aos dados</li>
            </ul>
          </CardContent>
        </Card>

        {/* Contato DPO */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Encarregado de Proteção de Dados (DPO)</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Para dúvidas, reclamações ou exercício de direitos relacionados a dados pessoais:
                </p>
                <p className="text-sm">
                  <strong>Email:</strong>{' '}
                  <a href={`mailto:${DPO_EMAIL}`} className="text-primary hover:underline">
                    {DPO_EMAIL}
                  </a>
                </p>
                <p className="text-sm">
                  <strong>Telefone:</strong> {WHATSAPP_DISPLAY}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ANPD */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Autoridade Nacional de Proteção de Dados</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              Caso entenda que o tratamento de seus dados pessoais viola a LGPD, você tem o direito 
              de peticionar à Autoridade Nacional de Proteção de Dados (ANPD):
            </p>
            <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border/50">
              <p><strong>Site:</strong> <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.gov.br/anpd</a></p>
              <p><strong>Email:</strong> <a href="mailto:anpd@anpd.gov.br" className="text-primary hover:underline">anpd@anpd.gov.br</a></p>
            </div>
          </CardContent>
        </Card>

        {/* Links relacionados */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link to="/termos">Termos de Uso</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/privacidade">Política de Privacidade</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
