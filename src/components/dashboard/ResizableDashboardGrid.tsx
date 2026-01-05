import { useState, useCallback, ReactNode, useEffect } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import { Button } from '@/components/ui/button';
import { 
  Maximize2, 
  Minimize2, 
  LayoutGrid, 
  RotateCcw,
  Lock,
  Unlock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

export interface DashboardWidget {
  id: string;
  component: ReactNode;
  title?: string;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  defaultW?: number;
  defaultH?: number;
}

interface ResizableDashboardGridProps {
  widgets: DashboardWidget[];
  columns?: number;
  rowHeight?: number;
  storageKey?: string;
}

const STORAGE_KEY_PREFIX = 'dashboard-layout-';

export function ResizableDashboardGrid({
  widgets,
  columns = 12,
  rowHeight = 100,
  storageKey = 'default',
}: ResizableDashboardGridProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [containerWidth, setContainerWidth] = useState(1200);

  // Generate default layout
  const generateDefaultLayout = useCallback((): Layout[] => {
    let currentY = 0;
    return widgets.map((widget, index) => {
      const w = widget.defaultW || 4;
      const h = widget.defaultH || 3;
      const x = (index % (columns / w)) * w;
      
      if (index > 0 && x === 0) {
        currentY += h;
      }
      
      return {
        i: widget.id,
        x: x % columns,
        y: currentY,
        w,
        h,
        minW: widget.minW || 2,
        minH: widget.minH || 2,
        maxW: widget.maxW || 12,
        maxH: widget.maxH || 8,
      };
    });
  }, [widgets, columns]);

  // Load layout from localStorage or use default
  const loadLayout = useCallback((): Layout[] => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${storageKey}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge saved layout with current widgets (in case widgets changed)
        const savedMap = new Map<string, Layout>(parsed.map((l: Layout) => [l.i, l]));
        return widgets.map((widget, index) => {
          const savedLayout = savedMap.get(widget.id);
          if (savedLayout) {
            return {
              i: savedLayout.i,
              x: savedLayout.x,
              y: savedLayout.y,
              w: savedLayout.w,
              h: savedLayout.h,
              minW: widget.minW || 2,
              minH: widget.minH || 2,
              maxW: widget.maxW || 12,
              maxH: widget.maxH || 8,
            };
          }
          return generateDefaultLayout()[index];
        });
      } catch {
        return generateDefaultLayout();
      }
    }
    return generateDefaultLayout();
  }, [storageKey, widgets, generateDefaultLayout]);

  const [layout, setLayout] = useState<Layout[]>(loadLayout);

  // Sync layout when widgets change
  useEffect(() => {
    setLayout(loadLayout());
  }, [widgets.length]);

  // Measure container width
  useEffect(() => {
    const updateWidth = () => {
      const container = document.querySelector('.dashboard-grid-container');
      if (container) {
        setContainerWidth(container.clientWidth);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Save layout to localStorage
  const saveLayout = useCallback((newLayout: Layout[]) => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${storageKey}`, JSON.stringify(newLayout));
  }, [storageKey]);

  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    setLayout(newLayout);
    if (isEditMode) {
      saveLayout(newLayout);
    }
  }, [isEditMode, saveLayout]);

  const handleResetLayout = useCallback(() => {
    const defaultLayout = generateDefaultLayout();
    setLayout(defaultLayout);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${storageKey}`);
  }, [generateDefaultLayout, storageKey]);

  return (
    <div className="dashboard-grid-container w-full">
      {/* Edit Mode Controls */}
      <div className="flex items-center justify-end gap-2 mb-4">
        <Button
          variant={isEditMode ? "default" : "outline"}
          size="sm"
          onClick={() => setIsEditMode(!isEditMode)}
          className="gap-2"
        >
          {isEditMode ? (
            <>
              <Lock className="h-4 w-4" />
              Bloquear Layout
            </>
          ) : (
            <>
              <Unlock className="h-4 w-4" />
              Editar Layout
            </>
          )}
        </Button>
        {isEditMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetLayout}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar Padrão
          </Button>
        )}
      </div>

      {/* Grid Layout */}
      <GridLayout
        className="layout"
        layout={layout}
        cols={columns}
        rowHeight={rowHeight}
        width={containerWidth}
        onLayoutChange={handleLayoutChange}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        draggableHandle=".widget-drag-handle"
        margin={[16, 16]}
        containerPadding={[0, 0]}
        useCSSTransforms
      >
        {widgets.map((widget) => (
          <div
            key={widget.id}
            className={cn(
              "relative group",
              isEditMode && "ring-2 ring-primary/20 ring-offset-2 ring-offset-background rounded-lg"
            )}
          >
            {/* Widget Content */}
            <div className="h-full w-full overflow-auto">
              {widget.component}
            </div>

            {/* Edit Mode Overlay */}
            {isEditMode && (
              <>
                {/* Drag Handle */}
                <div className="widget-drag-handle absolute top-2 left-2 z-10 p-1.5 rounded-md bg-primary/90 text-primary-foreground cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                  <LayoutGrid className="h-4 w-4" />
                </div>

                {/* Resize Indicator */}
                <div className="absolute bottom-2 right-2 z-10 p-1 rounded-md bg-muted/80 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="h-3 w-3" />
                </div>
              </>
            )}
          </div>
        ))}
      </GridLayout>

      {/* Edit Mode Hint */}
      {isEditMode && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm">
          <LayoutGrid className="h-4 w-4" />
          Arraste para mover, redimensione pelas bordas
        </div>
      )}
    </div>
  );
}

// Simplified wrapper for individual widget sizing
interface ResizableWidgetProps {
  children: ReactNode;
  className?: string;
}

export function ResizableWidget({ children, className }: ResizableWidgetProps) {
  return (
    <div className={cn("h-full w-full", className)}>
      {children}
    </div>
  );
}
