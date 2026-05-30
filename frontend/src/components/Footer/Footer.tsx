import "./Footer.css";
import car1 from "../../assets/icons/car1.png";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <div className="logo">
            <img src={car1} alt="CarService logo" />
            <p id="name">
              Car <span>Service</span>
            </p>
          </div>
        </div>

        <div className="footer-right">
          <h3>Quick Links</h3>
          <ul>
            <li>Home</li>
            <li>Services</li>
            <li>About</li>
            <li>Contact</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        Copyright 2026 CarServiceSystem | All rights reserved
      </div>
    </footer>
  );
};

export default Footer;
