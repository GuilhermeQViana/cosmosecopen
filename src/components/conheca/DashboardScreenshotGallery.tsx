import { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const screenshots = [
  {
    src: '/screenshots/dashboard-1.png',
    title: 'Dashboard Completo',
    description: 'Visão geral do painel executivo',
  },
  {
    src: '/screenshots/dashboard-2.png',
    title: 'Métricas de Remediação',
    description: 'Progresso dos planos de ação',
  },
  {
    src: '/screenshots/dashboard-3.png',
    title: 'Mapa de Calor de Riscos',
    description: 'Distribuição visual de riscos',
  },
  {
    src: '/screenshots/dashboard-4.png',
    title: 'Tendências de Conformidade',
    description: 'Evolução histórica dos indicadores',
  },
];

export function DashboardScreenshotGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? screenshots.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === screenshots.length - 1 ? 0 : prev + 1));
  };

  const current = screenshots[currentIndex];

  return (
    <div className="mt-12 mb-8">
      <h3 className="text-xl font-semibold text-foreground mb-4 font-space">
        Veja o Dashboard em Ação
      </h3>
      
      {/* Main Image Container */}
      <div className="relative group rounded-xl overflow-hidden border border-border bg-muted/30">
        <div className="aspect-video relative">
          <img
            src={current.src}
            alt={current.title}
            className="w-full h-full object-cover"
          />
          
          {/* Navigation Arrows */}
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          
          {/* Fullscreen Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(true)}
            className="absolute top-2 right-2 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Caption */}
        <div className="p-4 bg-background/50 backdrop-blur-sm">
          <p className="font-medium text-foreground">{current.title}</p>
          <p className="text-sm text-muted-foreground">{current.description}</p>
        </div>
      </div>
      
      {/* Thumbnails */}
      <div className="flex gap-2 mt-4 justify-center">
        {screenshots.map((screenshot, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "w-20 h-14 rounded-lg overflow-hidden border-2 transition-all",
              index === currentIndex
                ? "border-primary ring-2 ring-primary/30"
                : "border-transparent opacity-60 hover:opacity-100"
            )}
          >
            <img
              src={screenshot.src}
              alt={screenshot.title}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
      
      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
          <DialogTitle className="sr-only">{current.title}</DialogTitle>
          <div className="relative">
            <img
              src={current.src}
              alt={current.title}
              className="w-full h-auto max-h-[85vh] object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
              <p className="font-medium text-white">{current.title}</p>
              <p className="text-sm text-white/80">{current.description}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
