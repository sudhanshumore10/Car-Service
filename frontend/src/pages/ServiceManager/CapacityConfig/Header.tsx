import { useEffect, useState } from "react";
import { getManagerScopedWorkshops } from "../../../services/workshopService";
import { getCapacityRules } from "../services/capacityService";
import "./Header.css";

type HeaderProps = {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  selectedWorkshop: any;
  setSelectedWorkshop: (ws: any) => void;
};

const TABS = [
  { key: "details", label: "Details" },
  { key: "rules", label: "Capacity Rules" },
  { key: "calendar", label: "Heatmap Calendar" },
  { key: "blackouts", label: "Blackout Days" },
];

const Header = ({
  activeTab,
  setActiveTab,
  selectedWorkshop,
  setSelectedWorkshop,
}: HeaderProps) => {
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [exporting, setExporting] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const managerUserId = user?.userId ?? user?.id ?? null;

  useEffect(() => {
    const loadWorkshops = async () => {
      try {
        const result = await getManagerScopedWorkshops(managerUserId);
        setWorkshops(result);
        if (!selectedWorkshop && result.length > 0) {
          setSelectedWorkshop(result[0]);
        }
      } catch {
        setWorkshops([]);
      }
    };

    if (managerUserId) {
      loadWorkshops();
    }
  }, [managerUserId, selectedWorkshop, setSelectedWorkshop]);

  const handleWorkshopChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const workshop = workshops.find((item) => String(item.id) === event.target.value);
    setSelectedWorkshop(workshop ?? null);
  };

  const handleExportCSV = async () => {
    if (!selectedWorkshop) return;

    setExporting(true);
    try {
      const response = await getCapacityRules(selectedWorkshop.id);
      const rules = response.data || [];
      const rows = [
        ["Workshop", "Start Time", "End Time", "Max Capacity"],
        ...rules.map((rule: any) => [
          selectedWorkshop.name,
          rule.startTime?.slice(0, 5),
          rule.endTime?.slice(0, 5),
          rule.maxCapacity,
        ]),
      ];
      const csv = rows.map((row) => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `capacity_config_${selectedWorkshop.name}_${new Date().toISOString().split("T")[0]}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="topbar-container">
      <div className="topbar-header">
        <h2>Workshop Configuration</h2>
      </div>

      <div className="toolbar">
        <div className="left">
          <select
            className="workshop-select"
            value={selectedWorkshop?.id ?? ""}
            onChange={handleWorkshopChange}
          >
            <option value="" disabled>
              Select Workshop
            </option>
            {workshops.map((workshop) => (
              <option key={workshop.id} value={workshop.id}>
                {workshop.name}
              </option>
            ))}
          </select>
        </div>

        <div className="right">
          <button
            className="export-btn"
            onClick={handleExportCSV}
            disabled={exporting || !selectedWorkshop}
            title="Export capacity rules as CSV"
            type="button"
          >
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((tab) => (
          <span
            key={tab.key}
            className={activeTab === tab.key ? "tab active" : "tab"}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Header;
