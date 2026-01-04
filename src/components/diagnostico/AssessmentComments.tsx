import { useState, useRef, useEffect, useCallback } from 'react';
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
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
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
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useOrganization } from '@/contexts/OrganizationContext';
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
  Mail,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AssessmentCommentsProps {
  assessmentId: string | undefined;
  controlCode?: string;
  controlName?: string;
}

// Component for mention suggestions dropdown
function MentionSuggestions({
  suggestions,
  onSelect,
  selectedIndex,
  textareaRef,
}: {
  suggestions: { id: string; name: string; avatar?: string }[];
  onSelect: (name: string) => void;
  selectedIndex: number;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const rect = textarea.getBoundingClientRect();
      const parentRect = textarea.offsetParent?.getBoundingClientRect() || rect;
      
      // Position above the textarea
      setPosition({
        top: rect.top - parentRect.top - (dropdownRef.current?.offsetHeight || 200) - 8,
        left: 0,
      });
    }
  }, [textareaRef, suggestions.length]);

  if (suggestions.length === 0) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute z-50 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto min-w-[200px]"
      style={{ 
        bottom: '100%',
        left: 0,
        marginBottom: '8px',
      }}
    >
      {suggestions.map((user, index) => {
        const initials = user.name
          ?.split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2) || '??';

        return (
          <button
            key={user.id}
            type="button"
            className={cn(
              'flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-accent transition-colors',
              index === selectedIndex && 'bg-accent'
            )}
            onClick={() => onSelect(user.name)}
            onMouseDown={(e) => e.preventDefault()} // Prevent blur on click
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={user.avatar || ''} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span>{user.name}</span>
          </button>
        );
      })}
    </div>
  );
}

