import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Image, Video, Camera } from 'lucide-react';

interface Content {
  id: string;
  title: string;
  description: string;
  type: 'photo' | 'video' | '360_tour';
  file_url: string;
  thumbnail_url: string;
  category: string;
  is_featured: boolean;
  created_at: string;
}

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [contents, setContents] = useState<Content[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'photo' as 'photo' | 'video' | '360_tour',
    file_url: '',
    thumbnail_url: '',
    category: '',
    is_featured: false
  });

  useEffect(() => {
    if (isAdmin) {
      fetchContents();
    }
  }, [isAdmin]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  const fetchContents = async () => {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch contents",
        variant: "destructive",
      });
    } else {
      setContents((data || []) as Content[]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const contentData = {
      ...formData,
      created_by: user.id
    };

    if (editingContent) {
      const { error } = await supabase
        .from('content')
        .update(contentData)
        .eq('id', editingContent.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update content",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Content updated successfully",
        });
        fetchContents();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('content')
        .insert([contentData]);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create content",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Content created successfully",
        });
        fetchContents();
        resetForm();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('content')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Content deleted successfully",
      });
      fetchContents();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'photo',
      file_url: '',
      thumbnail_url: '',
      category: '',
      is_featured: false
    });
    setEditingContent(null);
    setIsDialogOpen(false);
  };

  const openEditDialog = (content: Content) => {
    setFormData({
      title: content.title,
      description: content.description,
      type: content.type,
      file_url: content.file_url,
      thumbnail_url: content.thumbnail_url,
      category: content.category,
      is_featured: content.is_featured
    });
    setEditingContent(content);
    setIsDialogOpen(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'photo':
        return <Image className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case '360_tour':
        return <Camera className="h-4 w-4" />;
      default:
        return <Image className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'photo':
        return 'bg-blue-100 text-blue-800';
      case 'video':
        return 'bg-purple-100 text-purple-800';
      case '360_tour':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Kelola konten foto, video, dan 360° tour</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Konten
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingContent ? 'Edit Konten' : 'Tambah Konten Baru'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Judul</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Tipe Konten</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: 'photo' | 'video' | '360_tour') => 
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="photo">Foto</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="360_tour">360° Tour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="file_url">URL File</Label>
                    <Input
                      id="file_url"
                      value={formData.file_url}
                      onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                      placeholder="https://example.com/file.jpg"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="thumbnail_url">URL Thumbnail</Label>
                    <Input
                      id="thumbnail_url"
                      value={formData.thumbnail_url}
                      onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                      placeholder="https://example.com/thumb.jpg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Kategori</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Interior, Exterior, Living Room"
                    />
                  </div>
                  <div className="flex items-center space-x-2 mt-6">
                    <Switch
                      id="featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                    />
                    <Label htmlFor="featured">Konten Unggulan</Label>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit">
                    {editingContent ? 'Update' : 'Simpan'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Batal
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="content" className="space-y-6">
          <TabsList>
            <TabsTrigger value="content">Kelola Konten</TabsTrigger>
            <TabsTrigger value="analytics">Statistik</TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Daftar Konten</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Judul</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contents.map((content) => (
                      <TableRow key={content.id}>
                        <TableCell className="font-medium">{content.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(content.type)}
                            <Badge className={getTypeBadgeColor(content.type)}>
                              {content.type === 'photo' && 'Foto'}
                              {content.type === 'video' && 'Video'}
                              {content.type === '360_tour' && '360° Tour'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{content.category || '-'}</TableCell>
                        <TableCell>
                          {content.is_featured && (
                            <Badge variant="secondary">Unggulan</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(content.created_at).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(content)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(content.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Konten</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{contents.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Konten Unggulan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {contents.filter(c => c.is_featured).length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>360° Tours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {contents.filter(c => c.type === '360_tour').length}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;