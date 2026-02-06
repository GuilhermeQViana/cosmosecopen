import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { PlatformSection } from '@/components/landing/PlatformSection';
import { TrustSection } from '@/components/landing/TrustSection';
import { ROICalculatorSection } from '@/components/landing/ROICalculatorSection';
import { CTASection } from '@/components/landing/CTASection';
import { FAQSection } from '@/components/landing/FAQSection';
import { Footer } from '@/components/landing/Footer';
import { StarField } from '@/components/ui/star-field';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background relative">
      <StarField starCount={80} dustCount={25} />
      <Navbar />
      <main className="relative z-10">
        <HeroSection />
        <PlatformSection />
        <TrustSection />
        <ROICalculatorSection />
        <CTASection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
