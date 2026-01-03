-- Add icon column to frameworks table
ALTER TABLE public.frameworks 
ADD COLUMN icon TEXT DEFAULT 'shield';