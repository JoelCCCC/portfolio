import { Hero } from "@/sections/Hero";
import { Contact } from "@/sections/Contact";
import { About } from "@/sections/About";
import { Projects } from "@/sections/Projects";
import { Experience } from "@/sections/Experience";
import { RAGSection } from "@/sections/RAG";
import { Navbar } from "@/layout/Navbar";
function App() {

    return ( 
        <div className="min-h-screen overflow-x-hidden">
            <Navbar/>
            <main>
                <Hero/>
                <About/>
                <RAGSection/>
                <Projects/>
                <Experience/>
                <Contact/>
            </main>
        </div>
    );
}

export default App;
