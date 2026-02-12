import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, CheckCircle, Trash2, Reply, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePolicyComments, type PolicyComment } from '@/hooks/usePolicyComments';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  policyId: string;
}

function CommentItem({ comment, onReply, onResolve, onDelete, currentUserId }: {
  comment: PolicyComment;
  replies: PolicyComment[];
  onReply: (parentId: string) => void;
  onResolve: (id: string) => void;
  onDelete: (id: string) => void;
  currentUserId?: string;
}) {
  const initials = comment.profile?.full_name
    ?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';

  return (
    <div className={`p-3 rounded-lg border transition-colors ${comment.is_resolved ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-border/50'}`}>
      <div className="flex items-start gap-3">
        <Avatar className="w-7 h-7 shrink-0">
          <AvatarImage src={comment.profile?.avatar_url || undefined} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{comment.profile?.full_name || 'Usuário'}</span>
            {comment.created_at && (
              <span className="text-xs text-muted-foreground">
                {format(new Date(comment.created_at), "dd/MM HH:mm", { locale: ptBR })}
              </span>
            )}
            {comment.is_resolved && <Badge variant="outline" className="text-xs text-emerald-400">Resolvido</Badge>}
          </div>
          <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
          <div className="flex items-center gap-1 mt-2">
            <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => onReply(comment.id)}>
              <Reply className="w-3 h-3 mr-1" /> Responder
            </Button>
            {!comment.is_resolved && (
              <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => onResolve(comment.id)}>
                <CheckCircle className="w-3 h-3 mr-1" /> Resolver
              </Button>
            )}
            {comment.user_id === currentUserId && (
              <Button variant="ghost" size="sm" className="h-6 text-xs px-2 text-destructive" onClick={() => onDelete(comment.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PolicyComments({ policyId }: Props) {
  const { user } = useAuth();
  const { comments, isLoading, addComment, resolveComment, deleteComment } = usePolicyComments(policyId);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const rootComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    await addComment.mutateAsync({ content: newComment, parentId: replyTo || undefined });
    setNewComment('');
    setReplyTo(null);
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-4 h-4 text-emerald-500" />
        <h3 className="font-semibold">Comentários</h3>
        {comments.length > 0 && <Badge variant="secondary" className="text-xs">{comments.length}</Badge>}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-3">
            {rootComments.map((comment) => {
              const replies = getReplies(comment.id);
              return (
                <div key={comment.id}>
                  <CommentItem
                    comment={comment}
                    replies={replies}
                    onReply={setReplyTo}
                    onResolve={(id) => resolveComment.mutate(id)}
                    onDelete={(id) => deleteComment.mutate(id)}
                    currentUserId={user?.id}
                  />
                  {replies.length > 0 && (
                    <div className="ml-8 mt-2 space-y-2 border-l-2 border-border/30 pl-3">
                      {replies.map((reply) => (
                        <CommentItem
                          key={reply.id}
                          comment={reply}
                          replies={[]}
                          onReply={setReplyTo}
                          onResolve={(id) => resolveComment.mutate(id)}
                          onDelete={(id) => deleteComment.mutate(id)}
                          currentUserId={user?.id}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {/* New Comment Input */}
      <div className="mt-3 space-y-2">
        {replyTo && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Reply className="w-3 h-3" />
            <span>Respondendo a um comentário</span>
            <Button variant="ghost" size="sm" className="h-5 text-xs px-1" onClick={() => setReplyTo(null)}>
              Cancelar
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Adicionar comentário..."
            rows={2}
            className="flex-1 resize-none"
            onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) handleSubmit(); }}
          />
          <Button size="icon" onClick={handleSubmit} disabled={!newComment.trim() || addComment.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 shrink-0 self-end">
            {addComment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </Card>
  );
}
