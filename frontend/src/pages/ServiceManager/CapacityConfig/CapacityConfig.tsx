import { useState } from "react";
import Sidebar from "../Sidebar/Sidebar";
import ServiceBays from "./EditWorkshop/ServiceBays/ServiceBays";
import TechnicianRoster from "./EditWorkshop/TechRoster/TechnicianRoster";
import WorkshopDetails from "./EditWorkshop/WorkshopDetails";
import Header from "./Header";
import "../SMDashboard/ServiceManager.css";
import { useLocation } from "react-router-dom";
import HeatmapCalendar from "./Calendar/HeatmapCalender";
import BlackoutDays from "./Blackout/BlackoutDays";
import CapacityRules from "./CapacityRules/CapacityRules";

type Workshop = {
  id: number;
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  openTime: string;
  closeTime: string;
  serviceableBrands: string;
};

const CapacityConfig = () => {
  const [activeTab, setActiveTab] = useState("details");
  const location = useLocation();
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);

  return (
    <div className="layout">
      <div className="sidebar">
        <Sidebar />
      </div>

      <div className="main-content">
        {location.pathname === "/manager/capacity" && (
          <>
            <Header
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              selectedWorkshop={selectedWorkshop}
              setSelectedWorkshop={setSelectedWorkshop}
            />
            <div className="main-card">
              {activeTab === "details" && (
                <>
                  <WorkshopDetails workshop={selectedWorkshop} />
                  <div className="divider"></div>
                  <div className="bottom-grid">
                    <ServiceBays workshopId={selectedWorkshop?.id} />
                    <TechnicianRoster workshopId={selectedWorkshop?.id} />
                  </div>
                </>
              )}
              {activeTab === "rules" && (
                <div className="tab-content">
                  <CapacityRules workshopId={selectedWorkshop?.id} />
                </div>
              )}
              {activeTab === "calendar" && (
                <div className="tab-content">
                  <HeatmapCalendar />
                </div>
              )}
              {activeTab === "blackouts" && (
                <div className="tab-content">
                  <BlackoutDays workshopId={selectedWorkshop?.id} />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CapacityConfig;
