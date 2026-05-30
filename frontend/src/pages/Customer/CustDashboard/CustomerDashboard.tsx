import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import CustomerNavbar from "../../../components/CustomerNavbar/CustomerNavbar";
import toast from "react-hot-toast";
import { getWorkshops } from "../../../services/workshopService";

type Workshop = {
  id: number;
  name: string;
  openTime: string;
  closeTime: string;
  serviceableBrands: string;
  address?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
};

const formatTime = (value?: string) => {
  if (!value) return "NA";
  return value.includes("T") ? value.split("T")[1]?.slice(0, 5) : value.slice(0, 5);
};

const CustomerDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const customerUserId = user?.userId ?? user?.id ?? null;
  const firstName = user.fullName ? user.fullName.split(" ")[0] : "Customer";
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const navigate = useNavigate();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const response = await getWorkshops();
        setWorkshops(response.data || []);
      } catch (error: any) {
        toast.error(error.response?.data?.errorMessage || "Error while fetching workshops");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  const brandsCovered = useMemo(() => {
    const unique = new Set<string>();
    workshops.forEach((workshop) => {
      String(workshop.serviceableBrands || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .forEach((brand) => unique.add(brand));
    });
    return unique.size;
  }, [workshops]);

  return (
    <>
      <CustomerNavbar />
      <div className="customer-shell">
        <div className="customer-shell__inner customer-grid">
          <section className="customer-hero-card">
            <div className="customer-section-head" style={{ marginBottom: "0" }}>
              <div>
                <h1>Hello, {firstName}</h1>
                <p>Discover workshops, manage vehicles, and keep your service journey moving without hunting through scattered screens.</p>
                <div className="customer-actions">
                  <button className="customer-action-btn" onClick={() => navigate("/customer/book-service")}>
                    Book a Service
                  </button>
                  <button className="customer-action-btn--secondary" onClick={() => navigate("/customer/bookings")}>
                    View My Bookings
                  </button>
                  <button className="customer-action-btn--secondary" onClick={() => navigate("/customer/invoices")}>
                    Open Invoices
                  </button>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontWeight: 700, color: "#fff" }}>{today}</p>
                <p>Use the workshop directory below to pick where you want to service your next vehicle.</p>
              </div>
            </div>

            <div className="customer-stat-row">
              <div className="customer-stat">
                <span className="customer-stat__label">Workshops</span>
                <span className="customer-stat__value">{loading ? "..." : workshops.length}</span>
              </div>
              <div className="customer-stat">
                <span className="customer-stat__label">Brands Covered</span>
                <span className="customer-stat__value">{loading ? "..." : brandsCovered}</span>
              </div>
              <div className="customer-stat">
                <span className="customer-stat__label">Profile Status</span>
                <span className="customer-stat__value" style={{ fontSize: "1rem" }}>Ready to Book</span>
              </div>
              <div className="customer-stat">
                <span className="customer-stat__label">Customer ID</span>
                <span className="customer-stat__value">CU-{customerUserId || "--"}</span>
              </div>
            </div>
          </section>

          <section className="customer-surface">
            <div className="customer-section-head">
              <div>
                <h2>Available Workshops</h2>
                <p>Select a workshop after choosing your vehicle. This list is now coming directly from the backend.</p>
              </div>
            </div>

            {loading ? (
              <div className="customer-empty">Loading workshops...</div>
            ) : workshops.length === 0 ? (
              <div className="customer-empty">No workshops are available right now.</div>
            ) : (
              <div className="customer-grid customer-grid--3">
                {workshops.map((workshop) => (
                  <article key={workshop.id} className="customer-surface" style={{ padding: "1.25rem" }}>
                    <div className="customer-section-head" style={{ marginBottom: "1rem" }}>
                      <div>
                        <h3 style={{ marginBottom: "0.35rem" }}>{workshop.name}</h3>
                        <p>
                          {workshop.address?.city || "City unavailable"}
                          {workshop.address?.state ? `, ${workshop.address.state}` : ""}
                        </p>
                      </div>
                      <span className="customer-chip customer-chip--success">Open</span>
                    </div>

                    <div className="customer-detail-list">
                      <div className="customer-detail">
                        <span className="customer-detail__label">Address</span>
                        <span className="customer-detail__value">
                          {[
                            workshop.address?.addressLine1,
                            workshop.address?.addressLine2,
                            workshop.address?.city,
                            workshop.address?.pincode,
                          ]
                            .filter(Boolean)
                            .join(", ") || "NA"}
                        </span>
                      </div>
                      <div className="customer-detail">
                        <span className="customer-detail__label">Hours</span>
                        <span className="customer-detail__value">
                          {formatTime(workshop.openTime)} - {formatTime(workshop.closeTime)}
                        </span>
                      </div>
                      <div className="customer-detail">
                        <span className="customer-detail__label">Brands</span>
                        <span className="customer-detail__value">{workshop.serviceableBrands || "NA"}</span>
                      </div>
                    </div>

                    <div className="customer-actions" style={{ marginTop: "1rem" }}>
                      <button
                        className="customer-action-btn"
                        onClick={() => navigate("/customer/book-service")}
                      >
                        Choose Workshop
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default CustomerDashboard;
