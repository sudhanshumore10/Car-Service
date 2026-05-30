import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CustomerNavbar from "../../../components/CustomerNavbar/CustomerNavbar";
import { getProfile, updateProfile } from "../../../services/profileService";

const ManageProfile = () => {
  const navigate = useNavigate();
  const existingUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = existingUser?.userId ?? existingUser?.id ?? null;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getProfile(userId);
        const profile = response.data;
        setForm({
          fullName: profile.fullName || "",
          phone: profile.phone || "",
          addressLine1: profile.address?.addressLine1 || "",
          addressLine2: profile.address?.addressLine2 || "",
          city: profile.address?.city || "",
          state: profile.address?.state || "",
          country: profile.address?.country || "",
          pincode: profile.address?.pincode || "",
        });
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.fullName.trim()) nextErrors.fullName = "Name is required";
    if (!form.phone.trim()) nextErrors.phone = "Phone is required";
    if (form.phone && !/^\d{10}$/.test(form.phone)) nextErrors.phone = "Enter a valid 10-digit number";
    if (!form.city.trim()) nextErrors.city = "City is required";
    if (!form.state.trim()) nextErrors.state = "State is required";
    if (!form.country.trim()) nextErrors.country = "Country is required";
    if (!form.pincode.trim()) nextErrors.pincode = "Pincode is required";
    return nextErrors;
  };

  const handleSubmit = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setSaving(true);
      const response = await updateProfile(userId, form);
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...existingUser,
          ...response.data,
        })
      );
      toast.success("Profile updated successfully");
      navigate("/customer/profile");
    } catch (error: any) {
      toast.error(error.response?.data?.errorMessage || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <CustomerNavbar />
      <div className="customer-shell">
        <div className="customer-shell__inner customer-grid">
          <section className="customer-hero-card">
            <div className="customer-section-head" style={{ marginBottom: "0" }}>
              <div>
                <h1>Manage Profile</h1>
                <p>Update your contact details and address so every booking, invoice, and pickup request stays in sync.</p>
              </div>
              <div className="customer-page-header__actions">
                <button
                  type="button"
                  className="customer-action-btn--secondary"
                  onClick={() => navigate("/customer/profile")}
                >
                  Back to Profile
                </button>
              </div>
            </div>
          </section>

          <section className="customer-surface">
            <div className="customer-section-head">
              <div>
                <h3>Edit Customer Details</h3>
                <p>Changes are saved against your customer account and used across service workflows.</p>
              </div>
            </div>

            {loading ? (
              <div className="customer-empty">Loading profile...</div>
            ) : (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSubmit();
                }}
              >
                <div className="customer-form-grid">
                  <div className="customer-form-field">
                    <label htmlFor="fullName">Full Name</label>
                    <input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} />
                    {errors.fullName && <p className="customer-error">{errors.fullName}</p>}
                  </div>

                  <div className="customer-form-field">
                    <label htmlFor="phone">Phone</label>
                    <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
                    {errors.phone && <p className="customer-error">{errors.phone}</p>}
                  </div>

                  <div className="customer-form-field customer-form-field--full">
                    <label htmlFor="addressLine1">Address Line 1</label>
                    <input id="addressLine1" name="addressLine1" value={form.addressLine1} onChange={handleChange} />
                  </div>

                  <div className="customer-form-field customer-form-field--full">
                    <label htmlFor="addressLine2">Address Line 2</label>
                    <input id="addressLine2" name="addressLine2" value={form.addressLine2} onChange={handleChange} />
                  </div>

                  <div className="customer-form-field">
                    <label htmlFor="city">City</label>
                    <input id="city" name="city" value={form.city} onChange={handleChange} />
                    {errors.city && <p className="customer-error">{errors.city}</p>}
                  </div>

                  <div className="customer-form-field">
                    <label htmlFor="state">State</label>
                    <input id="state" name="state" value={form.state} onChange={handleChange} />
                    {errors.state && <p className="customer-error">{errors.state}</p>}
                  </div>

                  <div className="customer-form-field">
                    <label htmlFor="country">Country</label>
                    <input id="country" name="country" value={form.country} onChange={handleChange} />
                    {errors.country && <p className="customer-error">{errors.country}</p>}
                  </div>

                  <div className="customer-form-field">
                    <label htmlFor="pincode">Pincode</label>
                    <input id="pincode" name="pincode" value={form.pincode} onChange={handleChange} />
                    {errors.pincode && <p className="customer-error">{errors.pincode}</p>}
                  </div>
                </div>

                <div className="customer-actions customer-form-actions">
                  <button
                    type="button"
                    className="customer-button-secondary"
                    onClick={() => navigate("/customer/profile")}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="customer-button-primary" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default ManageProfile;
