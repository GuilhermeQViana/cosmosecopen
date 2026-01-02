-- Add new fields to controls table
ALTER TABLE public.controls ADD COLUMN IF NOT EXISTS weight INTEGER DEFAULT 1 CHECK (weight >= 1 AND weight <= 5);
ALTER TABLE public.controls ADD COLUMN IF NOT EXISTS criticality TEXT CHECK (criticality IN ('baixo', 'medio', 'alto', 'critico'));
ALTER TABLE public.controls ADD COLUMN IF NOT EXISTS weight_reason TEXT;
ALTER TABLE public.controls ADD COLUMN IF NOT EXISTS implementation_example TEXT;
ALTER TABLE public.controls ADD COLUMN IF NOT EXISTS evidence_example TEXT;

-- Create assessment_comments table
CREATE TABLE public.assessment_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  parent_id UUID REFERENCES public.assessment_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on assessment_comments
ALTER TABLE public.assessment_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for assessment_comments
CREATE POLICY "Users can view assessment comments"
ON public.assessment_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.assessments a
    WHERE a.id = assessment_comments.assessment_id
    AND user_belongs_to_org(auth.uid(), a.organization_id)
  )
);

CREATE POLICY "Users can manage assessment comments"
ON public.assessment_comments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.assessments a
    WHERE a.id = assessment_comments.assessment_id
    AND user_belongs_to_org(auth.uid(), a.organization_id)
  )
);

-- Create comment_reactions table
CREATE TABLE public.comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.assessment_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'dislike', 'emoji')),
  emoji TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(comment_id, user_id, reaction_type)
);

-- Enable RLS on comment_reactions
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for comment_reactions
CREATE POLICY "Users can view reactions"
ON public.comment_reactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.assessment_comments ac
    JOIN public.assessments a ON a.id = ac.assessment_id
    WHERE ac.id = comment_reactions.comment_id
    AND user_belongs_to_org(auth.uid(), a.organization_id)
  )
);

CREATE POLICY "Users can manage their reactions"
ON public.comment_reactions
FOR ALL
USING (user_id = auth.uid());

-- Create indexes
CREATE INDEX idx_assessment_comments_assessment ON public.assessment_comments(assessment_id);
CREATE INDEX idx_assessment_comments_parent ON public.assessment_comments(parent_id);
CREATE INDEX idx_comment_reactions_comment ON public.comment_reactions(comment_id);

-- Trigger to update updated_at
CREATE TRIGGER update_assessment_comments_updated_at
BEFORE UPDATE ON public.assessment_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();