import "./Contact.css";

const Contact = () => {
  return (
    <section className="contact">

      <div className="contact-container">

        <div className="contact-left">
          <p className="tag1">{'// Contact Us'}</p>

          <h1 className="con">
            Get In <span>Touch</span>
          </h1>

          <form className="contact-form">

            <div className="row">
              <input type="text" placeholder="Name" />
              <input type="email" placeholder="Email" />
            </div>

            <input type="text" placeholder="Subject" />

            <textarea placeholder="Message"></textarea>

            <button type="submit" className="cta">
              Send Message →
            </button>

          </form>
        </div>

        <div className="contact-right">
          <div className="image-box1"></div>
        </div>

      </div>

    </section>
  );
};

export default Contact;
