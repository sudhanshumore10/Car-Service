import React, { useState } from "react";

import "./WorkOrderDetailsV2.css";

const OPTIONS = [

  "Engine Performance Issue",

  "Brake System",

  "Oil Leak",

  "Battery / Charging Issue",

  "Suspension / Steering",

  "Transmission Issue",

  "AC / Heating Issue",

  "Other",

];

const WorkOrderDetailsV2 = () => {

  const [selected, setSelected] = useState<string[]>([]);

  const [notes, setNotes] = useState("");

  const toggle = (item: string) => {

    setSelected((prev) =>

      prev.includes(item)

        ? prev.filter((i) => i !== item)

        : [...prev, item]

    );

  };

  return (

    <div className="container">

      {/* HEADER */}

      <div className="header">

        <h2>WO-1008</h2>

        <span className="badge">In Progress</span>

      </div>

      {/* TOP CARDS */}

      <div className="top-grid">

        <div className="card">John Smith</div>

        <div className="card">Toyota Camry 2018</div>

        <div className="card">45,230 km</div>

        <div className="card">Mike Johnson</div>

      </div>

      {/* MAIN GRID */}

      <div className="main-grid">

        {/* LEFT SIDE */}

        <div className="left">

          <div className="box">

            <div className="box-header">

              <h3>Diagnosis Checklist</h3>

              <span>{selected.length}/8 flagged</span>

            </div>

            {OPTIONS.map((item) => (

              <label key={item} className="item">

                <input

                  type="checkbox"

                  checked={selected.includes(item)}

                  onChange={() => toggle(item)}

                />

                {item}

              </label>

            ))}

          </div>

          <div className="box">

            <h3>Technician Notes</h3>

            <textarea

              value={notes}

              onChange={(e) => setNotes(e.target.value)}

              placeholder="Write notes..."

            />

          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="right">

          <div className="box">

            <h3>Estimate Summary</h3>

            <p>Brake Pad Repair - ₹2000</p>

            <p>Battery Replacement - ₹5000</p>

            <hr />

            <p>Subtotal: ₹7000</p>

            <p>Tax: ₹560</p>

            <p><strong>Total: ₹7560</strong></p>

          </div>

          <div className="box">

            <h3>Customer Approval</h3>

            <span className="pending">Pending Approval</span>

            <button className="btn">Send to Customer</button>

            <button className="btn secondary">View PDF</button>

          </div>

        </div>

      </div>

    </div>

  );

};

export default WorkOrderDetailsV2;

