import { Link } from "react-router-dom";
import Layout from "@/components/Layout";

export default function NotFound() {
  return (
    <Layout>
      <section className="section-container py-24 text-center">
        <h1 className="font-display text-5xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">Page not found</p>
        <Link to="/" className="text-primary underline hover:text-primary/80">Return to Home</Link>
      </section>
    </Layout>
  );
}
