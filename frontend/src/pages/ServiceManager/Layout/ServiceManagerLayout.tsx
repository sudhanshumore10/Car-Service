import Sidebar from "../Sidebar/Sidebar";
import "../../ServiceManager/SMDashboard/ServiceManager.css";

import { Outlet } from "react-router-dom";
const ServiceManagerLayout = () => {
    return (
        <div className="layout">
            <Sidebar />

            <div className="main-content">
                <Outlet />
            </div>
        </div>
    );
};
export default ServiceManagerLayout;