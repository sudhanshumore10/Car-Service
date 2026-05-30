import Hero from "./sections/Hero";


import "./Home.css";
import Services from "./sections/Services";
import About from "./sections/About";
import Contact from "./sections/Contact";

const Home: React.FC = () => {

  return (

    <div className="page-bg">



      <div className="main-container">

        <Hero />
        <Services />
        <About />
        <Contact />




      </div>

    </div>

  );

};

export default Home;



