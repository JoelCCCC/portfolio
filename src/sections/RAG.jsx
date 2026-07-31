import {
    Search,
    Database,
    Zap,
    Cpu,
    Lightbulb,
    BarChart3,
    Workflow,
    GitBranch,
    Layers,
    FlaskConical,
} from "lucide-react";

const stats = [
    { value: "240K+", label: "Matches indexed" },
    { value: "22", label: "Leagues across Europe" },
    { value: "11", label: "Countries covered" },
    { value: "<10ms", label: "Search latency (warm)" },
];

const architecture = [
    {
        icon: Database,
        title: "Ingestion Pipeline",
        steps: [
            "Load CSV of match descriptions",
            "Chunk documents — 500 chars with 50 overlap",
            "Embed batches of 1000 via Vertex AI text-embedding-004",
            "Insert text + embedding (bytea) into PostgreSQL",
            "Invalidate the in-memory search cache",
        ],
        note: "240K chunks take ~30 min; batched writes keep peak RAM under 50MB and preserve progress on interruption.",
    },
    {
        icon: Search,
        title: "Query Pipeline",
        steps: [
            "Embed the user's question with Vertex AI",
            "Lazy-load the NumPy matrix cache from PostgreSQL (first query)",
            "Cosine similarity via numba dot product → top-k chunks",
            "Build a prompt with [Source N] citations",
            "DeepSeek generates a grounded answer with cited sources",
        ],
        note: "After the ~3s cache warm-up, subsequent queries resolve in under 10ms.",
    },
];

const decisions = [
    {
        icon: Database,
        title: "PostgreSQL as the vector store",
        text: "Chose PostgreSQL + a bytea embedding column over a dedicated vector database (Pinecone, Weaviate). One database for both metadata and vectors means no extra infrastructure.",
    },
    {
        icon: Zap,
        title: "In-memory cache over vector indexes",
        text: "The 240K × 768 embedding matrix fits in ~700MB of RAM, so a lazy-loaded NumPy matrix gives ~10ms full-scan search — fast enough that HNSW/IVF indexes would add complexity for no perceptible gain.",
    },
    {
        icon: Layers,
        title: "Fixed-size chunking with overlap",
        text: "Match descriptions average 400–600 chars, so 500-char chunks with 50 overlap keep most documents intact while preserving context across chunk boundaries.",
    },
    {
        icon: Cpu,
        title: "Cost-conscious model choices",
        text: "text-embedding-004 (768-dim) costs roughly $0.10 to embed all 240K chunks, and DeepSeek delivers strong reasoning at ~1/10 the cost of GPT-4.",
    },
    {
        icon: Workflow,
        title: "Async reload with status polling",
        text: "Embedding 240K chunks takes ~30 minutes, so /reload returns a task_id immediately and processes in the background, with a polling endpoint for progress.",
    },
    {
        icon: GitBranch,
        title: "Twelve-Factor configuration",
        text: "API keys and database URLs live in .env (kept out of version control), and CSV input auto-maps unknown columns into searchable text — so the system works with any dataset.",
    },
];

const evaluation = [
    {
        title: "Retrieval OK",
        text: "Did the top-k chunks include the relevant matches?",
    },
    {
        title: "Generation OK",
        text: "Did DeepSeek produce a correct, grounded answer from the cited sources?",
    },
];

const learnings = [
    "At this scale, linear search beats approximate indexes — a 240K × 768 matrix fits in RAM and scans in ~10ms, so HNSW/IVF complexity isn't justified.",
    "Separating retrieval failures from generation failures (dual-axis scoring) makes debugging a RAG system dramatically easier.",
    "Chunking directly shapes answer quality — fixed-size chunks can split a key stat mid-sentence, so sentence-aware chunking is the next improvement.",
    "Cost engineering is part of system design — DeepSeek + a pay-per-token embedding model kept a 240K-document pipeline at ~$0.10 for embeddings.",
    "Resumable ingestion (per-batch writes + task_id polling) prevents redoing 30 minutes of embedding work after an interruption.",
    "Keeping config in .env (Twelve-Factor) protects API keys and makes the project portable across machines.",
];

