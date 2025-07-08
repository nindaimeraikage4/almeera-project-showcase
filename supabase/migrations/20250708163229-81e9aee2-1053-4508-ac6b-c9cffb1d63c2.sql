-- Insert super admin role for nindaimeraikage4@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT '3c54c418-85d2-49e8-bb85-25c8abc26ce0', 'super_admin'::app_role
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = '3c54c418-85d2-49e8-bb85-25c8abc26ce0'
);

-- Drop the old trigger and function properly
DROP TRIGGER IF EXISTS assign_super_admin_trigger ON auth.users;
DROP FUNCTION IF EXISTS public.assign_super_admin() CASCADE;

CREATE OR REPLACE FUNCTION public.assign_super_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if the new user is the super admin email
    IF NEW.email = 'nindaimeraikage4@gmail.com' THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'super_admin'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    ELSE
        -- Insert default user role for other users
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'user'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER assign_super_admin_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.assign_super_admin();