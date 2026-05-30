import { useCallback, useEffect, useState } from "react";
import "./TechnicianRoster.css";
import { getTechniciansByWorkshop, getShiftsByWorkshop, addShift, deleteShift, } from "../../../services/capacityService";
type Technician = {
    id: number;
    technicianName: string;
    specialization: string;
};
type Shift = {
    id: number;
    technicianId: number; technicianName?: string; shiftStart: string; shiftEnd: string;
};

type Props = {
    workshopId?: number;
};
const toLocalDateTime = (date: string, time: string) => `${date}T${time}:00`; const sliceTime = (dt: string) => dt ? dt.slice(11, 16) : "";
const TechnicianRoster = ({ workshopId }: Props) => {
    const [techs, setTechs] = useState<Technician[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]); const [form, setForm] = useState({ technicianId: "", shiftStart: "", shiftEnd: "", });
    const [error, setError] = useState(""); const today = new Date().toISOString().split("T")[0];
    const loadTechs = useCallback(async () => {
        if (!workshopId) return;
        try {
            const res = await getTechniciansByWorkshop(workshopId);
            setTechs(res.data);
        } catch { }
    }, [workshopId]);
    const loadShifts = useCallback(async () => {
        if (!workshopId) return; try {
            const res = await getShiftsByWorkshop(workshopId);
            setShifts(res.data);
        } catch { }
    }, [workshopId]); useEffect(() => {
        loadTechs(); loadShifts();

    }, [loadTechs, loadShifts]);
    const handleAdd = async () => {
        if (!form.technicianId || !form.shiftStart || !form.shiftEnd) {
            setError("All fields required.");
            return;
        } try {
            setError("");
            await addShift({
                technicianId: Number(form.technicianId),
                shiftStart: toLocalDateTime(today, form.shiftStart),
                shiftEnd: toLocalDateTime(today, form.shiftEnd),
            });
            setForm({ technicianId: "", shiftStart: "", shiftEnd: "" });
            loadShifts();
        } catch {
            setError("Failed to add shift.");

        }
    };
    const handleDelete = async (id: number) => {
        try {
            await deleteShift(id); setShifts((prev) => prev.filter((s) => s.id !== id));

        } catch {
            setError("Failed to delete shift.");
        }
    }; const getTechName = (id: number) => techs.find((t) => t.id === id)?.technicianName ?? `Tech #${id}`;
    return (
        <div className="inner-section"> <h3>Technician Roster</h3>
            <p className="section-sub">{shifts.length} shift{shifts.length !== 1 ? "s" : ""} scheduled</p>
            {error && <div className="section-error">{error}</div>} <div className="roster-form">
                <select value={form.technicianId} onChange={(e) => setForm({ ...form, technicianId: e.target.value })} >
                    <option value="">Select Technician</option>
                    {techs.map((t) => (<option key={t.id} value={t.id}> {t.technicianName} — {t.specialization} </option>))} </select> <input type="time" value={form.shiftStart} onChange={(e) => setForm({ ...form, shiftStart: e.target.value })} />
                <input type="time" value={form.shiftEnd} onChange={(e) => setForm({ ...form, shiftEnd: e.target.value })} />
                <button className="add-btn" onClick={handleAdd}>+ Add</button> </div> {shifts.length === 0 ? (<p className="section-empty">No shifts configured yet.</p>) :
                    (<div className="service-list"> {shifts.map((s) => (<div key={s.id} className="service-row">
                        <span className="tech-name">{getTechName(s.technicianId)}</span>
                        <span className="tech-time"> {sliceTime(s.shiftStart)} – {sliceTime(s.shiftEnd)} </span>
                        <button className="delete-btn-sm" onClick={() => handleDelete(s.id)} > 🗑️ </button> </div>))} </div>)} </div>);
};
export default TechnicianRoster; 
