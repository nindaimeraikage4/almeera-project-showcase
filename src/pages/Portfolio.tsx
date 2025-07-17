import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Home, Filter, Edit } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";

const Portfolio = () => {
  const { isAdmin } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState("Semua");

  const projects = [
    {
      id: 1,
      title: "Villa Tropis Modern",
      category: "Tropis",
      image: project1,
      description: "Rumah tropis 2 lantai dengan konsep modern minimalis, dilengkapi taman indoor dan outdoor pool.",
      specs: "Luas Tanah: 300m² | Luas Bangunan: 250m²",
      year: "2023"
    },
    {
      id: 2,
      title: "Hunian Industrial Loft",
      category: "Industrial",
      image: project2,
      description: "Desain industrial dengan konsep open space, menggunakan material beton exposed dan steel frame.",
      specs: "Luas Tanah: 200m² | Luas Bangunan: 180m²",
      year: "2023"
    },
    {
      id: 3,
      title: "Rumah Minimalis Kontemporer",
      category: "Minimalis",
      image: project3,
      description: "Hunian minimalis dengan konsep kontemporer, mengutamakan pencahayaan alami dan sirkulasi udara.",
      specs: "Luas Tanah: 150m² | Luas Bangunan: 120m²",
      year: "2024"
    },
    {
      id: 4,
      title: "Modern Tropical House",
      category: "Tropis",
      image: project1,
      description: "Rumah tropis modern dengan ventilasi silang optimal dan material ramah lingkungan.",
      specs: "Luas Tanah: 400m² | Luas Bangunan: 300m²",
      year: "2024"
    },
    {
      id: 5,
      title: "Urban Minimalist",
      category: "Minimalis",
      image: project3,
      description: "Hunian minimalis urban dengan konsep smart home dan efisiensi energi tinggi.",
      specs: "Luas Tanah: 100m² | Luas Bangunan: 150m²",
      year: "2023"
    },
    {
      id: 6,
      title: "Industrial Warehouse Home",
      category: "Industrial",
      image: project2,
      description: "Konversi gudang menjadi hunian industrial modern dengan ceiling tinggi dan ruang terbuka.",
      specs: "Luas Tanah: 500m² | Luas Bangunan: 400m²",
      year: "2024"
    }
  ];

  const categories = ["Semua", "Minimalis", "Tropis", "Industrial"];

  const filteredProjects = selectedFilter === "Semua" 
    ? projects 
    : projects.filter(project => project.category === selectedFilter);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Portofolio Proyek
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Koleksi karya terbaik kami dalam merancang dan membangun hunian 
            impian dengan berbagai gaya arsitektur modern.
          </p>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <Filter className="h-5 w-5 text-muted-foreground mr-2 mt-2" />
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedFilter === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(category)}
              className="transition-all duration-200"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <Card 
              key={project.id} 
              className="group overflow-hidden hover:shadow-elegant transition-all duration-500 hover:-translate-y-2 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                    <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                      <Eye className="h-4 w-4 mr-1" />
                      Lihat
                    </Button>
                    {isAdmin && (
                      <Button size="sm" className="bg-primary hover:bg-primary-hover">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge variant="secondary" className="bg-accent text-accent-foreground">
                    {project.category}
                  </Badge>
                  <Badge variant="outline" className="bg-white/90">
                    {project.year}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  {project.specs}
                </p>
                <p className="text-muted-foreground line-clamp-3">
                  {project.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 p-8 bg-muted/30 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Tertarik dengan Karya Kami?</h3>
          <p className="text-muted-foreground mb-6">
            Konsultasikan proyek impian Anda bersama tim ahli Almeera Project
          </p>
          <Button size="lg" asChild>
            <a href="/contact">Mulai Konsultasi</a>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Portfolio;