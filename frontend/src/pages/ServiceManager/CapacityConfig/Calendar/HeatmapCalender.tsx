import { useEffect, useMemo, useState } from "react";
import "./HeatmapCalender.css"; import React from "react";
import { getCapacityRules, getBlackouts } from "../../services/capacityService";
import api from "../../../../services/api";


type Props = { workshopId?: number; };

const HeatmapCalendar = ({ workshopId }: Props) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [bookingData, setBookingData] = useState<Record<string, number>>({});
    const [rules, setRules] = useState<any[]>([]); const [blackoutDates, setBlackoutDates] = useState<string[]>([]);
    const [loading, setLoading] = useState(false); const slots = useMemo(() => { const generatedSlots = []; for (let i = 8; i < 18; i++) { generatedSlots.push(`${i.toString().padStart(2, "0")}:00`); } return generatedSlots; }, []);
    useEffect(() => {
        if (!workshopId) return;
        Promise.all([getCapacityRules(workshopId), getBlackouts(workshopId),]).then(([rulesRes, blackoutsRes]) => {
            setRules(rulesRes.data);
            setBlackoutDates(blackoutsRes.data.map((b: any) => b.date));
        });
    }, [workshopId]);
    useEffect(() => {
        if (!workshopId || !selectedDate) return;
        setLoading(true);
        api.get(`/manager/heatmap/${workshopId}?date=${selectedDate}`)
            .then((res) => setBookingData(res.data))
            .catch(() => {
                const empty: Record<string, number> = {}; slots.forEach((s) => (empty[s] = 0));
                setBookingData(empty);
            }).finally(() => setLoading(false));
    }, [workshopId, selectedDate, slots]);
    const isBlackout = blackoutDates.includes(selectedDate);
    const getMaxForSlot = (slot: string): number => {
        const [h, m] = slot.split(":").map(Number);
        const slotMins = h * 60 + m; const rule = rules.find((r) => {
            const [sh, sm] = r.startTime.split(":").map(Number); const [eh, em] = r.endTime.split(":").map(Number);
            return slotMins >= sh * 60 + sm && slotMins < eh * 60 + em;
        }); return rule?.maxCapacity ?? 3;
    };
    const getStatusClass = (slot: string) => {
        if (isBlackout) return "cell-black"; const count = bookingData[slot] ?? 0;
        const max = getMaxForSlot(slot);
        if (count === 0) return "cell-green";
        if (count < max) return "cell-yellow";
        return "cell-red";
    };
    return (
        <div className="heatmap-card">
            <div className="heatmap-topbar">
                <h3>Capacity Heatmap</h3>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="heatmap-date-input" />
            </div> {isBlackout && (<div className="heatmap-blackout-banner"> 🚫 This date is marked as a blackout day — no bookings allowed. </div>)}
            {loading ? (<p className="heatmap-loading">Loading heatmap…</p>) : (<div className="heatmap-grid" style={{ gridTemplateColumns: `120px 1fr` }}>
                <div className="header-cell">Time Slot</div> <div className="header-cell">Booking Load</div>
                {slots.map((slot) => {
                    const count = bookingData[slot] ?? 0; const max = getMaxForSlot(slot);
                    return (
                        <React.Fragment key={slot}>
                            <div className="time-cell">{slot}</div> <div className={`cell ${getStatusClass(slot)}`}> {isBlackout ? "Closed" : `${count} / ${max}`} </div> </React.Fragment>);
                })} </div>)}
            <div className="heatmap-legend">
                <span className="legend cell-green">Available</span>
                <span className="legend cell-yellow">Partial</span> <span className="legend cell-red">Full</span>
                <span className="legend cell-black">Blackout</span> </div> </div>);
};

export default HeatmapCalendar; 
