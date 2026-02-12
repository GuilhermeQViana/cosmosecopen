import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { FrameworkProvider } from "@/contexts/FrameworkContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { VendorLayout } from "@/components/layout/VendorLayout";
import { PolicyLayout } from "@/components/layout/PolicyLayout";
import Landing from "@/pages/Landing";
import ConhecaCosmoSec from "@/pages/ConhecaCosmoSec";
import Auth from "@/pages/Auth";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Onboarding from "@/pages/Onboarding";
import SelecionarOrganizacao from "@/pages/SelecionarOrganizacao";
import SelecionarModulo from "@/pages/SelecionarModulo";
import SelecionarFramework from "@/pages/SelecionarFramework";
import Dashboard from "@/pages/Dashboard";
import Diagnostico from "@/pages/Diagnostico";
import Riscos from "@/pages/Riscos";
import Evidencias from "@/pages/Evidencias";
import PlanoAcao from "@/pages/PlanoAcao";
import Mapeamento from "@/pages/Mapeamento";
import Relatorios from "@/pages/Relatorios";
import Equipe from "@/pages/Equipe";
import Auditoria from "@/pages/Auditoria";
import Configuracoes from "@/pages/Configuracoes";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import Fornecedores from "@/pages/Fornecedores";
import FornecedoresDashboard from "@/pages/FornecedoresDashboard";
import VendorRequisitos from "@/pages/VendorRequisitos";
import VendorAgenda from "@/pages/VendorAgenda";
import VendorEvidencias from "@/pages/VendorEvidencias";
import Documentacao from "@/pages/Documentacao";
import Feedbacks from "@/pages/Feedbacks";
import BrandAssets from "@/pages/BrandAssets";
import TermosDeUso from "@/pages/TermosDeUso";
import PoliticaPrivacidade from "@/pages/PoliticaPrivacidade";
import PoliticaLGPD from "@/pages/PoliticaLGPD";
import VendorPortal from "@/pages/VendorPortal";
import PolicyDashboard from "@/pages/PolicyDashboard";
import Politicas from "@/pages/Politicas";
import PolicyWorkflows from "@/pages/PolicyWorkflows";
import PolicyAceite from "@/pages/PolicyAceite";
import PolicyTemplates from "@/pages/PolicyTemplates";
import PoliticaEditor from "@/pages/PoliticaEditor";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <OrganizationProvider>
              <FrameworkProvider>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/tour" element={<ConhecaCosmoSec />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/esqueci-senha" element={<ForgotPassword />} />
                  <Route path="/redefinir-senha" element={<ResetPassword />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/selecionar-organizacao" element={<SelecionarOrganizacao />} />
                  <Route path="/selecionar-modulo" element={<SelecionarModulo />} />
                  <Route path="/selecionar-framework" element={<SelecionarFramework />} />
                  <Route path="/checkout-success" element={<CheckoutSuccess />} />
                  <Route path="/documentacao" element={<Documentacao />} />
                  <Route path="/brand-assets" element={<BrandAssets />} />
                  <Route path="/termos" element={<TermosDeUso />} />
                  <Route path="/privacidade" element={<PoliticaPrivacidade />} />
                  <Route path="/lgpd" element={<PoliticaLGPD />} />
                  <Route path="/vendor-portal/:token" element={<VendorPortal />} />
                  
                  {/* Módulo Frameworks (GRC) */}
                  <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/diagnostico" element={<Diagnostico />} />
                    <Route path="/riscos" element={<Riscos />} />
                    <Route path="/evidencias" element={<Evidencias />} />
                    <Route path="/plano-acao" element={<PlanoAcao />} />
                    <Route path="/relatorios" element={<Relatorios />} />
                    <Route path="/mapeamento" element={<Mapeamento />} />
                    <Route path="/equipe" element={<Equipe />} />
                    <Route path="/auditoria" element={<Auditoria />} />
                    <Route path="/configuracoes" element={<Configuracoes />} />
                    <Route path="/feedbacks" element={<Feedbacks />} />
                  </Route>

                  {/* Módulo Fornecedores (VRM) */}
                  <Route element={<VendorLayout />}>
                    <Route path="/vrm" element={<FornecedoresDashboard />} />
                    <Route path="/vrm/fornecedores" element={<Fornecedores />} />
                    <Route path="/vrm/requisitos" element={<VendorRequisitos />} />
                    <Route path="/vrm/evidencias" element={<VendorEvidencias />} />
                    <Route path="/vrm/agenda" element={<VendorAgenda />} />
                    <Route path="/vrm/configuracoes" element={<Configuracoes />} />
                  </Route>

                  {/* Módulo Políticas (Policy Center) */}
                  <Route element={<PolicyLayout />}>
                    <Route path="/policies" element={<PolicyDashboard />} />
                    <Route path="/policies/central" element={<Politicas />} />
                    <Route path="/policies/central/:id" element={<PoliticaEditor />} />
                    <Route path="/policies/workflows" element={<PolicyWorkflows />} />
                    <Route path="/policies/aceite" element={<PolicyAceite />} />
                    <Route path="/policies/templates" element={<PolicyTemplates />} />
                    <Route path="/policies/configuracoes" element={<Configuracoes />} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </FrameworkProvider>
            </OrganizationProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
