import Sidebar from "../Sidebar/Sidebar";
import "../TechnicianDashboard/TechnicianDashboard.css";

const TechnicianProfile = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="dashboard-page">
      <Sidebar />
      <div className="main">
        <div className="header-section">
          <div className="header-title">
            <h1>Technician Profile</h1>
            <p className="created-date">A simple workspace identity view backed by the logged-in account session.</p>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="panel" style={{ margin: "0 30px", color: "white" }}>
            <div className="customer-detail-list">
              <div className="customer-detail">
                <span className="customer-detail__label" style={{ color: "#ffffff" }}>Full Name</span>
                <span className="customer-detail__value" style={{ color: "#ffffff" }}>{user?.fullName || "NA"}</span>
              </div>
              <div className="customer-detail">
                <span className="customer-detail__label" style={{ color: "#ffffff" }}>Email</span>
                <span className="customer-detail__value" style={{ color: "#ffffff" }}>{user?.email || "NA"}</span>
              </div>
              <div className="customer-detail">
                <span className="customer-detail__label" style={{ color: "#ffffff" }}>Role</span>
                <span className="customer-detail__value" style={{ color: "#ffffff" }}>{user?.role || "TECHNICIAN"}</span>
              </div>
              <div className="customer-detail">
                <span className="customer-detail__label" style={{ color: "#ffffff" }}>User ID</span>
                <span className="customer-detail__value" style={{ color: "#ffffff" }}>{user?.userId || "NA"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianProfile;
