import Layout from "@/components/Layout";
import PortfolioChat from "@/components/PortfolioChat";

export default function AskAI() {
  return (
    <Layout>
      <section className="py-16 md:py-24">
        <div className="section-container max-w-4xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Ask <span className="gradient-text">AI</span></h1>
          <p className="text-lg text-muted-foreground mb-10">Explore my experience and projects through a conversation with my portfolio assistant.</p>
          <PortfolioChat />
        </div>
      </section>
    </Layout>
  );
}