export const RAGSection = () => {
    return (
        <section id="rag" className="py-24 bg-background">
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <p className="text-sm uppercase tracking-widest text-primary mb-3">
                        Featured Project
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        RAG-Based AI{" "}
                        <span className="text-primary glow-text">Search System</span>
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        A Retrieval-Augmented Generation backend built with FastAPI
                        that indexes 240,000+ historical football matches — scores,
                        stats, and bookmaker odds — and answers natural-language
                        questions with grounded, cited responses.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="glass rounded-2xl p-6 text-center hover:border-primary/30 transition-colors duration-300"
                        >
                            <div className="text-3xl font-bold text-primary mb-1">
                                {stat.value}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Architecture */}
                <div className="max-w-3xl mx-auto text-center mb-10">
                    <h3 className="text-2xl md:text-3xl font-bold mb-3">
                        Architecture
                    </h3>
                    <p className="text-muted-foreground">
                        A two-stage pipeline — ingestion indexes the corpus, while
                        query-time retrieval and generation produce grounded answers.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-20">
                    {architecture.map((stage) => (
                        <div
                            key={stage.title}
                            className="glass rounded-2xl p-6 hover:border-primary/30 transition-colors duration-300"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <stage.icon className="w-5 h-5 text-primary" />
                                </div>
                                <h4 className="font-semibold text-lg">{stage.title}</h4>
                            </div>
                            <ol className="space-y-3 mb-4">
                                {stage.steps.map((step, idx) => (
                                    <li key={step} className="flex gap-3 text-sm">
                                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                                            {idx + 1}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {step}
                                        </span>
                                    </li>
                                ))}
                            </ol>
                            <p className="text-sm text-muted-foreground bg-surface rounded-xl p-3">
                                {stage.note}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Design decisions */}
                <div className="max-w-3xl mx-auto text-center mb-10">
                    <h3 className="text-2xl md:text-3xl font-bold mb-3">
                        Design Decisions
                    </h3>
                    <p className="text-muted-foreground">
                        Why the system is built the way it is — and the trade-offs
                        that shaped it.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                    {decisions.map((decision) => (
                        <div
                            key={decision.title}
                            className="glass rounded-2xl p-6 hover:border-primary/30 transition-colors duration-300"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <decision.icon className="w-5 h-5 text-primary" />
                                </div>
                                <h4 className="font-semibold">{decision.title}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {decision.text}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Evaluation */}
                <div className="glass rounded-2xl p-8 md:p-10 mb-20">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold">Evaluation</h3>
                    </div>
                    <p className="text-muted-foreground mb-6">
                        I tested the system with 10 football-specific queries spanning
                        betting odds, score patterns, match stats, aggregates, and
                        cross-league comparisons. Each result was scored on two axes to
                        isolate where failures happen:
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                        {evaluation.map((axis) => (
                            <div key={axis.title} className="bg-surface rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <FlaskConical className="w-4 h-4 text-primary" />
                                    <h4 className="font-semibold text-sm">
                                        {axis.title}
                                    </h4>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {axis.text}
                                </p>
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Performance: ~10ms full-scan retrieval across 240K rows after the
                        first query (~3s cache build), and a full 240K-chunk reload in
                        ~30–35 minutes with peak RAM under 50MB.
                    </p>
                </div>

                {/* Learnings */}
                <div className="max-w-3xl mx-auto text-center mb-10">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Lightbulb className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold">
                            What I Learned
                        </h3>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto">
                    <ul className="space-y-4">
                        {learnings.map((learning) => (
                            <li
                                key={learning}
                                className="glass rounded-2xl p-5 flex gap-3 hover:border-primary/30 transition-colors duration-300"
                            >
                                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span className="text-muted-foreground">
                                    {learning}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
};
