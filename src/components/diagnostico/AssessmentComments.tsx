import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useAssessmentComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
  usePinComment,
  useToggleReaction,
  AssessmentComment,
} from '@/hooks/useAssessmentComments';
import { useAuth } from '@/contexts/AuthContext';
import {
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Send,
  Reply,
  Pin,
  PinOff,
  Pencil,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AssessmentCommentsProps {
  assessmentId: string | undefined;
}

export function AssessmentComments({ assessmentId }: AssessmentCommentsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const { user } = useAuth();
  const { data: comments = [], isLoading } = useAssessmentComments(assessmentId);
  const createComment = useCreateComment();
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();
  const pinComment = usePinComment();
  const toggleReaction = useToggleReaction();

  const totalComments = comments.reduce(
    (acc, c) => acc + 1 + (c.replies?.length || 0),
    0
  );

  const handleSubmit = async () => {
    if (!newComment.trim() || !assessmentId) return;

    try {
      await createComment.mutateAsync({
        assessmentId,
        content: newComment.trim(),
        parentId: replyingTo || undefined,
      });
      setNewComment('');
      setReplyingTo(null);
      toast.success('Comentário adicionado');
    } catch {
      toast.error('Erro ao adicionar comentário');
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim() || !assessmentId) return;

    try {
      await updateComment.mutateAsync({
        commentId,
        content: editContent.trim(),
        assessmentId,
      });
      setEditingId(null);
      setEditContent('');
      toast.success('Comentário editado');
    } catch {
      toast.error('Erro ao editar comentário');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!assessmentId) return;

    try {
      await deleteComment.mutateAsync({ commentId, assessmentId });
      toast.success('Comentário excluído');
    } catch {
      toast.error('Erro ao excluir comentário');
    }
  };

  const handlePin = async (commentId: string, isPinned: boolean) => {
    if (!assessmentId) return;

    try {
      await pinComment.mutateAsync({
        commentId,
        isPinned: !isPinned,
        assessmentId,
      });
      toast.success(isPinned ? 'Comentário desafixado' : 'Comentário fixado');
    } catch {
      toast.error('Erro ao fixar comentário');
    }
  };

  const handleReaction = async (
    commentId: string,
    reactionType: 'like' | 'dislike'
  ) => {
    if (!assessmentId) return;

    try {
      await toggleReaction.mutateAsync({
        commentId,
        reactionType,
        assessmentId,
      });
    } catch {
      toast.error('Erro ao reagir');
    }
  };

  const renderComment = (comment: AssessmentComment, isReply = false) => {
    const isEditing = editingId === comment.id;
    const isOwner = user?.id === comment.user_id;
    const wasEdited =
      comment.created_at !== comment.updated_at && comment.updated_at;

    const likes =
      comment.reactions?.filter((r) => r.reaction_type === 'like').length || 0;
    const dislikes =
      comment.reactions?.filter((r) => r.reaction_type === 'dislike').length ||
      0;
    const userLiked = comment.reactions?.some(
      (r) => r.user_id === user?.id && r.reaction_type === 'like'
    );
    const userDisliked = comment.reactions?.some(
      (r) => r.user_id === user?.id && r.reaction_type === 'dislike'
    );

    const initials =
      comment.profile?.full_name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2) || '??';

    return (
      <div
        key={comment.id}
        className={cn(
          'space-y-2',
          isReply && 'ml-8 pl-4 border-l-2 border-muted'
        )}
      >
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.profile?.avatar_url || ''} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">
                {comment.profile?.full_name || 'Usuário'}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
              {wasEdited && (
                <Badge variant="outline" className="text-xs py-0">
                  editado
                </Badge>
              )}
              {comment.is_pinned && (
                <Badge variant="secondary" className="text-xs py-0">
                  <Pin className="w-3 h-3 mr-1" />
                  Fixado
                </Badge>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleEdit(comment.id)}
                    disabled={updateComment.isPending}
                  >
                    Salvar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingId(null);
                      setEditContent('');
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm">{comment.content}</p>
            )}

            {!isEditing && (
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs gap-1"
                  onClick={() => handleReaction(comment.id, 'like')}
                >
                  <ThumbsUp
                    className={cn(
                      'w-3 h-3',
                      userLiked && 'fill-current text-primary'
                    )}
                  />
                  {likes > 0 && likes}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs gap-1"
                  onClick={() => handleReaction(comment.id, 'dislike')}
                >
                  <ThumbsDown
                    className={cn(
                      'w-3 h-3',
                      userDisliked && 'fill-current text-destructive'
                    )}
                  />
                  {dislikes > 0 && dislikes}
                </Button>

                {!isReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs gap-1"
                    onClick={() => setReplyingTo(comment.id)}
                  >
                    <Reply className="w-3 h-3" />
                    Responder
                  </Button>
                )}

                {(isOwner || true) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          handlePin(comment.id, comment.is_pinned)
                        }
                      >
                        {comment.is_pinned ? (
                          <>
                            <PinOff className="w-4 h-4 mr-2" />
                            Desafixar
                          </>
                        ) : (
                          <>
                            <Pin className="w-4 h-4 mr-2" />
                            Fixar
                          </>
                        )}
                      </DropdownMenuItem>
                      {isOwner && (
                        <>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingId(comment.id);
                              setEditContent(comment.content);
                            }}
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(comment.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}

            {/* Reply input */}
            {replyingTo === comment.id && (
              <div className="flex gap-2 mt-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escreva sua resposta..."
                  rows={1}
                  className="resize-none flex-1"
                />
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={createComment.isPending}
                >
                  <Send className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setReplyingTo(null);
                    setNewComment('');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            )}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="space-y-3 mt-3">
                {comment.replies.map((reply) => renderComment(reply, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!assessmentId) {
    return (
      <p className="text-sm text-muted-foreground italic">
        Salve a avaliação para habilitar comentários
      </p>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between p-3 h-auto"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="font-medium">
              Discussão ({totalComments} comentário{totalComments !== 1 && 's'})
            </span>
          </div>
          {isOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="pt-4 space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            Nenhum comentário ainda. Seja o primeiro!
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => renderComment(comment))}
          </div>
        )}

        {/* New comment input */}
        {!replyingTo && (
          <div className="flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Adicione um comentário... Use @ para mencionar"
              rows={1}
              className="resize-none flex-1"
            />
            <Button
              onClick={handleSubmit}
              disabled={!newComment.trim() || createComment.isPending}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
