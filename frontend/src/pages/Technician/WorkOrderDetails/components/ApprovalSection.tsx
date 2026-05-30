import React from "react";

const ApprovalSection = ({ data, setWorkOrderData }: any) => {

  const { status, approvedAt } = data;
  const sendForApproval = () => {
    setWorkOrderData((prev: any) => ({
      ...prev,
      approval: {
        ...prev.approval,
        status: "pending",
        approvedAt: null,
      },
    }));
  };
  const approveEstimate = () => {
    setWorkOrderData((prev: any) => ({
      ...prev,
      approval: {
        ...prev.approval,
        status: "approved",
        approvedAt: new Date().toISOString(),
      },
    }));
  };
  const declineEstimate = () => {
    setWorkOrderData((prev: any) => ({
      ...prev,
      approval: {
        ...prev.approval,
        status: "declined",
        approvedAt: new Date().toISOString(),
      },
    }));
  };

  return (
    <div>
      <h3>Customer Approval</h3>
      <p>
        Status: <strong>{status}</strong>
      </p>
      {approvedAt && (
        <p>Updated At: {new Date(approvedAt).toLocaleString()}</p>
      )}
      {status === "draft" && (
        <button onClick={sendForApproval}>
          Send for Approval
        </button>
      )}
      {status === "pending" && (
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={approveEstimate}>
            Approve
          </button>
          <button
            onClick={declineEstimate}
            style={{ background: "red", color: "white" }}
          >
            Decline
          </button>
        </div>
      )}
      {status === "approved" && (
        <p style={{ color: "green" }}>
          ✅ Estimate Approved
        </p>
      )}
      {status === "declined" && (
        <p style={{ color: "red" }}>
          ❌ Estimate Declined
        </p>
      )}
    </div>
  );
};
export default ApprovalSection;