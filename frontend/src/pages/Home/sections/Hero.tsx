import { useNavigate } from "react-router-dom";

import "./Hero.css";
import Features from "./Features";

const Hero: React.FC = () => {

  const navigate = useNavigate();

  return (

    <section className="hero">
      <div className="hero-bg"></div>

      <div className="hero-overlay">
        <div className="hero-content">

          <p className="top-text">Smart • Fast • Reliable</p>
          <h1>Smooth Rides Ahead <br /><span>Service Made Simple</span></h1>



          <button

            className="cta-btn"

            onClick={() => navigate("/select-role")}

          >

            Get Started ↗

          </button>

          <Features />

        </div>



      </div>


    </section>

  );

};

export default Hero;