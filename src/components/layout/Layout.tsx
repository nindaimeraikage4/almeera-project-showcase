import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import FloatingWhatsApp from "@/components/ui/floating-whatsapp";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};

export default Layout;