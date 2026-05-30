import Sidebar from "../pages/ServiceManager/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import "./ManagerLayout.css";

const ManagerLayout = () => {
    return (
        <div className="layout">
            <Sidebar/>
            <div className="content">
                <Outlet />
            </div>

        </div>
    );
};

export default ManagerLayout;