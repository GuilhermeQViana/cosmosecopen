import { useState, useCallback } from "react";
import { GripVertical, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DraggableControlListProps {
  controlIds: string[];
  onReorder: (newOrder: string[]) => void;
  onReset: () => void;
  hasCustomOrder: boolean;
}

export function DraggableControlList({
  controlIds,
  onReorder,
  onReset,
  hasCustomOrder,
}: DraggableControlListProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== id) {
      setDragOverId(id);
    }
  }, [draggedId]);

  const handleDragLeave = useCallback(() => {
    setDragOverId(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const newOrder = [...controlIds];
    const draggedIndex = newOrder.indexOf(draggedId);
    const targetIndex = newOrder.indexOf(targetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedId);
      onReorder(newOrder);
    }

    setDraggedId(null);
    setDragOverId(null);
  }, [draggedId, controlIds, onReorder]);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDragOverId(null);
  }, []);

  return {
    draggedId,
    dragOverId,
    hasCustomOrder,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    onReset,
  };
}

interface DragHandleProps {
  controlId: string;
  dragHandlers: ReturnType<typeof DraggableControlList>;
  className?: string;
}

export function DragHandle({ controlId, dragHandlers, className }: DragHandleProps) {
  const {
    draggedId,
    dragOverId,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  } = dragHandlers;

  const isDragging = draggedId === controlId;
  const isDragOver = dragOverId === controlId;

  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, controlId)}
      onDragOver={(e) => handleDragOver(e, controlId)}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, controlId)}
      onDragEnd={handleDragEnd}
      className={cn(
        "cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted/50 transition-colors",
        isDragging && "opacity-50",
        isDragOver && "ring-2 ring-primary ring-offset-2",
        className
      )}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}

interface ResetOrderButtonProps {
  hasCustomOrder: boolean;
  onReset: () => void;
}

export function ResetOrderButton({ hasCustomOrder, onReset }: ResetOrderButtonProps) {
  if (!hasCustomOrder) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onReset}
      className="gap-2"
    >
      <RotateCcw className="h-4 w-4" />
      Resetar Ordem
    </Button>
  );
}

export function useDragAndDrop(
  initialOrder: string[],
  storageKey: string
) {
  const getStoredOrder = (): string[] | null => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const [customOrder, setCustomOrder] = useState<string[] | null>(getStoredOrder);

  const handleReorder = useCallback((newOrder: string[]) => {
    setCustomOrder(newOrder);
    localStorage.setItem(storageKey, JSON.stringify(newOrder));
  }, [storageKey]);

  const handleReset = useCallback(() => {
    setCustomOrder(null);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  const getOrderedIds = useCallback((ids: string[]): string[] => {
    if (!customOrder) return ids;
    
    // Include new items that aren't in the custom order
    const orderedIds = customOrder.filter(id => ids.includes(id));
    const newIds = ids.filter(id => !customOrder.includes(id));
    return [...orderedIds, ...newIds];
  }, [customOrder]);

  return {
    customOrder,
    hasCustomOrder: customOrder !== null,
    handleReorder,
    handleReset,
    getOrderedIds,
  };
}
