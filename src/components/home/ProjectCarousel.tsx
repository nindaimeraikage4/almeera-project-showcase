import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Eye, Home } from "lucide-react";
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";

const ProjectCarousel = () => {
  const projects = [
    {
      id: 1,
      title: "Rumah Tropis Modern",
      category: "Minimalis Tropis",
      image: project1,
      description: "Desain rumah tropis dengan sentuhan modern yang memadukan unsur alam dan teknologi."
    },
    {
      id: 2,
      title: "Hunian Industrial",
      category: "Industrial Modern",
      image: project2,
      description: "Konsep industrial dengan material beton dan steel untuk tampilan yang bold dan modern."
    },
    {
      id: 3,
      title: "Minimalis Kontemporer",
      category: "Minimalis",
      image: project3,
      description: "Desain minimalis kontemporer dengan garis-garis bersih dan pencahayaan optimal."
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Portofolio Terpilih
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Beberapa karya terbaik kami yang telah mewujudkan hunian impian klien 
            dengan desain inovatif dan kualitas konstruksi terbaik.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {projects.map((project, index) => (
            <Card 
              key={project.id} 
              className="group overflow-hidden hover:shadow-elegant transition-all duration-500 hover:-translate-y-2"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="relative overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                    <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                      <Eye className="h-4 w-4 mr-1" />
                      Lihat Detail
                    </Button>
                    <Button size="sm" className="bg-primary hover:bg-primary-hover">
                      <Home className="h-4 w-4 mr-1" />
                      Room Tour
                    </Button>
                  </div>
                </div>
                <div className="absolute top-4 left-4">
                  <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium">
                    {project.category}
                  </span>
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <p className="text-muted-foreground line-clamp-3">
                  {project.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" asChild>
            <Link to="/portfolio">
              Lihat Semua Proyek
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProjectCarousel;