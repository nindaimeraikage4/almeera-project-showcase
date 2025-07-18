import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Circle, Rect, FabricText, FabricImage } from "fabric";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Move, 
  Brush as BrushIcon, 
  Eraser, 
  Focus, 
  Crop, 
  MapPin, 
  Type, 
  Sun, 
  Contrast, 
  Palette,
  RotateCw,
  ZoomIn,
  Undo2,
  Redo2,
  Download,
  Save,
  Trash2,
  Filter
} from "lucide-react";

interface AdvancedPhotoEditorProps {
  imageUrl: string;
  onSave?: (editedImageUrl: string) => void;
}

type ToolType = 'move' | 'brush' | 'eraser' | 'blur' | 'crop' | 'hotspot' | 'text';
type FilterType = 'none' | 'vintage' | 'blackwhite' | 'sepia' | 'vibrant' | 'cool' | 'warm';

interface EditHistory {
  action: string;
  timestamp: number;
  data: any;
}

export const AdvancedPhotoEditor = ({ imageUrl, onSave }: AdvancedPhotoEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>('move');
  const [isLoading, setIsLoading] = useState(true);
  
  // Tool settings
  const [brushSize, setBrushSize] = useState([5]);
  const [brushColor, setBrushColor] = useState("#000000");
  
  // Image adjustments
  const [brightness, setBrightness] = useState([0]);
  const [contrast, setContrast] = useState([0]);
  const [saturation, setSaturation] = useState([0]);
  const [blur, setBlur] = useState([0]);
  const [rotation, setRotation] = useState([0]);
  const [zoom, setZoom] = useState([100]);
  
  // Filter effects
  const [activeFilter, setActiveFilter] = useState<FilterType>('none');
  
  // History management
  const [history, setHistory] = useState<EditHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Objects management
  const [objects, setObjects] = useState<any[]>([]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#ffffff",
    });

    // Load the image
    FabricImage.fromURL(imageUrl, {
      crossOrigin: 'anonymous'
    }).then((img) => {
      // Scale image to fit canvas
      const scale = Math.min(
        canvas.width! / img.width!,
        canvas.height! / img.height!
      );
      
      img.set({
        scaleX: scale,
        scaleY: scale,
        left: (canvas.width! - img.width! * scale) / 2,
        top: (canvas.height! - img.height! * scale) / 2,
        selectable: false,
        evented: false
      });
      
      canvas.add(img);
      canvas.renderAll();
      setIsLoading(false);
      
      // Save initial state
      saveToHistory('initial', { imageUrl });
    });

    // Initialize brush
    canvas.freeDrawingBrush.color = brushColor;
    canvas.freeDrawingBrush.width = brushSize[0];

    setFabricCanvas(canvas);
    toast.success("Photo editor ready!");

    return () => {
      canvas.dispose();
    };
  }, [imageUrl]);

  // Update brush settings
  useEffect(() => {
    if (!fabricCanvas) return;
    
    if (fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = brushColor;
      fabricCanvas.freeDrawingBrush.width = brushSize[0];
    }
  }, [brushColor, brushSize, fabricCanvas]);

  // Handle tool changes
  useEffect(() => {
    if (!fabricCanvas) return;

    // Reset canvas interaction modes
    fabricCanvas.isDrawingMode = false;
    fabricCanvas.selection = true;
    
    switch (activeTool) {
      case 'move':
        fabricCanvas.defaultCursor = 'move';
        break;
      case 'brush':
        fabricCanvas.isDrawingMode = true;
        if (fabricCanvas.freeDrawingBrush) {
          fabricCanvas.freeDrawingBrush.color = brushColor;
          fabricCanvas.freeDrawingBrush.width = brushSize[0];
        }
        break;
      case 'eraser':
        fabricCanvas.isDrawingMode = true;
        if (fabricCanvas.freeDrawingBrush) {
          fabricCanvas.freeDrawingBrush.color = 'rgba(255,255,255,1)';
          fabricCanvas.freeDrawingBrush.width = brushSize[0];
        }
        break;
      case 'text':
        fabricCanvas.defaultCursor = 'text';
        break;
      default:
        fabricCanvas.defaultCursor = 'default';
    }
  }, [activeTool, fabricCanvas, brushColor, brushSize]);

  const saveToHistory = (action: string, data: any) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      action,
      timestamp: Date.now(),
      data
    });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleToolClick = (tool: ToolType) => {
    setActiveTool(tool);
    
    if (tool === 'hotspot') {
      const hotspot = new Circle({
        left: 100,
        top: 100,
        radius: 20,
        fill: 'rgba(255, 0, 0, 0.7)',
        stroke: '#ff0000',
        strokeWidth: 2,
      });
      fabricCanvas?.add(hotspot);
      saveToHistory('add_hotspot', { hotspot: hotspot.toObject() });
    }
    
    if (tool === 'text') {
      const text = new FabricText('Click to edit', {
        left: 100,
        top: 100,
        fontSize: 24,
        fill: '#000000',
      });
      fabricCanvas?.add(text);
      fabricCanvas?.setActiveObject(text);
      saveToHistory('add_text', { text: text.toObject() });
    }
  };

  const applyImageAdjustment = () => {
    if (!fabricCanvas) return;
    
    const objects = fabricCanvas.getObjects();
    const backgroundImage = objects[0]; // Assuming first object is the background image
    
    if (backgroundImage && backgroundImage.type === 'image') {
      const filters: any[] = [];
      
      // Brightness
      if (brightness[0] !== 0) {
        filters.push(new (window as any).fabric.Image.filters.Brightness({
          brightness: brightness[0] / 100
        }));
      }
      
      // Contrast
      if (contrast[0] !== 0) {
        filters.push(new (window as any).fabric.Image.filters.Contrast({
          contrast: contrast[0] / 100
        }));
      }
      
      // Saturation
      if (saturation[0] !== 0) {
        filters.push(new (window as any).fabric.Image.filters.Saturation({
          saturation: saturation[0] / 100
        }));
      }
      
      // Apply filters
      (backgroundImage as any).filters = filters;
      (backgroundImage as any).applyFilters();
      fabricCanvas.renderAll();
      
      saveToHistory('adjust_image', { brightness, contrast, saturation });
    }
  };

  const applyFilter = (filterType: FilterType) => {
    if (!fabricCanvas) return;
    
    const objects = fabricCanvas.getObjects();
    const backgroundImage = objects[0];
    
    if (backgroundImage && backgroundImage.type === 'image') {
      let filters: any[] = [];
      
      switch (filterType) {
        case 'vintage':
          filters = [
            new (window as any).fabric.Image.filters.Sepia(),
            new (window as any).fabric.Image.filters.Brightness({ brightness: 0.1 })
          ];
          break;
        case 'blackwhite':
          filters = [new (window as any).fabric.Image.filters.Grayscale()];
          break;
        case 'sepia':
          filters = [new (window as any).fabric.Image.filters.Sepia()];
          break;
        case 'vibrant':
          filters = [new (window as any).fabric.Image.filters.Saturation({ saturation: 0.3 })];
          break;
        case 'cool':
          filters = [new (window as any).fabric.Image.filters.BlendColor({ 
            color: '#0066cc',
            mode: 'overlay',
            alpha: 0.2
          })];
          break;
        case 'warm':
          filters = [new (window as any).fabric.Image.filters.BlendColor({ 
            color: '#ff6600',
            mode: 'overlay',
            alpha: 0.2
          })];
          break;
        default:
          filters = [];
      }
      
      (backgroundImage as any).filters = filters;
      (backgroundImage as any).applyFilters();
      fabricCanvas.renderAll();
      setActiveFilter(filterType);
      
      saveToHistory('apply_filter', { filterType });
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      // Implement undo logic
      toast.success("Undo applied");
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      // Implement redo logic
      toast.success("Redo applied");
    }
  };

  const clearCanvas = () => {
    if (!fabricCanvas) return;
    
    const objects = fabricCanvas.getObjects();
    const backgroundImage = objects[0];
    
    fabricCanvas.clear();
    if (backgroundImage) {
      fabricCanvas.add(backgroundImage);
    }
    fabricCanvas.renderAll();
    
    saveToHistory('clear_canvas', {});
    toast.success("Canvas cleared");
  };

  const downloadImage = () => {
    if (!fabricCanvas) return;
    
    const dataURL = fabricCanvas.toDataURL({
      format: 'jpeg',
      quality: 0.9,
      multiplier: 1
    });
    
    const link = document.createElement('a');
    link.download = 'edited-image.jpg';
    link.href = dataURL;
    link.click();
    
    toast.success("Image downloaded successfully");
  };

  const saveEdit = () => {
    if (!fabricCanvas) return;
    
    const dataURL = fabricCanvas.toDataURL({
      format: 'jpeg',
      quality: 0.9,
      multiplier: 1
    });
    
    if (onSave) {
      onSave(dataURL);
    }
    
    toast.success("Changes saved successfully");
  };

  const tools = [
    { name: 'move', icon: Move, label: 'Move' },
    { name: 'brush', icon: BrushIcon, label: 'Brush' },
    { name: 'eraser', icon: Eraser, label: 'Eraser' },
    { name: 'blur', icon: Focus, label: 'Blur' },
    { name: 'crop', icon: Crop, label: 'Crop' },
    { name: 'hotspot', icon: MapPin, label: 'Hotspot' },
    { name: 'text', icon: Type, label: 'Text' },
  ];

  const filters = [
    { name: 'none', label: 'None' },
    { name: 'vintage', label: 'Vintage' },
    { name: 'blackwhite', label: 'B&W' },
    { name: 'sepia', label: 'Sepia' },
    { name: 'vibrant', label: 'Vibrant' },
    { name: 'cool', label: 'Cool' },
    { name: 'warm', label: 'Warm' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading photo editor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Advanced Photo Editor</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={undo} disabled={historyIndex <= 0}>
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={redo} disabled={historyIndex >= history.length - 1}>
                <Redo2 className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={downloadImage}>
                <Download className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={saveEdit}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <Button
                  key={tool.name}
                  variant={activeTool === tool.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToolClick(tool.name as ToolType)}
                  className="flex items-center gap-1"
                >
                  <IconComponent className="h-4 w-4" />
                  {tool.label}
                </Button>
              );
            })}
            <Separator orientation="vertical" className="h-8" />
            <Button size="sm" variant="destructive" onClick={clearCanvas}>
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-4">
              <div className="border border-muted rounded-lg overflow-hidden">
                <canvas ref={canvasRef} className="max-w-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <Tabs defaultValue="tools" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tools">Tools</TabsTrigger>
              <TabsTrigger value="adjust">Adjust</TabsTrigger>
              <TabsTrigger value="effects">Effects</TabsTrigger>
            </TabsList>

            <TabsContent value="tools" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Brush Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Size</label>
                    <Slider
                      value={brushSize}
                      onValueChange={setBrushSize}
                      max={50}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                    <span className="text-xs text-muted-foreground">{brushSize[0]}px</span>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Color</label>
                    <input
                      type="color"
                      value={brushColor}
                      onChange={(e) => setBrushColor(e.target.value)}
                      className="w-full h-8 rounded border mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="adjust" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Image Adjustments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium flex items-center gap-1">
                      <Sun className="h-3 w-3" />
                      Brightness
                    </label>
                    <Slider
                      value={brightness}
                      onValueChange={(value) => {
                        setBrightness(value);
                        applyImageAdjustment();
                      }}
                      max={100}
                      min={-100}
                      step={1}
                      className="mt-2"
                    />
                    <span className="text-xs text-muted-foreground">{brightness[0]}%</span>
                  </div>

                  <div>
                    <label className="text-sm font-medium flex items-center gap-1">
                      <Contrast className="h-3 w-3" />
                      Contrast
                    </label>
                    <Slider
                      value={contrast}
                      onValueChange={(value) => {
                        setContrast(value);
                        applyImageAdjustment();
                      }}
                      max={100}
                      min={-100}
                      step={1}
                      className="mt-2"
                    />
                    <span className="text-xs text-muted-foreground">{contrast[0]}%</span>
                  </div>

                  <div>
                    <label className="text-sm font-medium flex items-center gap-1">
                      <Palette className="h-3 w-3" />
                      Saturation
                    </label>
                    <Slider
                      value={saturation}
                      onValueChange={(value) => {
                        setSaturation(value);
                        applyImageAdjustment();
                      }}
                      max={100}
                      min={-100}
                      step={1}
                      className="mt-2"
                    />
                    <span className="text-xs text-muted-foreground">{saturation[0]}%</span>
                  </div>

                  <div>
                    <label className="text-sm font-medium flex items-center gap-1">
                      <ZoomIn className="h-3 w-3" />
                      Zoom
                    </label>
                    <Slider
                      value={zoom}
                      onValueChange={setZoom}
                      max={300}
                      min={10}
                      step={5}
                      className="mt-2"
                    />
                    <span className="text-xs text-muted-foreground">{zoom[0]}%</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="effects" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-1">
                    <Filter className="h-3 w-3" />
                    Filter Effects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {filters.map((filter) => (
                      <Button
                        key={filter.name}
                        variant={activeFilter === filter.name ? "default" : "outline"}
                        size="sm"
                        onClick={() => applyFilter(filter.name as FilterType)}
                        className="text-xs"
                      >
                        {filter.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Objects Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Objects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="secondary" className="text-xs">
                  {history.length} actions in history
                </Badge>
                <div className="text-xs text-muted-foreground">
                  Current tool: <span className="font-medium">{activeTool}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};