import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import DownloadCV from "@/components/DownloadCV";
import Layout from "@/components/Layout";
import { cn } from "@/lib/utils";

const skills = [
  "Python", "FastAPI", "Django", "PostgreSQL", "SQLAlchemy",
  "asyncio", "Web Scraping", "pytest", "gRPC", "OpenAI API",
  "LangGraph", "RAG", "Docker", "CI/CD",
];

const projectTypes = [
  "Backend services and REST APIs",
  "Data collection and scraping pipelines",
  "Product matching and LLM integrations",
  "Test automation and mock services",
  "RAG assistants and semantic search",
];

const experience = [
  {
    company: "Rozetka",
    role: "Python Developer",
    period: "November 2025 – September 2026",
    highlights: [
      "Maintained a FastAPI backend service.",
      "Developed and maintained Python scraping pipelines for product data from multiple sources.",
      "Expanded competitor product and category coverage and improved data extraction reliability.",
      "Analyzed product attributes and identified noisy titles, including extra words and symbols, as a key challenge for product matching.",
      "Proposed a matching improvement that was implemented and frequently used.",
      "Built product matching algorithms and integrated LLM approaches for complex matching cases.",
      "Optimized processing with asyncio, multithreading, and multiprocessing.",
    ],
  },
  {
    company: "Ajax Systems",
    role: "Python Developer in Test",
    period: "July 2024 – November 2025",
    highlights: [
      "Developed mock gRPC services for integration testing of distributed components.",
      "Automated unit, integration, and end-to-end tests in Python and integrated tests into CI/CD.",
      "Investigated complex issues through log analysis, debugging, and root cause analysis.",
      "Reconstructed the behavior of an undocumented notification feature through collaboration with QA, app developers, and backend teams.",
      "Used this in-depth understanding to diagnose failures and fix unstable notification tests more quickly, with a focus on stabilizing the test suite.",
      "Mentored two team members and supported their onboarding and technical development.",
    ],
  },
];

