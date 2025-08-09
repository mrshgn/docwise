import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { ProblemSolutionSection } from "@/components/problem-solution";
import { ImpactSection } from "@/components/impact-section";
import { Footer } from "@/components/footer";
import { HeaderBar } from "@/components/header-bar";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>DocWise - Make Documents Accessible | AI-Powered Accessibility</title>
        <meta name="description" content="Transform your documents into accessible, inclusive content with AI. Fix reading order, add proper tags, and create barrier-free documents for everyone." />
        <link rel="canonical" href="/" />
      </Helmet>
      
      <HeaderBar />
      <HeroSection />
      <FeaturesSection />
      <ProblemSolutionSection />
      <ImpactSection />
      <Footer />
    </div>
  );
};

export default Index;