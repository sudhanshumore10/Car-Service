import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "../Sidebar/Sidebar";
import "../SMDashboard/ServiceManager.css";
import { getManagerFeedback, respondToFeedback } from "../../../services/feedbackService";

const exportRows = (filename: string, rows: Array<Record<string, string | number>>) => {
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((header) => `"${String(row[header] ?? "").replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const FeedbackManager = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnlyPending, setShowOnlyPending] = useState(false);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getManagerFeedback();
        setItems(response.data || []);
      } catch (error: any) {
        toast.error(error.response?.data?.errorMessage || "Failed to load feedback");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const visibleItems = useMemo(
    () => items.filter((item) => !showOnlyPending || !item.managerResponse),
    [items, showOnlyPending]
  );

  const handleRespond = async (feedbackId: number) => {
    try {
      setSavingId(feedbackId);
      const response = await respondToFeedback(feedbackId, drafts[feedbackId] || "");
      setItems((current) =>
        current.map((item) => (item.id === feedbackId ? response.data : item))
      );
      toast.success("Response saved");
    } catch (error: any) {
      toast.error(error.response?.data?.errorMessage || "Failed to save response");
    } finally {
      setSavingId(null);
    }
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
              <h2>Customer Feedback</h2>
              <p>Review post-service feedback, respond as a manager, and export the latest review list.</p>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                type="button"
                className="btn btn-outline-light btn-sm"
                onClick={() =>
                  exportRows(
                    "customer-feedback.csv",
                    visibleItems.map((item) => ({
                      feedbackId: item.id,
                      workOrderId: item.workOrderId ?? "",
                      customerName: item.customerName ?? "",
                      workshopName: item.workshopName ?? "",
                      rating: item.rating ?? "",
                      comments: item.comments ?? "",
                      tags: item.tags ?? "",
                      managerResponse: item.managerResponse ?? "",
                    }))
                  )
                }
              >
                Export CSV
              </button>
              <button
                type="button"
                className="btn btn-outline-light btn-sm"
                onClick={() => setShowOnlyPending((current) => !current)}
              >
                {showOnlyPending ? "Show All" : "Pending Only"}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="main-card">Loading feedback...</div>
          ) : visibleItems.length === 0 ? (
            <div className="main-card">No feedback records matched the current filter.</div>
          ) : (
            <div className="bottom-grid">
              {visibleItems.map((item) => (
                <div className="main-card" key={item.id}>
                  <h4>{item.customerName || "Customer"} | WO-{item.workOrderId}</h4>
                  <p><strong>Workshop:</strong> {item.workshopName || "NA"}</p>
                  <p><strong>Vehicle:</strong> {item.vehicle || "NA"}</p>
                  <p><strong>Rating:</strong> {item.rating}/5</p>
                  <p><strong>Comments:</strong> {item.comments || "NA"}</p>
                  <p><strong>Tags:</strong> {item.tags || "NA"}</p>
                  <textarea
                    className="form-control mt-2"
                    rows={3}
                    value={drafts[item.id] ?? item.managerResponse ?? ""}
                    onChange={(event) =>
                      setDrafts((current) => ({ ...current, [item.id]: event.target.value }))
                    }
                    placeholder="Add a manager response"
                  />
                  <button
                    type="button"
                    className="btn btn-danger mt-3"
                    disabled={savingId === item.id}
                    onClick={() => handleRespond(item.id)}
                  >
                    {savingId === item.id ? "Saving..." : "Save Response"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackManager;
