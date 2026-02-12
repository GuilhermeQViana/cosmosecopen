import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarField } from '@/components/ui/star-field';
import { CosmoSecLogo } from '@/components/ui/CosmoSecLogo';

export default function TermosDeUso() {
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
            <CardTitle className="text-3xl font-space">Termos de Uso</CardTitle>
            <p className="text-muted-foreground">Última atualização: {currentDate}</p>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-6">
            
            <section>
              <h2 className="text-xl font-semibold text-foreground">Identificação do Prestador</h2>
              <div className="bg-muted/30 p-4 rounded-lg text-muted-foreground">
                <p><strong>CosmoSec Tecnologia Ltda.</strong></p>
                <p>CNPJ: 00.000.000/0001-00</p>
                <p>Telefone: (21) 99925-3788</p>
                <p>Email: <a href="mailto:contato@cosmosec.com.br" className="text-primary hover:underline">contato@cosmosec.com.br</a></p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">1. Aceitação dos Termos</h2>
              <p className="text-muted-foreground">
                Ao assinar o contrato de prestação de serviços e/ou acessar a plataforma CosmoSec ("Serviço"), 
                você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concorda com 
                qualquer parte destes termos, não poderá acessar o Serviço.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">2. Descrição do Serviço</h2>
              <p className="text-muted-foreground">
                O CosmoSec é uma plataforma de Governança, Riscos e Conformidade (GRC) que oferece:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Gestão de conformidade com frameworks de segurança (NIST CSF, ISO 27001, BCB/CMN, entre outros)</li>
                <li>Gestão de riscos de segurança da informação</li>
                <li>Gestão de fornecedores e terceiros (VRM), incluindo due diligence, SLA tracking e portal de fornecedores</li>
                <li>Gestão de políticas com editor inteligente, fluxos de aprovação, campanhas de aceite e versionamento</li>
                <li>Repositório de evidências e documentação</li>
                <li>Planos de ação e remediação</li>
                <li>Relatórios e dashboards executivos gerados por inteligência artificial</li>
                <li>Funcionalidades assistidas por IA, incluindo geração de políticas, planos de ação e análise de riscos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">3. Elegibilidade</h2>
              <p className="text-muted-foreground">
                O Serviço é destinado exclusivamente para uso empresarial e profissional. Ao utilizar o 
                CosmoSec, você declara que:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Tem pelo menos 18 anos de idade</li>
                <li>Possui autorização para vincular sua organização a estes termos</li>
                <li>Utilizará o Serviço apenas para fins legítimos de negócios</li>
                <li>Passou pelo processo de demonstração e formalizou a contratação</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">4. Conta e Credenciais</h2>
              <p className="text-muted-foreground">
                Você é responsável por manter a confidencialidade de suas credenciais de acesso e por 
                todas as atividades realizadas em sua conta. Você concorda em:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Notificar imediatamente sobre qualquer uso não autorizado</li>
                <li>Não compartilhar credenciais de acesso</li>
                <li>Utilizar senhas fortes e únicas</li>
                <li>Manter seus dados de cadastro atualizados</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">5. Uso Aceitável</h2>
              <p className="text-muted-foreground">
                Ao utilizar o Serviço, você concorda em NÃO:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Violar leis ou regulamentos aplicáveis</li>
                <li>Tentar acessar dados de outras organizações</li>
                <li>Realizar engenharia reversa ou descompilar o software</li>
                <li>Utilizar o Serviço para atividades ilegais ou fraudulentas</li>
                <li>Sobrecarregar intencionalmente a infraestrutura</li>
                <li>Transmitir malware ou código malicioso</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">6. Propriedade Intelectual</h2>
              <p className="text-muted-foreground">
                O Serviço, incluindo seu design, código, funcionalidades e documentação, é propriedade 
                exclusiva do CosmoSec e está protegido por leis de propriedade intelectual. Você mantém 
                todos os direitos sobre os dados que inserir na plataforma.
              </p>
              <p className="text-muted-foreground mt-2">
                Conteúdos gerados pelas funcionalidades de inteligência artificial da plataforma (políticas, 
                planos de ação, relatórios, guias de implementação) são de propriedade do cliente, cabendo 
                ao CosmoSec apenas o papel de ferramenta facilitadora.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">7. Contratação e Pagamentos</h2>
              <p className="text-muted-foreground">
                O acesso ao CosmoSec é condicionado à formalização de contrato de prestação de serviços. 
                As condições comerciais são as seguintes:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Os valores e condições são definidos em proposta comercial individualizada</li>
                <li>Planos mensais ou anuais conforme acordado em contrato</li>
                <li>Pagamento via boleto bancário, Pix ou cartão de crédito</li>
                <li>Renovação automática, salvo manifestação contrária com 30 dias de antecedência ao término do período vigente</li>
                <li>Condições de rescisão conforme cláusulas do contrato firmado entre as partes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">8. Disponibilidade do Serviço</h2>
              <p className="text-muted-foreground">
                Nos esforçamos para manter o Serviço disponível 24/7, mas não garantimos disponibilidade 
                ininterrupta. Manutenções programadas serão comunicadas com antecedência. O CosmoSec não 
                se responsabiliza por indisponibilidades causadas por terceiros ou força maior.
              </p>
              <p className="text-muted-foreground mt-2">
                Níveis de serviço (SLA) específicos podem ser definidos em contrato, conforme a proposta 
                comercial acordada entre as partes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">9. Limitação de Responsabilidade</h2>
              <p className="text-muted-foreground">
                O CosmoSec é uma ferramenta de apoio à gestão de conformidade e riscos. NÃO garantimos 
                conformidade automática com frameworks ou regulamentos. A responsabilidade final pela 
                conformidade é da organização usuária. Em nenhuma circunstância seremos responsáveis por 
                danos indiretos, incidentais ou consequenciais.
              </p>
              <p className="text-muted-foreground mt-2">
                Os conteúdos gerados por inteligência artificial são sugestões e devem ser revisados por 
                profissionais qualificados antes de sua adoção. O CosmoSec não se responsabiliza por 
                decisões tomadas exclusivamente com base em outputs automatizados.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">10. Modificações nos Termos</h2>
              <p className="text-muted-foreground">
                Reservamo-nos o direito de modificar estes Termos a qualquer momento. Alterações 
                significativas serão comunicadas por email com pelo menos 30 dias de antecedência. 
                O uso continuado após alterações constitui aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">11. Confidencialidade e Proteção de Dados</h2>
              <p className="text-muted-foreground">
                O CosmoSec compromete-se a manter a confidencialidade de todos os dados inseridos pelo 
                cliente na plataforma. O tratamento de dados pessoais é realizado em conformidade com a 
                Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
              </p>
              <p className="text-muted-foreground mt-2">
                Para informações detalhadas sobre coleta, uso e proteção de dados, consulte nossa{' '}
                <Link to="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link> e 
                nossa{' '}
                <Link to="/lgpd" className="text-primary hover:underline">Política de Proteção de Dados (LGPD)</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">12. Lei Aplicável e Foro</h2>
              <p className="text-muted-foreground">
                Estes Termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa 
                será resolvida no foro da comarca de São Paulo/SP, com renúncia a qualquer outro, por 
                mais privilegiado que seja.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">13. Contato</h2>
              <p className="text-muted-foreground">
                Para dúvidas sobre estes Termos de Uso, entre em contato:
              </p>
              <div className="bg-muted/30 p-4 rounded-lg text-muted-foreground">
                <p>Email: <a href="mailto:legal@cosmosec.com.br" className="text-primary hover:underline">legal@cosmosec.com.br</a></p>
                <p>Telefone: (21) 99925-3788</p>
              </div>
            </section>

          </CardContent>
        </Card>
      </main>
    </div>
  );
}
