import { 
  Shield, 
  Lock, 
  Key, 
  FileCheck, 
  ClipboardCheck, 
  FileText,
  BookOpen,
  Scale,
  Building2,
  Landmark,
  Globe,
  Server,
  Database,
  Cloud,
  Cpu,
  Network,
  Fingerprint,
  Eye,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  FileCode,
  Layers,
  Box,
  Settings,
  Cog,
  type LucideIcon
} from 'lucide-react';

export interface FrameworkIconOption {
  name: string;
  icon: LucideIcon;
  label: string;
}

export const frameworkIconOptions: FrameworkIconOption[] = [
  { name: 'shield', icon: Shield, label: 'Escudo' },
  { name: 'shield-check', icon: ShieldCheck, label: 'Escudo Check' },
  { name: 'shield-alert', icon: ShieldAlert, label: 'Escudo Alerta' },
  { name: 'lock', icon: Lock, label: 'Cadeado' },
  { name: 'key', icon: Key, label: 'Chave' },
  { name: 'fingerprint', icon: Fingerprint, label: 'Digital' },
  { name: 'eye', icon: Eye, label: 'Olho' },
  { name: 'file-check', icon: FileCheck, label: 'Arquivo Check' },
  { name: 'clipboard-check', icon: ClipboardCheck, label: 'Checklist' },
  { name: 'file-text', icon: FileText, label: 'Documento' },
  { name: 'file-code', icon: FileCode, label: 'Código' },
  { name: 'book-open', icon: BookOpen, label: 'Livro' },
  { name: 'scale', icon: Scale, label: 'Balança' },
  { name: 'building', icon: Building2, label: 'Prédio' },
  { name: 'landmark', icon: Landmark, label: 'Instituição' },
  { name: 'globe', icon: Globe, label: 'Globo' },
  { name: 'server', icon: Server, label: 'Servidor' },
  { name: 'database', icon: Database, label: 'Banco de Dados' },
  { name: 'cloud', icon: Cloud, label: 'Nuvem' },
  { name: 'cpu', icon: Cpu, label: 'CPU' },
  { name: 'network', icon: Network, label: 'Rede' },
  { name: 'layers', icon: Layers, label: 'Camadas' },
  { name: 'box', icon: Box, label: 'Caixa' },
  { name: 'settings', icon: Settings, label: 'Configurações' },
  { name: 'cog', icon: Cog, label: 'Engrenagem' },
  { name: 'check-circle', icon: CheckCircle, label: 'Check' },
  { name: 'alert-triangle', icon: AlertTriangle, label: 'Alerta' },
];

export function getFrameworkIcon(iconName: string | null | undefined): LucideIcon {
  const found = frameworkIconOptions.find(opt => opt.name === iconName);
  return found?.icon || Shield;
}