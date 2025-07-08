import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import AboutPreview from "@/components/home/AboutPreview";
import ProjectCarousel from "@/components/home/ProjectCarousel";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <AboutPreview />
      <ProjectCarousel />
    </Layout>
  );
};

export default Index;
