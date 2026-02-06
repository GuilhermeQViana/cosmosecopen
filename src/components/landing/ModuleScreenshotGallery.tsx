import { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface Screenshot {
  src: string;
  title: string;
  description: string;
}

interface ModuleScreenshotGalleryProps {
  screenshots: Screenshot[];
  moduleId: string;
}

export function ModuleScreenshotGallery({ screenshots, moduleId }: ModuleScreenshotGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!screenshots || screenshots.length === 0) {
    return (
      <div className="mt-6 p-8 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 text-center">
        <p className="text-muted-foreground text-sm">
          Screenshots em breve...
        </p>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? screenshots.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === screenshots.length - 1 ? 0 : prev + 1));
  };

  const current = screenshots[currentIndex];

  return (
    <div className="mt-6">
      {/* Main Image Container */}
      <div className="relative group rounded-xl overflow-hidden border border-border/50 bg-background/50">
        <div className="aspect-video relative">
          <img
            src={current.src}
            alt={current.title}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
          
          {/* Navigation Arrows */}
          {screenshots.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}
          
          {/* Fullscreen Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(true)}
            className="absolute top-2 right-2 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Caption */}
        <div className="p-4 bg-background/70 backdrop-blur-sm border-t border-border/50">
          <p className="font-medium text-foreground text-sm">{current.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{current.description}</p>
        </div>
      </div>
      
      {/* Dot Indicators */}
      {screenshots.length > 1 && (
        <div className="flex gap-2 mt-4 justify-center">
          {screenshots.map((_, index) => (
            <button
              key={`${moduleId}-dot-${index}`}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                index === currentIndex
                  ? "bg-primary w-6"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50 hover:scale-110"
              )}
              aria-label={`Ver screenshot ${index + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-background/95 backdrop-blur-md border-border/50">
          <DialogTitle className="sr-only">{current.title}</DialogTitle>
          <div className="relative">
            <img
              src={current.src}
              alt={current.title}
              className="w-full h-auto max-h-[90vh] object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
              <p className="font-medium text-white">{current.title}</p>
              <p className="text-sm text-white/80">{current.description}</p>
            </div>
            
            {/* Fullscreen Navigation */}
            {screenshots.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background h-12 w-12"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background h-12 w-12"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
