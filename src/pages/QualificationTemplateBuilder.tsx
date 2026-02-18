import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  useQualificationTemplates,
  useUpdateQualificationTemplate,
  useTemplateHasResponses,
} from '@/hooks/useQualificationTemplates';
import {
  useQualificationQuestions,
  useUpsertQualificationQuestion,
  useDeleteQualificationQuestion,
  useReorderQualificationQuestions,
  QualificationQuestion,
} from '@/hooks/useQualificationQuestions';
import {
  ArrowLeft,
  Plus,
  GripVertical,
  Trash2,
  Loader2,
  Save,
  Eye,
  Settings2,
  AlertTriangle,
  Type,
  List,
  Upload,
  Calendar,
  DollarSign,
  Hash,
  ChevronDown,
  ChevronUp,
  FileUp,
} from 'lucide-react';
import { ImportQuestionsDialog } from '@/components/configuracoes/ImportQuestionsDialog';

const QUESTION_TYPES = [
  { value: 'text', label: 'Texto', icon: Type },
  { value: 'multiple_choice', label: 'Múltipla Escolha', icon: List },
  { value: 'upload', label: 'Upload de Arquivo', icon: Upload },
  { value: 'date', label: 'Data', icon: Calendar },
  { value: 'currency', label: 'Moeda', icon: DollarSign },
  { value: 'number', label: 'Número', icon: Hash },
];

interface QuestionOption {
  value: string;
  label: string;
  score: number;
}

