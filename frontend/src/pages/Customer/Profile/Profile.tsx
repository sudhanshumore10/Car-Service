import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CustomerNavbar from "../../../components/CustomerNavbar/CustomerNavbar";
import { CustomerProfile, getProfile } from "../../../services/profileService";

const Profile = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = storedUser.userId ?? storedUser.id;
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getProfile(userId);
        setProfile(response.data);
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...JSON.parse(localStorage.getItem("user") || "{}"),
            ...response.data,
          })
        );
      } catch (error: any) {
        toast.error(error.response?.data?.errorMessage || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const initials = useMemo(() => {
    const name = profile?.fullName || storedUser.fullName || "Customer";
    return name
      .split(" ")
      .map((part: string) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [profile?.fullName, storedUser.fullName]);

  return (
    <>
      <CustomerNavbar />
      <div className="customer-shell">
        <div className="customer-shell__inner customer-grid">
          <section className="customer-hero-card">
            <div className="customer-section-head" style={{ marginBottom: "0" }}>
              <div>
                <h1>My Profile</h1>
                <p>Keep your contact details and address current so bookings and pickup updates stay accurate.</p>
              </div>
              <button
                type="button"
                className="customer-action-btn"
                onClick={() => navigate("/customer/manage-profile")}
              >
                Edit Profile
              </button>
            </div>
            {!loading && (
              <div className="customer-stat-row">
                <div className="customer-stat">
                  <span className="customer-stat__label">Customer</span>
                  <span className="customer-stat__value">{profile?.fullName || "NA"}</span>
                </div>
                <div className="customer-stat">
                  <span className="customer-stat__label">Email</span>
                  <span className="customer-stat__value" style={{ fontSize: "1.05rem" }}>
                    {profile?.email || "NA"}
                  </span>
                </div>
                <div className="customer-stat">
                  <span className="customer-stat__label">Phone</span>
                  <span className="customer-stat__value">{profile?.phone || "NA"}</span>
                </div>
                <div className="customer-stat">
                  <span className="customer-stat__label">Profile ID</span>
                  <span className="customer-stat__value">CU-{profile?.userId || userId || "--"}</span>
                </div>
              </div>
            )}
          </section>

          {loading ? (
            <div className="customer-surface customer-empty">Loading profile...</div>
          ) : (
            <section className="customer-grid customer-grid--2">
              <article className="customer-surface">
                <div className="customer-section-head">
                  <div>
                    <h3>Contact Summary</h3>
                    <p>Primary customer contact details used across bookings and invoices.</p>
                  </div>
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "18px",
                      display: "grid",
                      placeItems: "center",
                      background: "linear-gradient(135deg, #cf3b3b, #1d4ed8)",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: "1.1rem",
                    }}
                  >
                    {initials}
                  </div>
                </div>

                <div className="customer-detail-list">
                  <div className="customer-detail">
                    <span className="customer-detail__label">Full Name</span>
                    <span className="customer-detail__value">{profile?.fullName || "NA"}</span>
                  </div>
                  <div className="customer-detail">
                    <span className="customer-detail__label">Email Address</span>
                    <span className="customer-detail__value">{profile?.email || "NA"}</span>
                  </div>
                  <div className="customer-detail">
                    <span className="customer-detail__label">Phone Number</span>
                    <span className="customer-detail__value">{profile?.phone || "NA"}</span>
                  </div>
                </div>
              </article>

              <article className="customer-surface">
                <div className="customer-section-head">
                  <div>
                    <h3>Address Details</h3>
                    <p>Your pickup, drop, and booking communication address on file.</p>
                  </div>
                </div>

                <div className="customer-detail-list">
                  <div className="customer-detail">
                    <span className="customer-detail__label">Address Line 1</span>
                    <span className="customer-detail__value">{profile?.address?.addressLine1 || "NA"}</span>
                  </div>
                  <div className="customer-detail">
                    <span className="customer-detail__label">Address Line 2</span>
                    <span className="customer-detail__value">{profile?.address?.addressLine2 || "NA"}</span>
                  </div>
                  <div className="customer-detail">
                    <span className="customer-detail__label">City / State</span>
                    <span className="customer-detail__value">
                      {[profile?.address?.city, profile?.address?.state].filter(Boolean).join(", ") || "NA"}
                    </span>
                  </div>
                  <div className="customer-detail">
                    <span className="customer-detail__label">Country / Pincode</span>
                    <span className="customer-detail__value">
                      {[profile?.address?.country, profile?.address?.pincode].filter(Boolean).join(" - ") || "NA"}
                    </span>
                  </div>
                </div>
              </article>
            </section>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
