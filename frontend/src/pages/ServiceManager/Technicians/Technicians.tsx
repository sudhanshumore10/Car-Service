import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "../Sidebar/Sidebar";
import "../SMDashboard/ServiceManager.css";
import { getManagerScopedWorkshops } from "../../../services/workshopService";
import { getAllTechnicians, getTechniciansByWorkshop, getShiftsByWorkshop } from "../services/capacityService";

const Technicians = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const managerUserId = user?.userId ?? user?.id ?? null;
  const [loading, setLoading] = useState(true);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState("");
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [allTechnicians, setAllTechnicians] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);

  useEffect(() => {
    const loadWorkshops = async () => {
      try {
        const nextWorkshops = await getManagerScopedWorkshops(managerUserId);
        const allTechnicianResponse = await getAllTechnicians();
        setWorkshops(nextWorkshops);
        setAllTechnicians(allTechnicianResponse.data || []);
        if (nextWorkshops.length > 0) {
          setSelectedWorkshopId(String(nextWorkshops[0].id));
        }
      } catch (error: any) {
        toast.error(error.response?.data?.errorMessage || "Failed to load workshops");
      } finally {
        setLoading(false);
      }
    };

    if (managerUserId) {
      loadWorkshops();
    } else {
      setLoading(false);
    }
  }, [managerUserId]);

  useEffect(() => {
    const loadTechnicianData = async () => {
      if (!selectedWorkshopId) {
        setTechnicians([]);
        setShifts([]);
        return;
      }

      try {
        const [technicianResponse, shiftResponse] = await Promise.all([
          getTechniciansByWorkshop(Number(selectedWorkshopId)),
          getShiftsByWorkshop(Number(selectedWorkshopId)),
        ]);
        setTechnicians(technicianResponse.data || []);
        setShifts(shiftResponse.data || []);
      } catch (error: any) {
        toast.error(error.response?.data?.errorMessage || "Failed to load technician roster");
      }
    };

    loadTechnicianData();
  }, [selectedWorkshopId]);

  return (
    <div className="layout">
      <div className="sidebar">
        <Sidebar />
      </div>
      <div className="main-content">
        <div className="dashboard-container">
          <div className="header-section">
            <div className="header-title">
              <h2>Technician Roster</h2>
              <p>Review active workshop staffing and the current shift schedule.</p>
            </div>
          </div>

          <div className="panel" style={{ marginBottom: "1.25rem" }}>
            <div className="panel-header">
              <h3>Select Workshop</h3>
            </div>
            <select
              className="workshop-select"
              value={selectedWorkshopId}
              onChange={(event) => setSelectedWorkshopId(event.target.value)}
            >
              {workshops.map((workshop) => (
                <option key={workshop.id} value={workshop.id}>
                  {workshop.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bottom-grid">
            <div className="panel">
              <div className="panel-header">
                <h3>Technicians</h3>
              </div>
              {loading ? (
                <p>Loading technicians...</p>
              ) : technicians.length === 0 ? (
                <div>
                  <p>No technicians are mapped to this workshop yet.</p>
                  {allTechnicians.length > 0 && (
                    <p className="sub-label">
                      Choose another workshop above, or map one of the technicians listed below to this workshop in your seed data.
                    </p>
                  )}
                </div>
              ) : (
                <table className="dashboard-table-premium">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Specialization</th>
                      <th>Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {technicians.map((technician) => (
                      <tr key={technician.id}>
                        <td>{technician.technicianName || "Technician"}</td>
                        <td>{technician.specialization || "General"}</td>
                        <td>{technician.phone || "NA"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="panel">
              <div className="panel-header">
                <h3>All Active Technicians</h3>
              </div>
              {loading ? (
                <p>Loading technician directory...</p>
              ) : allTechnicians.length === 0 ? (
                <p>No technicians are available yet.</p>
              ) : (
                <table className="dashboard-table-premium">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Workshop</th>
                      <th>Specialization</th>
                      <th>Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTechnicians.map((technician) => (
                      <tr key={technician.id}>
                        <td>{technician.technicianName || "Technician"}</td>
                        <td>{technician.workshopName || "Unassigned"}</td>
                        <td>{technician.specialization || "General"}</td>
                        <td>{technician.phone || "NA"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="panel">
              <div className="panel-header">
                <h3>Shifts</h3>
              </div>
              {loading ? (
                <p>Loading shifts...</p>
              ) : shifts.length === 0 ? (
                <p>No shifts are configured for this workshop yet.</p>
              ) : (
                <table className="dashboard-table-premium">
                  <thead>
                    <tr>
                      <th>Technician ID</th>
                      <th>Start</th>
                      <th>End</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shifts.map((shift) => (
                      <tr key={shift.id}>
                        <td>{shift.technicianId}</td>
                        <td>{shift.shiftStart}</td>
                        <td>{shift.shiftEnd}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Technicians;
