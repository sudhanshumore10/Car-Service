import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CustomerNavbar from "../../../components/CustomerNavbar/CustomerNavbar";
import {
  BookingResponse,
  PickupRequestResponse,
  cancelBooking,
  cancelPickupRequest,
  getBookingPickups,
  getCustomerBookings,
  rescheduleBooking,
} from "../../../services/bookingService";
import "./Bookings.css";

const formatDateTime = (value?: string | null) => {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const toDateTimeInputValue = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
};

const formatStatus = (status?: string | null) =>
  String(status || "UNKNOWN")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getStatusClass = (status?: string | null) => {
  const normalized = (status || "").toUpperCase();
  if (normalized === "COMPLETED" || normalized === "READY" || normalized === "DELIVERED") {
    return "status completed";
  }
  if (normalized === "CANCELLED") {
    return "status cancelled";
  }
  if (normalized === "CONFIRMED" || normalized === "SCHEDULED" || normalized === "RECEIVED") {
    return "status pending";
  }
  return "status in-progress";
};

const getPickupStatusClass = (status?: string | null) => {
  const normalized = (status || "").toUpperCase();
  if (normalized === "DELIVERED") {
    return "pickup-status delivered";
  }
  if (normalized === "CANCELLED") {
    return "pickup-status cancelled";
  }
  if (normalized === "REQUESTED" || normalized === "ASSIGNED") {
    return "pickup-status pending";
  }
  return "pickup-status active";
};

const sortPickupRequests = (requests: PickupRequestResponse[]) =>
  [...requests].sort((left, right) => {
    const typeWeight = (value?: string) => (String(value || "").toUpperCase() === "PICKUP" ? 0 : 1);
    return typeWeight(left.type) - typeWeight(right.type);
  });

const mergePickupStateIntoBooking = (
  booking: BookingResponse,
  requests: PickupRequestResponse[]
): BookingResponse => {
  const pickup = requests.find((request) => String(request.type).toUpperCase() === "PICKUP");
  const drop = requests.find((request) => String(request.type).toUpperCase() === "DROP");

  return {
    ...booking,
    pickupStatus: pickup?.status || booking.pickupStatus,
    dropStatus: drop?.status || booking.dropStatus,
    pickupTime: pickup?.scheduledTime || booking.pickupTime,
    dropTime: drop?.scheduledTime || booking.dropTime,
  };
};

