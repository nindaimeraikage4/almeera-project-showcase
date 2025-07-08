import { Link } from "react-router-dom";
import { MapPin, Phone, Mail } from "lucide-react";
import almeeraLogo from "@/assets/almeera-logo.png";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src={almeeraLogo} 
                alt="Almeera Project" 
                className="h-8 w-8 object-contain filter brightness-0 invert"
              />
              <span className="text-xl font-bold">Almeera Project</span>
            </div>
            <p className="text-background/80 mb-4 max-w-md">
              Spesialis desain dan arsitektur rumah tinggal modern. Mewujudkan hunian impian 
              dengan desain inovatif dan kualitas terbaik.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-accent" />
                <span className="text-sm text-background/80">
                  Jl. Alam Segar I, Sempaja Sel., Kec. Samarinda Utara, 
                  Kota Samarinda, Kalimantan Timur 75243
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-accent" />
                <span className="text-sm text-background/80">+62 852-5210-8850</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-accent" />
                <span className="text-sm text-background/80">info@almeeraproject.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Menu</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-background/80 hover:text-accent transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className="text-background/80 hover:text-accent transition-colors">
                  Portofolio
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-background/80 hover:text-accent transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-background/80 hover:text-accent transition-colors">
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Layanan</h3>
            <ul className="space-y-2 text-background/80">
              <li>Desain Arsitektur</li>
              <li>Konsultasi Bangunan</li>
              <li>3D Rendering</li>
              <li>Virtual Tour</li>
              <li>Konstruksi</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 mt-8 pt-8 text-center">
          <p className="text-background/60 text-sm">
            © {new Date().getFullYear()} Almeera Project. Semua hak dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;