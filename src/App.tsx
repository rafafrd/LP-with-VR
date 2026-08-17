import { lazy, Suspense } from "react";
import Backdrop from "./components/Backdrop";
import EditionsDock from "./components/EditionsDock";
import Footer from "./components/Footer";
import Nav from "./components/Nav";
import StatusBar from "./components/StatusBar";
import Beneficios from "./sections/Beneficios";
import Campanha from "./sections/Campanha";
import ComoFunciona from "./sections/ComoFunciona";
import Cta from "./sections/Cta";
import Filosofia from "./sections/Filosofia";
import Hero from "./sections/Hero";
import Showcase from "./sections/Showcase";
import TechSpecs from "./sections/TechSpecs";

// Camada 3D ambiente (óculos flutuando pela LP inteira) — code-split via React.lazy
// pra não competir com o primeiro paint (mesmo padrão do TryOnStage em Hero.tsx).
const AmbientCanvas = lazy(() => import("./scene/AmbientCanvas"));

export default function App() {
  return (
    <div className="app-root">
      <Backdrop />
      <Suspense fallback={null}>
        <AmbientCanvas />
      </Suspense>
      <StatusBar />
      <Nav />
      <main id="top" className="main-content">
        <Hero />
        <Showcase />
        <ComoFunciona />
        <Beneficios />
        <TechSpecs />
        <Campanha />
        <Filosofia />
        <Cta />
      </main>
      <EditionsDock />
      <Footer />
    </div>
  );
}
