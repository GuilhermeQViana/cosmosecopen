import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeedbackForm } from '@/components/feedbacks/FeedbackForm';
import { FeedbacksList } from '@/components/feedbacks/FeedbacksList';
import { useSuperAdmin } from '@/hooks/useFeedbacks';
import { MessageSquare, Eye } from 'lucide-react';

export default function Feedbacks() {
  const { data: isSuperAdmin, isLoading } = useSuperAdmin();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Feedbacks</h1>
        <p className="text-muted-foreground">
          Compartilhe sua opinião sobre cada módulo e ajude-nos a melhorar.
        </p>
      </div>

      <Tabs defaultValue="send" className="w-full">
        <TabsList>
          <TabsTrigger value="send" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Enviar Feedback
          </TabsTrigger>
          {!isLoading && isSuperAdmin && (
            <TabsTrigger value="view" className="gap-2">
              <Eye className="w-4 h-4" />
              Ver Respostas
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="send" className="mt-6">
          <div className="max-w-2xl">
            <FeedbackForm />
          </div>
        </TabsContent>

        {!isLoading && isSuperAdmin && (
          <TabsContent value="view" className="mt-6">
            <FeedbacksList />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
