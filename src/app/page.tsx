import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { Features } from '@/components/Features';
import { HowItWorks } from '@/components/HowItWorks';
import { Testimonials } from '@/components/Testimonials';
import { Newsletter } from '@/components/Newsletter';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-ink-950 overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <About />
        <Features />
        <HowItWorks />
        {/* <Testimonials /> */}
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
