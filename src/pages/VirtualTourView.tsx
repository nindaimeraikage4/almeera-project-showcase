import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { VirtualTour360 } from '@/components/tour/VirtualTour360';
import { SceneEditor } from '@/components/tour/SceneEditor';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Edit, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface VirtualTour {
  id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  is_published: boolean;
  created_at: string;
}

export const VirtualTourView = () => {
  const { tourId } = useParams<{ tourId: string }>();
  const { isAdmin } = useAuth();
  const [tour, setTour] = useState<VirtualTour | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);

  useEffect(() => {
    if (tourId) {
      fetchTour();
    }
  }, [tourId]);

  const fetchTour = async () => {
    if (!tourId) return;

    try {
      const { data, error } = await supabase
        .from('virtual_tours')
        .select('*')
        .eq('id', tourId)
        .single();

      if (error) throw error;
      setTour(data);
    } catch (error) {
      console.error('Error fetching tour:', error);
      toast.error('Failed to load virtual tour');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditScene = (sceneId: string) => {
    setEditingSceneId(sceneId);
  };

  const handleSaveEdit = (editedImageUrl: string) => {
    toast.success('Scene updated successfully!');
    setEditingSceneId(null);
    // Optionally refresh the tour data
  };

  if (!tourId) {
    return <Navigate to="/portfolio" replace />;
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!tour) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Tour Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The virtual tour you're looking for doesn't exist or is not available.
            </p>
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            {isAdmin && (
              <div className="flex gap-2">
                <Button
                  variant={isEditMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIsEditMode(!isEditMode)}
                >
                  {isEditMode ? (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      View Mode
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Mode
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">{tour.title}</h1>
              {tour.description && (
                <p className="text-lg text-muted-foreground mt-2">
                  {tour.description}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Badge variant={tour.is_published ? 'default' : 'secondary'}>
                {tour.is_published ? 'Published' : 'Draft'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Scene Editor (when editing specific scene) */}
        {editingSceneId && (
          <Card className="mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Edit Scene</h2>
                <Button
                  variant="outline"
                  onClick={() => setEditingSceneId(null)}
                >
                  Close Editor
                </Button>
              </div>
              <SceneEditor
                sceneId={editingSceneId}
                imageUrl="" // This should be fetched from the scene data
                onSave={handleSaveEdit}
              />
            </div>
          </Card>
        )}

        {/* Virtual Tour Viewer */}
        <Card>
          <div className="p-6">
            <VirtualTour360
              tourId={tourId}
              isEditMode={isEditMode}
              onEditScene={handleEditScene}
            />
          </div>
        </Card>

        {/* Tour Information */}
        <Card className="mt-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">About This Tour</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Created:</span>{' '}
                {new Date(tour.created_at).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Status:</span>{' '}
                <Badge variant={tour.is_published ? 'default' : 'secondary'}>
                  {tour.is_published ? 'Published' : 'Draft'}
                </Badge>
              </div>
            </div>
            {tour.description && (
              <div className="mt-4">
                <p className="text-muted-foreground">{tour.description}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
};