import Backdrop from "./components/Backdrop";
import EditionsDock from "./components/EditionsDock";
import Footer from "./components/Footer";
import Nav from "./components/Nav";
import StatusBar from "./components/StatusBar";
import Beneficios from "./sections/Beneficios";
import ComoFunciona from "./sections/ComoFunciona";
import Cta from "./sections/Cta";
import Filosofia from "./sections/Filosofia";
import Hero from "./sections/Hero";
import Showcase from "./sections/Showcase";
import TechSpecs from "./sections/TechSpecs";

export default function App() {
  return (
    <div className="app-root">
      <Backdrop />
      <StatusBar />
      <Nav />
      <main id="top" className="main-content">
        <Hero />
        <Showcase />
        <ComoFunciona />
        <Beneficios />
        <TechSpecs />
        <Filosofia />
        <Cta />
      </main>
      <EditionsDock />
      <Footer />
    </div>
  );
}
