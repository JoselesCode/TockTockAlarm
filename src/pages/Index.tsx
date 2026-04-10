import Navbar from "./index/_components/Navbar.tsx";
import Hero from "./index/_components/Hero.tsx";
import Problem from "./index/_components/Problem.tsx";
import HowItWorks from "./index/_components/HowItWorks.tsx";
import Features from "./index/_components/Features.tsx";
import Accessibility from "./index/_components/Accessibility.tsx";
import CTA from "./index/_components/CTA.tsx";
import Footer from "./index/_components/Footer.tsx";

export default function Index() {
  return (
    <>
      <Navbar />
      <Hero />
      <Problem />
      <HowItWorks />
      <Features />
      <Accessibility />
      <CTA />
      <Footer />
    </>
  );
}