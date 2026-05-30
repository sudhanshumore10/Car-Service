import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import CustomerNavbar from "../../../components/CustomerNavbar/CustomerNavbar";
import {
  FeedbackEligible,
  FeedbackRecord,
  getCustomerFeedback,
  getEligibleFeedbackWorkOrders,
  submitFeedback,
} from "../../../services/feedbackService";
import "./Feedback.css";

const CustomerFeedback = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const customerUserId = user?.userId ?? user?.id ?? null;
  const [eligible, setEligible] = useState<FeedbackEligible[]>([]);
  const [history, setHistory] = useState<FeedbackRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, { rating: number; comments: string; tags: string }>>({});

  const load = useCallback(async () => {
    try {
      const [eligibleResponse, historyResponse] = await Promise.all([
        getEligibleFeedbackWorkOrders(customerUserId || 0),
        getCustomerFeedback(customerUserId || 0),
      ]);
      setEligible(eligibleResponse.data);
      setHistory(historyResponse.data);
    } catch (error: any) {
      toast.error(error.response?.data?.errorMessage || "Failed to load feedback");
    } finally {
      setLoading(false);
    }
  }, [customerUserId]);

  useEffect(() => {
    load();
  }, [load]);

  const updateDraft = (workOrderId: number, field: "rating" | "comments" | "tags", value: string | number) => {
    setDrafts((current) => ({
      ...current,
      [workOrderId]: {
        rating: Number(current[workOrderId]?.rating || 5),
        comments: current[workOrderId]?.comments || "",
        tags: current[workOrderId]?.tags || "",
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (workOrderId: number) => {
    const draft = drafts[workOrderId] || { rating: 5, comments: "", tags: "" };
    try {
      setSubmittingId(workOrderId);
      const response = await submitFeedback({
        userId: customerUserId,
        workOrderId,
        rating: draft.rating,
        comments: draft.comments,
        tags: draft.tags,
      });
      setHistory((current) => [response.data, ...current]);
      setEligible((current) => current.filter((item) => item.workOrderId !== workOrderId));
      toast.success("Feedback submitted successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.errorMessage || "Failed to submit feedback");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <>
      <CustomerNavbar />
      <div className="feedback-page">
        <div className="feedback-container">
          <h2>Service Feedback</h2>
          <p className="feedback-subtitle">Share your experience after service completion and review past feedback.</p>

          {loading ? (
            <div className="feedback-empty">Loading feedback...</div>
          ) : (
            <>
              <section className="feedback-section">
                <h3>Pending Feedback</h3>
                {eligible.length === 0 ? (
                  <div className="feedback-empty">No completed work orders are waiting for feedback.</div>
                ) : (
                  <div className="feedback-grid">
                    {eligible.map((item) => (
                      <div className="feedback-card" key={item.workOrderId}>
                        <h4>WO-{item.workOrderId}</h4>
                        <p><strong>Workshop:</strong> {item.workshopName || "NA"}</p>
                        <p><strong>Vehicle:</strong> {item.vehicle || "NA"}</p>
                        <label>Rating</label>
                        <select
                          value={drafts[item.workOrderId]?.rating ?? 5}
                          onChange={(e) => updateDraft(item.workOrderId, "rating", Number(e.target.value))}
                        >
                          {[5, 4, 3, 2, 1].map((value) => (
                            <option key={value} value={value}>{value} Star</option>
                          ))}
                        </select>
                        <label>Comments</label>
                        <textarea
                          rows={3}
                          value={drafts[item.workOrderId]?.comments ?? ""}
                          onChange={(e) => updateDraft(item.workOrderId, "comments", e.target.value)}
                          placeholder="Tell us what went well or what needs improvement"
                        />
                        <label>Tags</label>
                        <input
                          value={drafts[item.workOrderId]?.tags ?? ""}
                          onChange={(e) => updateDraft(item.workOrderId, "tags", e.target.value)}
                          placeholder="delay, cost, quality"
                        />
                        <button
                          type="button"
                          disabled={submittingId === item.workOrderId}
                          onClick={() => handleSubmit(item.workOrderId)}
                        >
                          {submittingId === item.workOrderId ? "Submitting..." : "Submit Feedback"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="feedback-section">
                <h3>Previous Feedback</h3>
                {history.length === 0 ? (
                  <div className="feedback-empty">No feedback submitted yet.</div>
                ) : (
                  <div className="feedback-grid">
                    {history.map((item) => (
                      <div className="feedback-card history" key={item.id}>
                        <h4>WO-{item.workOrderId}</h4>
                        <p><strong>Workshop:</strong> {item.workshopName || "NA"}</p>
                        <p><strong>Vehicle:</strong> {item.vehicle || "NA"}</p>
                        <p><strong>Rating:</strong> {item.rating}/5</p>
                        <p><strong>Comments:</strong> {item.comments || "NA"}</p>
                        <p><strong>Tags:</strong> {item.tags || "NA"}</p>
                        {item.managerResponse && (
                          <div className="manager-response">
                            <strong>Manager Response</strong>
                            <p>{item.managerResponse}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CustomerFeedback;
