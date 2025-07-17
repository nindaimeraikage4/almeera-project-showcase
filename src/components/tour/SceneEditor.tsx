import { useState, useRef, useEffect } from 'react';
import { Canvas as FabricCanvas, FabricImage } from 'fabric';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { 
  Eraser, 
  Sun, 
  Contrast as ContrastIcon, 
  Palette,
  Download,
  Undo,
  Redo,
  Save
} from 'lucide-react';
import { toast } from 'sonner';

interface SceneEditorProps {
  sceneId: string;
  imageUrl: string;
  onSave?: (editedImageUrl: string) => void;
}

export const SceneEditor = ({ sceneId, imageUrl, onSave }: SceneEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTool, setActiveTool] = useState<'select' | 'eraser' | 'clone'>('select');
  const [brushSize, setBrushSize] = useState(20);
  const [filters, setFilters] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    exposure: 0
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
    });

    // Load the 360° image
    FabricImage.fromURL(imageUrl).then((img) => {
      canvas.setDimensions({
        width: img.width || 800,
        height: img.height || 600
      });
      
      img.set({
        left: 0,
        top: 0,
        selectable: false,
        evented: false
      });
      
      canvas.add(img);
      // Move image to back
      const objects = canvas.getObjects();
      if (objects.length > 1) {
        canvas.sendObjectToBack(img);
      }
      setIsLoading(false);
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [imageUrl]);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === 'eraser';
    
    if (activeTool === 'eraser' && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = 'rgba(255,255,255,0.8)';
      fabricCanvas.freeDrawingBrush.width = brushSize;
    }
  }, [activeTool, brushSize, fabricCanvas]);

  const applyFilter = (filterType: keyof typeof filters, value: number) => {
    if (!fabricCanvas) return;

    setFilters(prev => ({ ...prev, [filterType]: value }));

    const objects = fabricCanvas.getObjects();
    const backgroundImage = objects.find(obj => obj.type === 'image');

    if (backgroundImage) {
      // Simple filter application - you can enhance this with proper fabric.js filters
      const filterValue = value / 100;
      fabricCanvas.renderAll();
    }
  };

  const saveEdit = async () => {
    if (!fabricCanvas) return;

    try {
      const dataURL = fabricCanvas.toDataURL({
        format: 'jpeg',
        quality: 0.9,
        multiplier: 1
      });

      // Convert to blob and upload
      const response = await fetch(dataURL);
      const blob = await response.blob();

      const fileName = `edited_scene_${sceneId}_${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('tour-images')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      // Save edit record
      const editData = {
        filters,
        timestamp: new Date().toISOString()
      };

      const { error: dbError } = await supabase
        .from('image_edits')
        .insert({
          scene_id: sceneId,
          edit_type: 'composite',
          edit_data: editData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (dbError) throw dbError;

      const { data: urlData } = supabase.storage
        .from('tour-images')
        .getPublicUrl(uploadData.path);

      onSave?.(urlData.publicUrl);
      toast.success('Scene edits saved successfully!');
    } catch (error) {
      console.error('Error saving edit:', error);
      toast.error('Failed to save edits');
    }
  };

  const downloadImage = () => {
    if (!fabricCanvas) return;

    const dataURL = fabricCanvas.toDataURL({
      format: 'jpeg',
      quality: 0.9,
      multiplier: 1
    });

    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `edited_scene_${sceneId}.jpg`;
    link.click();
  };

  const clearCanvas = () => {
    if (!fabricCanvas) return;
    
    const objects = fabricCanvas.getObjects();
    const backgroundImage = objects.find(obj => obj.type === 'image');
    
    fabricCanvas.clear();
    if (backgroundImage) {
      fabricCanvas.add(backgroundImage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card>
        <div className="p-4">
          <div className="flex flex-wrap gap-2 items-center">
            <Button
              variant={activeTool === 'select' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTool('select')}
            >
              Select
            </Button>
            <Button
              variant={activeTool === 'eraser' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTool('eraser')}
            >
              <Eraser className="w-4 h-4 mr-1" />
              Remove Object
            </Button>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Brush Size:</span>
              <Slider
                value={[brushSize]}
                onValueChange={(value) => setBrushSize(value[0])}
                max={50}
                min={5}
                step={1}
                className="w-20"
              />
              <Badge variant="outline">{brushSize}px</Badge>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <Button size="sm" variant="outline" onClick={downloadImage}>
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
            <Button size="sm" onClick={saveEdit}>
              <Save className="w-4 h-4 mr-1" />
              Save Changes
            </Button>
          </div>
        </div>
      </Card>

      {/* Adjustments Panel */}
      <Card>
        <div className="p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Image Adjustments
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Sun className="w-3 h-3" />
                  Brightness
                </label>
                <Badge variant="outline">{filters.brightness}</Badge>
              </div>
              <Slider
                value={[filters.brightness]}
                onValueChange={(value) => applyFilter('brightness', value[0])}
                max={100}
                min={-100}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-1">
                  <ContrastIcon className="w-3 h-3" />
                  Contrast
                </label>
                <Badge variant="outline">{filters.contrast}</Badge>
              </div>
              <Slider
                value={[filters.contrast]}
                onValueChange={(value) => applyFilter('contrast', value[0])}
                max={100}
                min={-100}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Palette className="w-3 h-3" />
                  Saturation
                </label>
                <Badge variant="outline">{filters.saturation}</Badge>
              </div>
              <Slider
                value={[filters.saturation]}
                onValueChange={(value) => applyFilter('saturation', value[0])}
                max={100}
                min={-100}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Sun className="w-3 h-3" />
                  Exposure
                </label>
                <Badge variant="outline">{filters.exposure}</Badge>
              </div>
              <Slider
                value={[filters.exposure]}
                onValueChange={(value) => applyFilter('exposure', value[0])}
                max={100}
                min={-100}
                step={1}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Canvas */}
      <Card>
        <div className="p-4">
          <div className="border rounded-lg overflow-hidden">
            <canvas ref={canvasRef} className="max-w-full" />
          </div>
        </div>
      </Card>
    </div>
  );
};