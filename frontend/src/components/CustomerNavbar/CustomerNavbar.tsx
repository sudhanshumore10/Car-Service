import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import car1 from "../../assets/icons/car1.png"
import "./CustomerNavbar.css";

const CustomerNavbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const displayName = user.fullName || "User";
    const displayEmail = user.email || "email@example.com";
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setMenuOpen(false);
        navigate("/");
    };

    return (
        <>
            <nav className="navbar navbar-expand-lg shadow-sm px-4 custom-navbar">

                <div className="d-flex align-items-center" onClick={() => navigate("/customer/dashboard")}>
                    <img src={car1} alt="logo" className="logo"></img>
                    <span className="brand-name">CarService</span></div>
                <div className="ms-auto d-flex align-items-center gap-4">
                    <span className="navbar-link" onClick={() => navigate("/customer/dashboard")}>Dashboard</span>
                    <span className="navbar-link" onClick={() => navigate("/customer/book-service")}>Book Service</span>
                    <span className="navbar-link" onClick={() => navigate("/customer/bookings")}>My Bookings</span>
                    <span className="navbar-link" onClick={() => navigate("/customer/vehicles")}>My Vehicles</span>
                    <span className="navbar-link" onClick={() => navigate("/customer/feedback")}>Feedback</span>
                    <span className="navbar-link" onClick={() => navigate("/customer/invoices")}>Invoices</span>
                    <div className="profile" ref={menuRef}>
                        <button
                            type="button"
                            className={`profile-toggle${menuOpen ? " open" : ""}`}
                            onClick={() => setMenuOpen((current) => !current)}
                            aria-expanded={menuOpen}
                            aria-haspopup="true"
                        >
                            Profile
                        </button>
                        <div className={`dropdown-menu-custom${menuOpen ? " open" : ""}`}>
                            <div className="dropdown-menu-custom__header">
                                <p><strong>{displayName}</strong></p>
                                <p>{displayEmail}</p>
                            </div>
                            <div className="dropdown-menu-custom__actions">
                                <button type="button" onClick={() => {
                                    setMenuOpen(false);
                                    navigate("/customer/manage-profile");
                                }}>Manage Profile</button>
                                <button type="button" onClick={handleLogout}>Logout</button>
                            </div>
                        </div>

                    </div>
                </div>

            </nav>

        </>

    );
};
export default CustomerNavbar;
