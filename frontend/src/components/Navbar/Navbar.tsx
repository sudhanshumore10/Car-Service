import { useNavigate } from "react-router-dom"
import "./Navbar.css";
import car1 from "../../assets/icons/car1.png"

const Navbar = () => {
    const navigate = useNavigate();
    return (
        <>
            <nav className="navbar navbar-expand-lg shadow-sm px-4" style={{ backgroundColor: "#000000" }}>
                <img src={car1} alt="logo" className="logo" onClick={() => navigate("/")}></img>
                <span className="name navbar-brand" style={{ color: "#ffffff", cursor: "pointer" }}
                    onClick={() => navigate("/")}>Car Service</span>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarContent">
                    <ul className="navbar-nav ms-auto align-items-center gap-3">
                        <li className="nav-item">
                            <span className="nav-link"
                                style={{ cursor: "pointer" }}
                                onClick={() => navigate("/")}>Home</span>
                        </li>

                        <li className="nav-item">
                            <span className="nav-link"
                                style={{ cursor: "pointer" }}
                                onClick={() => navigate("/services")}>Services</span>
                        </li>

                        <li className="nav-item">
                            <span className="nav-link"
                                style={{ cursor: "pointer" }}
                                onClick={() => navigate("/about-us")}>About Us</span>
                        </li>

                        <li className="nav-item">
                            <span className="nav-link"
                                style={{ cursor: "pointer" }}
                                onClick={() => navigate("/contact-us")}>Contact Us</span>
                        </li>

                        <li className="nav-item">
                            <button className="btn"
                                onClick={() => navigate("/login/customer")}>Sign up</button>
                        </li>
                    </ul>
                </div>
            </nav>
        </>
    )
};
export default Navbar;