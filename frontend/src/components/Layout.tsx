import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Link, useLocation } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16 md:pt-20">{children}</main>
      <Footer />
      {pathname !== "/ask-ai" && (
        <Button asChild size="icon" className="fixed bottom-14 right-14 z-50 h-14 w-14 rounded-full shadow-lg">
          <Link to="/ask-ai" aria-label="Ask my AI assistant" title="Ask my AI assistant"><MessageCircle className="!h-6 !w-6" aria-hidden="true" /></Link>
        </Button>
      )}
    </div>
  );
}