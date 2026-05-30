import { useEffect, useMemo, useState } from "react";
import Sidebar from "../Sidebar/Sidebar";
import "./WorkOrderDetails.css";
import toast from "react-hot-toast";
import { useParams, Link } from "react-router-dom";
import api from "../../../services/api";
import {
  convertApprovedEstimate,
  EstimateItem,
  getWorkOrderDetails,
  saveEstimateDraft,
  saveWorkOrderFindings,
  sendEstimateForApproval,
  WorkOrderDetailsResponse,
} from "../../../services/workOrderServices";

const DIAGNOSIS_OPTIONS = [
  "Engine Issue",
  "Brake Problem",
  "Oil Leakage",
  "Battery Fault",
  "Electrical Issue",
  "Suspension Issue",
  "Transmission Issue",
  "Other",
];

const toCurrency = (value: number) => `Rs. ${Number(value || 0).toFixed(2)}`;

type PartCatalogItem = {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
};

function WorkOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("Diagnosis & Findings");
  const [workOrder, setWorkOrder] = useState<WorkOrderDetailsResponse | null>(null);
  const [notes, setNotes] = useState("");
  const [checklist, setChecklist] = useState<string[]>([]);
  const [estimateItems, setEstimateItems] = useState<EstimateItem[]>([]);
  const [partCatalog, setPartCatalog] = useState<PartCatalogItem[]>([]);
  const [partSearch, setPartSearch] = useState("");
  const [showPartSearch, setShowPartSearch] = useState(false);

  useEffect(() => {
    const loadWorkOrder = async () => {
      if (!id) return;
      try {
        const data = await getWorkOrderDetails(id);
        hydrateState(data);
      } catch (error: any) {
        toast.error(error.response?.data?.errorMessage || "Failed to load work order");
      } finally {
        setLoading(false);
      }
    };

    loadWorkOrder();
  }, [id]);

  useEffect(() => {
    if (!showPartSearch) return;

    const timer = setTimeout(async () => {
      try {
        const response = await api.get<PartCatalogItem[]>(
          `/parts${partSearch ? `?search=${encodeURIComponent(partSearch)}` : ""}`
        );
        setPartCatalog(response.data);
      } catch {
        setPartCatalog([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [partSearch, showPartSearch]);

  const hydrateState = (data: WorkOrderDetailsResponse) => {
    setWorkOrder(data);
    setNotes(data.diagnosisNotes || "");
    setChecklist(data.diagnosisChecklist || []);
    setEstimateItems(
      (data.estimateItems || []).map((item) => ({
        ...item,
        type: item.type === "PART" ? "PART" : "SERVICE",
      }))
    );
  };

  const totals = useMemo(() => {
    const subtotal = estimateItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.1;
    const discount = subtotal >= 5000 ? subtotal * 0.05 : 0;
    const total = subtotal + tax - discount;
    return { subtotal, tax, discount, total };
  }, [estimateItems]);

  const toggleChecklist = (value: string) => {
    setChecklist((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  };

  const addServiceLine = () => {
    setEstimateItems((current) => [
      ...current,
      {
        id: `tmp_${Date.now()}_${Math.random()}`,
        description: "",
        type: "SERVICE",
        price: 0,
        quantity: 1,
        approved: true,
      },
    ]);
  };

  const addPartFromCatalog = (part: PartCatalogItem) => {
    setEstimateItems((current) => [
      ...current,
      {
        id: `tmp_${Date.now()}_${Math.random()}`,
        description: part.name,
        type: "PART",
        price: Number(part.price || 0),
        quantity: 1,
        approved: true,
      },
    ]);
    setShowPartSearch(false);
    setPartSearch("");
  };

  const handleRemoveItem = (itemId: number | string) => {
    setEstimateItems((current) => current.filter((item) => item.id !== itemId));
  };

  const handleUpdateItem = (
    itemId: number | string,
    field: keyof EstimateItem,
    value: string | number
  ) => {
    setEstimateItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [field]:
                field === "price" || field === "quantity"
                  ? Number(value) || 0
                  : value,
            }
          : item
      )
    );
  };

  const validateEstimateItems = () => {
    if (!estimateItems.length) {
      return "Add at least one estimate item before saving.";
    }

    for (let index = 0; index < estimateItems.length; index += 1) {
      const item = estimateItems[index];
      if (!item.description.trim()) {
        return `Item #${index + 1} is missing a description.`;
      }
      if (item.price <= 0) {
        return `Item #${index + 1} must have a price greater than 0.`;
      }
      if (item.quantity < 1) {
        return `Item #${index + 1} must have quantity at least 1.`;
      }
    }

    return null;
  };

  const handleSaveFindings = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const updated = await saveWorkOrderFindings(id, { checklist, notes });
      hydrateState(updated);
      toast.success("Findings saved successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.errorMessage || "Failed to save findings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!id) return;
    const validationError = validateEstimateItems();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setSaving(true);
    try {
      const updated = await saveEstimateDraft(id, { items: estimateItems, sendToCustomer: false });
      hydrateState(updated);
      toast.success("Estimate draft saved");
    } catch (error: any) {
      toast.error(error.response?.data?.errorMessage || "Failed to save estimate");
    } finally {
      setSaving(false);
    }
  };

  const handleSendEstimate = async () => {
    if (!id) return;
    const validationError = validateEstimateItems();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setSaving(true);
    try {
      const updated = await sendEstimateForApproval(id, estimateItems);
      hydrateState(updated);
      toast.success("Estimate sent to customer for approval");
    } catch (error: any) {
      toast.error(error.response?.data?.errorMessage || "Failed to send estimate");
    } finally {
      setSaving(false);
    }
  };

  const handleConvertToJob = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const updated = await convertApprovedEstimate(id);
      hydrateState(updated);
      toast.success("Approved estimate converted to job scope");
    } catch (error: any) {
      toast.error(error.response?.data?.errorMessage || "Unable to convert approved estimate");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container">Loading work order...</div>;
  }

  return (
    <div className="container">
      <Sidebar />
      <div className="page-content">
        <div className="breadcrumb">
          <Link to="/technician/work-orders">Work Orders</Link> /{" "}
          <span>WO-{workOrder?.workOrderId || id}</span>
        </div>
        <div className="header-section">
          <div className="header-title">
            <h1>
              WO-{workOrder?.workOrderId || id}{" "}
              <span className="status-badge in-progress">{workOrder?.status || "In Progress"}</span>
            </h1>
            <p className="created-date">
              Created{" "}
              {workOrder?.createdAt
                ? new Date(workOrder.createdAt).toLocaleString()
                : "recently"}
            </p>
          </div>
        </div>
        <div className="info-grid">
          <div className="info-card">
            <p className="label">CUSTOMER</p>
            <h3>{workOrder?.customerName || "Customer"}</h3>
            <p className="sub-label">Booking ID: {workOrder?.bookingId || "N/A"}</p>
          </div>
          <div className="info-card">
            <p className="label">VEHICLE</p>
            <h3>
              {workOrder?.vehicleMake || "Vehicle"} {workOrder?.vehicleModel || ""}
            </h3>
            <p className="sub-label">Plate: {workOrder?.vehiclePlateNumber || "N/A"}</p>
          </div>
          <div className="info-card">
            <p className="label">WORKSHOP</p>
            <h3>{workOrder?.workshopName || "Assigned Workshop"}</h3>
            <p className="sub-label">Work Order ID: {workOrder?.workOrderId}</p>
          </div>
          <div className="info-card">
            <p className="label">TECHNICIAN</p>
            <h3>{workOrder?.technicianName || "Technician"}</h3>
            <p className="sub-label">Status: {workOrder?.approvalStatus || "Pending"}</p>
          </div>
        </div>
        <div className="content-layout">
          <div className="left-column">
            <div className="tabs-nav">
              {["Diagnosis & Findings", "Estimate", "History", "Customer Comms"].map((tab) => (
                <span
                  key={tab}
                  className={activeTab === tab ? "active" : ""}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </span>
              ))}
            </div>

            {activeTab === "Diagnosis & Findings" && (
              <div className="tab-pane">
                <div className="panel checklist-panel">
                  <div className="panel-header">
                    <h3>Diagnosis Checklist</h3>
                    <span className="count">{checklist.length}/8 flagged</span>
                  </div>
                  <div className="checklist-grid">
                    {DIAGNOSIS_OPTIONS.map((option) => (
                      <label key={option} className="check-item">
                        <input
                          type="checkbox"
                          checked={checklist.includes(option)}
                          onChange={() => toggleChecklist(option)}
                        />
                        <span className="check-label">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="panel notes-panel">
                  <div className="panel-header">
                    <h3>Technician Notes</h3>
                    <button className="btn-edit" onClick={handleSaveFindings} disabled={saving}>
                      Save Findings
                    </button>
                  </div>
                  <div className="notes-box">
                    <textarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Describe the diagnosis and recommended repair scope..."
                      style={{ width: "100%", minHeight: "140px", border: "none", outline: "none" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Estimate" && (
              <div className="tab-pane">
                <div className="panel">
                  <div className="panel-header">
                    <h3>Estimate Builder</h3>
                    <span className="count">Version {workOrder?.estimateVersion || 0}</span>
                  </div>

                  <table className="estimate-table-premium">
                    <thead>
                      <tr>
                        <th>DESCRIPTION</th>
                        <th>TYPE</th>
                        <th>PRICE</th>
                        <th>QTY</th>
                        <th>TOTAL</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estimateItems.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <input
                              type="text"
                              className={`inline-input${!item.description.trim() ? " error-input" : ""}`}
                              value={item.description}
                              placeholder="Item description"
                              onChange={(event) =>
                                handleUpdateItem(item.id, "description", event.target.value)
                              }
                            />
                          </td>
                          <td>
                            <span className={`type-badge ${String(item.type).toLowerCase()}`}>
                              {item.type}
                            </span>
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              className={`inline-input price-input${item.price <= 0 ? " error-input" : ""}`}
                              value={item.price === 0 ? "" : item.price}
                              placeholder="0.00"
                              onChange={(event) =>
                                handleUpdateItem(item.id, "price", event.target.value)
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              className="inline-input qty-input"
                              value={item.quantity}
                              onChange={(event) =>
                                handleUpdateItem(item.id, "quantity", event.target.value)
                              }
                            />
                          </td>
                          <td>{toCurrency(item.price * item.quantity)}</td>
                          <td>
                            <button
                              className="remove-btn"
                              onClick={() => handleRemoveItem(item.id)}
                              type="button"
                              title="Remove item"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="add-buttons">
                    <button className="btn-add-line" onClick={addServiceLine} type="button">
                      + Add Service
                    </button>
                    <button
                      className="btn-add-line"
                      onClick={() => setShowPartSearch((current) => !current)}
                      type="button"
                    >
                      + Add Part from Catalog
                    </button>
                  </div>

                  {showPartSearch && (
                    <div className="part-search-box">
                      <input
                        type="text"
                        className="part-search-input"
                        placeholder="Search by part name or SKU..."
                        value={partSearch}
                        onChange={(event) => setPartSearch(event.target.value)}
                      />
                      <div className="part-results">
                        {partCatalog.length === 0 ? (
                          <p className="no-results">
                            {partSearch ? "No matching parts found." : "Type to search the parts catalog."}
                          </p>
                        ) : (
                          partCatalog.map((part) => (
                            <div
                              key={part.id}
                              className="part-result-row"
                              onClick={() => addPartFromCatalog(part)}
                            >
                              <span className="part-name">{part.name}</span>
                              <span className="part-sku">{part.sku}</span>
                              <span
                                className="part-stock"
                                style={{ color: part.stock > 0 ? "#10b981" : "#ef4444" }}
                              >
                                {part.stock > 0 ? `${part.stock} in stock` : "Backorder"}
                              </span>
                              <span className="part-price">{toCurrency(part.price)}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  <div className="panel pricing-summary">
                    <div className="summary-row"><span>Subtotal</span><span>{toCurrency(totals.subtotal)}</span></div>
                    <div className="summary-row tax-row"><span>Tax</span><span>{toCurrency(totals.tax)}</span></div>
                    <div className="summary-row"><span>Discount</span><span>-{toCurrency(totals.discount)}</span></div>
                    <div className="summary-row total total-row"><span>Total</span><span>{toCurrency(totals.total)}</span></div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "History" && (
              <div className="tab-pane">
                <div className="panel">
                  <div className="panel-header">
                    <h3>Estimate Version History</h3>
                  </div>
                  {workOrder?.estimateHistory?.length ? (
                    workOrder.estimateHistory.map((entry) => (
                      <div key={entry.version} className="history-item active">
                        <div className="v-tag">v{entry.version}</div>
                        <div className="v-details">
                          <p className="v-date">
                            {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : "Saved"}
                          </p>
                          <p className="v-author">
                            {entry.items?.length || 0} items · {entry.status}
                          </p>
                        </div>
                        <div className="v-price">{toCurrency(entry.total)}</div>
                      </div>
                    ))
                  ) : (
                    <p>No estimate revisions yet.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "Customer Comms" && (
              <div className="tab-pane">
                <div className="panel">
                  <h3>Customer Communication</h3>
                  <p className="panel-desc">
                    Estimate status: {workOrder?.estimateStatus || "Draft"}
                  </p>
                  <p className="panel-desc">
                    Approval status: {workOrder?.approvalStatus || "Pending"}
                  </p>
                  <p className="panel-desc">
                    Sent at:{" "}
                    {workOrder?.estimateSentAt
                      ? new Date(workOrder.estimateSentAt).toLocaleString()
                      : "Not sent yet"}
                  </p>
                  <p className="panel-desc">
                    Approved at:{" "}
                    {workOrder?.approvalAt
                      ? new Date(workOrder.approvalAt).toLocaleString()
                      : "Waiting for customer action"}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="right-column">
            <div className="panel approval-panel">
              <h3>Customer Approval</h3>
              <p className="panel-desc">Track the approval state before converting work scope.</p>
              <div className="approval-status-box">
                <span className="status-dot pending"></span>
                <span className="status-text">{workOrder?.approvalStatus || "PENDING"}</span>
              </div>
              <button className="btn-outline full" onClick={handleSendEstimate} disabled={saving}>
                Send to Customer
              </button>
            </div>

            <div className="panel history-panel">
              <div className="panel-header">
                <h3>Summary</h3>
              </div>
              <div className="history-item active">
                <div className="v-tag">Draft</div>
                <div className="v-details">
                  <p className="v-date">Current estimate total</p>
                  <p className="v-author">{estimateItems.length} line items</p>
                </div>
                <div className="v-price">{toCurrency(totals.total)}</div>
              </div>
              <div className="history-item active">
                <div className="v-tag">State</div>
                <div className="v-details">
                  <p className="v-date">{workOrder?.estimateStatus || "DRAFT"}</p>
                  <p className="v-author">{workOrder?.approvalStatus || "PENDING"}</p>
                </div>
                <div className="v-price">v{workOrder?.estimateVersion || 0}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="bottom-bar">
          <div className="bar-actions">
            <button className="btn-secondary" onClick={handleSaveFindings} disabled={saving}>
              Save Findings
            </button>
            <button className="btn-secondary" onClick={handleSaveDraft} disabled={saving}>
              Save Draft
            </button>
            <button className="btn-primary" onClick={handleSendEstimate} disabled={saving}>
              Send for Approval
            </button>
            <button
              className="btn-success"
              onClick={handleConvertToJob}
              disabled={saving || !workOrder?.canConvertToJob}
            >
              Convert to Job
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkOrderDetails;
