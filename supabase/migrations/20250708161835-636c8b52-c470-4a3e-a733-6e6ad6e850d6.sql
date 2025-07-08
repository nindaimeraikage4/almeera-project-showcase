-- Create role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create content management table
CREATE TABLE public.content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('photo', 'video', '360_tour')),
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    category TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Create function to check user roles (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
        AND role = _role
    )
$$;

-- Create function to check if user is admin or super admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
        AND role IN ('admin', 'super_admin')
    )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Super admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for content
CREATE POLICY "Everyone can view content"
ON public.content
FOR SELECT
USING (true);

CREATE POLICY "Admins can create content"
ON public.content
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()) AND auth.uid() = created_by);

CREATE POLICY "Admins can update content"
ON public.content
FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete content"
ON public.content
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Create triggers for updated_at
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_updated_at
BEFORE UPDATE ON public.content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert super admin role for nindaimeraikage4@gmail.com
-- Note: This will be inserted after user signs up, or we can create a trigger
CREATE OR REPLACE FUNCTION public.assign_super_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if the new user is the super admin email
    IF NEW.email = 'nindaimeraikage4@gmail.com' THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'super_admin');
    END IF;
    RETURN NEW;
END;
$$;

-- Create trigger to auto-assign super admin role
CREATE TRIGGER assign_super_admin_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.assign_super_admin();