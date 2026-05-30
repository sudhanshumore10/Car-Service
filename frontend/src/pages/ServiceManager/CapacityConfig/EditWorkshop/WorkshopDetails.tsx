import { useEffect, useState } from "react";
import "./WorkshopDetails.css";
import { updateWorkshop } from "../../services/capacityService";

type Workshop = {
    id: number;
    name: string;
    address?: {
        addressLine1: string;
        addressLine2: string;
        city: string;
        state: string;
        country: string;
        pincode: string;
    };
    openTime: any;
    closeTime: any;
    serviceableBrands: string;
};

type Props = {
    workshop: Workshop | null;
    onSaved?: (updated: any) => void;
};

const toTimeString = (val: any): string => {
    if (!val) return "";
    const s = typeof val === "string" ? val : String(val);
    const t = s.includes("T") ? s.split("T")[1] : s;
    return t.slice(0, 5);
};

const WorkshopDetails = ({ workshop, onSaved }: Props) => {
    const [form, setForm] = useState({
        name: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
        openTime: "",
        closeTime: "",
        serviceableBrands: "",
    });
    const [showInput, setShowInput] = useState<boolean>(false);
    const [newBrand, setNewBrand] = useState<string>("");
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const brandsArray: string[] = form.serviceableBrands
        ? form.serviceableBrands.split(",").filter(Boolean)
        : [];

    useEffect(() => {
        if (!workshop) return;
        const addr = workshop.address ?? ({} as any);
        setForm({
            name: workshop.name ?? "",
            addressLine1: addr.addressLine1 ?? "",
            addressLine2: addr.addressLine2 ?? "",
            city: addr.city ?? "",
            state: addr.state ?? "",
            country: addr.country ?? "",
            pincode: addr.pincode ?? "",
            openTime: toTimeString(workshop.openTime),
            closeTime: toTimeString(workshop.closeTime),
            serviceableBrands: workshop.serviceableBrands ?? "",
        });
        setSaveMsg(null);
    }, [workshop]);

    const handleAddBrand = () => {
        if (!newBrand.trim()) return;
        const updated = [...brandsArray, newBrand.trim()];
        setForm({ ...form, serviceableBrands: updated.join(",") });
        setNewBrand("");
        setShowInput(false);
    };

    const handleSave = async () => {
        if (!workshop) return;
        setSaving(true);
        setSaveMsg(null);
        try {
            const today = new Date().toISOString().split("T")[0];
            const payload = {
                name: form.name,
                openTime: `${today}T${form.openTime}:00`,
                closeTime: `${today}T${form.closeTime}:00`,
                serviceableBrands: form.serviceableBrands,
                address: {
                    addressLine1: form.addressLine1,
                    addressLine2: form.addressLine2,
                    city: form.city,
                    state: form.state,
                    country: form.country,
                    pincode: form.pincode,
                },
            };
            const res = await updateWorkshop(workshop.id, payload);
            setSaveMsg({ type: "success", text: "Workshop details saved successfully!" });
            if (onSaved) onSaved(res.data);
        } catch {
            setSaveMsg({ type: "error", text: "Failed to save. Please try again." });
        } finally {
            setSaving(false);
        }
    };

    if (!workshop)
        return <p style={{ padding: "1rem", color: "#888" }}>Select a workshop to view details.</p>;

    return (
        <div className="inner-section">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 className="card-title" id="w-title">Workshop Details</h3>
                <button className="save-changes-btn" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving…" : "💾 Save Changes"}
                </button>
            </div>

            {saveMsg && (
                <div className={`save-msg ${saveMsg.type}`}>
                    {saveMsg.text}
                </div>
            )}

            <div className="details-grid">
                <div className="col">
                    <div className="form-group">
                        <label className="form-label">Workshop Name</label>
                        <input
                            placeholder="Workshop Name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Address</label>
                        <input placeholder="Address Line 1" value={form.addressLine1}
                            onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} />
                        <input placeholder="Address Line 2" value={form.addressLine2}
                            onChange={(e) => setForm({ ...form, addressLine2: e.target.value })} />
                        <input placeholder="City" value={form.city}
                            onChange={(e) => setForm({ ...form, city: e.target.value })} />
                        <input placeholder="State" value={form.state}
                            onChange={(e) => setForm({ ...form, state: e.target.value })} />
                        <input placeholder="Country" value={form.country}
                            onChange={(e) => setForm({ ...form, country: e.target.value })} />
                        <input placeholder="Pincode" value={form.pincode}
                            onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
                    </div>
                </div>

                <div className="col">
                    <div className="form-group">
                        <label className="form-label">Working Hours</label>
                        <div className="time-row">
                            <input
                                type="time"
                                value={form.openTime}
                                onChange={(e) => setForm({ ...form, openTime: e.target.value })}
                            />
                            <span>To</span>
                            <input
                                type="time"
                                value={form.closeTime}
                                onChange={(e) => setForm({ ...form, closeTime: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Serviceable Brands</label>
                        <div className="tags">
                            {brandsArray.map((b, i) => (
                                <span key={i} className="tag">
                                    {b}
                                    <button
                                        className="remove-btn"
                                        onClick={() => {
                                            const updated = brandsArray.filter((_, index) => index !== i);
                                            setForm({ ...form, serviceableBrands: updated.join(",") });
                                        }}
                                    >
                                        ❌
                                    </button>
                                </span>
                            ))}
                            {showInput && (
                                <input
                                    className="brand-input"
                                    value={newBrand}
                                    onChange={(e) => setNewBrand(e.target.value)}
                                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                        if (e.key === "Enter") handleAddBrand();
                                    }}
                                    placeholder="Enter brand"
                                />
                            )}
                            <button className="add-btn" onClick={() => setShowInput(!showInput)}>+Add</button>
                            {showInput && (
                                <button className="save-btn" onClick={handleAddBrand}>Add</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default WorkshopDetails;