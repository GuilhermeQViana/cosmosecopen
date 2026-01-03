-- Add notification preferences and layout density to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_notifications boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS risk_alerts boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS due_date_reminders boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS layout_density text DEFAULT 'default';

-- Add check constraint for layout_density
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_layout_density_check 
CHECK (layout_density IN ('compact', 'default', 'comfortable'));