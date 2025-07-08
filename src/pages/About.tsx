import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Target, Award, Lightbulb, CheckCircle } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Visi",
      description: "Menjadi perusahaan arsitektur terdepan yang menghadirkan inovasi desain hunian berkelanjutan dan ramah lingkungan."
    },
    {
      icon: Lightbulb,
      title: "Misi",
      description: "Mewujudkan hunian impian klien melalui desain inovatif, teknologi terkini, dan pelayanan berkualitas tinggi."
    },
    {
      icon: Award,
      title: "Komitmen",
      description: "Memberikan solusi arsitektur terbaik dengan mengutamakan kualitas, ketepatan waktu, dan kepuasan klien."
    }
  ];

  const team = [
    {
      name: "Ir. Ahmad Almeera",
      position: "Principal Architect",
      experience: "15+ tahun",
      specialization: "Arsitektur Residential & Commercial"
    },
    {
      name: "Sarah Putri, S.T.",
      position: "Senior Designer",
      experience: "8+ tahun", 
      specialization: "Interior Design & 3D Visualization"
    },
    {
      name: "Budi Santoso, S.T.",
      position: "Project Manager",
      experience: "10+ tahun",
      specialization: "Construction Management"
    }
  ];

  const services = [
    "Konsultasi Arsitektur dan Desain",
    "Perencanaan Tata Ruang",
    "Desain 3D & Rendering",
    "Virtual Tour 360°",
    "Manajemen Konstruksi",
    "Interior Design",
    "Landscape Architecture",
    "Smart Home Integration"
  ];

  const achievements = [
    { number: "50+", label: "Proyek Selesai" },
    { number: "15+", label: "Tahun Pengalaman" },
    { number: "98%", label: "Kepuasan Klien" },
    { number: "24/7", label: "Customer Support" }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Tentang Almeera Project
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Sejak didirikan, Almeera Project telah menjadi mitra terpercaya dalam 
            mewujudkan hunian impian. Dengan tim profesional berpengalaman dan 
            pendekatan inovatif, kami menghadirkan solusi arsitektur yang 
            memadukan estetika, fungsionalitas, dan keberlanjutan.
          </p>
        </div>
      </section>

      {/* Vision, Mission, Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="text-center hover:shadow-card transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Pencapaian Kami</h2>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto">
              Kepercayaan klien adalah prestasi terbesar kami
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2 text-accent">
                  {achievement.number}
                </div>
                <div className="text-primary-foreground/80">{achievement.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Tim Profesional
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Didukung oleh tim arsitek dan desainer berpengalaman yang siap 
              mewujudkan visi arsitektur Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-card transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-2">{member.position}</p>
                  <p className="text-sm text-muted-foreground mb-2">{member.experience}</p>
                  <p className="text-sm text-muted-foreground">{member.specialization}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Layanan Kami
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Solusi lengkap untuk kebutuhan arsitektur dan desain Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {services.map((service, index) => (
              <div key={index} className="flex items-center space-x-3 p-4">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="text-foreground">{service}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Siap Memulai Proyek Anda?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Konsultasikan ide dan rencana Anda bersama tim ahli Almeera Project. 
              Kami siap membantu mewujudkan hunian impian Anda.
            </p>
            <Button size="lg" asChild>
              <a href="/contact">Konsultasi Gratis Sekarang</a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;