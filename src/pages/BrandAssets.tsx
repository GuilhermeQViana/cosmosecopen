import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Copy, Check, ArrowLeft } from 'lucide-react';
import { CosmoSecLogo } from '@/components/ui/CosmoSecLogo';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const LOGO_SIZES = [
  { name: 'Favicon', size: 32 },
  { name: 'Small', size: 64 },
  { name: 'Medium', size: 128 },
  { name: 'Large', size: 256 },
  { name: 'Extra Large', size: 512 },
];

const SVG_FILES = [
  { name: 'Logo Animado', path: '/brand/cosmosec-logo.svg', description: 'SVG com animações CSS' },
  { name: 'Logo Estático', path: '/brand/cosmosec-logo-static.svg', description: 'SVG sem animações' },
  { name: 'Logo com Fundo Escuro', path: '/brand/cosmosec-logo-dark-bg.svg', description: 'Logo centralizado em fundo escuro' },
  { name: 'Wordmark (Fundo Escuro)', path: '/brand/cosmosec-wordmark.svg', description: 'Logo + texto para fundos escuros' },
  { name: 'Wordmark (Fundo Claro)', path: '/brand/cosmosec-wordmark-dark.svg', description: 'Logo + texto para fundos claros' },
];

export default function BrandAssets() {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const downloadSVG = (path: string, filename: string) => {
    const link = document.createElement('a');
    link.href = path;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${filename} baixado com sucesso!`);
  };

  const downloadPNG = async (size: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    // Load the static SVG
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `cosmosec-logo-${size}x${size}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success(`PNG ${size}x${size} baixado com sucesso!`);
        }
      }, 'image/png');
    };

    img.src = '/brand/cosmosec-logo-static.svg';
  };

  const copySVGCode = async (path: string, name: string) => {
    try {
      const response = await fetch(path);
      const svgText = await response.text();
      await navigator.clipboard.writeText(svgText);
      setCopiedItem(name);
      toast.success('Código SVG copiado!');
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      toast.error('Erro ao copiar código SVG');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hidden canvas for PNG generation */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              CosmoSec
            </span>{' '}
            Brand Assets
          </h1>
          <p className="text-muted-foreground text-lg">
            Baixe logos e assets da marca em múltiplos formatos e tamanhos
          </p>
        </div>

        {/* Logo Preview Section */}
        <Card className="mb-8 bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle>Preview do Logo</CardTitle>
            <CardDescription>Visualização interativa do logo em diferentes tamanhos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {LOGO_SIZES.map(({ name, size }) => (
                <div key={size} className="flex flex-col items-center gap-3">
                  <div 
                    className="bg-background/80 rounded-lg p-4 border border-border/50 flex items-center justify-center"
                    style={{ minWidth: Math.max(size + 32, 80), minHeight: Math.max(size + 32, 80) }}
                  >
                    <CosmoSecLogo 
                      showText={false} 
                      className="transition-transform hover:scale-105"
                      size={size <= 32 ? 'sm' : size <= 64 ? 'md' : size <= 128 ? 'lg' : 'xl'}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-xs text-muted-foreground">{size}x{size}px</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SVG Downloads */}
        <Card className="mb-8 bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Arquivos SVG
            </CardTitle>
            <CardDescription>Vetores escaláveis para qualquer tamanho</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {SVG_FILES.map((file) => (
                <div 
                  key={file.path}
                  className="border border-border/50 rounded-lg p-4 bg-background/50 hover:bg-background/80 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{file.name}</h4>
                      <p className="text-xs text-muted-foreground">{file.description}</p>
                    </div>
                  </div>
                  <div className="h-20 bg-muted/30 rounded-md flex items-center justify-center mb-3 overflow-hidden">
                    <img 
                      src={file.path} 
                      alt={file.name}
                      className="max-h-16 max-w-full object-contain"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => downloadSVG(file.path, `${file.name.toLowerCase().replace(/\s+/g, '-')}.svg`)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copySVGCode(file.path, file.name)}
                    >
                      {copiedItem === file.name ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* PNG Downloads */}
        <Card className="mb-8 bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-cyan-400" />
              Arquivos PNG (Fundo Transparente)
            </CardTitle>
            <CardDescription>Imagens rasterizadas em múltiplos tamanhos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
              {LOGO_SIZES.map(({ name, size }) => (
                <Button
                  key={size}
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2"
                  onClick={() => downloadPNG(size)}
                >
                  <Download className="h-4 w-4" />
                  <span className="font-medium">{name}</span>
                  <span className="text-xs text-muted-foreground">{size}x{size}px</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Color Palette */}
        <Card className="mb-8 bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle>Paleta de Cores</CardTitle>
            <CardDescription>Cores oficiais da marca CosmoSec</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { name: 'Event Horizon', hex: '#2E5CFF', desc: 'Cor primária' },
                { name: 'Nebula', hex: '#00D4FF', desc: 'Cor de destaque' },
                { name: 'Deep Void', hex: '#0B0E14', desc: 'Fundo escuro' },
                { name: 'Celestial Dawn', hex: '#F8FAFC', desc: 'Fundo claro' },
              ].map((color) => (
                <div 
                  key={color.hex}
                  className="border border-border/50 rounded-lg p-4 bg-background/50"
                >
                  <div 
                    className="h-16 rounded-md mb-3 border border-border/30"
                    style={{ backgroundColor: color.hex }}
                  />
                  <h4 className="font-medium">{color.name}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{color.desc}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full justify-between font-mono text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(color.hex);
                      toast.success(`${color.hex} copiado!`);
                    }}
                  >
                    {color.hex}
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Usage Guidelines */}
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle>Diretrizes de Uso</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <ul className="space-y-2 text-muted-foreground">
              <li>Use o <strong>logo com wordmark</strong> em materiais onde há espaço suficiente</li>
              <li>Use o <strong>logo ícone</strong> para favicons, avatares e espaços reduzidos</li>
              <li>Mantenha uma <strong>área de respiro</strong> mínima de 20% do tamanho do logo ao redor</li>
              <li>Prefira o <strong>logo animado</strong> para web e o <strong>estático</strong> para impressão</li>
              <li>Use a versão <strong>fundo escuro</strong> sobre backgrounds claros e vice-versa</li>
              <li>Nunca distorça, rotacione ou altere as cores do logo</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
