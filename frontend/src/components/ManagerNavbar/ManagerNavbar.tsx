import { useNavigate } from "react-router-dom";
import "../CustomerNavbar/CustomerNavbar.css"
const ManagerNavbar=({ toggleSidebar}:any)=>{
    const navigate =useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return (
        <nav className="customer-navbar">
            <div className="nav-left">
                <span className="hamburger" onClick={toggleSidebar}>☰</span>
            </div>
            <div className="nav-left" onClick={()=>navigate("/manager/dashboard")}>  CarService</div>
            <div className="nav-right">
                <span onClick={()=>navigate("/manager/catalog")}>Catalog</span>                
                <div className="profile"><span onClick={()=>navigate("/manager/profile")}>Profile</span>
                <div className="dropdown">
                    <p><strong>{user.fullName || "User"}</strong></p>
                    <p>{user.email ||"email@example.com"}</p>
                    <hr/>
                    <button onClick={()=>navigate("/manager/manage-profile")}>Manage Profile</button>
                    <button onClick={()=>{
                        localStorage.removeItem("user");
                        localStorage.removeItem("token");
                        navigate("/");
                    }}
                    >Logout</button>
                    </div>
                </div>
            </div>
        </nav>
    );
};
export default ManagerNavbar;