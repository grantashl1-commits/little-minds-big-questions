import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import ThemeGrid from "@/components/ThemeGrid";
import FeaturedQuestions from "@/components/FeaturedQuestions";
import InstagramFeed from "@/components/InstagramFeed";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <FeaturedQuestions />
      <InstagramFeed />
      <ThemeGrid />
      <Footer />
    </div>
  );
};

export default Index;
