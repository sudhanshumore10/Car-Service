import React, { useCallback, useEffect, useState } from "react";
import "./CapacityRules.css";
import {
  getCapacityRules,
  addCapacityRule,
  deleteCapacityRule,
} from "../../services/capacityService";

type Rule = {
  id: number;
  workshopId: number;
  startTime: string;
  endTime: string;
  maxCapacity: number;
};

type Props = {
  workshopId?: number;
};

const CapacityRules = ({ workshopId }: Props) => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [form, setForm] = useState({
    startTime: "",
    endTime: "",
    maxCapacity: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pad = (t: string) => (t.length === 5 ? t + ":00" : t);

  // ✅ Load rules (ONLY using service)
  const load = useCallback(async () => {
    if (!workshopId) return;

    try {
      setLoading(true);
      setError("");

      const data = await getCapacityRules(workshopId);
      setRules(data);

    } catch (err) {
      console.error("Load failed:", err);
      setError("Failed to load rules.");
    } finally {
      setLoading(false);
    }
  }, [workshopId]);

  useEffect(() => {
    load();
  }, [load]);

  // ✅ Add rule
  const handleAdd = async () => {
    console.log("Form:", form);

    if (!form.startTime || !form.endTime || !form.maxCapacity) {
      setError("All fields are required.");
      return;
    }

    if (!workshopId) return;

    try {
      setError("");

      await addCapacityRule({
        workshopId,
        startTime: pad(form.startTime),
        endTime: pad(form.endTime),
        maxCapacity: Number(form.maxCapacity),
      });

      setForm({ startTime: "", endTime: "", maxCapacity: "" });

      await load(); // refresh list

      console.log("rule added");

    } catch (err) {
      console.error(err);
      setError("Failed to add rule.");
    }
  };

  // ✅ Delete rule (NO fetch anymore)
  const handleDelete = async (id: number) => {
    try {
      await deleteCapacityRule(id);
      await load();
    } catch (err) {
      console.error(err);
      setError("Failed to delete rule.");
    }
  };

  return (
    <div className="capacity-container">
      <div className="capacity-header">
        <h3>Slot Capacity Rules</h3>
        <p className="capacity-sub">
          Define max concurrent bookings per time window for this workshop.
        </p>
      </div>

      {error && <div className="capacity-error">{error}</div>}

      <div className="capacity-form">
        <label>
          Start Time
          <input
            type="time"
            value={form.startTime}
            onChange={(e) =>
              setForm({ ...form, startTime: e.target.value })
            }
          />
        </label>

        <label>
          End Time
          <input
            type="time"
            value={form.endTime}
            onChange={(e) =>
              setForm({ ...form, endTime: e.target.value })
            }
          />
        </label>

        <label>
          Max Capacity
          <input
            type="number"
            min={1}
            placeholder="e.g. 5"
            value={form.maxCapacity}
            onChange={(e) =>
              setForm({ ...form, maxCapacity: e.target.value })
            }
          />
        </label>

        <button className="capacity-add-btn" onClick={handleAdd}>
          + Add Rule
        </button>
      </div>

      {loading ? (
        <p className="capacity-loading">Loading rules…</p>
      ) : rules.length === 0 ? (
        <p className="capacity-empty">No rules configured yet.</p>
      ) : (
        <table className="rules-table">
          <thead>
            <tr>
              <th>Start</th>
              <th>End</th>
              <th>Max Capacity</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id}>
                <td>{r.startTime?.slice(0, 5)}</td>
                <td>{r.endTime?.slice(0, 5)}</td>
                <td>
                  <span className="capacity-badge">{r.maxCapacity}</span>
                </td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(r.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CapacityRules;
