import "./About.css";

const About = () => {
  return (
    <>
      <section className="why-section">

        <div className="why-bg"></div>

        <div className="why-overlay">

          <p className="tag1">{'// About Us'}</p>

          <h1>
            Why <span>Choose Us</span>
          </h1>

          <div className="why-grid">

            <div className="why-card">
              <h3>Experienced Technicians</h3>
              <p>
                Certified and skilled professionals ensuring top-quality service.
              </p>
            </div>

            <div className="why-card">
              <h3>Customer-Centric Approach</h3>
              <p>
                Your satisfaction and safety are always our top priority.
              </p>
            </div>

            <div className="why-card">
              <h3>Advanced Equipment</h3>
              <p>
                Modern tools and technology for accurate diagnostics and repairs.
              </p>
            </div>

            <div className="why-card">
              <h3>Reliable & Transparent Service</h3>
              <p>
                No hidden costs. Honest pricing. Clear Communications.
              </p>
            </div>

          </div>
        </div>

      </section>
    </>
  );
};

export default About;
