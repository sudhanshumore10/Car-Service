import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../Sidebar/Sidebar";
import "./TechnicianDashboard.css";
import {
  getTechnicianOperationalQueue,
  getTechnicianWorkOrders,
  TechnicianWorkOrderSummary,
} from "../../../services/workOrderServices";

const ACTIVE_STATUSES = ["SCHEDULED", "RECEIVED", "VEHICLE_RECEIVED", "DIAGNOSIS", "IN_SERVICE", "QA", "READY"];

const prettifyStatus = (status?: string) =>
  String(status || "PENDING")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

function TechnicianDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const technicianUserId = user?.userId ?? user?.id ?? null;
  const [loading, setLoading] = useState(true);
  const [workOrders, setWorkOrders] = useState<TechnicianWorkOrderSummary[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
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
          toast.error(queueError.response?.data?.errorMessage || error.response?.data?.errorMessage || "Failed to load technician dashboard");
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [technicianUserId]);

  const assignedJobs = workOrders.length;
  const inProgressCount = workOrders.filter((item) => ACTIVE_STATUSES.includes(item.status)).length;
  const sentForApprovalCount = workOrders.filter((item) => item.estimateStatus === "SENT").length;
  const recentOrders = useMemo(
    () =>
      [...workOrders]
        .sort((left, right) => {
          const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
          const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
          return rightTime - leftTime;
        })
        .slice(0, 3),
    [workOrders]
  );

  return (
    <div className="dashboard-page">
      <Sidebar />
      <div className="main">
        <div className="breadcrumb">
          <span>Overview</span> / <span>Dashboard</span>
        </div>

        <div className="header-section">
          <div className="header-title">
            <h1>Technician Dashboard</h1>
            <p className="created-date">
              Welcome back, {user?.fullName || "Technician"}. Here&apos;s your live work order summary.
            </p>
          </div>
        </div>

        <div className="cards">
          <div className="info-card">
            <p className="label">ASSIGNED JOBS</p>
            <h3>{loading ? "..." : assignedJobs}</h3>
            <p className="sub-label text-success">Fetched from your assigned work orders</p>
          </div>
          <div className="info-card">
            <p className="label">ACTIVE WORK</p>
            <h3>{loading ? "..." : inProgressCount}</h3>
            <p className="sub-label text-warning">Statuses from the backend work order table</p>
          </div>
          <div className="info-card">
            <p className="label">ESTIMATES SENT</p>
            <h3>{loading ? "..." : sentForApprovalCount}</h3>
            <p className="sub-label">US-08 approvals waiting with customers</p>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="panel" style={{ margin: "0 30px 20px 30px" }}>
            <div className="panel-header">
              <h3>Recent Work Orders</h3>
              <Link to="/technician/work-orders" className="btn-link">
                View All
              </Link>
            </div>

            {loading ? (
              <p>Loading work orders...</p>
            ) : recentOrders.length === 0 ? (
              <p>No work orders are currently assigned to this technician.</p>
            ) : (
              <table className="dashboard-table-premium">
                <thead>
                  <tr>
                    <th>WORK ORDER</th>
                    <th>CUSTOMER</th>
                    <th>VEHICLE</th>
                    <th>STATUS</th>
                    <th>ESTIMATE</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((item) => (
                    <tr key={item.workOrderId}>
                      <td>
                        <Link to={`/work-orders/${item.workOrderId}`} className="wo-link">
                          WO-{item.workOrderId}
                        </Link>
                      </td>
                      <td>{item.customerName || "Customer"}</td>
                      <td>
                        {[item.vehicleMake, item.vehicleModel].filter(Boolean).join(" ") || "Vehicle"}
                      </td>
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

export default TechnicianDashboard;
