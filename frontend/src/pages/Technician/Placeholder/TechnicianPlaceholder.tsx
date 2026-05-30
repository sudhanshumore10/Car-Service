import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../Sidebar/Sidebar";
import {
  getTechnicianOperationalQueue,
  getTechnicianWorkOrders,
  TechnicianWorkOrderSummary,
} from "../../../services/workOrderServices";

const routeMeta: Record<string, { title: string; subtitle: string }> = {
  customers: {
    title: "Technician Customer View",
    subtitle: "Review assigned customers and jump back into their active work orders.",
  },
  vehicles: {
    title: "Technician Vehicle View",
    subtitle: "Inspect the vehicles currently linked to your assigned jobs and service work.",
  },
  inventory: {
    title: "Technician Inventory View",
    subtitle: "Track parts-linked jobs and use work-order details to continue parts updates.",
  },
  estimates: {
    title: "Technician Estimate Queue",
    subtitle: "Focus on work orders still waiting for diagnosis, estimate creation, or customer approval.",
  },
  reports: {
    title: "Technician Productivity Snapshot",
    subtitle: "See your current workload mix and recent operational activity from live work-order data.",
  },
  settings: {
    title: "Technician Workspace Guide",
    subtitle: "Use this screen as a quick operational summary while we keep expanding the technician tools.",
  },
};

const prettifyStatus = (status?: string) =>
  String(status || "PENDING")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

function TechnicianPlaceholder() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const technicianUserId = user?.userId ?? user?.id ?? null;
  const currentKey = location.pathname.split("/").pop() || "workspace";
  const pageMeta = routeMeta[currentKey] || {
    title: "Technician Workspace",
    subtitle: "Live technician data is available here while the full module screens are expanded.",
  };

  const [loading, setLoading] = useState(true);
  const [workOrders, setWorkOrders] = useState<TechnicianWorkOrderSummary[]>([]);

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
        } else {
          setWorkOrders(await getTechnicianOperationalQueue());
        }
      } catch (error: any) {
        try {
          setWorkOrders(await getTechnicianOperationalQueue());
        } catch (queueError: any) {
          toast.error(queueError.response?.data?.errorMessage || error.response?.data?.errorMessage || "Failed to load technician workspace");
        }
      } finally {
        setLoading(false);
      }
    };

    loadWorkOrders();
  }, [technicianUserId]);

  const approvalPending = workOrders.filter((item) => item.approvalStatus === "PENDING").length;
  const readyForDelivery = workOrders.filter((item) => item.status === "READY").length;
  const estimateQueue = useMemo(
    () => workOrders.filter((item) => ["PENDING", "SENT"].includes(String(item.approvalStatus || ""))).slice(0, 5),
    [workOrders]
  );

  return (
    <div className="dashboard-page">
      <Sidebar />
      <div className="main">
        <div className="breadcrumb">
          <span>Technician</span> / <span>{pageMeta.title}</span>
        </div>

        <div className="header-section">
          <div className="header-title">
            <h1>{pageMeta.title}</h1>
            <p className="created-date">{pageMeta.subtitle}</p>
          </div>
        </div>

        <div className="cards">
          <div className="info-card">
            <p className="label">ASSIGNED WORK ORDERS</p>
            <h3>{loading ? "..." : workOrders.length}</h3>
            <p className="sub-label">Live jobs mapped to this technician account</p>
          </div>
          <div className="info-card">
            <p className="label">READY FOR DELIVERY</p>
            <h3>{loading ? "..." : readyForDelivery}</h3>
            <p className="sub-label">Work orders already at the ready stage</p>
          </div>
          <div className="info-card">
            <p className="label">APPROVAL PENDING</p>
            <h3>{loading ? "..." : approvalPending}</h3>
            <p className="sub-label">Estimate approvals still open with customers</p>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="panel" style={{ margin: "0 30px 20px 30px", width: "100%" }}>
            <div
              className="panel-header"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}
            >
              <h3>Operational Queue</h3>
              <Link to="/technician/work-orders" className="btn-link">
                Open Work Orders
              </Link>
            </div>

            {loading ? (
              <p>Loading live technician data...</p>
            ) : estimateQueue.length === 0 ? (
              <p>No technician work orders are currently waiting in this queue.</p>
            ) : (
              <table className="dashboard-table-premium">
                <thead>
                  <tr>
                    <th>WORK ORDER</th>
                    <th>CUSTOMER</th>
                    <th>VEHICLE</th>
                    <th>STATUS</th>
                    <th>APPROVAL</th>
                  </tr>
                </thead>
                <tbody>
                  {estimateQueue.map((item) => (
                    <tr key={item.workOrderId}>
                      <td>
                        <Link to={`/work-orders/${item.workOrderId}`} className="wo-link">
                          WO-{item.workOrderId}
                        </Link>
                      </td>
                      <td>{item.customerName || "Customer"}</td>
                      <td>{[item.vehicleMake, item.vehicleModel].filter(Boolean).join(" ") || "Vehicle"}</td>
                      <td>{prettifyStatus(item.status)}</td>
                      <td>{prettifyStatus(item.approvalStatus)}</td>
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

export default TechnicianPlaceholder;
