import { Mail, Phone, MapPin } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa6";

const contactItems = [
    {
        icon: Mail,
        label: "Email",
        value: "jchan@paragoniu.edu.kh",
        href: "mailto:jchan@paragoniu.edu.kh",
    },
    {
        icon: Phone,
        label: "Phone",
        value: "+855 96 999 6399",
        href: "tel:+855969963996",
    },
    {
        icon: MapPin,
        label: "Location",
        value: "Toul Kork, Phnom Penh, Cambodia",
        href: null,
    },
];

export const Contact = () => {
    return (
        <section id="contact" className="py-24 bg-background">
            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <p className="text-sm uppercase tracking-widest text-primary mb-3">
                        Contact
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Let's <span className="text-primary glow-text">connect</span>
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        I'm open to backend roles, collaborations, and new opportunities.
                        Reach out any time.
                    </p>
                </div>

                <div className="max-w-2xl mx-auto">
                    <div className="grid sm:grid-cols-3 gap-4 mb-6">
                        {contactItems.map((item) => {
                            const inner = (
                                <div className="glass rounded-2xl p-6 text-center h-full hover:border-primary/30 transition-colors duration-300">
                                    <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                        <item.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                                        {item.label}
                                    </p>
                                    <p className="text-sm font-medium break-words">
                                        {item.value}
                                    </p>
                                </div>
                            );

                            return item.href ? (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    className="block"
                                >
                                    {inner}
                                </a>
                            ) : (
                                <div key={item.label}>{inner}</div>
                            );
                        })}
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <a
                            href="https://github.com/JoelCCCC"
                            target="_blank"
                            rel="noreferrer"
                            className="p-3 rounded-full glass hover:bg-primary/10 hover:text-primary transition-all duration-300"
                            aria-label="GitHub"
                        >
                            <FaGithub className="w-5 h-5" />
                        </a>
                        <a
                            href="https://linkedin.com"
                            target="_blank"
                            rel="noreferrer"
                            className="p-3 rounded-full glass hover:bg-primary/10 hover:text-primary transition-all duration-300"
                            aria-label="LinkedIn"
                        >
                            <FaLinkedin className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};
