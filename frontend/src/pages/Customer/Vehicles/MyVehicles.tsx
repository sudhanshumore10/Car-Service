import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CustomerNavbar from "../../../components/CustomerNavbar/CustomerNavbar";
import "./Vehicles.css";
import {
  getVehicles,
  updateVehicleStatus,
  VehicleRecord,
} from "../../../services/vehicleService";

const MyVehicles = () => {
  const navigate = useNavigate();
  const existingUser = JSON.parse(localStorage.getItem("user") || "{}");
  const customerUserId = existingUser?.userId ?? existingUser?.id ?? null;
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const response = await getVehicles(customerUserId || 0);
        setVehicles(response.data);
      } catch (error: any) {
        toast.error(error.response?.data?.errorMessage || "Error fetching vehicles");
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, [customerUserId]);

  const toggleStatus = async (vehicle: VehicleRecord) => {
    if (!vehicle.vehicleId) return;
    try {
      setUpdatingId(vehicle.vehicleId);
      const response = await updateVehicleStatus(
        vehicle.vehicleId,
        customerUserId || 0,
        !(vehicle.isActive ?? true)
      );
      setVehicles((current) =>
        current.map((item) =>
          item.vehicleId === vehicle.vehicleId ? response.data : item
        )
      );
      toast.success(
        `Vehicle ${response.data.isActive ? "activated" : "deactivated"} successfully`
      );
    } catch (error: any) {
      toast.error(error.response?.data?.errorMessage || "Failed to update vehicle status");
    } finally {
      setUpdatingId(null);
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
                <h1>My Vehicles</h1>
                <p>Keep active vehicles ready for booking and deactivate older ones to prevent new appointments against them.</p>
              </div>
              <button className="customer-action-btn" onClick={() => navigate("/customer/add-vehicle")}>
                Add Vehicle
              </button>
            </div>
          </section>

          <section className="customer-surface">
            <div className="customer-section-head">
              <div>
                <h3>Registered Vehicles</h3>
                <p>These records now come directly from the backend vehicle service instead of temporary browser state.</p>
              </div>
            </div>

            {loading ? (
              <div className="customer-empty">Loading vehicles...</div>
            ) : vehicles.length === 0 ? (
              <div className="customer-empty">No vehicles added yet.</div>
            ) : (
              <div className="vehicle-grid">
                {vehicles.map((vehicle) => (
                  <div className="vehicle-card" key={vehicle.vehicleId}>
                    <p>
                      <b>{vehicle.make} {vehicle.model} ({vehicle.year})</b>
                    </p>
                    <p><b>VIN:</b> {vehicle.vin}</p>
                    <p><b>Plate:</b> {vehicle.plateNumber}</p>
                    <p>
                      <b>Status:</b>{" "}
                      <span className={`customer-chip ${vehicle.isActive ? "customer-chip--success" : "customer-chip--danger"}`}>
                        {vehicle.isActive ? "Active" : "Inactive"}
                      </span>
                    </p>
                    <p><b>Document Type:</b> {vehicle.vehicleDocument?.docType || "NA"}</p>

                    {vehicle.vehicleDocument?.fileUrl && (
                      <button
                        className="view-doc-btn"
                        onClick={() => window.open(vehicle.vehicleDocument?.fileUrl, "_blank")}
                      >
                        View Document
                      </button>
                    )}

                    <button
                      className="activate-btn"
                      disabled={updatingId === vehicle.vehicleId}
                      onClick={() => toggleStatus(vehicle)}
                    >
                      {updatingId === vehicle.vehicleId
                        ? "Updating..."
                        : vehicle.isActive
                          ? "Deactivate Vehicle"
                          : "Activate Vehicle"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default MyVehicles;
