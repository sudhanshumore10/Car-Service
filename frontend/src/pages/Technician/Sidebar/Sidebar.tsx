import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const items = [
  { to: "/technician/dashboard", label: "Dashboard", icon: "DB" },
  { to: "/technician/work-orders", label: "Work Orders", icon: "WO" },
  { to: "/technician/profile", label: "Profile", icon: "PR" },
];

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const fullName = user?.fullName || "Technician";
  const initials = fullName
    .split(" ")
    .map((part: string) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo-icon">{initials}</div>
        <div className="logo-text">
          <span className="brand">CarService</span>
          <span className="version">Technician Workspace</span>
        </div>
      </div>

      <div className="sidebar-section">
        <p className="section-title">WORKSPACE</p>
        <ul>
          {items.map((item) => {
            const isActive =
              location.pathname === item.to ||
              (item.to === "/technician/work-orders" && location.pathname.startsWith("/work-orders/"));
            return (
              <li key={item.to} className={isActive ? "active" : ""}>
                <Link to={item.to}>
                  <span className="icon">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="sidebar-section">
        <p className="section-title">QUICK NOTES</p>
        <div
          style={{
            borderRadius: "14px",
            padding: "14px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#cbd5e1",
            fontSize: "13px",
            lineHeight: 1.6,
          }}
        >
          Keep work order status current, save diagnosis notes clearly, and send estimates only after reviewing parts and services.
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="user-avatar">{initials}</div>
        <div className="user-info">
          <p className="user-name">{fullName}</p>
          <p className="user-role">{user?.role || "TECHNICIAN"}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        style={{
          marginTop: "14px",
          width: "100%",
          border: "1px solid #334155",
          background: "transparent",
          color: "white",
          borderRadius: "10px",
          padding: "10px 12px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default Sidebar;
