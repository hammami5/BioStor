import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/store/HeroSection';
import { FeaturesSection } from '@/components/store/FeaturesSection';
import { HowItWorksSection } from '@/components/store/HowItWorksSection';
import { PricingSection } from '@/components/store/PricingSection';
import { TestimonialsSection } from '@/components/store/TestimonialsSection';
import { FAQSection } from '@/components/store/FAQSection';
import { CTASection } from '@/components/store/CTASection';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection id="features" />
        <HowItWorksSection id="how-it-works" />
        <PricingSection id="pricing" />
        <TestimonialsSection id="testimonials" />
        <FAQSection id="faq" />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
