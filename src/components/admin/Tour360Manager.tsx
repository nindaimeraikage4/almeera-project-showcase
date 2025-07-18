import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, Upload, Image as ImageIcon, Settings } from 'lucide-react';
import { AdvancedPhotoEditor } from './AdvancedPhotoEditor';

interface VirtualTour {
  id: string;
  title: string;
  description: string;
  cover_image_url: string;
  is_published: boolean;
  created_at: string;
}

interface TourScene {
  id: string;
  tour_id: string;
  title: string;
  image_360_url: string;
  thumbnail_url: string;
  initial_view: any;
  hotspots: any[];
  order_index: number;
}

export const Tour360Manager = () => {
  const { toast } = useToast();
  const [tours, setTours] = useState<VirtualTour[]>([]);
  const [scenes, setScenes] = useState<TourScene[]>([]);
  const [selectedTour, setSelectedTour] = useState<VirtualTour | null>(null);
  const [editingScene, setEditingScene] = useState<TourScene | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSceneDialogOpen, setIsSceneDialogOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [tourFormData, setTourFormData] = useState({
    title: '',
    description: '',
    cover_image_url: '',
    is_published: false
  });

  const [sceneFormData, setSceneFormData] = useState({
    title: '',
    image_360_url: '',
    thumbnail_url: '',
    initial_view: { yaw: 0, pitch: 0, fov: 90 },
    order_index: 0
  });

  useEffect(() => {
    fetchTours();
  }, []);

  useEffect(() => {
    if (selectedTour) {
      fetchScenes(selectedTour.id);
    }
  }, [selectedTour]);

  const fetchTours = async () => {
    const { data, error } = await supabase
      .from('virtual_tours')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tours",
        variant: "destructive",
      });
    } else {
      setTours(data || []);
    }
  };

  const fetchScenes = async (tourId: string) => {
    const { data, error } = await supabase
      .from('tour_scenes')
      .select('*')
      .eq('tour_id', tourId)
      .order('order_index', { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch scenes",
        variant: "destructive",
      });
    } else {
      setScenes((data || []) as TourScene[]);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    
    try {
      const fileName = `360-photos/${Date.now()}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('360-tours')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('360-tours')
        .getPublicUrl(fileName);

      setSceneFormData({
        ...sceneFormData,
        image_360_url: publicUrl,
        thumbnail_url: publicUrl
      });

      toast({
        title: "Success",
        description: "360° image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleTourSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (selectedTour) {
        const { error } = await supabase
          .from('virtual_tours')
          .update(tourFormData)
          .eq('id', selectedTour.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Tour updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('virtual_tours')
          .insert([{
            ...tourFormData,
            created_by: (await supabase.auth.getUser()).data.user?.id
          }]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Tour created successfully",
        });
      }
      
      fetchTours();
      resetTourForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save tour",
        variant: "destructive",
      });
    }
  };

  const handleSceneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTour) return;

    try {
      if (editingScene) {
        const { error } = await supabase
          .from('tour_scenes')
          .update(sceneFormData)
          .eq('id', editingScene.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Scene updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('tour_scenes')
          .insert([{
            ...sceneFormData,
            tour_id: selectedTour.id
          }]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Scene added successfully",
        });
      }
      
      fetchScenes(selectedTour.id);
      resetSceneForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save scene",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTour = async (id: string) => {
    const { error } = await supabase
      .from('virtual_tours')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete tour",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Tour deleted successfully",
      });
      fetchTours();
      if (selectedTour?.id === id) {
        setSelectedTour(null);
        setScenes([]);
      }
    }
  };

  const handleDeleteScene = async (id: string) => {
    const { error } = await supabase
      .from('tour_scenes')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete scene",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Scene deleted successfully",
      });
      if (selectedTour) {
        fetchScenes(selectedTour.id);
      }
    }
  };

  const resetTourForm = () => {
    setTourFormData({
      title: '',
      description: '',
      cover_image_url: '',
      is_published: false
    });
    setSelectedTour(null);
    setIsDialogOpen(false);
  };

  const resetSceneForm = () => {
    setSceneFormData({
      title: '',
      image_360_url: '',
      thumbnail_url: '',
      initial_view: { yaw: 0, pitch: 0, fov: 90 },
      order_index: 0
    });
    setEditingScene(null);
    setIsSceneDialogOpen(false);
  };

  const openTourEditDialog = (tour: VirtualTour) => {
    setTourFormData({
      title: tour.title,
      description: tour.description || '',
      cover_image_url: tour.cover_image_url || '',
      is_published: tour.is_published
    });
    setSelectedTour(tour);
    setIsDialogOpen(true);
  };

  const openSceneEditDialog = (scene: TourScene) => {
    setSceneFormData({
      title: scene.title,
      image_360_url: scene.image_360_url,
      thumbnail_url: scene.thumbnail_url || '',
      initial_view: scene.initial_view || { yaw: 0, pitch: 0, fov: 90 },
      order_index: scene.order_index
    });
    setEditingScene(scene);
    setIsSceneDialogOpen(true);
  };

  const openPhotoEditor = (scene: TourScene) => {
    setEditingScene(scene);
    setIsEditorOpen(true);
  };

  const handlePhotoEditorSave = async (editedImageUrl: string) => {
    if (!editingScene) return;

    try {
      const { error } = await supabase
        .from('tour_scenes')
        .update({ image_360_url: editedImageUrl })
        .eq('id', editingScene.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Edited photo saved successfully",
      });

      if (selectedTour) {
        fetchScenes(selectedTour.id);
      }
      setIsEditorOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save edited photo",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {isEditorOpen && editingScene ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Editing: {editingScene.title}</h2>
            <Button variant="outline" onClick={() => setIsEditorOpen(false)}>
              Back to Manager
            </Button>
          </div>
          <AdvancedPhotoEditor 
            imageUrl={editingScene.image_360_url}
            onSave={handlePhotoEditorSave}
          />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">360° Tour Manager</h1>
              <p className="text-muted-foreground">Manage virtual tours with advanced photo editing</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetTourForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Tour
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {selectedTour ? 'Edit Tour' : 'Create New Tour'}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleTourSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={tourFormData.title}
                      onChange={(e) => setTourFormData({ ...tourFormData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={tourFormData.description}
                      onChange={(e) => setTourFormData({ ...tourFormData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="cover_image">Cover Image URL</Label>
                    <Input
                      id="cover_image"
                      value={tourFormData.cover_image_url}
                      onChange={(e) => setTourFormData({ ...tourFormData, cover_image_url: e.target.value })}
                      placeholder="https://example.com/cover.jpg"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="published"
                      checked={tourFormData.is_published}
                      onCheckedChange={(checked) => setTourFormData({ ...tourFormData, is_published: checked })}
                    />
                    <Label htmlFor="published">Published</Label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit">
                      {selectedTour ? 'Update' : 'Create'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetTourForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Tours Table */}
          <Card>
            <CardHeader>
              <CardTitle>Virtual Tours</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Scenes</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tours.map((tour) => (
                    <TableRow key={tour.id}>
                      <TableCell className="font-medium">{tour.title}</TableCell>
                      <TableCell>
                        <Badge variant={tour.is_published ? "default" : "secondary"}>
                          {tour.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {selectedTour?.id === tour.id ? scenes.length : '-'}
                      </TableCell>
                      <TableCell>
                        {new Date(tour.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedTour(tour)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openTourEditDialog(tour)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteTour(tour.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Scenes Manager */}
          {selectedTour && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Scenes for "{selectedTour.title}"</span>
                  <Dialog open={isSceneDialogOpen} onOpenChange={setIsSceneDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" onClick={() => resetSceneForm()}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Scene
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {editingScene ? 'Edit Scene' : 'Add New Scene'}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <form onSubmit={handleSceneSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="scene_title">Scene Title</Label>
                          <Input
                            id="scene_title"
                            value={sceneFormData.title}
                            onChange={(e) => setSceneFormData({ ...sceneFormData, title: e.target.value })}
                            required
                          />
                        </div>

                        <div>
                          <Label>360° Image Upload</Label>
                          <div className="mt-2 space-y-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(file);
                              }}
                              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                            />
                            {uploadingImage && (
                              <p className="text-sm text-muted-foreground">Uploading...</p>
                            )}
                            {sceneFormData.image_360_url && (
                              <div className="flex items-center gap-2 text-sm text-green-600">
                                <ImageIcon className="h-4 w-4" />
                                Image uploaded successfully
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="order_index">Order Index</Label>
                          <Input
                            id="order_index"
                            type="number"
                            value={sceneFormData.order_index}
                            onChange={(e) => setSceneFormData({ ...sceneFormData, order_index: parseInt(e.target.value) })}
                            min="0"
                          />
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button type="submit" disabled={!sceneFormData.image_360_url}>
                            {editingScene ? 'Update' : 'Add Scene'}
                          </Button>
                          <Button type="button" variant="outline" onClick={resetSceneForm}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Preview</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scenes.map((scene) => (
                      <TableRow key={scene.id}>
                        <TableCell>{scene.order_index}</TableCell>
                        <TableCell className="font-medium">{scene.title}</TableCell>
                        <TableCell>
                          {scene.thumbnail_url && (
                            <img 
                              src={scene.thumbnail_url} 
                              alt={scene.title}
                              className="w-16 h-10 object-cover rounded"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openPhotoEditor(scene)}
                              title="Edit Photo"
                            >
                              <Settings className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openSceneEditDialog(scene)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleDeleteScene(scene.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};