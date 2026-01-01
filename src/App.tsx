import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { FrameworkProvider } from "@/contexts/FrameworkContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Auth from "@/pages/Auth";
import Onboarding from "@/pages/Onboarding";
import SelecionarOrganizacao from "@/pages/SelecionarOrganizacao";
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
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <OrganizationProvider>
            <FrameworkProvider>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/selecionar-organizacao" element={<SelecionarOrganizacao />} />
                <Route path="/selecionar-framework" element={<SelecionarFramework />} />
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
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </FrameworkProvider>
          </OrganizationProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
