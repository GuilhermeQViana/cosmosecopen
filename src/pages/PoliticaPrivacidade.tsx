import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarField } from '@/components/ui/star-field';
import { CosmoSecLogo } from '@/components/ui/CosmoSecLogo';

export default function PoliticaPrivacidade() {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

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

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-3xl font-space">Política de Privacidade</CardTitle>
            <p className="text-muted-foreground">Última atualização: {currentDate}</p>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-6">
            
            <section>
              <h2 className="text-xl font-semibold text-foreground">1. Introdução</h2>
              <p className="text-muted-foreground">
                Esta Política de Privacidade descreve como o CosmoSec coleta, usa, armazena e protege 
                suas informações pessoais quando você utiliza nossa plataforma de GRC. Estamos comprometidos 
                com a proteção de seus dados em conformidade com a Lei Geral de Proteção de Dados (LGPD - 
                Lei nº 13.709/2018).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">2. Controlador de Dados</h2>
              <p className="text-muted-foreground">
                O controlador dos dados pessoais coletados através do CosmoSec é:
              </p>
              <div className="bg-muted/30 p-4 rounded-lg text-muted-foreground">
                <p><strong>CosmoSec Tecnologia Ltda.</strong></p>
                <p>CNPJ: 00.000.000/0001-00</p>
                <p>Email: <a href="mailto:privacidade@cosmosec.com.br" className="text-primary hover:underline">privacidade@cosmosec.com.br</a></p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">3. Dados Coletados</h2>
              <p className="text-muted-foreground">Coletamos os seguintes tipos de dados:</p>
              
              <h3 className="text-lg font-medium text-foreground mt-4">3.1 Dados de Cadastro</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Nome completo</li>
                <li>Endereço de email</li>
                <li>Foto de perfil (opcional)</li>
                <li>Nome da organização</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground mt-4">3.2 Dados de Uso</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Logs de acesso e ações na plataforma</li>
                <li>Endereço IP</li>
                <li>Tipo de navegador e dispositivo</li>
                <li>Páginas visitadas e tempo de uso</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground mt-4">3.3 Dados de Negócio</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Avaliações de conformidade</li>
                <li>Registros de riscos</li>
                <li>Evidências e documentos carregados</li>
                <li>Informações de fornecedores</li>
                <li>Planos de ação</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground mt-4">3.4 Dados de Pagamento</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Informações de cobrança processadas pelo Stripe</li>
                <li>Histórico de transações</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">4. Finalidades do Tratamento</h2>
              <p className="text-muted-foreground">Utilizamos seus dados para:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Fornecer e manter o Serviço</li>
                <li>Processar pagamentos e gerenciar assinaturas</li>
                <li>Enviar comunicações sobre o serviço</li>
                <li>Melhorar a experiência do usuário</li>
                <li>Garantir a segurança da plataforma</li>
                <li>Cumprir obrigações legais</li>
                <li>Gerar relatórios e análises de conformidade</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">5. Base Legal</h2>
              <p className="text-muted-foreground">O tratamento de dados pessoais é realizado com base em:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li><strong>Execução de contrato:</strong> para prestação do serviço contratado</li>
                <li><strong>Legítimo interesse:</strong> para melhorias do serviço e segurança</li>
                <li><strong>Cumprimento de obrigação legal:</strong> para atender requisitos regulatórios</li>
                <li><strong>Consentimento:</strong> para comunicações de marketing (quando aplicável)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">6. Compartilhamento de Dados</h2>
              <p className="text-muted-foreground">Compartilhamos dados apenas com:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li><strong>Stripe:</strong> processamento de pagamentos</li>
                <li><strong>Resend:</strong> envio de emails transacionais</li>
                <li><strong>Supabase/AWS:</strong> infraestrutura e armazenamento</li>
                <li><strong>Autoridades:</strong> quando exigido por lei</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Não vendemos ou compartilhamos seus dados com terceiros para fins de marketing.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">7. Armazenamento e Segurança</h2>
              <p className="text-muted-foreground">
                Seus dados são armazenados em servidores seguros da AWS, localizados nos Estados Unidos, 
                com as seguintes medidas de proteção:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Criptografia em trânsito (TLS 1.3) e em repouso (AES-256)</li>
                <li>Controle de acesso baseado em funções (RBAC)</li>
                <li>Row-Level Security (RLS) para isolamento de dados</li>
                <li>Logs de auditoria de todas as ações</li>
                <li>Backups automáticos diários</li>
                <li>Monitoramento contínuo de segurança</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">8. Retenção de Dados</h2>
              <p className="text-muted-foreground">
                Mantemos seus dados pelo tempo necessário para:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li><strong>Dados de conta:</strong> enquanto a conta estiver ativa + 5 anos</li>
                <li><strong>Logs de auditoria:</strong> 5 anos (requisito regulatório)</li>
                <li><strong>Dados de pagamento:</strong> conforme exigido por lei tributária</li>
                <li><strong>Backups:</strong> 90 dias após exclusão</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">9. Seus Direitos (LGPD)</h2>
              <p className="text-muted-foreground">Você tem direito a:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li><strong>Confirmação e acesso:</strong> saber se tratamos seus dados e acessá-los</li>
                <li><strong>Correção:</strong> corrigir dados incompletos ou desatualizados</li>
                <li><strong>Anonimização ou eliminação:</strong> de dados desnecessários</li>
                <li><strong>Portabilidade:</strong> receber seus dados em formato estruturado</li>
                <li><strong>Informação:</strong> sobre compartilhamento com terceiros</li>
                <li><strong>Revogação:</strong> do consentimento a qualquer momento</li>
                <li><strong>Oposição:</strong> ao tratamento em certas circunstâncias</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Para exercer seus direitos, entre em contato: <a href="mailto:privacidade@cosmosec.com.br" className="text-primary hover:underline">privacidade@cosmosec.com.br</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">10. Cookies</h2>
              <p className="text-muted-foreground">
                Utilizamos apenas cookies essenciais para funcionamento da plataforma:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Sessão de autenticação</li>
                <li>Preferências de tema (claro/escuro)</li>
                <li>Token de segurança (CSRF)</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Não utilizamos cookies de rastreamento ou publicidade.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">11. Alterações nesta Política</h2>
              <p className="text-muted-foreground">
                Podemos atualizar esta Política periodicamente. Alterações significativas serão comunicadas 
                por email com 30 dias de antecedência. Recomendamos revisar esta página regularmente.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">12. Contato e DPO</h2>
              <p className="text-muted-foreground">
                Para questões sobre privacidade ou para contatar nosso Encarregado de Proteção de Dados (DPO):
              </p>
              <div className="bg-muted/30 p-4 rounded-lg text-muted-foreground">
                <p>Email: <a href="mailto:dpo@cosmosec.com.br" className="text-primary hover:underline">dpo@cosmosec.com.br</a></p>
                <p>Telefone: (21) 99925-3788</p>
              </div>
            </section>

          </CardContent>
        </Card>
      </main>
    </div>
  );
}
