import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "../Sidebar/Sidebar";
import "../SMDashboard/ServiceManager.css";
import {
  getBookingVolume,
  getPartsUsage,
  getReportSummary,
  getRevenueByWorkshop,
  getTechnicianProductivity,
  getTopServices,
  getWorkOrderStatusDistribution,
  ReportFilters,
} from "../../../services/reportService";

const currency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value || 0);

const toInputDate = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
};

const defaultFilters = () => {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  return {
    startDate: toInputDate(thirtyDaysAgo),
    endDate: toInputDate(today),
  };
};

const downloadCsv = (filename: string, rows: Array<Record<string, string | number>>) => {
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  const content = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => `"${String(row[header] ?? "").replace(/"/g, '""')}"`)
        .join(",")
    ),
  ].join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const formatDelta = (value?: number) => {
  const numericValue = Number(value || 0);
  const prefix = numericValue > 0 ? "+" : "";
  return `${prefix}${numericValue.toFixed(2)}%`;
};

const deltaTone = (value?: number) => {
  const numericValue = Number(value || 0);
  if (numericValue > 0) return "#5ef2a0";
  if (numericValue < 0) return "#ff9292";
  return "#cbd5e1";
};

const Reports = () => {
  const initialFilters = useMemo(() => defaultFilters(), []);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<string>("");
  const [draftFilters, setDraftFilters] = useState<ReportFilters>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<ReportFilters>(initialFilters);
  const [summary, setSummary] = useState<any>({});
  const [topServices, setTopServices] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<Record<string, number>>({});
  const [revenueByWorkshop, setRevenueByWorkshop] = useState<any[]>([]);
  const [partsUsage, setPartsUsage] = useState<any[]>([]);
  const [bookingVolume, setBookingVolume] = useState<any[]>([]);

  const load = useCallback(async (filters: ReportFilters) => {
    setLoading(true);
    try {
      const [
        summaryRes,
        servicesRes,
        techniciansRes,
        statusRes,
        revenueRes,
        partsRes,
        volumeRes,
      ] = await Promise.all([
        getReportSummary(filters),
        getTopServices(filters),
        getTechnicianProductivity(filters),
        getWorkOrderStatusDistribution(filters),
        getRevenueByWorkshop(filters),
        getPartsUsage(filters),
        getBookingVolume(filters),
      ]);

      setSummary(summaryRes.data || {});
      setTopServices(servicesRes.data || []);
      setTechnicians(techniciansRes.data || []);
      setStatusDistribution(statusRes.data || {});
      setRevenueByWorkshop(revenueRes.data || []);
      setPartsUsage(partsRes.data || []);
      setBookingVolume(volumeRes.data || []);
      setLastRefresh(new Date().toLocaleString("en-IN"));
    } catch (error: any) {
      toast.error(error.response?.data?.errorMessage || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(appliedFilters);
  }, [appliedFilters, load]);

  const statusRows = useMemo(
    () =>
      Object.entries(statusDistribution).map(([status, count]) => ({
        status,
        count,
      })),
    [statusDistribution]
  );

  const maxBookingCount = useMemo(
    () => bookingVolume.reduce((max, item) => Math.max(max, Number(item.bookingCount || 0)), 0),
    [bookingVolume]
  );

  const comparison = summary?.comparison || {};

  const applyFilters = () => {
    if (
      draftFilters.startDate &&
      draftFilters.endDate &&
      draftFilters.startDate > draftFilters.endDate
    ) {
      toast.error("Start date cannot be after end date");
      return;
    }
    setAppliedFilters({ ...draftFilters });
  };

  const resetFilters = () => {
    const reset = defaultFilters();
    setDraftFilters(reset);
    setAppliedFilters(reset);
  };

  return (
    <div className="layout">
      <div className="sidebar">
        <Sidebar />
      </div>

      <div className="main-content">
        <div className="dashboard-container">
          <div className="customer-section-head">
            <div>
              <h2>Reports & Insights</h2>
              <p>
                Filter commercial and operational metrics by date range, then export live backend data for review.
              </p>
            </div>
            <div style={{ textAlign: "right", color: "#cbd5e1" }}>
              <div>Last refresh</div>
              <strong>{lastRefresh || "Loading..."}</strong>
            </div>
          </div>

          <div className="main-card" style={{ marginBottom: 20 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 14,
                alignItems: "end",
              }}
            >
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ color: "#cbd5e1", fontWeight: 600 }}>Start Date</span>
                <input
                  type="date"
                  className="form-control"
                  value={draftFilters.startDate || ""}
                  onChange={(event) =>
                    setDraftFilters((current) => ({ ...current, startDate: event.target.value }))
                  }
                />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ color: "#cbd5e1", fontWeight: 600 }}>End Date</span>
                <input
                  type="date"
                  className="form-control"
                  value={draftFilters.endDate || ""}
                  onChange={(event) =>
                    setDraftFilters((current) => ({ ...current, endDate: event.target.value }))
                  }
                />
              </label>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button type="button" className="btn btn-danger" onClick={applyFilters}>
                  Apply Filters
                </button>
                <button type="button" className="btn btn-outline-light" onClick={resetFilters}>
                  Last 30 Days
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="main-card">Loading reports...</div>
          ) : (
            <>
              <div className="main-card">
                <div className="bottom-grid">
                  <div>
                    <h4>Total Bookings</h4>
                    <p>{summary.totalBookings ?? 0}</p>
                  </div>
                  <div>
                    <h4>Confirmed</h4>
                    <p>{summary.confirmedBookings ?? 0}</p>
                  </div>
                  <div>
                    <h4>Completed</h4>
                    <p>{summary.completedBookings ?? 0}</p>
                  </div>
                  <div>
                    <h4>Cancelled</h4>
                    <p>{summary.cancelledBookings ?? 0}</p>
                  </div>
                  <div>
                    <h4>Active Work Orders</h4>
                    <p>{summary.activeWorkOrders ?? 0}</p>
                  </div>
                  <div>
                    <h4>Average TAT</h4>
                    <p>{Number(summary.averageTatHours || 0).toFixed(1)} hrs</p>
                  </div>
                  <div>
                    <h4>Paid Revenue</h4>
                    <p>{currency(summary.totalRevenue ?? 0)}</p>
                  </div>
                  <div>
                    <h4>Completion Rate</h4>
                    <p>{Number(summary.completionRate || 0).toFixed(1)}%</p>
                  </div>
                  <div>
                    <h4>Cancellation Rate</h4>
                    <p>{Number(summary.cancellationRate || 0).toFixed(1)}%</p>
                  </div>
                  <div>
                    <h4>Total Workshops</h4>
                    <p>{summary.totalWorkshops ?? 0}</p>
                  </div>
                </div>
              </div>

              {comparison.previousStartDate && (
                <div className="main-card">
                  <div className="customer-section-head">
                    <div>
                      <h3>Prior Period Comparison</h3>
                      <p>
                        Compared with {comparison.previousStartDate} to {comparison.previousEndDate}
                      </p>
                    </div>
                  </div>
                  <div className="bottom-grid">
                    <div>
                      <h4>Booking Growth</h4>
                      <p style={{ color: deltaTone(comparison.bookingDeltaPercent) }}>
                        {formatDelta(comparison.bookingDeltaPercent)}
                      </p>
                    </div>
                    <div>
                      <h4>Revenue Growth</h4>
                      <p style={{ color: deltaTone(comparison.revenueDeltaPercent) }}>
                        {formatDelta(comparison.revenueDeltaPercent)}
                      </p>
                    </div>
                    <div>
                      <h4>TAT Shift</h4>
                      <p style={{ color: deltaTone(comparison.tatDeltaPercent) }}>
                        {formatDelta(comparison.tatDeltaPercent)}
                      </p>
                    </div>
                    <div>
                      <h4>Previous Bookings</h4>
                      <p>{comparison.previousBookings ?? 0}</p>
                    </div>
                    <div>
                      <h4>Previous Revenue</h4>
                      <p>{currency(comparison.previousRevenue ?? 0)}</p>
                    </div>
                    <div>
                      <h4>Previous TAT</h4>
                      <p>{Number(comparison.previousTatHours || 0).toFixed(1)} hrs</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="main-card">
                <div className="customer-section-head">
                  <div>
                    <h3>Booking Volume Trend</h3>
                    <p>Daily booking activity for the selected reporting window.</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-light btn-sm"
                    onClick={() => downloadCsv("booking-volume.csv", bookingVolume)}
                  >
                    Export CSV
                  </button>
                </div>
                {bookingVolume.length === 0 ? (
                  <p style={{ color: "#cbd5e1", margin: 0 }}>No bookings found for the selected range.</p>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${bookingVolume.length}, minmax(70px, 1fr))`,
                      gap: 12,
                      alignItems: "end",
                    }}
                  >
                    {bookingVolume.map((item) => {
                      const count = Number(item.bookingCount || 0);
                      const height = maxBookingCount ? Math.max((count / maxBookingCount) * 140, 14) : 14;
                      return (
                        <div key={item.bookingDate} style={{ display: "grid", gap: 10, textAlign: "center" }}>
                          <div
                            style={{
                              height,
                              borderRadius: 14,
                              background: "linear-gradient(180deg, #ff845c 0%, #ff5c7a 100%)",
                            }}
                          />
                          <strong>{count}</strong>
                          <span style={{ color: "#cbd5e1", fontSize: "0.82rem" }}>{item.bookingDate}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="main-card">
                <div className="customer-section-head">
                  <div>
                    <h3>Work Order Status Distribution</h3>
                    <p>Quick read on where jobs are sitting in the lifecycle right now.</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-light btn-sm"
                    onClick={() => downloadCsv("work-order-status.csv", statusRows)}
                  >
                    Export CSV
                  </button>
                </div>
                <div className="bottom-grid">
                  {statusRows.map((item) => (
                    <div key={item.status}>
                      <h4>{item.status}</h4>
                      <p>{item.count}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bottom-grid">
                <div className="main-card">
                  <div className="customer-section-head">
                    <div>
                      <h3>Top Services</h3>
                      <p>Most-booked services from the current reporting window.</p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline-light btn-sm"
                      onClick={() => downloadCsv("top-services.csv", topServices)}
                    >
                      Export CSV
                    </button>
                  </div>
                  <table className="table table-dark table-striped">
                    <thead>
                      <tr>
                        <th>Service</th>
                        <th>Bookings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topServices.map((item) => (
                        <tr key={item.serviceName}>
                          <td>{item.serviceName}</td>
                          <td>{item.bookingCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="main-card">
                  <div className="customer-section-head">
                    <div>
                      <h3>Technician Productivity</h3>
                      <p>Completed work orders by technician for the selected range.</p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline-light btn-sm"
                      onClick={() => downloadCsv("technician-productivity.csv", technicians)}
                    >
                      Export CSV
                    </button>
                  </div>
                  <table className="table table-dark table-striped">
                    <thead>
                      <tr>
                        <th>Technician</th>
                        <th>Jobs Completed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {technicians.map((item) => (
                        <tr key={item.technicianId}>
                          <td>{item.technicianName}</td>
                          <td>{item.jobsCompleted}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bottom-grid">
                <div className="main-card">
                  <div className="customer-section-head">
                    <div>
                      <h3>Revenue By Workshop</h3>
                      <p>Paid revenue grouped by workshop for a commercial view.</p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline-light btn-sm"
                      onClick={() => downloadCsv("revenue-by-workshop.csv", revenueByWorkshop)}
                    >
                      Export CSV
                    </button>
                  </div>
                  <table className="table table-dark table-striped">
                    <thead>
                      <tr>
                        <th>Workshop</th>
                        <th>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueByWorkshop.map((item) => (
                        <tr key={item.workshopName}>
                          <td>{item.workshopName}</td>
                          <td>{currency(item.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="main-card">
                  <div className="customer-section-head">
                    <div>
                      <h3>Top Parts Usage</h3>
                      <p>Consumed parts and material spend from work-order activity.</p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline-light btn-sm"
                      onClick={() => downloadCsv("parts-usage.csv", partsUsage)}
                    >
                      Export CSV
                    </button>
                  </div>
                  <table className="table table-dark table-striped">
                    <thead>
                      <tr>
                        <th>Part</th>
                        <th>Quantity Used</th>
                        <th>Estimated Spend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {partsUsage.map((item) => (
                        <tr key={item.partName}>
                          <td>{item.partName}</td>
                          <td>{item.quantityUsed}</td>
                          <td>{currency(item.spend)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
