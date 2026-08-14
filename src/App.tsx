import Backdrop from "./components/Backdrop";
import Footer from "./components/Footer";
import Nav from "./components/Nav";
import StatusBar from "./components/StatusBar";
import Beneficios from "./sections/Beneficios";
import ComoFunciona from "./sections/ComoFunciona";
import Cta from "./sections/Cta";
import Filosofia from "./sections/Filosofia";
import Hero from "./sections/Hero";

export default function App() {
  return (
    <>
      <Backdrop />
      <StatusBar />
      <Nav />
      <main id="top">
        <Hero />
        <Filosofia />
        <Beneficios />
        <ComoFunciona />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
