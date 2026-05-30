import "./Services.css";

const services = [
  {
    title: "A/C & Electrical Repair",
    desc: "From climate control malfunctions to electrical shorts — we repair all comfort systems.",
  },
  {
    title: "Transmission Services",
    desc: "Full diagnostics, maintenance, repair, and replacement for smooth shifting.",
  },
  {
    title: "Suspension & Brake Repair",
    desc: "Complete suspension upgrades for safety, comfort, and performance.",
  },
  {
    title: "Vehicle Maintenance",
    desc: "Routine inspections, tire checks, and fluid top-offs.",
  },
  {
    title: "Computer Diagnostics",
    desc: "Advanced scan tools to uncover hidden issues.",
  },
  {
    title: "Filter & Oil Change",
    desc: "High-quality oil and filters for long engine life.",
  },
  {
    title: "Full Engine Repair & Diagnostics",
    desc: "From minor fixes to full engine rebuilds with precision.",
  },
  {
    title: "Custom Work for Luxury & Exotic Brands",
    desc: "Specialized repair services for high-end vehicles.",
  },
  {
    title: "Pre-Purchase Inspections",
    desc: "Full inspection before buying a vehicle.",
  },
];

const ServicesCards = () => {
  return (
    <section className="services-grid-section">
      <div className="grid-container">
        {services.map((item, index) => (
          <div className="service-card" key={index}>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
            <button className="book-btn">Book Now →</button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ServicesCards;