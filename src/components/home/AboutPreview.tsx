import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Home, Users, Award, Lightbulb } from "lucide-react";

const AboutPreview = () => {
  const features = [
    {
      icon: Home,
      title: "Desain Arsitektur",
      description: "Desain rumah modern dengan konsep inovatif dan fungsional"
    },
    {
      icon: Users,
      title: "Tim Profesional",
      description: "Arsitek dan desainer berpengalaman dengan track record terpercaya"
    },
    {
      icon: Award,
      title: "Kualitas Terjamin",
      description: "Standar konstruksi tinggi dengan material berkualitas premium"
    },
    {
      icon: Lightbulb,
      title: "Solusi Kreatif",
      description: "Pendekatan inovatif untuk setiap tantangan desain dan ruang"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tentang Almeera Project
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Dengan pengalaman bertahun-tahun, kami menghadirkan solusi arsitektur 
            terbaik untuk hunian impian Anda. Dari konsep hingga konstruksi, 
            kami berkomitmen memberikan hasil yang melampaui ekspektasi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="text-center hover:shadow-card transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg" asChild>
            <Link to="/about">
              Selengkapnya Tentang Kami
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AboutPreview;