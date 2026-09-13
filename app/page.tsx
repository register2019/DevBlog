import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Articles from "@/components/Articles";
import Projects from "@/components/Projects";
import About from "@/components/About";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Articles />
        <Projects />
        <About />
      </main>
      <Footer />
    </>
  );
}