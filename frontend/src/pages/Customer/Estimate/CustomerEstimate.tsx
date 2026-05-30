import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CustomerNavbar from "../../../components/CustomerNavbar/CustomerNavbar";
import "./CustomerEstimate.css";
import toast from "react-hot-toast";
import {
  EstimateItem,
  getCustomerWorkOrderDetails,
  recordCustomerApproval,
  WorkOrderDetailsResponse,
} from "../../../services/workOrderServices";

const CustomerEstimate = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const customerUserId = user?.userId ?? user?.id ?? null;
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<WorkOrderDetailsResponse | null>(null);
  const [estimateItems, setEstimateItems] = useState<EstimateItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadEstimate = async () => {
      if (!id) return;
      try {
        const data = await getCustomerWorkOrderDetails(id, customerUserId || 0);
        setDetails(data);
        setEstimateItems(
          (data.estimateItems || []).map((item) => ({
            ...item,
            approved: item.approved ?? true,
          }))
        );
      } catch (error: any) {
        toast.error(error.response?.data?.errorMessage || "Failed to load estimate");
      } finally {
        setLoading(false);
      }
    };

    loadEstimate();
  }, [id, customerUserId]);

  const approvedItems = useMemo(
    () => estimateItems.filter((item) => item.approved),
    [estimateItems]
  );

  const totals = useMemo(() => {
    const subtotal = approvedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.1;
    const discount = subtotal >= 5000 ? subtotal * 0.05 : 0;
    const total = subtotal + tax - discount;
    return { subtotal, tax, discount, total };
  }, [approvedItems]);

  const handleToggleApproval = (itemId: number | string) => {
    setEstimateItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, approved: !item.approved } : item
      )
    );
  };

  const handleConfirmApproval = async () => {
    if (!id) return;
    setSubmitting(true);
    try {
      await recordCustomerApproval(id, customerUserId || 0, {
        items: estimateItems,
        timestamp: new Date().toISOString(),
        status: approvedItems.length > 0 ? "APPROVED" : "DECLINED",
      });
      toast.success(
        approvedItems.length > 0
          ? "Estimate approved successfully"
          : "Estimate declined successfully"
      );
      navigate(approvedItems.length > 0 ? "/customer/invoices" : "/customer/bookings");
    } catch (error: any) {
      toast.error(error.response?.data?.errorMessage || "Failed to submit approval");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading Estimate...</div>;
  }

  const approvalStatus = String(details?.approvalStatus || "PENDING").toUpperCase();
  const alreadyActioned = approvalStatus === "APPROVED" || approvalStatus === "DECLINED";
  const statusClass = approvalStatus.toLowerCase();

  return (
    <>
      <CustomerNavbar />
      <div className="estimate-container">
        <div className="estimate-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "10px" }}>
            <h2>Service Estimate - WO-{id}</h2>
            <span className={`status-pill ${statusClass}`}>{approvalStatus}</span>
          </div>
          <p className="description">
            Review the technician findings and choose which services and parts you approve.
          </p>

          {alreadyActioned && (
            <div className="actioned-banner">
              {approvalStatus === "APPROVED"
                ? "You have already approved this estimate."
                : "You have already declined this estimate."}
              {details?.approvalAt && (
                <span style={{ marginLeft: "10px", fontSize: "12px", opacity: 0.7 }}>
                  on {new Date(details.approvalAt).toLocaleString("en-IN")}
                </span>
              )}
            </div>
          )}

          <div style={{ marginBottom: "18px", color: "#475569" }}>
            <div>
              <strong>Customer:</strong> {details?.customerName || "N/A"}
            </div>
            <div>
              <strong>Vehicle:</strong> {details?.vehicleMake} {details?.vehicleModel}
            </div>
            <div>
              <strong>Technician:</strong> {details?.technicianName || "Assigned technician"}
            </div>
          </div>

          <div
            style={{
              marginBottom: "22px",
              padding: "16px",
              borderRadius: "16px",
              background: "#f8fafc",
            }}
          >
            <h4 style={{ marginBottom: "12px" }}>Diagnosis Summary</h4>
            <div style={{ marginBottom: "10px" }}>
              <strong>Checklist:</strong>{" "}
              {details?.diagnosisChecklist?.length
                ? details.diagnosisChecklist.join(", ")
                : "No flagged issues"}
            </div>
            <div>
              <strong>Notes:</strong> {details?.diagnosisNotes || "No additional notes added."}
            </div>
          </div>

          <table className="estimate-table">
            <thead>
              <tr>
                <th>Approve</th>
                <th>Type</th>
                <th>Description</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {estimateItems.map((item) => (
                <tr key={item.id} className={item.approved ? "" : "declined"}>
                  <td>
                    <input
                      type="checkbox"
                      checked={Boolean(item.approved)}
                      disabled={alreadyActioned}
                      onChange={() => handleToggleApproval(item.id)}
                    />
                  </td>
                  <td>
                    <span className={`type-tag ${String(item.type).toLowerCase()}`}>
                      {item.type}
                    </span>
                  </td>
                  <td>{item.description}</td>
                  <td>Rs. {item.price.toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td>Rs. {(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="summary-section">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>Rs. {totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (10%):</span>
              <span>Rs. {totals.tax.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Discount:</span>
              <span>-Rs. {totals.discount.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>Rs. {totals.total.toFixed(2)}</span>
            </div>
          </div>

          {!alreadyActioned && (
            <div className="approval-actions">
              <button className="btn secondary" onClick={() => navigate("/customer/bookings")}>
                Decide Later
              </button>
              <button className="btn primary" disabled={submitting} onClick={handleConfirmApproval}>
                {submitting ? "Submitting..." : "Submit Decision"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CustomerEstimate;
