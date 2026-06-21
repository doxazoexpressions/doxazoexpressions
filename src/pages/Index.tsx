import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import DevotionalHighlight from "@/components/DevotionalHighlight";
import CategoriesPreview from "@/components/CategoriesPreview";
import AboutPreview from "@/components/AboutPreview";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <h1 className="sr-only">Doxazo Expressions — Daily Christian Devotionals</h1>
        <Hero />
        <DevotionalHighlight />
        <CategoriesPreview />
        <AboutPreview />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
