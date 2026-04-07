import { Hero } from "@/sections/Hero";
import { Contact } from "@/sections/Contact";
import { About } from "@/sections/About";
import { Projects } from "@/sections/Projects";
import { Testimonials } from "@/sections/Testimonials";
import { Experience } from "@/sections/Experience";
import { Navbar } from "@/layout/Navbar";
function App() {

    return ( 
        <div className="min-h-screen overflow-x-hidden">
            <Navbar/>
            <main>
                <Hero/>
                <About/>
                <Projects/>
                <Experience/>
                <Testimonials/>
                <Contact/>
            </main>
        </div>
    );
}

export default App;
