import { useNavigate, useLocation } from "react-router-dom";
import "../../ServiceManager/SMDashboard/ServiceManager.css";
import car_logo from "../../../assets/icons/car_logo.svg";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">
        <img src={car_logo} alt="logo" className="logo" />
        CarService
      </h2>
      <p style={{ color: "#94a3b8", margin: "0 0 18px 6px", fontSize: "13px" }}>
        {user.fullName || "Service Manager"}
      </p>

      <div
        className={location.pathname === "/manager/dashboard" ? "menu active" : "menu"}
        onClick={() => navigate("/manager/dashboard")}
      >
        Overview
      </div>
      <div
        className={location.pathname.startsWith("/manager/workshops") || location.pathname.startsWith("/manager/add-workshop") ? "menu active" : "menu"}
        onClick={() => navigate("/manager/workshops")}
      >
        Workshops
      </div>
      <div
        className={location.pathname === "/manager/capacity" ? "menu active" : "menu"}
        onClick={() => navigate("/manager/capacity")}
      >
        Capacity Setup
      </div>
      <div
        className={location.pathname === "/manager/bookings" ? "menu active" : "menu"}
        onClick={() => navigate("/manager/bookings")}
      >
        Bookings
      </div>
      <div
        className={location.pathname === "/manager/catalog" ? "menu active" : "menu"}
        onClick={() => navigate("/manager/catalog")}
      >
        Catalog
      </div>
      <div
        className={location.pathname === "/manager/technicians" ? "menu active" : "menu"}
        onClick={() => navigate("/manager/technicians")}
      >
        Technicians
      </div>
      <div
        className={location.pathname === "/manager/reports" ? "menu active" : "menu"}
        onClick={() => navigate("/manager/reports")}
      >
        Reports
      </div>
      <div
        className={location.pathname === "/manager/feedback" ? "menu active" : "menu"}
        onClick={() => navigate("/manager/feedback")}
      >
        Feedback
      </div>

      <div
        className="menu logout"
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("role");
          navigate("/");
        }}
      >
        Logout
      </div>
    </div>
  );
};

export default Sidebar;
