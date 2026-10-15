export interface Project {
  slug: string;
  title: string;
  category: string;
  githubUrl?: string;
  stack?: { label: string; technologies: string[] }[];
  description: string;
  context: string;
  strategy: string;
  execution: string[];
  impact: string;
  metrics: {
    value: string;
    label: string;
    variant?: "positive" | "negative" | "neutral";
  }[];
}

export const projects: Project[] = [
  {
    slug: "ai-portfolio-agent",
    githubUrl: "https://github.com/MaxOperchuk/ai-portfolio-agent",
    stack: [
      { label: "Language", technologies: ["Python"] },
      { label: "API", technologies: ["FastAPI", "Pydantic"] },
      { label: "AI Pipeline", technologies: ["LangGraph", "OpenAI", "RAG"] },
      { label: "Data & Search", technologies: ["PostgreSQL", "pgvector"] },
      { label: "Database Access", technologies: ["SQLAlchemy", "asyncpg", "psycopg", "Alembic"] },
      { label: "HTTP Client", technologies: ["HTTPX"] },
      { label: "Services & Infrastructure", technologies: ["Go", "Docker Compose"] },
      { label: "Frontend", technologies: ["React", "TypeScript", "Vite", "Tailwind CSS"] },
    ],
    title: "AI Portfolio Agent",
    category: "AI / Backend",
    description:
      "A RAG-powered assistant that answers questions about my experience, skills, and projects.",
    context:
      "A portfolio assistant that lets visitors explore my professional background through a conversation.",
    strategy:
      "Retrieve relevant portfolio information from PostgreSQL and use it to generate grounded answers with an LLM.",
    execution: [
      "Built a FastAPI backend with a LangGraph pipeline",
      "Implemented hybrid retrieval using pgvector and full-text search",
      "Persisted conversation state with PostgreSQL checkpoints",
      "Added a Go service for Telegram notifications",
      "Containerized services with Docker Compose",
    ],
    impact:
      "Visitors can ask questions and follow-ups about my background. Successful chats trigger Telegram notifications.",
    metrics: [
      { value: "FastAPI", label: "Backend", variant: "neutral" },
      { value: "LangGraph", label: "AI Pipeline", variant: "neutral" },
      { value: "pgvector", label: "Vector Search", variant: "neutral" },
    ],
  },
  {
    slug: "library-service",
    githubUrl: "https://github.com/Serejka21/DRF_APILibrary",
    title: "Library Service",
    category: "Backend",
    description:
      "A Django REST Framework application for managing books, borrowing, payments, and notifications.",
    context:
      "A library backend combining borrowing management with payments and Telegram notifications.",
    strategy:
      "Build a REST API with PostgreSQL storage, JWT authentication, and background processing using Celery and Redis.",
    execution: [
      "Worked on book and borrowing management",
      "Integrated Stripe payments",
      "Implemented Telegram notifications",
      "Used Celery and Redis for background processing",
      "Used Docker and Swagger/OpenAPI",
    ],
    impact:
      "The application supports library workflows with integrated payments and notifications.",
    metrics: [
      { value: "DRF", label: "REST API", variant: "neutral" },
      { value: "Stripe", label: "Payments", variant: "neutral" },
      { value: "Celery", label: "Background Tasks", variant: "neutral" },
    ],
  },
];
