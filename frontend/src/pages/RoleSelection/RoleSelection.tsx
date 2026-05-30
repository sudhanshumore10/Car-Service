import RoleCard from "../../components/RoleCard/RoleCard";
import { useNavigate } from "react-router-dom";
import "./RoleSelection.css";
import profileRed from "../../assets/icons/profileRed.svg"
import profileWhite from "../../assets/icons/profileWhite.svg"
import TechRed from "../../assets/icons/TechRed.svg"
import TechWhite from "../../assets/icons/TechWhite.svg"
import ManRed from "../../assets/icons/ManRed.svg"
import ManWhite from "../../assets/icons/ManWhite.svg"
const RoleSelection = () =>{
    const navigate = useNavigate();
    return(
        <div>
        <div className="role-wrapper"><h2 className="role-title">Login as:</h2>
        <div className="role-container">
            <RoleCard title="Customer" 
            icon={profileWhite} hoverIcon={profileRed} onClick={()=>navigate("/login/customer")}/>

            <RoleCard title="Service Manager" 
            icon={ManWhite} hoverIcon={ManRed} onClick={()=>navigate("/login/manager")}/>

            <RoleCard title="Technician" 
            icon={TechWhite} hoverIcon={TechRed} onClick={()=>navigate("/login/technician")}/>

            <RoleCard title="Admin"
            icon={ManWhite} hoverIcon={ManRed} onClick={()=>navigate("/login/admin")}/>
        </div>
        </div>
        </div>
    );
};

export default RoleSelection;
