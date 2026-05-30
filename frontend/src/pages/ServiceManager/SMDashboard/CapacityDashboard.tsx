import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../Sidebar/Sidebar";
import "./ServiceManager.css";
import {
  getReportSummary,
  getRevenueByWorkshop,
  getTopServices,
  getWorkOrderStatusDistribution,
} from "../../../services/reportService";
import { getManagerScopedWorkshops } from "../../../services/workshopService";

const currency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const CapacityDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const managerUserId = user?.userId ?? user?.id ?? null;
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>({});
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [topServices, setTopServices] = useState<any[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [
          summaryResponse,
          managerWorkshops,
          revenueResponse,
          topServicesResponse,
          statusResponse,
        ] = await Promise.all([
          getReportSummary(),
          getManagerScopedWorkshops(managerUserId),
          getRevenueByWorkshop(),
          getTopServices(),
          getWorkOrderStatusDistribution(),
        ]);

        setSummary(summaryResponse.data || {});
        setWorkshops(managerWorkshops || []);
        setRevenue(revenueResponse.data || []);
        setTopServices(topServicesResponse.data || []);
        setStatusDistribution(statusResponse.data || {});
      } catch (error: any) {
        toast.error(error.response?.data?.errorMessage || "Failed to load manager overview");
      } finally {
        setLoading(false);
      }
    };

    if (managerUserId) {
      loadDashboard();
    } else {
      setLoading(false);
    }
  }, [managerUserId]);

  const visibleRevenue = useMemo(
    () => revenue.filter((item) => workshops.some((workshop) => workshop.name === item.workshopName)),
    [revenue, workshops]
  );

  return (
    <div className="layout">
      <div className="sidebar">
        <Sidebar />
      </div>
      <div className="main-content">
        <div className="dashboard-container">
          <div className="header-section" style={{ marginBottom: "1.5rem" }}>
            <div className="header-title">
              <h2>Manager Overview</h2>
              <p>
                Live operating snapshot for your workshops with bookings, work-order load,
                revenue, and quick links into the operational screens.
              </p>
            </div>
          </div>

          <div className="cards">
            <div className="info-card">
              <p className="label">MY WORKSHOPS</p>
              <h3>{loading ? "..." : workshops.length}</h3>
              <p className="sub-label">Directly assigned to this manager account</p>
            </div>
            <div className="info-card">
              <p className="label">TOTAL BOOKINGS</p>
              <h3>{loading ? "..." : summary.totalBookings ?? 0}</h3>
              <p className="sub-label">Current system-wide booking volume</p>
            </div>
            <div className="info-card">
              <p className="label">ACTIVE WORK ORDERS</p>
              <h3>{loading ? "..." : summary.activeWorkOrders ?? 0}</h3>
              <p className="sub-label">Jobs not yet delivered or closed</p>
            </div>
            <div className="info-card">
              <p className="label">PAID REVENUE</p>
              <h3>{loading ? "..." : currency(Number(summary.totalRevenue || 0))}</h3>
              <p className="sub-label">Paid invoices only</p>
            </div>
          </div>

          <div className="panel" style={{ marginTop: "1.5rem", marginBottom: "1.25rem" }}>
            <div className="panel-header">
              <h3>Quick Actions</h3>
            </div>
            <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap" }}>
              <button className="btn-outline-sm" onClick={() => navigate("/manager/capacity")}>Configure Capacity</button>
              <button className="btn-outline-sm" onClick={() => navigate("/manager/workshops")}>Open Workshops</button>
              <button className="btn-outline-sm" onClick={() => navigate("/manager/bookings")}>Review Bookings</button>
              <button className="btn-outline-sm" onClick={() => navigate("/manager/reports")}>View Reports</button>
              <button className="btn-outline-sm" onClick={() => navigate("/manager/feedback")}>Check Feedback</button>
            </div>
          </div>

          <div className="bottom-grid">
            <div className="panel">
              <div className="panel-header">
                <h3>My Workshops</h3>
              </div>
              {loading ? (
                <p>Loading workshops...</p>
              ) : workshops.length === 0 ? (
                <p>No workshops are assigned to this manager yet.</p>
              ) : (
                <div style={{ display: "grid", gap: "0.85rem" }}>
                  {workshops.map((workshop) => (
                    <div key={workshop.id} className="info-card" style={{ textAlign: "left" }}>
                      <p className="label">{workshop.name}</p>
                      <p className="sub-label">
                        {[workshop.address?.city, workshop.address?.state].filter(Boolean).join(", ") || "Location unavailable"}
                      </p>
                      <p className="sub-label">Brands: {workshop.serviceableBrands || "Not configured"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="panel">
              <div className="panel-header">
                <h3>Work Order Status Mix</h3>
              </div>
              {loading ? (
                <p>Loading status distribution...</p>
              ) : Object.keys(statusDistribution).length === 0 ? (
                <p>No work-order metrics available yet.</p>
              ) : (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  {Object.entries(statusDistribution).map(([status, count]) => (
                    <div key={status} className="customer-detail-item">
                      <span className="customer-detail__label">{status.replace(/_/g, " ")}</span>
                      <span className="customer-detail__value">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bottom-grid" style={{ marginTop: "1.25rem" }}>
            <div className="panel">
              <div className="panel-header">
                <h3>Top Services</h3>
              </div>
              {loading ? (
                <p>Loading service trends...</p>
              ) : topServices.length === 0 ? (
                <p>No service trend data available yet.</p>
              ) : (
                <table className="dashboard-table-premium">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Bookings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topServices.slice(0, 5).map((service) => (
                      <tr key={service.serviceName}>
                        <td>{service.serviceName}</td>
                        <td>{service.bookingCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="panel">
              <div className="panel-header">
                <h3>Revenue by Workshop</h3>
              </div>
              {loading ? (
                <p>Loading revenue...</p>
              ) : visibleRevenue.length === 0 ? (
                <p>No paid revenue found for your workshops yet.</p>
              ) : (
                <table className="dashboard-table-premium">
                  <thead>
                    <tr>
                      <th>Workshop</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRevenue.slice(0, 5).map((item) => (
                      <tr key={item.workshopName}>
                        <td>{item.workshopName}</td>
                        <td>{currency(Number(item.revenue || 0))}</td>
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

export default CapacityDashboard;
