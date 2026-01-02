import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  route: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao CosmoSec!',
    description: 'Vamos fazer um tour rápido pelos principais recursos da plataforma. Você pode pular a qualquer momento.',
    route: '/dashboard',
    position: 'center',
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Aqui você tem uma visão geral do status de conformidade, riscos críticos e próximas ações.',
    route: '/dashboard',
    position: 'center',
  },
  {
    id: 'sidebar',
    title: 'Menu de Navegação',
    description: 'Use o menu lateral para acessar todas as funcionalidades: diagnóstico, riscos, evidências e mais.',
    targetSelector: '[data-sidebar="sidebar"]',
    route: '/dashboard',
    position: 'right',
  },
  {
    id: 'search',
    title: 'Busca Rápida',
    description: 'Pressione Ctrl+K (ou ⌘K no Mac) para buscar rapidamente por controles, riscos ou evidências.',
    route: '/dashboard',
    position: 'center',
  },
  {
    id: 'diagnostico',
    title: 'Diagnóstico de Controles',
    description: 'Avalie a maturidade dos controles de segurança e acompanhe o progresso da conformidade.',
    route: '/diagnostico',
    position: 'center',
  },
  {
    id: 'riscos',
    title: 'Gestão de Riscos',
    description: 'Cadastre e monitore riscos de segurança com matriz de probabilidade x impacto.',
    route: '/riscos',
    position: 'center',
  },
  {
    id: 'evidencias',
    title: 'Cofre de Evidências',
    description: 'Organize documentos comprobatórios de conformidade de forma segura.',
    route: '/evidencias',
    position: 'center',
  },
  {
    id: 'final',
    title: 'Tudo Pronto!',
    description: 'Agora você está pronto para começar. Use o checklist no Dashboard para configurar sua organização.',
    route: '/dashboard',
    position: 'center',
  },
];

const TOUR_STORAGE_KEY = 'cosmosec-tour-completed';

export function OnboardingTour() {
  const location = useLocation();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!tourCompleted) {
      // Delay showing tour to let the page load
      const timer = setTimeout(() => setIsActive(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const updatePosition = useCallback(() => {
    const step = tourSteps[currentStep];
    if (!step) return;

    if (step.targetSelector) {
      const element = document.querySelector(step.targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        const pos = step.position || 'bottom';
        
        let top = 0;
        let left = 0;

        switch (pos) {
          case 'bottom':
            top = rect.bottom + 16;
            left = rect.left + rect.width / 2;
            break;
          case 'top':
            top = rect.top - 16;
            left = rect.left + rect.width / 2;
            break;
          case 'left':
            top = rect.top + rect.height / 2;
            left = rect.left - 16;
            break;
          case 'right':
            top = rect.top + rect.height / 2;
            left = rect.right + 16;
            break;
        }

        setPosition({ top, left });
      }
    }
  }, [currentStep]);

  useEffect(() => {
    if (isActive) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      return () => window.removeEventListener('resize', updatePosition);
    }
  }, [isActive, updatePosition]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTour();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeTour = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    setIsActive(false);
  };

  const skipTour = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    setIsActive(false);
  };

  if (!isActive) return null;

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;
  const isCentered = step.position === 'center' || !step.targetSelector;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" />
      
      {/* Tour Card */}
      <Card
        className={cn(
          'fixed z-50 w-[380px] shadow-2xl border-2 border-primary/20 animate-fade-in',
          isCentered && 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
        )}
        style={
          !isCentered
            ? {
                top: `${position.top}px`,
                left: `${position.left}px`,
                transform: 'translateX(-50%)',
              }
            : undefined
        }
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{step.title}</CardTitle>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={skipTour}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Progress value={progress} className="h-1" />
        </CardHeader>
        
        <CardContent>
          <p className="text-muted-foreground">{step.description}</p>
        </CardContent>
        
        <CardFooter className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {currentStep + 1} de {tourSteps.length}
          </span>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" size="sm" onClick={handlePrev}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
            )}
            <Button size="sm" onClick={handleNext}>
              {currentStep === tourSteps.length - 1 ? (
                'Concluir'
              ) : (
                <>
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}

export function useTourReset() {
  return () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    window.location.reload();
  };
}
