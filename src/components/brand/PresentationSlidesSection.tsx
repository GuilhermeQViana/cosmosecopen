import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, Presentation } from 'lucide-react';
import { toast } from 'sonner';
import {
  SLIDE_DEFINITIONS,
  generatePreview,
  downloadSlide,
  downloadAllSlides,
  type SlideDefinition,
} from '@/lib/slide-generator';

const CATEGORIES = [
  { id: 'fundos', label: 'Fundos' },
  { id: 'capas', label: 'Capas' },
  { id: 'transicao', label: 'Transição' },
  { id: 'finalizacao', label: 'Finalização' },
] as const;

function SlidePreviewCard({ slide }: { slide: SlideDefinition }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setLoading(true);
    generatePreview(canvas, slide.id)
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  }, [slide.id]);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      await downloadSlide(slide.id, slide.name);
      toast.success(`${slide.name} baixado!`);
    } catch {
      toast.error('Erro ao baixar slide');
    } finally {
      setDownloading(false);
    }
  }, [slide.id, slide.name]);

  return (
    <div className="group rounded-lg border border-border/50 bg-background/50 overflow-hidden hover:border-primary/30 transition-colors">
      <div className="relative aspect-video bg-muted/20 overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
          style={{ imageRendering: 'auto' }}
        />
      </div>
      <div className="p-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-sm font-medium truncate">{slide.name}</h4>
          <p className="text-xs text-muted-foreground truncate">{slide.description}</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="flex-shrink-0"
          disabled={downloading}
          onClick={handleDownload}
        >
          <Download className="h-3 w-3 mr-1" />
          PNG
        </Button>
      </div>
    </div>
  );
}

export default function PresentationSlidesSection() {
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [activeTab, setActiveTab] = useState('fundos');

  const handleDownloadAll = async () => {
    setDownloadingAll(true);
    try {
      await downloadAllSlides();
      toast.success('Todos os slides baixados!');
    } catch {
      toast.error('Erro ao baixar slides');
    } finally {
      setDownloadingAll(false);
    }
  };

  return (
    <Card className="mb-8 bg-card/50 backdrop-blur border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Presentation className="h-5 w-5 text-primary" />
              Slides para Apresentação
            </CardTitle>
            <CardDescription>
              Imagens 1920×1080 prontas para importar no PowerPoint como fundo editável
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={downloadingAll}
            onClick={handleDownloadAll}
          >
            <Download className="h-4 w-4 mr-1" />
            {downloadingAll ? 'Baixando...' : 'Baixar Todos'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 relative z-20">
            {CATEGORIES.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {CATEGORIES.map(cat => {
            const slides = SLIDE_DEFINITIONS.filter(s => s.category === cat.id);
            return (
              <TabsContent key={cat.id} value={cat.id}>
                <div className="grid gap-4 md:grid-cols-2">
                  {slides.map(slide => (
                    <SlidePreviewCard key={slide.id} slide={slide} />
                  ))}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}
