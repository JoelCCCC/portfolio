import { Sparkles, Brain, CreditCard, Workflow } from "lucide-react";

const projects = [
    {
        icon: Sparkles,
        name: "AI-SkillPath",
        role: "Project Lead, Fullstack & AI Lead",
        year: "2026",
        tagline:
            "An AI-powered platform helping students track and navigate their course roadmaps.",
        points: [
            "Led a team of 4 engineers to architect and deploy a scalable, AI-driven learning platform.",
            "Designed an optimized, fast-paced, and cost-effective AI integration pipeline leveraging LLM caching and low-latency API handlers.",
        ],
        stack: [
            "Next.js",
            "FastAPI",
            "Gemini API",
            "DeepSeek",
            "Redis",
            "PostgreSQL",
            "Docker",
            "Google OAuth",
            "GitHub",
        ],
    },
    {
        icon: Brain,
        name: "RAG",
        role: "Full Stack Developer",
        year: "2026",
        tagline:
            "A working Retrieval-Augmented Generation (RAG) system built on 240k football club match records across Europe for sports betting analysis.",
        points: [
            "Built a working RAG system indexing 240k football club match records across Europe to power sports betting analysis.",
            "Engineered the retrieval pipeline using Gemini embeddings stored in pgvector, with DeepSeek as the generative model and caching for low-latency responses.",
        ],
        stack: [
            "FastAPI",
            "Gemini Embedding Model",
            "pgvector",
            "DeepSeek",
            "Caching",
        ],
    },
    {
        icon: CreditCard,
        name: "P2P Money Lending Platform",
        role: "API & Database Architect",
        year: "2025",
        tagline:
            "A secure backend service powering peer-to-peer financial transactions.",
        points: [
            "Developed and optimized high-performance RESTful APIs supporting secure user authentication (OTP verification), transaction processing, and real-time tracking.",
            "Architected a highly scalable relational database schema in MySQL to manage complex borrower/lender relationships and high-frequency transactions.",
            "Implemented performance-driven indexing and foreign key constraints to ensure strict data integrity and low latency.",
        ],
        stack: ["PHP", "Laravel", "MySQL", "REST APIs"],
    },
    {
        icon: Workflow,
        name: "STEMARK",
        role: "DevOps & Systems Engineer",
        year: "2026",
        tagline:
            "Microservice infrastructure and API gateway design for high-concurrency architecture.",
        points: [
            "Designed comprehensive architectural blueprints and system diagrams serving as the foundational framework for the development team.",
            "Engineered robust CI/CD pipelines to automate testing and streamline cloud provider deployments.",
        ],
        stack: [
            "Go",
            "Kong Gateway",
            "Gitea",
            "PostgreSQL",
            "Docker",
            "Google OAuth",
        ],
    },
];

export const Projects = () => {
    return (
        <section id="projects" className="py-24 bg-background">
            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <p className="text-sm uppercase tracking-widest text-primary mb-3">
                        Key Projects
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Things I've <span className="text-primary glow-text">built</span>
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        A selection of projects where I've designed APIs, architected
                        databases, and shipped cloud deployments.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <article
                            key={project.name}
                            className="glass rounded-2xl p-6 flex flex-col hover:border-primary/30 hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <project.icon className="w-6 h-6 text-primary" />
                                </div>
                                <span className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary">
                                    {project.year}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold mb-1">{project.name}</h3>
                            <p className="text-sm text-primary mb-3">{project.role}</p>
                            <p className="text-muted-foreground mb-4">{project.tagline}</p>

                            <ul className="space-y-2 mb-5 text-sm text-muted-foreground flex-1">
                                {project.points.map((point) => (
                                    <li key={point} className="flex gap-2">
                                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                        {point}
                                    </li>
                                ))}
                            </ul>

                            <div className="flex flex-wrap gap-2">
                                {project.stack.map((tech) => (
                                    <span
                                        key={tech}
                                        className="text-xs px-2.5 py-1 rounded-full bg-surface text-muted-foreground"
                                    >
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};
