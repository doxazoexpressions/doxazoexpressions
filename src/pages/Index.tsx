import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import DevotionalHighlight from "@/components/DevotionalHighlight";
import AboutPreview from "@/components/AboutPreview";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <DevotionalHighlight />
      <AboutPreview />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
