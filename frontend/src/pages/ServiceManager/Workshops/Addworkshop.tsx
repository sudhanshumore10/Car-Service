import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../Sidebar/Sidebar";
import { addWorkshop } from "../../../services/workshopService";
import "./AddWorkshop.css";

const AddWorkshop = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    openTime: "",
    closeTime: "",
    brands: [] as string[],
    brandInput: "",
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const managerUserId = user?.userId ?? user?.id ?? null;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const addBrand = () => {
    const nextBrand = form.brandInput.trim();
    if (!nextBrand) return;

    setForm((current) => ({
      ...current,
      brands: current.brands.includes(nextBrand) ? current.brands : [...current.brands, nextBrand],
      brandInput: "",
    }));
  };

  const removeBrand = (index: number) => {
    setForm((current) => ({
      ...current,
      brands: current.brands.filter((_, brandIndex) => brandIndex !== index),
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      if (!managerUserId) {
        toast.error("Manager session not found. Please log in again.");
        return;
      }

      const response = await addWorkshop(managerUserId, form);
      if (response && response.status === 200) {
        toast.success("Workshop added successfully");
        navigate("/manager/workshops");
        return;
      }

      toast.error("Failed to add workshop");
      throw new Error("Failed to add workshop");
    } catch (error) {
      toast.error("Failed while adding workshop");
      console.error(error);
    }
  };

  return (
    <div className="add-workshop-container">
      <div className="sidebar">
        <Sidebar />
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        <h2 className="form-title">Add Workshop</h2>

        <div className="form-group">
          <label className="workshop">Workshop Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter workshop name"
            required
          />
        </div>

        <h3 className="form-fields">Address Details</h3>
        <div className="grid-2">
          <input name="addressLine1" placeholder="Address Line 1" value={form.addressLine1} onChange={handleChange} />
          <input name="addressLine2" placeholder="Address Line 2" value={form.addressLine2} onChange={handleChange} />
          <input name="city" placeholder="City" value={form.city} onChange={handleChange} />
          <input name="state" placeholder="State" value={form.state} onChange={handleChange} />
          <input name="country" placeholder="Country" value={form.country} onChange={handleChange} />
          <input name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} />
        </div>

        <h3 className="form-fields">Working Hours</h3>
        <div className="grid-2">
          <input type="time" name="openTime" value={form.openTime} onChange={handleChange} />
          <input type="time" name="closeTime" value={form.closeTime} onChange={handleChange} />
        </div>

        <h3 className="form-fields">Serviceable Brands</h3>
        <div className="brand-input">
          <input
            value={form.brandInput}
            onChange={(event) =>
              setForm((current) => ({ ...current, brandInput: event.target.value }))
            }
            placeholder="Add brand"
          />
          <button type="button" onClick={addBrand}>
            + Add
          </button>
        </div>

        <div className="brands-list">
          {form.brands.map((brand, index) => (
            <span key={`${brand}-${index}`} className="brand-chip">
              {brand}
              <button type="button" onClick={() => removeBrand(index)}>
                x
              </button>
            </span>
          ))}
        </div>

        <button type="submit" className="save-btn">
          Save Workshop
        </button>
      </form>
    </div>
  );
};

export default AddWorkshop;
