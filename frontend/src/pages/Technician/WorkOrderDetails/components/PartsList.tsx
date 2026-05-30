import React from "react";

const PartsList = ({ parts, setWorkOrderData }: any) => {
const addPart = () => {
    setWorkOrderData((prev: any) => ({
      ...prev,
      estimate: {
        ...prev.estimate,
        parts: [
          ...prev.estimate.parts,
          { name: "", cost: 0, quantity: 1 },
        ],
      },
    }));
  };
  const removePart = (index: number) => {
    setWorkOrderData((prev: any) => {
      const updated = [...prev.estimate.parts];
      updated.splice(index, 1);
      return {
        ...prev,
        estimate: {
          ...prev.estimate,
          parts: updated,
        },
      };
    });
  };
const updatePart =(
    index:number,
    field:string,
    value:string
)=>{
    setWorkOrderData((prev:any)=>{
        const updated = [...prev.estimate.parts];
        updated[index]={
            ...updated[index],
            [field]:field === "cost" || field === "quantity"
            ? Number(value):value,
        };
        return{
            ...prev,
            estimate:{
                ...prev.estimate,
                parts:updated,
            },
        };
        
    });
};
return (
    <div>
      <h4>Parts</h4>
      {parts.length === 0 && <p>No parts added yet.</p>}
      {parts.map((part: any, index: number) => (
        <div key={index} className="row">
          <input
            type="text"
            placeholder="Part Name"
            value={part.name}
            onChange={(e) =>
              updatePart(index, "name", e.target.value)
            }
          />
          <input
            type="number"
            placeholder="Cost"
            value={part.cost}
            onChange={(e) =>
              updatePart(index, "cost", e.target.value)
            }
          />
          <input
            type="number"
            placeholder="Qty"
            value={part.quantity}
            onChange={(e) =>
              updatePart(index, "quantity", e.target.value)
            }
          />
          <button onClick={() => removePart(index)}>
            Remove
          </button>
        </div>
      ))}
      <button onClick={addPart}>+ Add Part</button>
    </div>
  );
};

export default PartsList;

