import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CustomerNavbar from "../../../components/CustomerNavbar/CustomerNavbar";
import { validateVehicle } from "../../../utils/validation";
import { addVehicle } from "../../../services/vehicleService";
import "./Vehicles.css";

const AddVehicle = () => {
  const [form, setForm] = useState({
    make: "",
    model: "",
    year: "",
    vin: "",
    plateNumber: "",
    docType: "",
    fileUrl: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const existingUser = JSON.parse(localStorage.getItem("user") || "{}");
  const customerUserId = existingUser?.userId ?? existingUser?.id ?? null;
  const navigate = useNavigate();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PDF, JPG, and PNG files are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5 MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setForm((current) => ({ ...current, fileUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async () => {
    const nextErrors = validateVehicle(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setSaving(true);
      await addVehicle(customerUserId || 0, form);
      toast.success("Vehicle added successfully");
      navigate("/customer/vehicles");
    } catch (error: any) {
      toast.error(error.response?.data?.errorMessage || "Failed to add vehicle");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <CustomerNavbar />
      <div className="customer-shell">
        <div className="customer-shell__inner customer-grid">
          <section className="customer-hero-card">
            <div className="customer-section-head" style={{ marginBottom: "0" }}>
              <div>
                <h1>Add Vehicle</h1>
                <p>Register a vehicle with validated details and supporting documents so future bookings become faster.</p>
              </div>
              <button
                type="button"
                className="customer-action-btn--secondary"
                onClick={() => navigate("/customer/vehicles")}
              >
                Back to Vehicles
              </button>
            </div>
          </section>

          <section className="customer-surface">
            <div className="customer-section-head">
              <div>
                <h3>Vehicle Information</h3>
                <p>VIN and plate should be unique, and the registration document must be under 5 MB.</p>
              </div>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleSubmit();
              }}
            >
              <div className="customer-form-grid">
                <div className="customer-form-field">
                  <label htmlFor="make">Make</label>
                  <input id="make" name="make" value={form.make} onChange={handleChange} />
                  {errors.make && <p className="customer-error">{errors.make}</p>}
                </div>

                <div className="customer-form-field">
                  <label htmlFor="model">Model</label>
                  <input id="model" name="model" value={form.model} onChange={handleChange} />
                  {errors.model && <p className="customer-error">{errors.model}</p>}
                </div>

                <div className="customer-form-field">
                  <label htmlFor="year">Year</label>
                  <input id="year" name="year" value={form.year} onChange={handleChange} />
                  {errors.year && <p className="customer-error">{errors.year}</p>}
                </div>

                <div className="customer-form-field">
                  <label htmlFor="vin">VIN</label>
                  <input id="vin" name="vin" value={form.vin} onChange={handleChange} />
                  {errors.vin && <p className="customer-error">{errors.vin}</p>}
                </div>

                <div className="customer-form-field">
                  <label htmlFor="plateNumber">Plate Number</label>
                  <input id="plateNumber" name="plateNumber" value={form.plateNumber} onChange={handleChange} />
                  {errors.plateNumber && <p className="customer-error">{errors.plateNumber}</p>}
                </div>

                <div className="customer-form-field">
                  <label htmlFor="docType">Document Type</label>
                  <select id="docType" name="docType" value={form.docType} onChange={handleChange}>
                    <option value="">Select document type</option>
                    <option value="INSURANCE">Insurance</option>
                    <option value="RC">RC</option>
                    <option value="POLLUTION">Pollution</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {errors.docType && <p className="customer-error">{errors.docType}</p>}
                </div>

                <div className="customer-form-field customer-form-field--full">
                  <label htmlFor="fileUpload">Upload Document</label>
                  <input id="fileUpload" type="file" accept=".pdf,image/*" onChange={handleFileChange} />
                  <p className="customer-muted" style={{ marginBottom: "0" }}>
                    Accepted: PDF, JPG, PNG
                  </p>
                  {errors.fileUrl && <p className="customer-error">{errors.fileUrl}</p>}
                </div>
              </div>

              <div className="customer-actions">
                <button
                  type="button"
                  className="customer-action-btn--secondary"
                  onClick={() => navigate("/customer/vehicles")}
                >
                  Cancel
                </button>
                <button type="submit" className="customer-action-btn" disabled={saving}>
                  {saving ? "Saving..." : "Add Vehicle"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </>
  );
};

export default AddVehicle;