const About = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-dot-pattern bg-dot-md opacity-30" />
        <div className="absolute top-10 right-20 w-64 h-64 bg-primary/15 rounded-full blur-3xl animate-float" />

        <div className="section-container relative">
          <div className="max-w-3xl">
            <span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 opacity-0 animate-fade-in"
            >
              <Sparkles size={16} className="animate-pulse-soft" />
              About Me
            </span>
            <h1
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-8 opacity-0 animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              Python backend
              <br />
              and <span className="gradient-text">AI engineering</span>
            </h1>
            <blockquote
              className={cn(
                "relative text-xl md:text-2xl text-foreground leading-relaxed",
                "pl-6 opacity-0 animate-fade-in"
              )}
              style={{ animationDelay: "0.2s" }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-coral rounded-full" />
              My experience spans backend development, data collection,
              automated testing, and practical LLM integrations.
            </blockquote>
            <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-4">
              <DownloadCV />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background-alt to-background" />

        <div className="section-container relative">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Bio */}
            <div className="lg:col-span-2 space-y-6">
              <p
                className="text-lg md:text-xl text-muted-foreground leading-relaxed opacity-0 animate-fade-in"
                style={{ animationDelay: "0.3s" }}
              >
                I'm Maksym Operchuk, a Python developer focused on backend services, automation, and practical AI integrations.
              </p>
              <p
                className="text-lg md:text-xl text-muted-foreground leading-relaxed opacity-0 animate-fade-in"
                style={{ animationDelay: "0.4s" }}
              >
                At Rozetka, I maintained a FastAPI service and worked on product data collection and matching.
                I proposed an improvement for handling noisy product titles that became a frequently used.
                At Ajax Systems, I developed mock gRPC services and worked on stabilizing notification tests,
                investigating undocumented behavior with QA, app developers, and backend teams.
              </p>
              <p
                className="text-lg md:text-xl text-muted-foreground leading-relaxed opacity-0 animate-fade-in"
                style={{ animationDelay: "0.5s" }}
              >
                I am currently building this AI Portfolio Agent with FastAPI,
                LangGraph, and PostgreSQL. It combines hybrid retrieval,
                persistent conversation memory, and a Go service for
                Telegram notifications.
              </p>
              <div className="space-y-6 pt-6">
                <h2 className="font-display text-2xl md:text-3xl font-semibold">
                  Professional Experience
                </h2>
                {experience.map((job) => (
                  <article key={job.company} className="rounded-2xl border border-border/60 bg-card p-6 md:p-8">
                    <p className="text-sm text-muted-foreground mb-2">{job.period}</p>
                    <h3 className="font-display text-2xl font-semibold">{job.company}</h3>
                    <p className="text-primary font-medium mt-1 mb-5">{job.role}</p>
                    <ul className="space-y-3">
                      {job.highlights.map((highlight) => (
                        <li key={highlight} className="flex items-start gap-3 text-muted-foreground leading-relaxed">
                          <CheckCircle size={18} className="mt-1 flex-shrink-0 text-primary" aria-hidden="true" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-6">
              {/* Skills */}
              <div
                className={cn(
                  "group relative p-6 rounded-2xl overflow-hidden",
                  "bg-card border border-border/60",
                  "transition-all duration-500",
                  "hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5",
                  "opacity-0 animate-fade-in"
                )}
                style={{ animationDelay: "0.3s" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <h2 className="font-display text-lg font-semibold text-foreground mb-4">
                    Core Competencies
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <span
                        key={skill}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm font-medium",
                          "bg-primary/10 text-primary",
                          "transition-all duration-300",
                          "hover:bg-primary hover:text-white hover:scale-105"
                        )}
                        style={{ transitionDelay: `${index * 30}ms` }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Project Types */}
              <div
                className={cn(
                  "group relative p-6 rounded-2xl overflow-hidden",
                  "bg-card border border-border/60",
                  "transition-all duration-500",
                  "hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5",
                  "opacity-0 animate-fade-in"
                )}
                style={{ animationDelay: "0.4s" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <h2 className="font-display text-lg font-semibold text-foreground mb-4">
                    Types of Projects
                  </h2>
                  <ul className="space-y-3">
                    {projectTypes.map((type, index) => (
                      <li
                        key={type}
                        className="flex items-center gap-3 text-sm text-muted-foreground group/item transition-all duration-300 hover:translate-x-1"
                        style={{ transitionDelay: `${index * 50}ms` }}
                      >
                        <CheckCircle
                          size={18}
                          className="text-primary flex-shrink-0 transition-transform duration-300 group-hover/item:scale-110"
                        />
                        <span className="group-hover/item:text-foreground transition-colors">
                          {type}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-background-alt" />
        <div className="absolute inset-0 bg-dot-pattern bg-dot-lg opacity-20" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-coral opacity-10 blur-3xl rounded-full" />

        <div className="section-container relative">
          <div
            className={cn(
              "max-w-2xl mx-auto text-center p-10 md:p-14 rounded-3xl",
              "bg-card/80 backdrop-blur-sm border border-border/50",
              "shadow-2xl shadow-primary/5"
            )}
          >
            <h2
              className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 opacity-0 animate-fade-in"
            >
              Let's work{" "}
              <span className="gradient-text">together</span>
            </h2>
            <p
              className="text-lg text-muted-foreground mb-8 opacity-0 animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              Looking for a Python developer for backend, automation, or AI
              projects? Let's discuss your team and the problems you're solving.
            </p>
            <Link
              to="mailto:maksym.operchuk@gmail.com"
              className={cn(
                "inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full",
                "bg-gradient-coral text-white font-semibold text-lg",
                "shadow-lg shadow-primary/25",
                "transition-all duration-300 ease-out",
                "hover:shadow-xl hover:shadow-primary/35 hover:scale-105",
                "active:scale-95",
                "opacity-0 animate-fade-in"
              )}
              style={{ animationDelay: "0.2s" }}
            >
              Send an Email
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
