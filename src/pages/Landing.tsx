import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FrameworksSection } from '@/components/landing/FrameworksSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { Footer } from '@/components/landing/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FrameworksSection />
        <FeaturesSection />
        <HowItWorksSection />
        <BenefitsSection />
      </main>
      <Footer />
    </div>
  );
}