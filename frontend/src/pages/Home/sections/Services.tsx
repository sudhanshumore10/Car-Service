import "./Services.css";
import ServicesCards from "./ServicesCards";

const Services = () => {
  return (
    <>
      <section className="services">

        <div className="services-container">

          <div className="services-left">
            <p className="tag">{'// Services'}</p>

            <h1>
              Our <span>Services</span>
            </h1>

            <p className="desc">
              At Car Service, we provide top-quality vehicle repair and
              maintenance solutions designed for all types of cars.
              Our experienced technicians bring years of expertise
              and use advanced diagnostic equipment to ensure every
              service meets the highest standards of performance and
              reliability.
            </p>

            <button className="cta">
              Book Service Now →
            </button>
          </div>

          <div className="services-right">
            <div className="image-box"></div>
          </div>

        </div>

      </section>
      <ServicesCards />
    </>
  );
};

export default Services;
