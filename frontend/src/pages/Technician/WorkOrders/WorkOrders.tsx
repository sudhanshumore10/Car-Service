import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../Sidebar/Sidebar";
import "./WorkOrders.css";
import {
  getTechnicianOperationalQueue,
  getTechnicianWorkOrders,
  TechnicianWorkOrderSummary,
} from "../../../services/workOrderServices";

const prettifyStatus = (status?: string) =>
  String(status || "PENDING")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

function WorkOrders() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const technicianUserId = user?.userId ?? user?.id ?? null;
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [workOrders, setWorkOrders] = useState<TechnicianWorkOrderSummary[]>([]);
  const [queueMode, setQueueMode] = useState(false);

  useEffect(() => {
    const loadWorkOrders = async () => {
      if (!technicianUserId) {
        setLoading(false);
        return;
      }

      try {
        const data = await getTechnicianWorkOrders(technicianUserId);
        if (data.length > 0) {
          setWorkOrders(data);
          setQueueMode(false);
        } else {
          const queue = await getTechnicianOperationalQueue();
          setWorkOrders(queue);
          setQueueMode(queue.length > 0);
        }
      } catch (error: any) {
        try {
          const queue = await getTechnicianOperationalQueue();
          setWorkOrders(queue);
          setQueueMode(queue.length > 0);
        } catch (queueError: any) {
          toast.error(queueError.response?.data?.errorMessage || error.response?.data?.errorMessage || "Failed to load work orders");
        }
      } finally {
        setLoading(false);
      }
    };

    loadWorkOrders();
  }, [technicianUserId]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return workOrders;
    }

    return workOrders.filter((item) => {
      const vehicle = [item.vehicleMake, item.vehicleModel, item.vehiclePlateNumber]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        `wo-${item.workOrderId}`.toLowerCase().includes(query) ||
        String(item.customerName || "").toLowerCase().includes(query) ||
        vehicle.includes(query) ||
        prettifyStatus(item.status).toLowerCase().includes(query)
      );
    });
  }, [search, workOrders]);

  return (
    <div className="container">
      <Sidebar />
      <div className="main">
        <div className="header-section">
          <div className="header-title">
            <h1>Work Orders</h1>
            <p className="created-date">
              {queueMode
                ? "Showing the live shared workshop queue because there are no direct assignments on this login yet."
                : `Live work orders assigned to ${user?.fullName || "this technician"}`}
            </p>
          </div>
          <div className="header-actions">
            <input
              type="text"
              className="search-input"
              placeholder="Search work orders..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>
        <div className="content-layout">
          <div className="panel">
            {loading ? (
              <p style={{ padding: "20px" }}>Loading work orders...</p>
            ) : filteredOrders.length === 0 ? (
              <p style={{ padding: "20px" }}>No work orders found for this technician.</p>
            ) : (
              <table className="table-premium">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>CUSTOMER</th>
                    <th>VEHICLE</th>
                    <th>DATE CREATED</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((item) => (
                    <tr key={item.workOrderId}>
                      <td>
                        <Link to={`/work-orders/${item.workOrderId}`} className="wo-link">
                          WO-{item.workOrderId}
                        </Link>
                      </td>
                      <td>
                        <p className="cust-name">{item.customerName || "Customer"}</p>
                        <p className="cust-phone">{item.workshopName || "Assigned workshop"}</p>
                      </td>
                      <td>
                        <p className="veh-model">
                          {[item.vehicleMake, item.vehicleModel].filter(Boolean).join(" ") || "Vehicle"}
                        </p>
                        <p className="veh-vin">{item.vehiclePlateNumber || "Plate unavailable"}</p>
                      </td>
                      <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}</td>
                      <td>
                        <span className="status-badge in-progress">{prettifyStatus(item.status)}</span>
                      </td>
                      <td>
                        <Link to={`/work-orders/${item.workOrderId}`} className="btn-outline-sm">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkOrders;
