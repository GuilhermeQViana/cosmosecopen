import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { PlatformSection } from '@/components/landing/PlatformSection';
import { TrustSection } from '@/components/landing/TrustSection';
import { AudienceSection } from '@/components/landing/AudienceSection';
import { ROICalculatorSection } from '@/components/landing/ROICalculatorSection';
import { OptionalConfigSection } from '@/components/landing/OptionalConfigSection';
import { CTASection } from '@/components/landing/CTASection';
import { FAQSection } from '@/components/landing/FAQSection';
import { Footer } from '@/components/landing/Footer';
import { StarField } from '@/components/ui/star-field';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background relative">
      <StarField starCount={80} dustCount={25} />
      <Navbar />
      <main className="relative z-10">
        <HeroSection />
        <ScrollReveal animation="fade-up" duration={700}>
          <PlatformSection />
        </ScrollReveal>
        <ScrollReveal animation="fade-up" duration={700} delay={100}>
          <TrustSection />
        </ScrollReveal>
        <ScrollReveal animation="fade-up" duration={700}>
          <AudienceSection />
        </ScrollReveal>
        <ScrollReveal animation="fade-up" duration={700} delay={100}>
          <ROICalculatorSection />
        </ScrollReveal>
        <ScrollReveal animation="fade-up" duration={700}>
          <OptionalConfigSection />
        </ScrollReveal>
        <ScrollReveal animation="fade-up" duration={700}>
          <FAQSection />
        </ScrollReveal>
        <ScrollReveal animation="scale-in" duration={700}>
          <CTASection />
        </ScrollReveal>
      </main>
      <Footer />
    </div>
  );
}
