import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import "./TechnicianLayout.css";
export default function TechnicianLayout(){
    return(
        <div className="layout">
            <Sidebar/>
            <div className="content">
                <Outlet/>
            </div>
        </div>
    );
}
