import { Contact } from "@/components/contact";
import { Experience } from "@/components/experience";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Principles } from "@/components/principles";
import { Services } from "@/components/services";
import { SelectedWork } from "@/components/selected-work";
import { ChinaDeskHome } from "@/components/china-desk-home";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Experience />
        <SelectedWork />
        <Services />
        <ChinaDeskHome />
        <Principles />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
