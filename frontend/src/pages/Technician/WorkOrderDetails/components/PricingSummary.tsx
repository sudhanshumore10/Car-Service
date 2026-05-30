import React from "react";

const PricingSummary = ({ data, setWorkOrderData }: any) => {

  const { services, parts, tax, discount } = data;
  const servicesTotal = services.reduce(
    (sum: number, s: any) => sum + (s.cost || 0),
    0
  );
  const partsTotal = parts.reduce(
    (sum: number, p: any) =>
      sum + (p.cost || 0) * (p.quantity || 0),
    0
  );
  const subtotal = servicesTotal + partsTotal;
  const total = subtotal + tax - discount;
  const handleTaxChange = (value: string) => {
    setWorkOrderData((prev: any) => ({
      ...prev,
      estimate: {
        ...prev.estimate,
        tax: Number(value),
      },
    }));
  };
  const handleDiscountChange = (value: string) => {
    setWorkOrderData((prev: any) => ({
      ...prev,
      estimate: {
        ...prev.estimate,
        discount: Number(value),
      },
    }));
  };
  return (
    <div>
      <h4>Pricing Summary</h4>
      <div className="summary-row">
        <span>Services Total:</span>
        <span>₹ {servicesTotal}</span>
      </div>
      <div className="summary-row">
        <span>Parts Total:</span>
        <span>₹ {partsTotal}</span>
      </div>
      <div className="summary-row">
        <span>Subtotal:</span>
        <span>₹ {subtotal}</span>
      </div>
      <div className="summary-row">
        <span>Tax:</span>
        <input
          type="number"
          value={tax}
          onChange={(e) => handleTaxChange(e.target.value)}
        />
      </div>
      <div className="summary-row">
        <span>Discount:</span>
        <input
          type="number"
          value={discount}
          onChange={(e) =>
            handleDiscountChange(e.target.value)
          }
        />
      </div>
      <div className="summary-row total">
        <strong>Total:</strong>
        <strong>₹ {total}</strong>
      </div>
    </div>
  );

};

export default PricingSummary;