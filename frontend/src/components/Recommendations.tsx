import { Linkedin, Quote, ArrowUpRight } from "lucide-react";
import { recommendations } from "@/data/recommendations";

export default function Recommendations() {
  return (
    <section aria-labelledby="recommendations-title" className="py-16 md:py-24">
      <div className="section-container">
        <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">Recommendations</span>
        <h2 id="recommendations-title" className="font-display text-3xl md:text-4xl font-bold mb-10">What colleagues <span className="gradient-text">say</span></h2>
        <div className="grid md:grid-cols-2 gap-6 items-start">
          {recommendations.map((recommendation) => (
            <article key={recommendation.profileUrl} className="rounded-2xl border border-border/60 bg-card p-6 md:p-8">
              <Quote className="text-primary mb-5" size={28} aria-hidden="true" />
              <h3 className="font-display text-xl font-semibold">{recommendation.author}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{recommendation.role}</p>
              <p className="mt-2 text-xs text-muted-foreground">{recommendation.relationship} · {recommendation.date}</p>
              <details className="group mt-6">
                <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                  <span className="block text-foreground/90 leading-relaxed group-open:hidden">“{recommendation.quote.split("\n\n")[0]}”</span>
                  <span className="mt-4 inline-block text-sm font-semibold text-primary group-open:hidden">Read more</span>
                  <span className="hidden text-sm font-semibold text-primary group-open:inline-block">Read less</span>
                </summary>
                <blockquote className="mt-4 whitespace-pre-wrap break-words leading-relaxed text-foreground/90">{recommendation.quote}</blockquote>
              </details>
              <div className="mt-6 pt-5 border-t border-border/50 flex flex-wrap gap-4 text-sm font-medium text-primary">
                <a href={recommendation.profileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:underline"><Linkedin size={16} aria-hidden="true" />Author profile</a>
                <a href="https://www.linkedin.com/in/maksym-operchuk/details/recommendations/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">View on LinkedIn<ArrowUpRight size={16} aria-hidden="true" /></a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
