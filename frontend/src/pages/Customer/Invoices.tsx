import { useEffect, useMemo, useState } from "react";
import CustomerNavbar from "../../components/CustomerNavbar/CustomerNavbar";
import toast from "react-hot-toast";
import {
  getCustomerInvoices,
  InvoiceResponse,
  recordInvoicePayment,
} from "../../services/workOrderServices";

const currency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value || 0);

const badgeStyle = (status: string) => {
  if (status === "PAID") return { background: "#dcfce7", color: "#166534" };
  if (status === "PARTIALLY_PAID") return { background: "#fef3c7", color: "#92400e" };
  return { background: "#fee2e2", color: "#991b1b" };
};

const Invoices = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const customerUserId = user?.userId ?? user?.id ?? null;
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const data = await getCustomerInvoices(customerUserId || 0);
        setInvoices(data);
        if (data.length > 0) {
          setSelectedInvoiceId(data[0].invoiceId);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.errorMessage || "Failed to load invoices");
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, [customerUserId]);

  const selectedInvoice = useMemo(
    () => invoices.find((invoice) => invoice.invoiceId === selectedInvoiceId) || null,
    [invoices, selectedInvoiceId]
  );

  useEffect(() => {
    if (selectedInvoice) {
      setPaymentAmount(
        selectedInvoice.balanceAmount > 0 ? String(selectedInvoice.balanceAmount) : ""
      );
    }
  }, [selectedInvoice]);

  const refreshInvoice = (updatedInvoice: InvoiceResponse) => {
    setInvoices((current) =>
      current.map((invoice) =>
        invoice.invoiceId === updatedInvoice.invoiceId ? updatedInvoice : invoice
      )
    );
    setSelectedInvoiceId(updatedInvoice.invoiceId);
  };

  const handlePay = async () => {
    if (!selectedInvoice) return;
    if (selectedInvoice.readyForPayment === false) {
      toast.error("Approve the estimate first. This invoice is still a preview.");
      return;
    }
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid payment amount");
      return;
    }

    setSubmitting(true);
    try {
      const updated = await recordInvoicePayment(selectedInvoice.invoiceId, {
        method: paymentMethod,
        amount,
      });
      refreshInvoice(updated);
      toast.success("Payment recorded successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.errorMessage || "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintPdf = () => {
    if (!selectedInvoice) return;
    window.print();
  };

  return (
    <>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }

            .printable-invoice,
            .printable-invoice * {
              visibility: visible;
            }

            .printable-invoice {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              background: white;
              padding: 24px;
            }

            .no-print {
              display: none !important;
            }
          }
        `}
      </style>
      <CustomerNavbar />
      <div style={{ background: "#f5f7fb", minHeight: "100vh", padding: "32px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div className="no-print" style={{ marginBottom: "24px" }}>
            <h2 style={{ marginBottom: "8px", fontWeight: 700 }}>Invoices & Payments</h2>
            <p style={{ color: "#64748b", marginBottom: 0 }}>
              Review approved service charges, track payment status, and collect receipts.
            </p>
          </div>

          {loading ? (
            <div style={{ padding: "40px", background: "#fff", borderRadius: "20px" }}>
              Loading invoices...
            </div>
          ) : invoices.length === 0 ? (
            <div style={{ padding: "40px", background: "#fff", borderRadius: "20px" }}>
              No invoices are available yet.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "320px 1fr",
                gap: "24px",
                alignItems: "start",
              }}
            >
              <div style={{ background: "#fff", borderRadius: "20px", padding: "20px" }}>
                <h4 style={{ marginBottom: "16px" }}>My Invoices</h4>
                <div style={{ display: "grid", gap: "12px" }}>
                  {invoices.map((invoice) => (
                    <button
                      key={invoice.invoiceId}
                      type="button"
                      onClick={() => setSelectedInvoiceId(invoice.invoiceId)}
                      style={{
                        border:
                          selectedInvoiceId === invoice.invoiceId
                            ? "2px solid #2563eb"
                            : "1px solid #e2e8f0",
                        background: "#fff",
                        borderRadius: "16px",
                        padding: "16px",
                        textAlign: "left",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "10px",
                        }}
                      >
                        <strong>INV-{invoice.invoiceId}</strong>
                        <span
                          style={{
                            ...badgeStyle(invoice.paymentStatus),
                            borderRadius: "999px",
                            fontSize: "12px",
                            padding: "4px 10px",
                            fontWeight: 600,
                          }}
                        >
                          {invoice.paymentStatus.replace("_", " ")}
                        </span>
                      </div>
                      <div style={{ color: "#475569", fontSize: "14px" }}>
                        <div>Work Order: WO-{invoice.workOrderId}</div>
                        <div>Total: {currency(invoice.total)}</div>
                        <div>Balance: {currency(invoice.balanceAmount)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedInvoice && (
                <div className="printable-invoice" style={{ background: "#fff", borderRadius: "20px", padding: "24px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "16px",
                      marginBottom: "24px",
                    }}
                  >
                    <div>
                      <h3 style={{ marginBottom: "8px" }}>Invoice INV-{selectedInvoice.invoiceId}</h3>
                      <div style={{ color: "#64748b" }}>
                        <div>Customer: {selectedInvoice.customerName || user.fullName}</div>
                        <div>Vehicle: {selectedInvoice.vehicle || "Vehicle details unavailable"}</div>
                        <div>Work Order: WO-{selectedInvoice.workOrderId}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          ...badgeStyle(selectedInvoice.paymentStatus),
                          borderRadius: "999px",
                          padding: "6px 12px",
                          display: "inline-block",
                          fontWeight: 700,
                          marginBottom: "12px",
                        }}
                      >
                        {selectedInvoice.paymentStatus.replace("_", " ")}
                      </div>
                      <div style={{ color: "#64748b", fontSize: "14px" }}>
                        Created:{" "}
                        {selectedInvoice.createdAt
                          ? new Date(selectedInvoice.createdAt).toLocaleString()
                          : "N/A"}
                      </div>
                      <div className="no-print">
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={handlePrintPdf}
                          style={{
                            marginTop: "12px",
                            background: "#2563eb",
                            borderColor: "#2563eb",
                            color: "#ffffff",
                            fontWeight: 700,
                            opacity: 1,
                          }}
                        >
                          Print / Save as PDF
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ overflowX: "auto", marginBottom: "24px" }}>
                    <table className="table table-striped align-middle">
                      <thead>
                        <tr>
                          <th>Description</th>
                          <th>Type</th>
                          <th>Qty</th>
                          <th>Unit Price</th>
                          <th>Tax</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.lineItems.map((item) => (
                          <tr key={item.id}>
                            <td>{item.description}</td>
                            <td>{item.type}</td>
                            <td>{item.quantity}</td>
                            <td>{currency(item.unitPrice)}</td>
                            <td>{currency(item.tax)}</td>
                            <td>{currency(item.lineTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 320px",
                      gap: "24px",
                    }}
                  >
                    <div
                      className="no-print"
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: "16px",
                        padding: "20px",
                      }}
                    >
                      <h5 style={{ marginBottom: "16px" }}>Payment</h5>
                      <div style={{ display: "grid", gap: "14px" }}>
                        <div>
                          <label className="form-label">Method</label>
                          <select
                            className="form-select"
                            value={paymentMethod}
                            disabled={selectedInvoice.paymentStatus === "PAID" || selectedInvoice.readyForPayment === false}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          >
                            <option value="UPI">UPI</option>
                            <option value="CARD">Card</option>
                            <option value="CASH">Cash</option>
                          </select>
                        </div>
                        <div>
                          <label className="form-label">Amount to record</label>
                          <input
                            type="number"
                            className="form-control"
                            value={paymentAmount}
                            disabled={selectedInvoice.paymentStatus === "PAID" || selectedInvoice.readyForPayment === false}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                          />
                        </div>
                        {selectedInvoice.readyForPayment === false && (
                          <div
                            style={{
                              background: "#fff7ed",
                              border: "1px solid #fdba74",
                              borderRadius: "12px",
                              color: "#9a3412",
                              padding: "12px 14px",
                              fontSize: "14px",
                            }}
                          >
                            This is a proforma preview generated from the sent estimate. Payment unlocks after customer approval is recorded.
                          </div>
                        )}
                        <button
                          type="button"
                          className="btn btn-primary"
                          disabled={
                            selectedInvoice.paymentStatus === "PAID" ||
                            selectedInvoice.readyForPayment === false ||
                            submitting
                          }
                          onClick={handlePay}
                          style={{
                            background: selectedInvoice.paymentStatus === "PAID" ||
                              selectedInvoice.readyForPayment === false
                              ? "#94a3b8"
                              : "#2563eb",
                            borderColor: selectedInvoice.paymentStatus === "PAID" ||
                              selectedInvoice.readyForPayment === false
                              ? "#94a3b8"
                              : "#2563eb",
                            color: "#ffffff",
                            fontWeight: 700,
                            opacity: 1,
                          }}
                        >
                          {selectedInvoice.readyForPayment === false
                            ? "Awaiting Approval"
                            : submitting
                              ? "Recording..."
                              : "Record Payment"}
                        </button>
                        {selectedInvoice.receipt && (
                          <div
                            style={{
                              background: "#eff6ff",
                              border: "1px solid #bfdbfe",
                              borderRadius: "12px",
                              padding: "14px",
                            }}
                          >
                            <strong>Receipt Ready</strong>
                            <div>Receipt: {selectedInvoice.receipt.receiptNumber || "Pending final settlement"}</div>
                            <div>Amount: {currency(selectedInvoice.receipt.amountPaid)}</div>
                            <div>Method: {selectedInvoice.receipt.method}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: "16px",
                        padding: "20px",
                        background: "#f8fafc",
                      }}
                    >
                      <h5 style={{ marginBottom: "16px" }}>Summary</h5>
                      <div style={{ display: "grid", gap: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Subtotal</span>
                          <strong>{currency(selectedInvoice.subtotal)}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Tax</span>
                          <strong>{currency(selectedInvoice.tax)}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Discount</span>
                          <strong>-{currency(selectedInvoice.discount)}</strong>
                        </div>
                        <hr style={{ margin: "8px 0" }} />
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Total</span>
                          <strong>{currency(selectedInvoice.total)}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Paid</span>
                          <strong>{currency(selectedInvoice.paidAmount)}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Balance</span>
                          <strong>{currency(selectedInvoice.balanceAmount)}</strong>
                        </div>
                        {selectedInvoice.paymentStatus === "PAID" && (
                          <div style={{ color: "#166534", fontSize: "14px", marginTop: "8px", fontWeight: 600 }}>
                            Invoice locked after full payment.
                          </div>
                        )}
                        {selectedInvoice.readyForPayment === false && (
                          <div style={{ color: "#9a3412", fontSize: "14px", marginTop: "8px", fontWeight: 600 }}>
                            Estimate approval is still pending. Preview only.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Invoices;
