import { useState, useEffect } from 'react';
import { Pannellum } from 'pannellum-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Edit, Navigation, Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface TourScene {
  id: string;
  title: string;
  image_360_url: string;
  thumbnail_url?: string;
  initial_view: {
    yaw: number;
    pitch: number;
    fov: number;
  };
  hotspots: Hotspot[];
  order_index: number;
}

interface Hotspot {
  id: string;
  type: 'scene_link' | 'info' | 'media';
  title?: string;
  description?: string;
  position: {
    yaw: number;
    pitch: number;
  };
  target_scene_id?: string;
  media_url?: string;
  icon_type: string;
}

interface VirtualTour360Props {
  tourId: string;
  isEditMode?: boolean;
  onEditScene?: (sceneId: string) => void;
}

export const VirtualTour360 = ({ tourId, isEditMode = false, onEditScene }: VirtualTour360Props) => {
  const { isAdmin } = useAuth();
  const [scenes, setScenes] = useState<TourScene[]>([]);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hotspots, setHotspots] = useState<any[]>([]);

  const currentScene = scenes[currentSceneIndex];

  useEffect(() => {
    fetchTourScenes();
  }, [tourId]);

  useEffect(() => {
    if (currentScene) {
      fetchHotspots();
    }
  }, [currentScene]);

  const fetchTourScenes = async () => {
    try {
      const { data, error } = await supabase
        .from('tour_scenes')
        .select('*')
        .eq('tour_id', tourId)
        .order('order_index');

      if (error) throw error;
      setScenes((data || []).map(scene => ({
        ...scene,
        initial_view: typeof scene.initial_view === 'string' 
          ? JSON.parse(scene.initial_view) 
          : scene.initial_view || { yaw: 0, pitch: 0, fov: 90 },
        hotspots: typeof scene.hotspots === 'string'
          ? JSON.parse(scene.hotspots)
          : scene.hotspots || []
      })) as TourScene[]);
    } catch (error) {
      console.error('Error fetching tour scenes:', error);
      toast.error('Failed to load tour scenes');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHotspots = async () => {
    try {
      const { data, error } = await supabase
        .from('scene_hotspots')
        .select('*')
        .eq('scene_id', currentScene.id);

      if (error) throw error;
      
      // Convert hotspots to Pannellum format
      const pannellumHotspots = (data || []).map(hotspot => ({
        id: hotspot.id,
        type: hotspot.type === 'scene_link' ? 'scene' : 'info',
        yaw: (hotspot.position as any)?.yaw || 0,
        pitch: (hotspot.position as any)?.pitch || 0,
        text: hotspot.title || '',
        sceneId: hotspot.target_scene_id,
        clickHandlerFunc: () => handleHotspotClick(hotspot)
      }));

      setHotspots(pannellumHotspots);
    } catch (error) {
      console.error('Error fetching hotspots:', error);
    }
  };

  const handleHotspotClick = (hotspot: any) => {
    if (hotspot.type === 'scene_link' && hotspot.target_scene_id) {
      const targetSceneIndex = scenes.findIndex(scene => scene.id === hotspot.target_scene_id);
      if (targetSceneIndex !== -1) {
        setCurrentSceneIndex(targetSceneIndex);
      }
    } else if (hotspot.type === 'info') {
      toast.info(hotspot.description || hotspot.title);
    }
  };

  const navigateToScene = (index: number) => {
    setCurrentSceneIndex(index);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentScene) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">No scenes available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {/* Scene Navigation */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {scenes.map((scene, index) => (
          <Card
            key={scene.id}
            className={`flex-shrink-0 cursor-pointer transition-all ${
              index === currentSceneIndex 
                ? 'ring-2 ring-primary' 
                : 'hover:ring-1 hover:ring-primary/50'
            }`}
            onClick={() => navigateToScene(index)}
          >
            <div className="p-2 flex items-center gap-2 min-w-0">
              {scene.thumbnail_url && (
                <img 
                  src={scene.thumbnail_url} 
                  alt={scene.title}
                  className="w-12 h-8 object-cover rounded"
                />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{scene.title}</p>
                <Badge variant="secondary" className="text-xs">
                  Scene {index + 1}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 360° Viewer */}
      <div className="relative h-96 md:h-[600px] rounded-lg overflow-hidden">
        <Pannellum
          width="100%"
          height="100%"
          image={currentScene.image_360_url}
          pitch={currentScene.initial_view.pitch}
          yaw={currentScene.initial_view.yaw}
          fov={currentScene.initial_view.fov}
          autoLoad
          hotSpots={hotspots}
          showZoomCtrl
          showFullscreenCtrl
          showControls
          autoRotate={-2}
          autoRotateInactivityDelay={3000}
          autoRotateStopDelay={1000}
        />

        {/* Scene Info Overlay */}
        <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3">
          <h3 className="font-semibold">{currentScene.title}</h3>
          <p className="text-sm text-muted-foreground">
            Scene {currentSceneIndex + 1} of {scenes.length}
          </p>
        </div>

        {/* Edit Controls */}
        {isAdmin && isEditMode && (
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              size="sm"
              onClick={() => onEditScene?.(currentScene.id)}
              className="bg-background/90 backdrop-blur-sm hover:bg-background/95"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit Scene
            </Button>
          </div>
        )}

        {/* Navigation Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={currentSceneIndex === 0}
            onClick={() => navigateToScene(currentSceneIndex - 1)}
            className="bg-background/90 backdrop-blur-sm"
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={currentSceneIndex === scenes.length - 1}
            onClick={() => navigateToScene(currentSceneIndex + 1)}
            className="bg-background/90 backdrop-blur-sm"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Scene Information */}
      <Card className="mt-4">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4" />
            <h4 className="font-medium">Scene Information</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Use mouse to look around, scroll to zoom. Click on hotspots to navigate or view information.
          </p>
          <div className="flex gap-2 text-xs">
            <Badge variant="outline">
              <Navigation className="w-3 h-3 mr-1" />
              Navigation Hotspots
            </Badge>
            <Badge variant="outline">
              <Info className="w-3 h-3 mr-1" />
              Information Points
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};