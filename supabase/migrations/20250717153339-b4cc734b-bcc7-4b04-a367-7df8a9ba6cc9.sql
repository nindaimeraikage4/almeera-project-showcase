
-- Add virtual tour tables and enhance content table
CREATE TABLE public.virtual_tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.tour_scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID REFERENCES public.virtual_tours(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  image_360_url TEXT NOT NULL,
  thumbnail_url TEXT,
  initial_view JSONB DEFAULT '{"yaw": 0, "pitch": 0, "fov": 90}',
  hotspots JSONB DEFAULT '[]',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.scene_hotspots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID REFERENCES public.tour_scenes(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('scene_link', 'info', 'media')) NOT NULL,
  title TEXT,
  description TEXT,
  position JSONB NOT NULL, -- {yaw, pitch}
  target_scene_id UUID REFERENCES public.tour_scenes(id),
  media_url TEXT,
  icon_type TEXT DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.image_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID REFERENCES public.tour_scenes(id) ON DELETE CASCADE NOT NULL,
  edit_type TEXT CHECK (edit_type IN ('remove_object', 'exposure', 'contrast', 'saturation', 'brightness', 'blur', 'clone')) NOT NULL,
  edit_data JSONB NOT NULL, -- Parameters for the edit
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Add tour_id to content table for linking portfolio items to tours
ALTER TABLE public.content ADD COLUMN tour_id UUID REFERENCES public.virtual_tours(id);

-- Enable RLS
ALTER TABLE public.virtual_tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scene_hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_edits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for virtual_tours
CREATE POLICY "Everyone can view published tours" ON public.virtual_tours
FOR SELECT USING (is_published = true OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all tours" ON public.virtual_tours
FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for tour_scenes
CREATE POLICY "Users can view scenes from published tours" ON public.tour_scenes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.virtual_tours 
    WHERE id = tour_scenes.tour_id 
    AND (is_published = true OR public.is_admin(auth.uid()))
  )
);

CREATE POLICY "Admins can manage all scenes" ON public.tour_scenes
FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for scene_hotspots
CREATE POLICY "Users can view hotspots from published tours" ON public.scene_hotspots
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.tour_scenes ts
    JOIN public.virtual_tours vt ON vt.id = ts.tour_id
    WHERE ts.id = scene_hotspots.scene_id 
    AND (vt.is_published = true OR public.is_admin(auth.uid()))
  )
);

CREATE POLICY "Admins can manage all hotspots" ON public.scene_hotspots
FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for image_edits
CREATE POLICY "Admins can manage all edits" ON public.image_edits
FOR ALL USING (public.is_admin(auth.uid()));

-- Create triggers for updated_at
CREATE TRIGGER update_virtual_tours_updated_at
BEFORE UPDATE ON public.virtual_tours
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tour_scenes_updated_at
BEFORE UPDATE ON public.tour_scenes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_tour_scenes_tour_id ON public.tour_scenes(tour_id);
CREATE INDEX idx_scene_hotspots_scene_id ON public.scene_hotspots(scene_id);
CREATE INDEX idx_image_edits_scene_id ON public.image_edits(scene_id);
CREATE INDEX idx_content_tour_id ON public.content(tour_id);
