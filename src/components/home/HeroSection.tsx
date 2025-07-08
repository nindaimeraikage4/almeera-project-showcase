import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroHouse from "@/assets/hero-house.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroHouse})` }}
      >
        <div className="absolute inset-0 bg-hero-overlay"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Wujudkan Hunian
            <span className="text-accent block">Impian Anda</span>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl mb-8 max-w-2xl mx-auto leading-relaxed text-white/90">
            Spesialis desain dan arsitektur rumah tinggal modern dengan 
            sentuhan inovatif dan kualitas terbaik
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary-hover text-primary-foreground px-8 py-3 text-lg"
              asChild
            >
              <Link to="/portfolio">
                Lihat Portofolio
              </Link>
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 px-8 py-3 text-lg backdrop-blur-sm"
              asChild
            >
              <Link to="/contact">
                Konsultasi Gratis
              </Link>
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;