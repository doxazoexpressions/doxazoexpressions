import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AboutPreview from "@/components/AboutPreview";
import Services from "@/components/Services";
import SpeakingPreview from "@/components/SpeakingPreview";
import WisdomPreview from "@/components/WisdomPreview";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <AboutPreview />
      <Services />
      <SpeakingPreview />
      <WisdomPreview />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
