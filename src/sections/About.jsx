import { Code2, Database, Cloud, GraduationCap } from "lucide-react";

const skillGroups = [
    {
        icon: Code2,
        title: "Languages & Frameworks",
        skills: [
            "PHP (Laravel)",
            "Java (Spring Boot)",
            "Go",
            "Python (FastAPI)",
            "JavaScript / TypeScript (Next.js)",
        ],
    },
    {
        icon: Database,
        title: "Databases & Caching",
        skills: ["MySQL", "PostgreSQL", "MongoDB", "Redis"],
    },
    {
        icon: Cloud,
        title: "DevOps & Infrastructure",
        skills: [
            "Docker",
            "Git",
            "CI/CD Pipelines",
            "Kong Gateway",
            "Gitea",
            "Cloud Deployment",
            "System Design",
        ],
    },
];

const education = [
    {
        school: "Paragon International University",
        degree: "B.S. in Computer Science",
        period: "2024 – Present",
    },
    {
        school: "AIS",
        degree: "High School Diploma",
        period: "2023",
    },
];

export const About = () => {
    return (
        <section id="about" className="py-24 bg-background">
            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <p className="text-sm uppercase tracking-widest text-primary mb-3">
                        About Me
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Backend developer &{" "}
                        <span className="text-primary glow-text">CS student</span>
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Results-driven backend developer specializing in architecting
                        RESTful APIs using Laravel and Spring Boot. Proficient in
                        relational database design, cloud deployments, and DevOps
                        methodologies — actively expanding expertise into Artificial
                        Intelligence, Machine Learning, and Data Science to build
                        next-generation, data-driven applications.
                    </p>
                </div>

                {/* Skills */}
                <div className="grid md:grid-cols-3 gap-6 mb-20">
                    {skillGroups.map((group) => (
                        <div
                            key={group.title}
                            className="glass rounded-2xl p-6 hover:border-primary/30 transition-colors duration-300"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <group.icon className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="font-semibold">{group.title}</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {group.skills.map((skill) => (
                                    <span
                                        key={skill}
                                        className="text-sm px-3 py-1 rounded-full bg-surface text-muted-foreground"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Education */}
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <GraduationCap className="w-6 h-6 text-primary" />
                        <h3 className="text-2xl font-bold">Education</h3>
                    </div>
                    <div className="space-y-4">
                        {education.map((item) => (
                            <div
                                key={item.degree}
                                className="glass rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4"
                            >
                                <div>
                                    <h4 className="font-semibold text-lg">
                                        {item.degree}
                                    </h4>
                                    <p className="text-muted-foreground">
                                        {item.school}
                                    </p>
                                </div>
                                <span className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary">
                                    {item.period}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
