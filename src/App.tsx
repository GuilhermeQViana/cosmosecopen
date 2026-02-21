import { lazy, Suspense } from "react";
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
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AUTH_ROUTE } from "@/lib/constants";

// Lazy loaded pages
const Landing = lazy(() => import("@/pages/Landing"));
const ConhecaCosmoSec = lazy(() => import("@/pages/ConhecaCosmoSec"));
const Gateway = lazy(() => import("@/pages/Gateway"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const SelecionarOrganizacao = lazy(() => import("@/pages/SelecionarOrganizacao"));
const SelecionarModulo = lazy(() => import("@/pages/SelecionarModulo"));
const SelecionarFramework = lazy(() => import("@/pages/SelecionarFramework"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Diagnostico = lazy(() => import("@/pages/Diagnostico"));
const Riscos = lazy(() => import("@/pages/Riscos"));
const Evidencias = lazy(() => import("@/pages/Evidencias"));
const PlanoAcao = lazy(() => import("@/pages/PlanoAcao"));
const Mapeamento = lazy(() => import("@/pages/Mapeamento"));
const Relatorios = lazy(() => import("@/pages/Relatorios"));
const Equipe = lazy(() => import("@/pages/Equipe"));
const Auditoria = lazy(() => import("@/pages/Auditoria"));
const Configuracoes = lazy(() => import("@/pages/Configuracoes"));
const CheckoutSuccess = lazy(() => import("@/pages/CheckoutSuccess"));
const Fornecedores = lazy(() => import("@/pages/Fornecedores"));
const FornecedoresDashboard = lazy(() => import("@/pages/FornecedoresDashboard"));
const VendorRequisitos = lazy(() => import("@/pages/VendorRequisitos"));
const VendorAgenda = lazy(() => import("@/pages/VendorAgenda"));
const VendorEvidencias = lazy(() => import("@/pages/VendorEvidencias"));
const Documentacao = lazy(() => import("@/pages/Documentacao"));
const Feedbacks = lazy(() => import("@/pages/Feedbacks"));
const BrandAssets = lazy(() => import("@/pages/BrandAssets"));
const TermosDeUso = lazy(() => import("@/pages/TermosDeUso"));
const PoliticaPrivacidade = lazy(() => import("@/pages/PoliticaPrivacidade"));
const PoliticaLGPD = lazy(() => import("@/pages/PoliticaLGPD"));
const PolicyDashboard = lazy(() => import("@/pages/PolicyDashboard"));
const Politicas = lazy(() => import("@/pages/Politicas"));
const PolicyWorkflows = lazy(() => import("@/pages/PolicyWorkflows"));
const PolicyAceite = lazy(() => import("@/pages/PolicyAceite"));
const PolicyTemplates = lazy(() => import("@/pages/PolicyTemplates"));
const PoliticaEditor = lazy(() => import("@/pages/PoliticaEditor"));
const QualificationTemplates = lazy(() => import("@/pages/QualificationTemplates"));
const QualificationTemplateBuilder = lazy(() => import("@/pages/QualificationTemplateBuilder"));
const QualificationCampaigns = lazy(() => import("@/pages/QualificationCampaigns"));
const VendorQualificationPortal = lazy(() => import("@/pages/VendorQualificationPortal"));
const AcceptInvite = lazy(() => import("@/pages/AcceptInvite"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const PageLoader = () => {
  // Lazy import to avoid circular deps - inline the cosmic loader
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-secondary/10 blur-3xl animate-pulse" style={{ animationDelay: '500ms' }} />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-primary/30" style={{ animation: 'spin 3s linear infinite' }}>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
          </div>
          <div className="absolute inset-1 rounded-full border border-secondary/40" style={{ animation: 'spin 2s linear infinite reverse' }}>
            <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-secondary" />
          </div>
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/80 to-secondary/80 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
          </div>
        </div>
        <p className="text-muted-foreground text-sm animate-pulse">Carregando CosmoSec...</p>
      </div>
    </div>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <OrganizationProvider>
                <FrameworkProvider>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<Landing />} />
                      <Route path="/tour" element={<ConhecaCosmoSec />} />
                      <Route path={AUTH_ROUTE} element={<Gateway />} />
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
                      <Route path="/qualification/:token" element={<VendorQualificationPortal />} />
                      <Route path="/aceitar-convite/:token" element={<AcceptInvite />} />
                      
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
                        <Route path="/vrm/qualificacao/templates" element={<QualificationTemplates />} />
                        <Route path="/vrm/qualificacao/templates/:id" element={<QualificationTemplateBuilder />} />
                        <Route path="/vrm/qualificacao/campanhas" element={<QualificationCampaigns />} />
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
                  </Suspense>
                </FrameworkProvider>
              </OrganizationProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
