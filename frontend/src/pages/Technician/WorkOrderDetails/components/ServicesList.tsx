import React from "react";
type Service = {
  name: string;
  cost: number;
};
type WorkOrderData = {
  estimate: {
    services: Service[];
    parts: any[];
    tax: number;
    discount: number;
  };
};

type Props = {
  services: Service[];
  setWorkOrderData: React.Dispatch<React.SetStateAction<any>>;
};

const ServicesList: React.FC<Props> = ({ services, setWorkOrderData }) => {
  const addService = () => {
    setWorkOrderData((prev: WorkOrderData) => ({
      ...prev,
      estimate: {
        ...prev.estimate,
        services: [...prev.estimate.services, { name: "", cost: 0 }],
      },
    }));
  };

  const removeService = (index: number) => {
    setWorkOrderData((prev: WorkOrderData) => {
      const updated = [...prev.estimate.services];
      updated.splice(index, 1);
      return {
        ...prev,
        estimate: {
          ...prev.estimate,
          services: updated,
        },
      };
    });
  };

  const updateService = (
    index: number,
    field: keyof Service,
    value: string
  ) => {
    setWorkOrderData((prev: WorkOrderData) => {
      const updated = [...prev.estimate.services];
      updated[index] = {
        ...updated[index],
        [field]: field === "cost" ? Number(value) : value,
      };
      return {
        ...prev,
        estimate: {
          ...prev.estimate,
          services: updated,
        },
      };
    });

  };

  return (
    <div>
      <h4>Services</h4>
      {services.length === 0 && (
        <p>No services added yet.</p>
      )}
      {services.map((service: Service, index: number) => (
        <div key={index} className="row">
          <input
            type="text"
            placeholder="Service Name"
            value={service.name}
            onChange={(e) =>
              updateService(index, "name", e.target.value)
            }
          />
          <input
            type="number"
            placeholder="Cost"
            value={service.cost}
            onChange={(e) =>
              updateService(index, "cost", e.target.value)
            }
          />
          <button onClick={() => removeService(index)}>
            Remove
          </button>
        </div>
      ))}
      <button onClick={addService}>+ Add Service</button>
    </div>

  );

};

export default ServicesList;