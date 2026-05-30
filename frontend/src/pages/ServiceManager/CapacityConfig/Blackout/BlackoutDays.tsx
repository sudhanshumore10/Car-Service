
import { useCallback, useEffect, useState } from "react";
import "./BlackoutDays.css";
import { getBlackouts, addBlackout, deleteBlackout, } from "../../services/capacityService";

type Blackout = { id: number; workshopId: number; date: string; reason: string; };
type Props = { workshopId?: number; };
const BlackoutDays = ({ workshopId }: Props) => {
    const [blackouts, setBlackouts] = useState<Blackout[]>([]);
    const [date, setDate] = useState("");
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const load: () => Promise<void> = useCallback(async () => {
        if (!workshopId) return;
        try {
            setLoading(true);
            const res = await getBlackouts(workshopId);
            setBlackouts(res.data);
        }
        catch {
            setError("Failed to load blackout dates.");
        }
        finally {
            setLoading(false);
        }
    }, [workshopId]);
    useEffect(() => {
        load();
    }, [load]);
    const handleAdd = async () => {
        if (!date || !reason.trim()) {
            setError("Please fill in both date and reason.");
            return;
        }
        if (!workshopId) return;
        try {
            setError("");
            await addBlackout({ workshopId, date, reason });
            setDate("");
            setReason("");
            load();
        } catch {
            setError("Failed to add blackout date.");
        }
    };
    const handleDelete = async (id: number) => {
        try {
            await deleteBlackout(id);
            setBlackouts((prev) => prev.filter((b) => b.id !== id));
        }
        catch {
            setError("Failed to remove blackout date.");
        }
    };
    return (
        <div className="blackout-container">
            <div className="blackout-header">
                <h3>Blackout Days</h3>
                <p className="blackout-sub"> Mark dates when this workshop will be closed for bookings. </p>
            </div> {error && <div className="blackout-error">{error}</div>}
            <div className="blackout-form">
                <label> Date <input type="date" value={date} min={new Date().toISOString().split("T")[0]} onChange={(e) => setDate(e.target.value)} />  </label>
                <label> Reason
                    <input type="text" placeholder="e.g. Public Holiday, Maintenance" value={reason}
                        onChange={(e) => setReason(e.target.value)} />
                </label>
                <button className="blackout-add-btn" onClick={handleAdd}> + Mark Blackout </button>
            </div>
            {loading ? (<p className="blackout-empty">Loading…</p>) : blackouts.length === 0 ? (<p className="blackout-empty">No blackout days marked.</p>) : (<div className="blackout-list"> {blackouts.map((b) => (<div key={b.id} className="blackout-card"> <div className="blackout-card-left"> <span className="blackout-date">{b.date}</span> <span className="blackout-reason">{b.reason}</span> </div>
                <button className="blackout-delete" onClick={() => handleDelete(b.id)} > Remove </button> </div>))} </div>)}
        </div>);
};


export default BlackoutDays; 