const MyBookings = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const customerUserId = user?.userId ?? user?.id ?? null;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [pickupSubmittingId, setPickupSubmittingId] = useState<number | null>(null);
  const [rescheduleId, setRescheduleId] = useState<number | null>(null);
  const [rescheduleValue, setRescheduleValue] = useState("");
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [pickupRequestsByBooking, setPickupRequestsByBooking] = useState<
    Record<number, PickupRequestResponse[]>
  >({});

  useEffect(() => {
    const hydratePickupRequests = async (sourceBookings: BookingResponse[]) => {
      const pickupBookings = sourceBookings.filter((booking) => booking.pickupRequired);
      if (!pickupBookings.length) {
        setPickupRequestsByBooking({});
        return sourceBookings;
      }

      const results = await Promise.allSettled(
        pickupBookings.map(async (booking) => ({
          bookingId: booking.id,
          requests: await getBookingPickups(booking.id, customerUserId || 0),
        }))
      );

      const nextPickupMap: Record<number, PickupRequestResponse[]> = {};
      let hadFailure = false;

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          nextPickupMap[result.value.bookingId] = result.value.requests;
        } else {
          hadFailure = true;
        }
      });

      setPickupRequestsByBooking(nextPickupMap);

      if (hadFailure) {
        toast.error("Some pickup and drop updates could not be loaded.");
      }

      return sourceBookings.map((booking) =>
        nextPickupMap[booking.id]
          ? mergePickupStateIntoBooking(booking, nextPickupMap[booking.id])
          : booking
      );
    };

    const loadBookings = async () => {
      try {
        const data = await getCustomerBookings(customerUserId || 0);
        const enrichedBookings = await hydratePickupRequests(data);
        setBookings(enrichedBookings);
      } catch (error: any) {
        toast.error(error.response?.data?.errorMessage || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [customerUserId]);

  const sortedBookings = useMemo(
    () =>
      [...bookings].sort((left, right) => {
        const first = left.bookingTime ? new Date(left.bookingTime).getTime() : 0;
        const second = right.bookingTime ? new Date(right.bookingTime).getTime() : 0;
        return second - first;
      }),
    [bookings]
  );

  const handleCancel = async (bookingId: number) => {
    try {
      setSubmittingId(bookingId);
      const updated = await cancelBooking(bookingId, customerUserId || 0);
      setBookings((current) =>
        current.map((booking) => (booking.id === bookingId ? updated : booking))
      );
      toast.success("Booking cancelled successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.errorMessage || "Failed to cancel booking");
    } finally {
      setSubmittingId(null);
    }
  };

  const beginReschedule = (booking: BookingResponse) => {
    setRescheduleId(booking.id);
    setRescheduleValue(toDateTimeInputValue(booking.bookingTime));
  };

  const handleReschedule = async (bookingId: number) => {
    if (!rescheduleValue) {
      toast.error("Select a new booking time");
      return;
    }

    try {
      setSubmittingId(bookingId);
      const updated = await rescheduleBooking(bookingId, customerUserId || 0, rescheduleValue);
      setBookings((current) =>
        current.map((booking) => (booking.id === bookingId ? updated : booking))
      );
      setRescheduleId(null);
      setRescheduleValue("");
      toast.success("Booking rescheduled successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.errorMessage || "Failed to reschedule booking");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleCancelPickup = async (pickup: PickupRequestResponse) => {
    try {
      setPickupSubmittingId(pickup.id);
      const updated = await cancelPickupRequest(pickup.id, customerUserId || 0);

      setPickupRequestsByBooking((current) => {
        const bookingRequests = current[updated.bookingId] || [];
        const nextRequests = bookingRequests.map((request) =>
          request.id === updated.id ? updated : request
        );

        setBookings((currentBookings) =>
          currentBookings.map((booking) =>
            booking.id === updated.bookingId ? mergePickupStateIntoBooking(booking, nextRequests) : booking
          )
        );

        return {
          ...current,
          [updated.bookingId]: nextRequests,
        };
      });

      toast.success(`${formatStatus(updated.type)} request cancelled`);
    } catch (error: any) {
      toast.error(error.response?.data?.errorMessage || "Failed to cancel pickup or drop request");
    } finally {
      setPickupSubmittingId(null);
    }
  };

  return (
    <div className="my-bookings-page">
      <CustomerNavbar />
      <div className="bookings-content">
        <h2>My Bookings</h2>
        <p className="bookings-subtitle">
          Track confirmed appointments, reschedule when policy allows, and keep an eye on pickup and drop progress.
        </p>

        {loading ? (
          <div className="bookings-empty">Loading your bookings...</div>
        ) : sortedBookings.length === 0 ? (
          <div className="bookings-empty">No bookings found yet.</div>
        ) : (
          <div className="bookings-list">
            {sortedBookings.map((booking) => {
              const normalizedStatus = (booking.status || "").toUpperCase();
              const canCancel = !["CANCELLED", "COMPLETED"].includes(normalizedStatus);
              const canReschedule = !["CANCELLED", "COMPLETED"].includes(normalizedStatus);
              const isRescheduling = rescheduleId === booking.id;
              const estimateStatus = (booking.estimateStatus || "").toUpperCase();
              const approvalStatus = (booking.approvalStatus || "").toUpperCase();
              const canReviewEstimate =
                Boolean(booking.workOrderId) &&
                (estimateStatus === "SENT" || ["APPROVED", "DECLINED"].includes(approvalStatus));
              const canOpenInvoice = Boolean(booking.invoiceId);
              const pickupRequests = sortPickupRequests(pickupRequestsByBooking[booking.id] || []);

              return (
                <div key={booking.id} className="booking-card">
                  <div className="booking-card-header">
                    <div>
                      <h3>{booking.workshopName || "Workshop Unavailable"}</h3>
                      <p className="booking-reference">
                        Ref: {booking.referenceNumber || `BOOK-${booking.id}`}
                      </p>
                    </div>
                    <span className={getStatusClass(booking.status)}>
                      {formatStatus(booking.status)}
                    </span>
                  </div>

                  <div className="booking-details">
                    <p>
                      <strong>Vehicle:</strong>{" "}
                      {[booking.vehicleMake, booking.vehicleModel, booking.vehiclePlateNumber]
                        .filter(Boolean)
                        .join(" ") || "Vehicle details unavailable"}
                    </p>
                    <p>
                      <strong>Start:</strong> {formatDateTime(booking.bookingTime)}
                    </p>
                    <p>
                      <strong>End:</strong> {formatDateTime(booking.endTime)}
                    </p>
                    <p>
                      <strong>Services:</strong>{" "}
                      {booking.serviceNames?.length ? booking.serviceNames.join(", ") : "Not available"}
                    </p>
                    <p>
                      <strong>Pickup / Drop:</strong>{" "}
                      {booking.pickupRequired ? "Pickup Requested" : "Workshop Visit"}
                    </p>
                    {booking.pickupStatus && (
                      <p>
                        <strong>Pickup Status:</strong> {formatStatus(booking.pickupStatus)}
                      </p>
                    )}
                    {booking.dropStatus && (
                      <p>
                        <strong>Drop Status:</strong> {formatStatus(booking.dropStatus)}
                      </p>
                    )}
                    {booking.workOrderId && (
                      <p>
                        <strong>Work Order:</strong> WO-{booking.workOrderId}
                      </p>
                    )}
                    {booking.estimateStatus && (
                      <p>
                        <strong>Estimate:</strong> {formatStatus(booking.estimateStatus)}
                      </p>
                    )}
                    {booking.invoiceId && (
                      <p>
                        <strong>Invoice:</strong>{" "}
                        {booking.invoiceReady ? "Ready for payment" : "Preview available"}
                      </p>
                    )}
                  </div>

                  {booking.pickupRequired && (
                    <div className="booking-pickup-panel">
                      <div className="booking-pickup-panel__head">
                        <div>
                          <h4>Pickup & Drop Lifecycle</h4>
                          <p>Track both transport legs and cancel only while a request is still pending.</p>
                        </div>
                      </div>

                      {pickupRequests.length === 0 ? (
                        <div className="booking-pickup-empty">
                          Pickup was requested for this booking, but detailed pickup records are not available yet.
                        </div>
                      ) : (
                        <div className="booking-pickup-grid">
                          {pickupRequests.map((pickup) => {
                            const canCancelPickupRequest = pickup.status?.toUpperCase() === "REQUESTED";
                            return (
                              <div key={pickup.id} className="pickup-card">
                                <div className="pickup-card__top">
                                  <div>
                                    <strong>{formatStatus(pickup.type)}</strong>
                                    <p>Request #{pickup.id}</p>
                                  </div>
                                  <span className={getPickupStatusClass(pickup.status)}>
                                    {formatStatus(pickup.status)}
                                  </span>
                                </div>

                                <div className="pickup-card__meta">
                                  <span>Scheduled: {formatDateTime(pickup.scheduledTime)}</span>
                                  <span>Completed: {formatDateTime(pickup.completedTime)}</span>
                                  {pickup.partnerName && <span>Partner: {pickup.partnerName}</span>}
                                  {pickup.partnerPhone && <span>Contact: {pickup.partnerPhone}</span>}
                                  {pickup.acknowledgementNote && (
                                    <span>Note: {pickup.acknowledgementNote}</span>
                                  )}
                                  {pickup.updatedAt && (
                                    <span>Last Update: {formatDateTime(pickup.updatedAt)}</span>
                                  )}
                                </div>

                                {pickup.proofUrl && (
                                  <a
                                    className="pickup-proof-link"
                                    href={pickup.proofUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    View Proof
                                  </a>
                                )}

                                {canCancelPickupRequest && (
                                  <button
                                    type="button"
                                    className="booking-secondary-button"
                                    disabled={pickupSubmittingId === pickup.id}
                                    onClick={() => handleCancelPickup(pickup)}
                                  >
                                    {pickupSubmittingId === pickup.id
                                      ? "Cancelling..."
                                      : `Cancel ${formatStatus(pickup.type)}`}
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {isRescheduling && (
                    <div className="booking-reschedule-box">
                      <label htmlFor={`reschedule-${booking.id}`}>Choose a new slot</label>
                      <input
                        id={`reschedule-${booking.id}`}
                        type="datetime-local"
                        value={rescheduleValue}
                        onChange={(event) => setRescheduleValue(event.target.value)}
                      />
                      <p>
                        Rescheduling still goes through workshop-hour, blackout, capacity, and vehicle-conflict checks.
                      </p>
                    </div>
                  )}

                  <div className="booking-actions">
                    {canReviewEstimate && booking.workOrderId && (
                      <button
                        type="button"
                        className="booking-secondary-button"
                        onClick={() => navigate(`/customer/estimate/${booking.workOrderId}`)}
                      >
                        {approvalStatus === "PENDING" ? "Review Estimate" : "View Estimate"}
                      </button>
                    )}

                    {canOpenInvoice && (
                      <button
                        type="button"
                        className="booking-secondary-button"
                        onClick={() => navigate("/customer/invoices")}
                      >
                        {booking.invoiceReady ? "Open Invoice" : "Open Preview"}
                      </button>
                    )}

                    {canReschedule && (
                      <>
                        {isRescheduling ? (
                          <>
                            <button
                              type="button"
                              className="booking-secondary-button"
                              disabled={submittingId === booking.id}
                              onClick={() => {
                                setRescheduleId(null);
                                setRescheduleValue("");
                              }}
                            >
                              Close
                            </button>
                            <button
                              type="button"
                              className="booking-action-button"
                              disabled={submittingId === booking.id}
                              onClick={() => handleReschedule(booking.id)}
                            >
                              {submittingId === booking.id ? "Saving..." : "Confirm Reschedule"}
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="booking-secondary-button"
                            disabled={submittingId === booking.id}
                            onClick={() => beginReschedule(booking)}
                          >
                            Reschedule
                          </button>
                        )}
                      </>
                    )}

                    {canCancel && (
                      <button
                        type="button"
                        className="booking-action-button"
                        disabled={submittingId === booking.id}
                        onClick={() => handleCancel(booking.id)}
                      >
                        {submittingId === booking.id ? "Cancelling..." : "Cancel Booking"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
