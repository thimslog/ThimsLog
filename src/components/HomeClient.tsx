"use client";

import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { Newsletter } from "@/components/Newsletter";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/context/theme-context";

export function HomeClient() {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}
