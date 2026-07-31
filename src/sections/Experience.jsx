import { GraduationCap, Store } from "lucide-react";

const experience = [
    {
        icon: GraduationCap,
        role: "Teaching Assistant",
        company: "Paragon International University",
        period: "2026",
        points: [
            "Assisted course instructor Haksrun Lao in supporting undergraduate Computer Science students with coursework, programming assignments, and lab exercises.",
        ],
    },
    {
        icon: Store,
        role: "Founder & Operations Lead",
        company: "Personal Micro-Business",
        period: null,
        points: [
            "Managed direct consumer relations and client communications to optimize customer retention.",
            "Scaled operational capacity by designing and implementing an efficient logistics system to streamline business growth.",
        ],
    },
];

export const Experience = () => {
    return (
        <section id="experience" className="py-24 bg-background">
            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <p className="text-sm uppercase tracking-widest text-primary mb-3">
                        Work & Leadership
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Where I've <span className="text-primary glow-text">worked</span>
                    </h2>
                </div>

                <div className="max-w-2xl mx-auto relative">
                    <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

                    <div className="space-y-8">
                        {experience.map((item) => (
                            <div key={item.role} className="relative pl-16">
                                <div className="absolute left-0 top-0 w-10 h-10 rounded-full glass timeline-glow flex items-center justify-center">
                                    <item.icon className="w-5 h-5 text-primary" />
                                </div>

                                <div className="glass rounded-2xl p-6 hover:border-primary/30 transition-colors duration-300">
                                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                        <h3 className="text-lg font-bold">{item.role}</h3>
                                        {item.period && (
                                            <span className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary">
                                                {item.period}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-primary mb-3">{item.company}</p>
                                    <ul className="space-y-2 text-muted-foreground text-sm">
                                        {item.points.map((point) => (
                                            <li key={point} className="flex gap-2">
                                                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
