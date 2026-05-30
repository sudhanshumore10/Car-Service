import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import "./Workshops.css";
import Sidebar from "../Sidebar/Sidebar";
import "../Sidebar/Sidebar.css";
import "../SMDashboard/ServiceManager.css"
import { getManagerScopedWorkshops } from "../../../services/workshopService";
import toast from "react-hot-toast";

const Workshops = () => {
  const navigate = useNavigate();
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageMessage, setPageMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const managerUserId = user?.userId ?? user?.id ?? null;

  const formatTime = (value?: string) => {
    if (!value) return "NA";
    if (value.includes("T")) return value.split("T")[1]?.slice(0, 5) || value;
    return value.slice(0, 5);
  };

  useEffect(() => {
    const fetchWorkshops = async () => {
      setLoading(true);
      setPageMessage("");
      try {
        if (!managerUserId) {
          setWorkshops([]);
          setPageMessage("Manager session not found. Please log in again.");
          return;
        }

        const scopedWorkshops = await getManagerScopedWorkshops(managerUserId);
        setWorkshops(scopedWorkshops);
        setPageMessage(scopedWorkshops.length > 0 ? "" : "No workshops are available yet.");
      } catch (err: any) {
        setWorkshops([]);
        setPageMessage("Unable to load workshops right now. Please try again shortly.");
        toast.error(err?.response?.data?.errorMessage || "Unable to load workshops");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, [managerUserId]);
  return (
    <div className="layout">
      <div className="sidebar">
        <Sidebar />
      </div>
      <div className="container">

        <h2>Workshops</h2>
        <button
          className="add-btn"
          onClick={() => navigate("/manager/add-workshop")}
        >
          + Add Workshop
        </button>
        {pageMessage && <p className="workshop-page-message">{pageMessage}</p>}
        <div className="workshop-cards">
          {loading ? (
            <div className="workshop-empty-state">Loading workshops...</div>
          ) : workshops.length === 0 ? (
            <div className="workshop-empty-state">No workshops available yet.</div>
          ) : (
            workshops.map((ws) => (
              <div key={ws.id} className="workshop-card">
                <p className="wname">{ws.name}</p>
                <p><b>Address:</b>{" "}
                  {[ws?.address?.addressLine1, ws?.address?.addressLine2, ws?.address?.city, ws?.address?.state, ws?.address?.country]
                    .filter(Boolean)
                    .join(", ")}
                  {ws?.address?.pincode ? ` - ${ws.address.pincode}` : ""}
                </p>
                <p><b>Time:</b> {formatTime(ws?.openTime)} - {formatTime(ws?.closeTime)}</p>
                <p><b>Brands:</b>{" "}
                  {ws.serviceableBrands ? ws?.serviceableBrands?.split(",").map((b: string, i: number) => (
                    <span key={i}>{b}</span>
                  ))
                    : "N/A"}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>

  );

};

export default Workshops;
