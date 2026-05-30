import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "../Sidebar/Sidebar";
import "../SMDashboard/ServiceManager.css";
import {
  getOperationalPickupsByBooking,
  getWorkshopBookings,
  updatePickupStatus,
  BookingResponse,
  PickupRequestResponse,
} from "../../../services/bookingService";
import { getManagerScopedWorkshops } from "../../../services/workshopService";

const formatDateTime = (value?: string) => {
  if (!value) return "NA";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const Bookings = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const managerUserId = user?.userId ?? user?.id ?? null;
  const [loading, setLoading] = useState(true);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>("");
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [pickupMap, setPickupMap] = useState<Record<number, PickupRequestResponse[]>>({});
  const [pickupDrafts, setPickupDrafts] = useState<Record<number, Partial<PickupRequestResponse>>>({});
  const [savingPickupId, setSavingPickupId] = useState<number | null>(null);

  useEffect(() => {
    const loadWorkshops = async () => {
      try {
        const nextWorkshops = await getManagerScopedWorkshops(managerUserId);
        setWorkshops(nextWorkshops);
        if (nextWorkshops.length > 0) {
          setSelectedWorkshopId(String(nextWorkshops[0].id));
        }
      } catch (error: any) {
        toast.error(error.response?.data?.errorMessage || "Failed to load workshops");
        setLoading(false);
      }
    };

    if (managerUserId) {
      loadWorkshops();
    }
  }, [managerUserId]);

  useEffect(() => {
    const loadBookings = async () => {
      if (!selectedWorkshopId) return;
      try {
        setLoading(true);
        const data = await getWorkshopBookings(selectedWorkshopId);
        setBookings(data);
        const pickups = await Promise.all(
          data.map(async (booking) => {
            if (!booking.pickupRequired) {
              return [booking.id, []] as const;
            }
            try {
              const requests = await getOperationalPickupsByBooking(booking.id);
              return [booking.id, requests] as const;
            } catch {
              return [booking.id, []] as const;
            }
          })
        );
        setPickupMap(Object.fromEntries(pickups));
      } catch (error: any) {
        toast.error(error.response?.data?.errorMessage || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [selectedWorkshopId]);

  const selectedWorkshop = useMemo(
    () => workshops.find((item) => String(item.id) === selectedWorkshopId),
    [selectedWorkshopId, workshops]
  );

  const updatePickupDraft = (
    pickupId: number,
    key: keyof PickupRequestResponse,
    value: string
  ) => {
    setPickupDrafts((current) => ({
      ...current,
      [pickupId]: {
        ...(current[pickupId] || {}),
        [key]: value,
      },
    }));
  };

  const handlePickupUpdate = async (pickup: PickupRequestResponse) => {
    const draft = pickupDrafts[pickup.id] || {};
    setSavingPickupId(pickup.id);
    try {
      const updated = await updatePickupStatus({
        requestId: pickup.id,
        status: String(draft.status || pickup.status || "REQUESTED"),
        partnerName: draft.partnerName ?? pickup.partnerName,
        partnerPhone: draft.partnerPhone ?? pickup.partnerPhone,
        proofUrl: draft.proofUrl ?? pickup.proofUrl,
        acknowledgementNote: draft.acknowledgementNote ?? pickup.acknowledgementNote,
        scheduledTime: draft.scheduledTime ?? pickup.scheduledTime,
      });

      setPickupMap((current) => ({
        ...current,
        [updated.bookingId]: (current[updated.bookingId] || []).map((item) =>
          item.id === updated.id ? updated : item
        ),
      }));
      setPickupDrafts((current) => {
        const next = { ...current };
        delete next[pickup.id];
        return next;
      });
      toast.success("Pickup/drop request updated");
    } catch (error: any) {
      toast.error(error.response?.data?.errorMessage || "Failed to update pickup/drop");
    } finally {
      setSavingPickupId(null);
    }
  };

  return (
    <div className="layout">
      <div className="sidebar">
        <Sidebar />
      </div>

      <div className="main-content">
        <div className="dashboard-container">
          <div className="customer-section-head">
            <div>
              <h2>Workshop Bookings</h2>
              <p>Live booking visibility by workshop for manager-owned locations.</p>
            </div>
            <div style={{ minWidth: "260px" }}>
              <label className="form-label" style={{ color: "#cbd5e1" }}>
                Workshop
              </label>
              <select
                className="form-select"
                value={selectedWorkshopId}
                onChange={(event) => setSelectedWorkshopId(event.target.value)}
              >
                {workshops.map((workshop) => (
                  <option key={workshop.id} value={workshop.id}>
                    {workshop.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedWorkshop && (
            <div className="main-card" style={{ marginBottom: "20px" }}>
              <div className="bottom-grid">
                <div>
                  <h4>Workshop</h4>
                  <p>{selectedWorkshop.name}</p>
                </div>
                <div>
                  <h4>Brands</h4>
                  <p>{selectedWorkshop.serviceableBrands || "NA"}</p>
                </div>
                <div>
                  <h4>Open Hours</h4>
                  <p>{selectedWorkshop.openTime} - {selectedWorkshop.closeTime}</p>
                </div>
                <div>
                  <h4>Total Bookings</h4>
                  <p>{bookings.length}</p>
                </div>
              </div>
            </div>
          )}

          <div className="main-card">
            {loading ? (
              <div className="customer-empty">Loading bookings...</div>
            ) : bookings.length === 0 ? (
              <div className="customer-empty">No bookings found for this workshop.</div>
            ) : (
              <table className="table table-dark table-striped align-middle">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Vehicle</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Status</th>
                    <th>Pickup</th>
                    <th>Services</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.referenceNumber || `BOOK-${booking.id}`}</td>
                      <td>
                        {[booking.vehicleMake, booking.vehicleModel, booking.vehiclePlateNumber]
                          .filter(Boolean)
                          .join(" ") || "NA"}
                      </td>
                      <td>{formatDateTime(booking.bookingTime)}</td>
                      <td>{formatDateTime(booking.endTime)}</td>
                      <td>{booking.status}</td>
                      <td>
                        {!booking.pickupRequired ? (
                          "No"
                        ) : (pickupMap[booking.id] || []).length === 0 ? (
                          booking.pickupStatus || "Requested"
                        ) : (
                          <div className="pickup-manager-stack">
                            {(pickupMap[booking.id] || []).map((pickup) => {
                              const draft = pickupDrafts[pickup.id] || {};
                              return (
                                <div key={pickup.id} className="pickup-manager-card">
                                  <div className="pickup-manager-card__head">
                                    <strong>{pickup.type || "PICKUP"}</strong>
                                    <span>{draft.status || pickup.status}</span>
                                  </div>
                                  <div className="pickup-manager-grid">
                                    <select
                                      value={String(draft.status || pickup.status || "REQUESTED")}
                                      onChange={(event) => updatePickupDraft(pickup.id, "status", event.target.value)}
                                    >
                                      <option value="REQUESTED">Requested</option>
                                      <option value="ASSIGNED">Assigned</option>
                                      <option value="EN_ROUTE">En route</option>
                                      <option value="PICKED">Picked</option>
                                      <option value="DELIVERED">Delivered</option>
                                      <option value="CANCELLED">Cancelled</option>
                                    </select>
                                    <input
                                      value={String(draft.partnerName ?? pickup.partnerName ?? "")}
                                      onChange={(event) => updatePickupDraft(pickup.id, "partnerName", event.target.value)}
                                      placeholder="Partner"
                                    />
                                    <input
                                      value={String(draft.partnerPhone ?? pickup.partnerPhone ?? "")}
                                      onChange={(event) => updatePickupDraft(pickup.id, "partnerPhone", event.target.value)}
                                      placeholder="Phone"
                                    />
                                    <input
                                      value={String(draft.proofUrl ?? pickup.proofUrl ?? "")}
                                      onChange={(event) => updatePickupDraft(pickup.id, "proofUrl", event.target.value)}
                                      placeholder="Proof URL"
                                    />
                                  </div>
                                  <textarea
                                    value={String(draft.acknowledgementNote ?? pickup.acknowledgementNote ?? "")}
                                    onChange={(event) => updatePickupDraft(pickup.id, "acknowledgementNote", event.target.value)}
                                    placeholder="Driver note / acknowledgement"
                                  />
                                  <div className="pickup-manager-card__foot">
                                    <span>{formatDateTime(pickup.scheduledTime)}</span>
                                    <button
                                      type="button"
                                      className="btn-outline-sm"
                                      disabled={savingPickupId === pickup.id}
                                      onClick={() => handlePickupUpdate(pickup)}
                                    >
                                      {savingPickupId === pickup.id ? "Saving..." : "Update"}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                      <td>
                        <div>{booking.serviceNames?.join(", ") || "NA"}</div>
                        {booking.addonNames && booking.addonNames.length > 0 && (
                          <small>Add-ons: {booking.addonNames.join(", ")}</small>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
