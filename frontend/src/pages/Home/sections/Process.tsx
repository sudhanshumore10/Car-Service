import "./Process.css";

const steps = [
  {
    step: "Step 1",
    title: "Consultation",
    desc: "We listen to your needs and provide a clear service plan.",
    img: "/images/step1.jpg",
    color: "red",
  },
  {
    step: "Step 2",
    title: "Schedule & Drop Off",
    desc: "Book your appointment and bring in your car.",
    img: "/images/step2.jpg",
    color: "dark",
  },
  {
    step: "Step 3",
    title: "Pick Up Your Car",
    desc: "We notify you once your car is ready.",
    img: "/images/step3.jpg",
    color: "red",
  },
];

const Process = () => {
  return (
    <section className="process">

      <div className="process-left">
        <p className="tag">// How It Works</p>

        <h1>
          <span>Our</span> Process
        </h1>

        <p className="desc">
          Our process makes car repair simple and stress-free,
          ensuring every step is handled with care.
        </p>

        <div className="arrows">≫≫≫</div>
      </div>

      <div className="process-right">
        {steps.map((item, i) => (
          <div className={`process-card ${item.color}`} key={i}>

            <img src={item.img} alt="" />

            <div className="content">
              <span className="badge">{item.step}</span>
              <h2>{item.title}</h2>
              <p>{item.desc}</p>
            </div>

          </div>
        ))}
      </div>

    </section>
  );
};

export default Process;