// Hook for mention functionality
function useMentions(teamMembers: { id: string; full_name: string | null; avatar_url: string | null }[]) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);

  const suggestions = teamMembers
    .filter((m) => m.full_name)
    .map((m) => ({
      id: m.id,
      name: m.full_name!,
      avatar: m.avatar_url || undefined,
    }))
    .filter((m) =>
      mentionQuery
        ? m.name.toLowerCase().includes(mentionQuery.toLowerCase())
        : true
    )
    .slice(0, 5);

  const handleInputChange = (
    value: string,
    cursorPosition: number,
    onChange: (value: string) => void
  ) => {
    onChange(value);

    // Find if we're in a mention context
    const textBeforeCursor = value.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // Check if there's a space after @, which means the mention is complete
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        setShowSuggestions(true);
        setMentionQuery(textAfterAt);
        setMentionStartIndex(lastAtIndex);
        setSelectedIndex(0);
        return;
      }
    }

    setShowSuggestions(false);
    setMentionQuery('');
    setMentionStartIndex(-1);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    value: string,
    onChange: (value: string) => void,
    onSubmit?: () => void
  ) => {
    if (!showSuggestions) {
      if (e.key === 'Enter' && !e.shiftKey && onSubmit) {
        e.preventDefault();
        onSubmit();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      if (suggestions[selectedIndex]) {
        selectMention(suggestions[selectedIndex].name, value, onChange);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const selectMention = (
    name: string,
    currentValue: string,
    onChange: (value: string) => void
  ) => {
    if (mentionStartIndex === -1) return;

    const beforeMention = currentValue.slice(0, mentionStartIndex);
    const afterMention = currentValue.slice(
      mentionStartIndex + 1 + mentionQuery.length
    );
    const newValue = `${beforeMention}@${name} ${afterMention}`;

    onChange(newValue);
    setShowSuggestions(false);
    setMentionQuery('');
    setMentionStartIndex(-1);
  };

  return {
    showSuggestions,
    suggestions,
    selectedIndex,
    handleInputChange,
    handleKeyDown,
    selectMention,
    closeSuggestions: () => setShowSuggestions(false),
  };
}

// Mention Profile Card Component
function MentionProfileCard({ 
  name, 
  teamMembers 
}: { 
  name: string; 
  teamMembers: { id: string; full_name: string | null; avatar_url: string | null }[];
}) {
  // Find the user by name
  const user = teamMembers.find(
    m => m.full_name?.toLowerCase().includes(name.toLowerCase()) ||
         name.toLowerCase().includes(m.full_name?.toLowerCase() || '')
  );

  if (!user) {
    return (
      <span className="text-primary font-medium cursor-default">
        @{name}
      </span>
    );
  }

  const initials = user.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2) || '??';

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <span className="text-primary font-medium cursor-pointer hover:underline">
          @{name}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-64" align="start">
        <div className="flex gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar_url || ''} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold flex items-center gap-1">
              <User className="h-3 w-3" />
              {user.full_name}
            </h4>
            <p className="text-xs text-muted-foreground">
              Membro da equipe
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

// Format comment content to highlight mentions with profile cards
function FormatContentWithMentions({ 
  content, 
  teamMembers 
}: { 
  content: string; 
  teamMembers: { id: string; full_name: string | null; avatar_url: string | null }[];
}) {
  const mentionRegex = /@([A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+)*)/g;
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    // Add text before mention
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    // Add mention with profile card
    parts.push(
      <MentionProfileCard 
        key={match.index} 
        name={match[1]} 
        teamMembers={teamMembers} 
      />
    );
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return <>{parts.length > 0 ? parts : content}</>;
}

export function AssessmentComments({ assessmentId, controlCode, controlName }: AssessmentCommentsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  const { user } = useAuth();
  const { organization } = useOrganization();
  const { data: comments = [], isLoading } = useAssessmentComments(assessmentId);
  const { data: teamMembers = [] } = useTeamMembers();
  const createComment = useCreateComment();
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();
  const pinComment = usePinComment();
  const toggleReaction = useToggleReaction();

  const teamMembersForMention = teamMembers.map((m) => ({
    id: m.user_id,
    full_name: m.profile?.full_name || null,
    avatar_url: m.profile?.avatar_url || null,
  }));

  const mainMentions = useMentions(teamMembersForMention);
  const replyMentions = useMentions(teamMembersForMention);
  const editMentions = useMentions(teamMembersForMention);

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
        organizationId: organization?.id,
        controlCode,
        controlName,
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
              <div className="space-y-2 relative">
                <Textarea
                  ref={editTextareaRef}
                  value={editContent}
                  onChange={(e) => {
                    const cursorPosition = e.target.selectionStart;
                    editMentions.handleInputChange(
                      e.target.value,
                      cursorPosition,
                      setEditContent
                    );
                  }}
                  onKeyDown={(e) =>
                    editMentions.handleKeyDown(e, editContent, setEditContent)
                  }
                  onBlur={() => setTimeout(() => editMentions.closeSuggestions(), 200)}
                  rows={2}
                  className="resize-none"
                />
                {editMentions.showSuggestions && (
                  <MentionSuggestions
                    suggestions={editMentions.suggestions}
                    onSelect={(name) =>
                      editMentions.selectMention(name, editContent, setEditContent)
                    }
                    selectedIndex={editMentions.selectedIndex}
                    textareaRef={editTextareaRef}
                  />
                )}
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
              <p className="text-sm">
                <FormatContentWithMentions content={comment.content} teamMembers={teamMembersForMention} />
              </p>
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
              <div className="relative mt-2">
                {replyMentions.showSuggestions && (
                  <MentionSuggestions
                    suggestions={replyMentions.suggestions}
                    onSelect={(name) =>
                      replyMentions.selectMention(name, newComment, setNewComment)
                    }
                    selectedIndex={replyMentions.selectedIndex}
                    textareaRef={replyTextareaRef}
                  />
                )}
                <div className="flex gap-2">
                  <Textarea
                    ref={replyTextareaRef}
                    value={newComment}
                    onChange={(e) => {
                      const cursorPosition = e.target.selectionStart;
                      replyMentions.handleInputChange(
                        e.target.value,
                        cursorPosition,
                        setNewComment
                      );
                    }}
                    onKeyDown={(e) =>
                      replyMentions.handleKeyDown(
                        e,
                        newComment,
                        setNewComment,
                        handleSubmit
                      )
                    }
                    onBlur={() => setTimeout(() => replyMentions.closeSuggestions(), 200)}
                    placeholder="Escreva sua resposta... Use @ para mencionar"
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
          <div className="relative">
            {mainMentions.showSuggestions && (
              <MentionSuggestions
                suggestions={mainMentions.suggestions}
                onSelect={(name) =>
                  mainMentions.selectMention(name, newComment, setNewComment)
                }
                selectedIndex={mainMentions.selectedIndex}
                textareaRef={textareaRef}
              />
            )}
            <div className="flex gap-2">
              <Textarea
                ref={textareaRef}
                value={newComment}
                onChange={(e) => {
                  const cursorPosition = e.target.selectionStart;
                  mainMentions.handleInputChange(
                    e.target.value,
                    cursorPosition,
                    setNewComment
                  );
                }}
                onKeyDown={(e) =>
                  mainMentions.handleKeyDown(
                    e,
                    newComment,
                    setNewComment,
                    handleSubmit
                  )
                }
                onBlur={() => setTimeout(() => mainMentions.closeSuggestions(), 200)}
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
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
