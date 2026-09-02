import { Star, Quote } from 'lucide-react';
import { Reveal } from '@/components/Reveal';

const testimonials = [
  {
    name: 'Daniel Park',
    role: 'Verified Buyer',
    avatar: 'https://images.pexels.com/photos/5308640/pexels-photo-5308640.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
    quote:
      'I lost money on two other platforms before finding ThimsLog. The escrow system actually works — got my account credentials within minutes of confirming delivery.',
  },
  {
    name: 'Priya Sharma',
    role: 'Top-rated Seller',
    avatar: 'https://images.pexels.com/photos/33680700/pexels-photo-33680700.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
    quote:
      'As a seller, the reputation engine changed my business. Buyers trust me instantly because my deal history is right there. Fees are fair and payouts are fast.',
  },
  {
    name: 'Marcus Webb',
    role: 'Verified Buyer',
    avatar: 'https://images.pexels.com/photos/14564834/pexels-photo-14564834.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
    quote:
      'Had a dispute on a listing that was not as described. ThimsLog mediation refunded me within 12 hours. This is how a marketplace should work.',
  },
];

export function Testimonials() {
  return (
    <section id="voices" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
            Voices from the floor
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Traders who stopped worrying
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 120}>
              <figure className="group relative h-full p-7 rounded-2xl glass hover:bg-white/[0.07] transition-all duration-300 hover:-translate-y-1.5">
                <Quote className="absolute top-6 right-6 w-10 h-10 text-white/5 group-hover:text-sky-400/20 transition-colors" />
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="mt-5 text-slate-300 leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-sky-400/30"
                  />
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-sky-400">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
