import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { ModulesSection } from '@/components/landing/ModulesSection';
import { FrameworksSection } from '@/components/landing/FrameworksSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { Footer } from '@/components/landing/Footer';
import { StarField } from '@/components/ui/star-field';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background relative">
      <StarField starCount={80} dustCount={25} />
      <Navbar />
      <main className="relative z-10">
        <HeroSection />
        <ModulesSection />
        <FrameworksSection />
        <FeaturesSection />
        <HowItWorksSection />
        <BenefitsSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
