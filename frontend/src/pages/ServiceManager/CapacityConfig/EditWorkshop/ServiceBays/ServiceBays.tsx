import { useCallback, useEffect, useState } from "react";
import "./ServiceBays.css";
import { getServiceBays, addServiceBay, deleteServiceBay, } from "../../../services/capacityService";

type Bay = {
    id: number;
    workshopId: number;
    bayName: string;
};

type Props = {
    workshopId?: number;
};

const ServiceBays = ({ workshopId }: Props) => {
    const [bays, setBays] = useState<Bay[]>([]);
    const [bayName, setBayName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const load = useCallback(async () => {
        if (!workshopId) return;
        try {
            setLoading(true);
            const res = await getServiceBays(workshopId);
            setBays(res.data);
        }
        catch {
            setError("Failed to load service bays.");
        }
        finally {
            setLoading(false);
        }
    }, [workshopId]);
    useEffect(() => {
        load();
    },
        [load]);
    const handleAdd = async () => {
        if (!bayName.trim()) {
            setError("Bay name is required."); return;
        }
        if (!workshopId) return;
        try {
            setError("");
            await addServiceBay({ workshopId, bayName: bayName.trim() });
            setBayName(""); load();
        }
        catch {
            setError("Failed to add bay.");
        }
    };
    const handleDelete = async (id: number) => {
        try {
            await deleteServiceBay(id);
            setBays((prev) => prev.filter((b) => b.id !== id));
        }
        catch {
            setError("Failed to delete bay.");
        }
    };
    return (
        <div className="inner-section">
            <h3>Service Bays</h3>
            <p className="section-sub">{bays.length} bay{bays.length !== 1 ? "s" : ""} configured</p>
            {error && <div className="section-error">{error}
            </div>}
            <div className="bay-add-row">
                <input type="text" placeholder="Bay name, e.g. Bay 3" value={bayName} onChange={(e) => setBayName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
                <button className="add-btn" onClick={handleAdd}>+ Add</button>
            </div> {loading ? (<p className="section-empty">Loading…</p>) : bays.length === 0 ? (<p className="section-empty">No bays added yet.</p>) : (<div className="service-list"> {bays.map((b) => (<div className="service-row" key={b.id}> <span className="tech-name">{b.bayName}</span>
                <button className="delete-btn-sm" onClick={() => handleDelete(b.id)} > 🗑️ </button> </div>))} </div>)}
        </div>);
};

export default ServiceBays; 