export default function QualificationTemplateBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: templates = [] } = useQualificationTemplates();
  const template = templates.find(t => t.id === id);
  const { data: questions = [], isLoading: questionsLoading } = useQualificationQuestions(id);
  const { data: hasResponses = false } = useTemplateHasResponses(id);
  const upsertQuestion = useUpsertQualificationQuestion();
  const deleteQuestion = useDeleteQualificationQuestion();
  const reorderQuestions = useReorderQualificationQuestions();
  const updateTemplate = useUpdateQualificationTemplate();

  const [editingQuestion, setEditingQuestion] = useState<Partial<QualificationQuestion> | null>(null);
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [nameEdited, setNameEdited] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize template name/description once when template loads
  if (template && !initialized) {
    setInitialized(true);
    setTemplateName(template.name);
    setTemplateDescription(template.description || '');
  }

  const handleAddQuestion = () => {
    setEditingQuestion({
      template_id: id!,
      label: '',
      type: 'text',
      weight: 10,
      is_required: true,
      is_ko: false,
      ko_value: null,
      conditional_on: null,
      conditional_value: null,
      order_index: questions.length,
    });
    setOptions([]);
    setShowQuestionEditor(true);
  };

  const handleEditQuestion = (q: QualificationQuestion) => {
    setEditingQuestion({ ...q });
    setOptions(Array.isArray(q.options) ? q.options : []);
    setShowQuestionEditor(true);
  };

  const handleSaveQuestion = async () => {
    if (!editingQuestion || !editingQuestion.label?.trim()) {
      toast({ title: 'Preencha o texto da pergunta', variant: 'destructive' });
      return;
    }

    try {
      await upsertQuestion.mutateAsync({
        ...editingQuestion,
        template_id: id!,
        label: editingQuestion.label!.trim(),
        options: editingQuestion.type === 'multiple_choice' ? options : [],
      } as any);
      setShowQuestionEditor(false);
      setEditingQuestion(null);
      toast({ title: 'Pergunta salva' });
    } catch {
      toast({ title: 'Erro ao salvar pergunta', variant: 'destructive' });
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    try {
      await deleteQuestion.mutateAsync({ id: qId, templateId: id! });
      toast({ title: 'Pergunta removida' });
    } catch {
      toast({ title: 'Erro ao remover', variant: 'destructive' });
    }
  };

  const handleMoveQuestion = async (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...questions];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newQuestions.length) return;
    [newQuestions[index], newQuestions[swapIndex]] = [newQuestions[swapIndex], newQuestions[index]];
    const reordered = newQuestions.map((q, i) => ({ id: q.id, order_index: i }));
    try {
      await reorderQuestions.mutateAsync({ templateId: id!, questions: reordered });
    } catch {
      toast({ title: 'Erro ao reordenar', variant: 'destructive' });
    }
  };

  const handleSaveTemplate = async () => {
    if (!id || !templateName.trim()) return;
    try {
      const result = await updateTemplate.mutateAsync({
        id,
        name: templateName.trim(),
        description: templateDescription.trim() || undefined,
      });
      setNameEdited(true);
      if ((result as any).versionIncremented) {
        toast({ title: `Template atualizado para v${(result as any).version}`, description: 'Nova versão criada pois já existem campanhas respondidas na versão anterior.' });
      } else {
        toast({ title: 'Template salvo' });
      }
    } catch {
      toast({ title: 'Erro ao salvar template', variant: 'destructive' });
    }
  };

  const handlePublish = async () => {
    if (!id) return;
    if (questions.length === 0) {
      toast({ title: 'Adicione pelo menos uma pergunta antes de publicar', variant: 'destructive' });
      return;
    }
    try {
      await updateTemplate.mutateAsync({ id, status: 'publicado' });
      toast({ title: 'Template publicado!' });
    } catch {
      toast({ title: 'Erro ao publicar', variant: 'destructive' });
    }
  };

  const handleAddOption = () => {
    setOptions([...options, { value: `opt_${options.length + 1}`, label: '', score: 0 }]);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleUpdateOption = (index: number, field: keyof QuestionOption, value: string | number) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    if (field === 'label') {
      newOptions[index].value = String(value).toLowerCase().replace(/\s+/g, '_').slice(0, 30);
    }
    setOptions(newOptions);
  };

  if (!template && !questionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Template não encontrado.</p>
      </div>
    );
  }

  const typeIcon = (type: string) => {
    const found = QUESTION_TYPES.find(t => t.value === type);
    return found ? <found.icon className="h-4 w-4" /> : <Type className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/vrm/qualificacao/templates')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <Input
              value={templateName}
              onChange={(e) => { setTemplateName(e.target.value); setNameEdited(true); }}
              className="text-xl font-bold font-space border-none p-0 h-auto shadow-none focus-visible:ring-0 bg-transparent"
              placeholder="Nome do template..."
              maxLength={100}
            />
            <p className="text-sm text-muted-foreground mt-0.5">
              v{template?.version || 1} · {questions.length} perguntas
              {template?.status && (
                <Badge variant={template.status === 'publicado' ? 'default' : 'secondary'} className="ml-2 text-xs">
                  {template.status}
                </Badge>
              )}
              {hasResponses && template?.status === 'publicado' && (
                <Badge variant="outline" className="ml-2 text-xs border-yellow-500 text-yellow-600">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Alterações criarão nova versão
                </Badge>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowImportDialog(true)}>
            <FileUp className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" size="sm" onClick={handleSaveTemplate} disabled={updateTemplate.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
          {template?.status !== 'publicado' && (
            <Button size="sm" onClick={handlePublish}>
              Publicar
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Questions List */}
        <div className="lg:col-span-2 space-y-3">
          {questionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : questions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-3">Nenhuma pergunta adicionada ainda.</p>
                <div className="flex items-center justify-center gap-2">
                  <Button onClick={handleAddQuestion} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Pergunta
                  </Button>
                  <Button onClick={() => setShowImportDialog(true)} variant="outline">
                    <FileUp className="h-4 w-4 mr-2" />
                    Importar via Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {questions.map((q, idx) => (
                <Card
                  key={q.id}
                  className="group cursor-pointer hover:border-primary/30 transition-colors"
                  onClick={() => handleEditQuestion(q)}
                >
                  <CardContent className="py-3 px-4">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handleMoveQuestion(idx, 'up'); }} disabled={idx === 0} className="disabled:opacity-30">
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <button onClick={(e) => { e.stopPropagation(); handleMoveQuestion(idx, 'down'); }} disabled={idx === questions.length - 1} className="disabled:opacity-30">
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-muted-foreground">{idx + 1}.</span>
                          {typeIcon(q.type)}
                          <span className="text-sm font-medium truncate">{q.label}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">Peso: {q.weight}</Badge>
                          {q.is_required && <Badge variant="secondary" className="text-xs">Obrigatória</Badge>}
                          {q.is_ko && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              KO
                            </Badge>
                          )}
                          {q.conditional_on && <Badge variant="outline" className="text-xs">Condicional</Badge>}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                        onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(q.id); }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}

          <Button onClick={handleAddQuestion} variant="outline" className="w-full border-dashed">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Pergunta
          </Button>
        </div>

        {/* Settings Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Descrição</label>
                <Textarea
                  value={templateDescription}
                  onChange={(e) => { setTemplateDescription(e.target.value); setNameEdited(true); }}
                  placeholder="Objetivo do questionário..."
                  rows={3}
                  maxLength={500}
                />
              </div>
              <Separator />
              <div>
                <label className="text-xs font-medium mb-1 block">Faixas de Score</label>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    0-50: Alto Risco
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    51-80: Médio Risco
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    81-100: Baixo Risco
                  </div>
                </div>
              </div>
              <Separator />
              <div className="text-xs text-muted-foreground">
                <strong>Peso total:</strong> {questions.reduce((sum, q) => sum + q.weight, 0)} pts
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Question Editor Dialog */}
      <Dialog open={showQuestionEditor} onOpenChange={setShowQuestionEditor}>
        <DialogContent className="max-w-lg max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingQuestion?.id ? 'Editar Pergunta' : 'Nova Pergunta'}</DialogTitle>
            <DialogDescription>Configure os detalhes da pergunta.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Texto da Pergunta *</label>
                <Textarea
                  value={editingQuestion?.label || ''}
                  onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, label: e.target.value } : null)}
                  placeholder="Ex: Sua empresa possui certificação ISO 27001?"
                  rows={2}
                  maxLength={500}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Tipo</label>
                  <Select
                    value={editingQuestion?.type || 'text'}
                    onValueChange={(v) => setEditingQuestion(prev => prev ? { ...prev, type: v } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUESTION_TYPES.map(qt => (
                        <SelectItem key={qt.value} value={qt.value}>
                          <span className="flex items-center gap-2">
                            <qt.icon className="h-4 w-4" />
                            {qt.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Peso (pontos)</label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={editingQuestion?.weight || 10}
                    onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, weight: parseInt(e.target.value) || 10 } : null)}
                  />
                </div>
              </div>

              {/* Multiple choice options */}
              {editingQuestion?.type === 'multiple_choice' && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Opções</label>
                  <div className="space-y-2">
                    {options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input
                          value={opt.label}
                          onChange={(e) => handleUpdateOption(i, 'label', e.target.value)}
                          placeholder={`Opção ${i + 1}`}
                          className="flex-1"
                          maxLength={200}
                        />
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={opt.score}
                          onChange={(e) => handleUpdateOption(i, 'score', parseInt(e.target.value) || 0)}
                          className="w-20"
                          placeholder="Score"
                        />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveOption(i)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={handleAddOption} className="w-full border-dashed">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Opção
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Obrigatória</label>
                <Switch
                  checked={editingQuestion?.is_required ?? true}
                  onCheckedChange={(v) => setEditingQuestion(prev => prev ? { ...prev, is_required: v } : null)}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Critério KO (Eliminatório)
                  </label>
                  <Switch
                    checked={editingQuestion?.is_ko ?? false}
                    onCheckedChange={(v) => setEditingQuestion(prev => prev ? { ...prev, is_ko: v } : null)}
                  />
                </div>
                {editingQuestion?.is_ko && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Valor que reprova automaticamente
                    </label>
                    <Input
                      value={editingQuestion?.ko_value || ''}
                      onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, ko_value: e.target.value } : null)}
                      placeholder="Ex: Sim, Não, etc."
                      maxLength={100}
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Conditional Logic */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Lógica Condicional</label>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Mostrar apenas se a pergunta...</label>
                  <Select
                    value={editingQuestion?.conditional_on || '__none__'}
                    onValueChange={(v) => setEditingQuestion(prev => prev ? { ...prev, conditional_on: v === '__none__' ? null : v } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Nenhuma (sempre visível)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Nenhuma (sempre visível)</SelectItem>
                      {questions
                        .filter(q => q.id !== editingQuestion?.id)
                        .map(q => (
                          <SelectItem key={q.id} value={q.id}>
                            {q.order_index + 1}. {q.label.slice(0, 50)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                {editingQuestion?.conditional_on && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">...tiver o valor:</label>
                    <Input
                      value={editingQuestion?.conditional_value || ''}
                      onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, conditional_value: e.target.value } : null)}
                      placeholder="Ex: Sim"
                      maxLength={100}
                    />
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={() => setShowQuestionEditor(false)}>Cancelar</Button>
            <Button onClick={handleSaveQuestion} disabled={upsertQuestion.isPending}>
              {upsertQuestion.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Salvar Pergunta
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Preview: {template?.name}</DialogTitle>
            <DialogDescription>Visualize como o fornecedor verá este questionário.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-4">
              {questions.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-lg border border-border/50 space-y-2">
                  <label className="text-sm font-medium">
                    {idx + 1}. {q.label}
                    {q.is_required && <span className="text-destructive ml-1">*</span>}
                    {q.is_ko && (
                      <Badge variant="destructive" className="ml-2 text-xs">KO</Badge>
                    )}
                  </label>
                  {q.type === 'text' && <Textarea disabled placeholder="Resposta do fornecedor..." rows={2} />}
                  {q.type === 'multiple_choice' && (
                    <div className="space-y-1">
                      {(Array.isArray(q.options) ? q.options : []).map((opt: any, i: number) => (
                        <label key={i} className="flex items-center gap-2 text-sm">
                          <input type="radio" disabled name={`preview_${q.id}`} />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  )}
                  {q.type === 'upload' && (
                    <div className="border-2 border-dashed rounded-lg p-4 text-center text-sm text-muted-foreground">
                      Área de upload de arquivo
                    </div>
                  )}
                  {q.type === 'date' && <Input type="date" disabled />}
                  {q.type === 'currency' && <Input type="number" disabled placeholder="R$ 0,00" />}
                  {q.type === 'number' && <Input type="number" disabled placeholder="0" />}
                  <div className="text-xs text-muted-foreground">Peso: {q.weight} pts</div>
                </div>
              ))}
              {questions.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Nenhuma pergunta adicionada.</p>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
