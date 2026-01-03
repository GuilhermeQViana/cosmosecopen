import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LayoutDashboard, Calendar, Settings } from 'lucide-react';
import { VendorReassessmentSchedule } from '@/components/fornecedores/VendorReassessmentSchedule';

export default function VendorAgenda() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('schedule');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/vrm')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-space">
              Agenda de Reavaliações
            </h1>
            <p className="text-muted-foreground">
              Gerencie o ciclo de reavaliações dos seus fornecedores
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate('/vrm/fornecedores')}>
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Ver Fornecedores
        </Button>
      </div>

      <VendorReassessmentSchedule />
    </div>
  );
}
