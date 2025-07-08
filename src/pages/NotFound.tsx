import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-8xl font-bold text-primary/20 mb-4">404</div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-muted-foreground mb-8">
            Maaf, halaman yang Anda cari tidak ditemukan. 
            Mungkin halaman telah dipindahkan atau dihapus.
          </p>
          <Button asChild size="lg">
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
