'use client';

import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { Features } from '@/components/Features';
import { HowItWorks } from '@/components/HowItWorks';
import { Newsletter } from '@/components/Newsletter';
import { Footer } from '@/components/Footer';
import { ThemeProvider, useTheme } from '@/context/theme-context';

function LandingPageContent() {
  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#060a14] text-slate-900 dark:text-slate-200 overflow-x-hidden transition-colors duration-200">
      <Header />
      <main>
        <Hero />
        <About />
        <Features />
        <HowItWorks />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <LandingPageContent />
    </ThemeProvider>
  );
}
