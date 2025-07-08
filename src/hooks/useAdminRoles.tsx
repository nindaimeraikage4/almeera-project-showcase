import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RoleChangeRequest {
  userId: string;
  newRole: 'admin' | 'user' | 'super_admin';
  reason?: string;
}

interface RoleChangeResult {
  success: boolean;
  message: string;
  user?: {
    id: string;
    username: string;
    newRole: string;
  };
}

export const useAdminRoles = () => {
  const { toast } = useToast();

  const changeUserRole = async (
    userId: string, 
    newRole: 'admin' | 'user' | 'super_admin', 
    reason?: string
  ): Promise<RoleChangeResult> => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-manage-roles', {
        body: {
          userId,
          newRole,
          reason
        }
      });

      if (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return { success: false, message: error.message };
      }

      if (data.success) {
        toast({
          title: "Success",
          description: `Berhasil mengubah role ${data.user.username} menjadi ${data.user.newRole}`,
        });
      }

      return data;
    } catch (err: any) {
      console.error('Unexpected error:', err);
      toast({
        title: "Error",
        description: "Terjadi kesalahan yang tidak terduga",
        variant: "destructive",
      });
      return { success: false, message: err.message || 'Unknown error' };
    }
  };

  return {
    changeUserRole
  };
};