import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Lightbulb, 
  Loader2, 
  CheckCircle2, 
  BookOpen, 
  Clipboard,
  RefreshCw,
  Sparkles 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImplementationAssistantProps {
  controlCode: string;
  controlName: string;
  controlDescription?: string | null;
  currentMaturity: number;
  targetMaturity: number;
  weight?: number;
}

interface ImplementationGuide {
  summary: string;
  steps: Array<{
    order: number;
    title: string;
    description: string;
    effort: "baixo" | "medio" | "alto";
  }>;
  checklist: string[];
  resources: Array<{
    title: string;
    type: string;
    description: string;
  }>;
  tips: string[];
}

export function ImplementationAssistant({
  controlCode,
  controlName,
  controlDescription,
  currentMaturity,
  targetMaturity,
  weight = 1,
}: ImplementationAssistantProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [guide, setGuide] = useState<ImplementationGuide | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateGuide = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "generate-implementation-guide",
        {
          body: {
            controlCode,
            controlName,
            controlDescription,
            currentMaturity,
            targetMaturity,
            weight,
          },
        }
      );

      if (fnError) throw fnError;

      if (data?.guide) {
        setGuide(data.guide);
      } else {
        throw new Error("Resposta inválida do assistente");
      }
    } catch (err: any) {
      console.error("Error generating guide:", err);
      setError(err.message || "Erro ao gerar guia de implementação");
      toast.error("Erro ao gerar guia de implementação");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => {
            setOpen(true);
            if (!guide) {
              generateGuide();
            }
          }}
        >
          <Lightbulb className="h-4 w-4" />
          Como implementar?
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Assistente de Implementação
          </DialogTitle>
          <DialogDescription>
            Guia personalizado para implementar o controle {controlCode}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="space-y-2 mt-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 border rounded-lg">
                    <Skeleton className="h-4 w-1/3 mb-2" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3 mt-1" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-destructive mb-4">{error}</p>
              <Button variant="outline" onClick={generateGuide}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          )}

          {guide && !isLoading && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Resumo
                </h4>
                <p className="text-sm text-muted-foreground">{guide.summary}</p>
              </div>

              {/* Steps */}
              <div>
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  Passos de Implementação
                  <Badge variant="outline" className="text-xs">
                    {guide.steps.length} passos
                  </Badge>
                </h4>
                <div className="space-y-3">
                  {guide.steps.map((step) => (
                    <div
                      key={step.order}
                      className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                          {step.order}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{step.title}</span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                step.effort === "baixo" && "border-green-500/50 text-green-600",
                                step.effort === "medio" && "border-yellow-500/50 text-yellow-600",
                                step.effort === "alto" && "border-red-500/50 text-red-600"
                              )}
                            >
                              Esforço {step.effort}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checklist */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Checklist de Verificação
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(guide.checklist.map((item, i) => `${i + 1}. ${item}`).join("\n"))}
                  >
                    <Clipboard className="h-4 w-4 mr-1" />
                    Copiar
                  </Button>
                </div>
                <div className="p-3 border rounded-lg bg-muted/30">
                  <ul className="space-y-2">
                    {guide.checklist.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-muted-foreground">☐</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Resources */}
              {guide.resources.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-3">Recursos Recomendados</h4>
                  <div className="grid gap-2">
                    {guide.resources.map((resource, index) => (
                      <div
                        key={index}
                        className="p-2 border rounded-lg flex items-center gap-3"
                      >
                        <Badge variant="secondary" className="text-xs">
                          {resource.type}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{resource.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {resource.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {guide.tips.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    Dicas
                  </h4>
                  <div className="p-3 border rounded-lg bg-yellow-500/5 border-yellow-500/20">
                    <ul className="space-y-2">
                      {guide.tips.map((tip, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-yellow-500">💡</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Regenerate */}
              <div className="flex justify-center pt-2">
                <Button variant="outline" size="sm" onClick={generateGuide}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Gerar novo guia
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
