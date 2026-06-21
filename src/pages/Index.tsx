import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import DevotionalHighlight from "@/components/DevotionalHighlight";
import CategoriesPreview from "@/components/CategoriesPreview";
import AboutPreview from "@/components/AboutPreview";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Doxazo Expressions | A Fresh Devotional Every Morning"
        description="Daily Christian devotionals to anchor your walk with God. Scripture, reflection, and a faith declaration delivered every morning."
        path="/"
      />
      <Navbar />
      <main>
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
