import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CustomerNavbar from "../../../components/CustomerNavbar/CustomerNavbar";
import { getVehicles, VehicleRecord } from "../../../services/vehicleService";
import { getWorkshops } from "../../../services/workshopService";
import {
  AddonCatalogItem,
  ServiceCatalogItem,
  ServicePackageCatalogItem,
  getCatalogAddOns,
  getCatalogPackages,
  getCatalogServices,
} from "../../../services/serviceCatalogService";
import { createAddress } from "../../../services/addressService";
import {
  createBooking,
  getAvailableSlots,
  SlotResponse,
} from "../../../services/bookingService";

type Workshop = {
  id: number;
  name: string;
  openTime?: string;
  closeTime?: string;
  serviceableBrands?: string;
  address?: {
    city?: string;
    state?: string;
  };
};

const currency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const toInputDate = (value: Date) => value.toISOString().split("T")[0];

const formatSlotLabel = (slot: SlotResponse) => {
  const start = new Date(slot.startTime);
  const end = new Date(slot.endTime);
  return `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};

const BookService = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.userId ?? user?.id ?? null;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [services, setServices] = useState<ServiceCatalogItem[]>([]);
  const [packages, setPackages] = useState<ServicePackageCatalogItem[]>([]);
  const [addOns, setAddOns] = useState<AddonCatalogItem[]>([]);
  const [slots, setSlots] = useState<SlotResponse[]>([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [selectedPackageIds, setSelectedPackageIds] = useState<number[]>([]);
  const [form, setForm] = useState({
    vehicleId: "",
    workshopId: "",
    date: toInputDate(new Date()),
    serviceIds: [] as number[],
    addonIds: [] as number[],
    bookingTime: "",
    pickupRequired: false,
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    pickupTime: "",
    dropTime: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [vehicleResponse, workshopResponse, catalogServices, catalogPackages, catalogAddOns] = await Promise.all([
          getVehicles(userId),
          getWorkshops(),
          getCatalogServices(),
          getCatalogPackages(),
          getCatalogAddOns(),
        ]);

        setVehicles((vehicleResponse.data || []).filter((vehicle) => vehicle.isActive !== false));
        setWorkshops(workshopResponse.data || []);
        setServices((catalogServices || []).filter((service) => service.active !== false));
        setPackages((catalogPackages || []).filter((item) => item.active !== false));
        setAddOns((catalogAddOns || []).filter((item) => item.active !== false));
      } catch (error: any) {
        toast.error(error.response?.data?.errorMessage || "Failed to load booking data");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => String(vehicle.vehicleId) === form.vehicleId),
    [vehicles, form.vehicleId]
  );

  const selectedWorkshop = useMemo(
    () => workshops.find((workshop) => String(workshop.id) === form.workshopId),
    [workshops, form.workshopId]
  );

  const selectedPackages = useMemo(
    () => packages.filter((item) => selectedPackageIds.includes(item.id)),
    [packages, selectedPackageIds]
  );

  const packageServiceIds = useMemo(
    () =>
      Array.from(
        new Set(
          selectedPackages.flatMap((item) => item.serviceIds || [])
        )
      ),
    [selectedPackages]
  );

  const effectiveServiceIds = useMemo(
    () => Array.from(new Set([...form.serviceIds, ...packageServiceIds])),
    [form.serviceIds, packageServiceIds]
  );

  const selectedServices = useMemo(
    () => services.filter((service) => effectiveServiceIds.includes(service.id)),
    [effectiveServiceIds, services]
  );

  const selectedAddOns = useMemo(
    () => addOns.filter((item) => form.addonIds.includes(item.id)),
    [addOns, form.addonIds]
  );

  const packageCoveredIds = useMemo(() => new Set(packageServiceIds), [packageServiceIds]);

  const estimatedServiceTotal = selectedServices.reduce((sum, service) => {
    if (packageCoveredIds.has(service.id)) {
      return sum;
    }
    return sum + Number(service.basePrice || 0);
  }, 0);

  const estimatedPackageTotal = selectedPackages.reduce(
    (sum, item) => sum + Number(item.price || 0),
    0
  );

  const estimatedAddonTotal = selectedAddOns.reduce(
    (sum, item) => sum + Number(item.price || 0),
    0
  );

  const estimatedTotal = estimatedServiceTotal + estimatedPackageTotal + estimatedAddonTotal;

  const estimatedDuration = selectedServices.reduce(
    (sum, service) => sum + Number(service.durationMinutes || 0) + Number(service.bufferMinutes || 0),
    0
  ) + selectedAddOns.reduce((sum, item) => sum + Number(item.durationMinutes || 0), 0);

  useEffect(() => {
    const loadSlots = async () => {
      if (!form.workshopId || effectiveServiceIds.length === 0 || !form.date) {
        setSlots([]);
        setForm((current) => ({ ...current, bookingTime: "" }));
        return;
      }

      setSlotLoading(true);
      try {
        const data = await getAvailableSlots(form.workshopId, effectiveServiceIds, form.date);
        setSlots(data);
        setForm((current) => {
          const stillValid = data.some((slot) => slot.startTime === current.bookingTime);
          return stillValid ? current : { ...current, bookingTime: "" };
        });
      } catch (error: any) {
        setSlots([]);
        toast.error(error.response?.data?.errorMessage || "Failed to load slots");
      } finally {
        setSlotLoading(false);
      }
    };

    loadSlots();
  }, [effectiveServiceIds, form.date, form.workshopId]);

  const handleServiceToggle = (serviceId: number) => {
    const lockedByPackage = packageServiceIds.includes(serviceId) && !form.serviceIds.includes(serviceId);
    if (lockedByPackage) {
      toast("This service is included from a selected package. Remove the package to unselect it.");
      return;
    }
    setForm((current) => ({
      ...current,
      serviceIds: current.serviceIds.includes(serviceId)
        ? current.serviceIds.filter((id) => id !== serviceId)
        : [...current.serviceIds, serviceId],
    }));
  };

  const handlePackageToggle = (packageId: number) => {
    setSelectedPackageIds((current) =>
      current.includes(packageId)
        ? current.filter((id) => id !== packageId)
        : [...current, packageId]
    );
  };

  const handleAddonToggle = (addonId: number) => {
    const addon = addOns.find((item) => item.id === addonId);
    const isSelected = form.addonIds.includes(addonId);
    const blockedByExclusion =
      !isSelected &&
      (addon?.excludedAddonIds || []).some((id) => form.addonIds.includes(id));

    if (blockedByExclusion) {
      toast.error("This add-on conflicts with another selected add-on.");
      return;
    }

    setForm((current) => ({
      ...current,
      addonIds: current.addonIds.includes(addonId)
        ? current.addonIds.filter((id) => id !== addonId)
        : [...current.addonIds, addonId],
    }));
  };

  const handleSubmit = async () => {
    if (!form.vehicleId || !form.workshopId || effectiveServiceIds.length === 0 || !form.bookingTime) {
      toast.error("Select a vehicle, workshop, service, and slot.");
      return;
    }

    if (form.pickupRequired) {
      if (!form.addressLine1 || !form.city || !form.state || !form.country || !form.pincode) {
        toast.error("Pickup address details are required.");
        return;
      }
      if (!form.pickupTime || !form.dropTime) {
        toast.error("Pickup and drop times are required.");
        return;
      }
    }

    setSaving(true);
    try {
      let addressId: number | undefined;
      if (form.pickupRequired) {
        const address = await createAddress({
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2,
          city: form.city,
          state: form.state,
          country: form.country,
          pincode: form.pincode,
        });
        addressId = address.id;
      }

      await createBooking({
        userId: Number(userId),
        vehicleId: Number(form.vehicleId),
        workshopId: Number(form.workshopId),
        bookingTime: form.bookingTime,
        serviceIds: effectiveServiceIds,
        addonIds: form.addonIds,
        pickupRequired: form.pickupRequired,
        pickupAddressId: addressId,
        dropAddressId: addressId,
        pickupTime: form.pickupRequired ? form.pickupTime : undefined,
        dropTime: form.pickupRequired ? form.dropTime : undefined,
      });

      toast.success("Booking created successfully");
      navigate("/customer/bookings");
    } catch (error: any) {
      toast.error(error.response?.data?.errorMessage || "Failed to create booking");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <CustomerNavbar />
      <div className="customer-shell">
        <div className="customer-shell__inner">
          <section className="customer-hero-card">
            <div>
              <span className="customer-kicker">US-06 Booking Flow</span>
              <h1>Book Your Next Service</h1>
              <p>
                Choose your active vehicle, compare workshop availability, preview service cost,
                and reserve a capacity-checked slot directly from live backend data.
              </p>
            </div>
            <div className="customer-stat-row">
              <div className="customer-stat">
                <span className="customer-stat__label">Active Vehicles</span>
                <span className="customer-stat__value">{vehicles.length}</span>
              </div>
              <div className="customer-stat">
                <span className="customer-stat__label">Live Workshops</span>
                <span className="customer-stat__value">{workshops.length}</span>
              </div>
              <div className="customer-stat">
                <span className="customer-stat__label">Catalog Services</span>
                <span className="customer-stat__value">{services.length}</span>
              </div>
              <div className="customer-stat">
                <span className="customer-stat__label">Packages</span>
                <span className="customer-stat__value">{packages.length}</span>
              </div>
              <div className="customer-stat">
                <span className="customer-stat__label">Add-ons</span>
                <span className="customer-stat__value">{addOns.length}</span>
              </div>
            </div>
          </section>

          <div className="customer-grid customer-booking-layout">
            <section className="customer-surface">
              <div className="customer-section-head">
                <div>
                  <h2>Booking Details</h2>
                  <p>Everything here is validated against workshop hours, blackout dates, capacity, and vehicle conflicts.</p>
                </div>
              </div>

              {loading ? (
                <div className="customer-empty">Loading booking data...</div>
              ) : (
                <>
                  <div className="customer-form-grid">
                    <label className="customer-form-field">
                      <span>Vehicle</span>
                      <select
                        value={form.vehicleId}
                        onChange={(event) => setForm((current) => ({ ...current, vehicleId: event.target.value }))}
                      >
                        <option value="">Select vehicle</option>
                        {vehicles.map((vehicle) => (
                          <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                            {[vehicle.make, vehicle.model, vehicle.plateNumber].filter(Boolean).join(" - ")}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="customer-form-field">
                      <span>Workshop</span>
                      <select
                        value={form.workshopId}
                        onChange={(event) => setForm((current) => ({ ...current, workshopId: event.target.value }))}
                      >
                        <option value="">Select workshop</option>
                        {workshops.map((workshop) => (
                          <option key={workshop.id} value={workshop.id}>
                            {workshop.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="customer-form-field">
                      <span>Preferred Date</span>
                      <input
                        type="date"
                        value={form.date}
                        min={toInputDate(new Date())}
                        onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                      />
                    </label>
                  </div>

                  <div className="customer-form-field" style={{ marginTop: "1rem" }}>
                    <div className="customer-inline-summary">
                      <span>Select Services</span>
                      <strong>
                        {selectedServices.length === 0
                          ? "Nothing selected yet"
                          : `${selectedServices.length} selected • ${currency(estimatedTotal)}`}
                      </strong>
                    </div>
                    {selectedServices.length > 0 && (
                      <div className="customer-selected-chips">
                        {selectedServices.map((service) => (
                          <span key={service.id} className="customer-selected-chip">
                            {service.name}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="customer-service-picker">
                      {services.map((service) => {
                        const checked = effectiveServiceIds.includes(service.id);
                        const packageIncluded =
                          packageCoveredIds.has(service.id) && !form.serviceIds.includes(service.id);
                        return (
                          <label
                            key={service.id}
                            className={`customer-service-option${checked ? " selected" : ""}`}
                          >
                            <div className="customer-service-option__toggle">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleServiceToggle(service.id)}
                              />
                            </div>
                            <div className="customer-service-option__copy">
                              <h3>{service.name}</h3>
                              <p>{service.description || "Workshop-ready service configuration."}</p>
                              <div className="customer-service-option__badges">
                                <span>{service.category || "General"}</span>
                                {packageIncluded && <span>Included in package</span>}
                                {(service.whatIncluded || service.tags) && (
                                  <span>{service.whatIncluded || service.tags}</span>
                                )}
                              </div>
                            </div>
                            <div className="customer-service-option__stats">
                              <div className="customer-service-option__stat">
                                <span>Duration</span>
                                <strong>{service.durationMinutes || 0} mins</strong>
                              </div>
                              <div className="customer-service-option__stat">
                                <span>Buffer</span>
                                <strong>{service.bufferMinutes || 0} mins</strong>
                              </div>
                              <div className="customer-service-option__stat customer-service-option__stat--price">
                                <span>Base Price</span>
                                <strong>{currency(Number(service.basePrice || 0))}</strong>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {packages.length > 0 && (
                    <div className="customer-form-field" style={{ marginTop: "1rem" }}>
                      <div className="customer-inline-summary">
                        <span>Packages</span>
                        <strong>
                          {selectedPackages.length === 0
                            ? "Optional service bundles"
                            : `${selectedPackages.length} selected | ${currency(estimatedPackageTotal)}`}
                        </strong>
                      </div>
                      {selectedPackages.length > 0 && (
                        <div className="customer-selected-chips">
                          {selectedPackages.map((item) => (
                            <span key={item.id} className="customer-selected-chip">
                              {item.name}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="customer-service-picker customer-service-picker--wide">
                        {packages.map((item) => {
                          const checked = selectedPackageIds.includes(item.id);
                          return (
                            <label
                              key={item.id}
                              className={`customer-service-option${checked ? " selected" : ""}`}
                            >
                              <div className="customer-service-option__toggle">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => handlePackageToggle(item.id)}
                                />
                              </div>
                              <div className="customer-service-option__copy">
                                <h3>{item.name}</h3>
                                <p>{item.description || "Bundled services for faster booking and better pricing."}</p>
                                <div className="customer-service-option__badges">
                                  <span>{item.category || "Bundle"}</span>
                                  {(item.serviceNames || []).slice(0, 3).map((serviceName) => (
                                    <span key={serviceName}>{serviceName}</span>
                                  ))}
                                </div>
                              </div>
                              <div className="customer-service-option__stats">
                                <div className="customer-service-option__stat">
                                  <span>Services</span>
                                  <strong>{item.serviceIds?.length || 0}</strong>
                                </div>
                                <div className="customer-service-option__stat">
                                  <span>Tax</span>
                                  <strong>{Number(item.taxPercent || 0)}%</strong>
                                </div>
                                <div className="customer-service-option__stat customer-service-option__stat--price">
                                  <span>Package Price</span>
                                  <strong>{currency(Number(item.price || 0))}</strong>
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {addOns.length > 0 && (
                    <div className="customer-form-field" style={{ marginTop: "1rem" }}>
                      <div className="customer-inline-summary">
                        <span>Add-ons</span>
                        <strong>
                          {selectedAddOns.length === 0
                            ? "Optional extras"
                            : `${selectedAddOns.length} selected | ${currency(estimatedAddonTotal)}`}
                        </strong>
                      </div>
                      {selectedAddOns.length > 0 && (
                        <div className="customer-selected-chips">
                          {selectedAddOns.map((item) => (
                            <span key={item.id} className="customer-selected-chip">
                              {item.name}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="customer-service-picker customer-service-picker--wide">
                        {addOns.map((item) => {
                          const checked = form.addonIds.includes(item.id);
                          const blockedByExclusion =
                            !checked &&
                            (item.excludedAddonIds || []).some((id) => form.addonIds.includes(id));

                          return (
                            <label
                              key={item.id}
                              className={`customer-service-option${checked ? " selected" : ""}${blockedByExclusion ? " disabled" : ""}`}
                            >
                              <div className="customer-service-option__toggle">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  disabled={blockedByExclusion}
                                  onChange={() => handleAddonToggle(item.id)}
                                />
                              </div>
                              <div className="customer-service-option__copy">
                                <h3>{item.name}</h3>
                                <p>{item.description || "Optional extra service applied during workshop visit."}</p>
                                <div className="customer-service-option__badges">
                                  <span>Add-on</span>
                                  {blockedByExclusion && <span>Blocked by selection</span>}
                                  {(item.excludedAddonNames || []).slice(0, 2).map((name) => (
                                    <span key={name}>Excludes {name}</span>
                                  ))}
                                </div>
                              </div>
                              <div className="customer-service-option__stats">
                                <div className="customer-service-option__stat">
                                  <span>Duration</span>
                                  <strong>{item.durationMinutes || 0} mins</strong>
                                </div>
                                <div className="customer-service-option__stat">
                                  <span>Rule</span>
                                  <strong>{blockedByExclusion ? "Unavailable" : "Compatible"}</strong>
                                </div>
                                <div className="customer-service-option__stat customer-service-option__stat--price">
                                  <span>Add-on Price</span>
                                  <strong>{currency(Number(item.price || 0))}</strong>
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="customer-form-field" style={{ marginTop: "1rem" }}>
                    <span>Available Slots</span>
                    {slotLoading ? (
                      <div className="customer-empty" style={{ marginTop: "0.85rem" }}>Checking live slot capacity...</div>
                    ) : slots.length === 0 ? (
                      <div className="customer-empty" style={{ marginTop: "0.85rem" }}>
                        Select a workshop, date, and at least one service or package to load slots.
                      </div>
                    ) : (
                      <div className="customer-slot-grid" style={{ marginTop: "0.85rem" }}>
                        {slots.map((slot) => (
                          <button
                            key={slot.startTime}
                            type="button"
                            className="customer-button-secondary"
                            onClick={() => setForm((current) => ({ ...current, bookingTime: slot.startTime }))}
                            style={{
                              justifyContent: "space-between",
                              borderColor: form.bookingTime === slot.startTime ? "rgba(255,107,53,0.7)" : undefined,
                              background: form.bookingTime === slot.startTime ? "rgba(255,107,53,0.16)" : undefined,
                            }}
                          >
                            <span>{formatSlotLabel(slot)}</span>
                            <span>{slot.available} left</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <label className="customer-checkbox" style={{ marginTop: "1rem", display: "flex", gap: "0.65rem" }}>
                    <input
                      type="checkbox"
                      checked={form.pickupRequired}
                      onChange={(event) => setForm((current) => ({ ...current, pickupRequired: event.target.checked }))}
                    />
                    <span>Need pickup and drop from my location</span>
                  </label>

                  {form.pickupRequired && (
                    <>
                      <div className="customer-form-grid" style={{ marginTop: "1rem" }}>
                        <label className="customer-form-field">
                          <span>Address Line 1</span>
                          <input
                            value={form.addressLine1}
                            onChange={(event) => setForm((current) => ({ ...current, addressLine1: event.target.value }))}
                          />
                        </label>
                        <label className="customer-form-field">
                          <span>Address Line 2</span>
                          <input
                            value={form.addressLine2}
                            onChange={(event) => setForm((current) => ({ ...current, addressLine2: event.target.value }))}
                          />
                        </label>
                        <label className="customer-form-field">
                          <span>City</span>
                          <input
                            value={form.city}
                            onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                          />
                        </label>
                        <label className="customer-form-field">
                          <span>State</span>
                          <input
                            value={form.state}
                            onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))}
                          />
                        </label>
                        <label className="customer-form-field">
                          <span>Country</span>
                          <input
                            value={form.country}
                            onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))}
                          />
                        </label>
                        <label className="customer-form-field">
                          <span>Pincode</span>
                          <input
                            value={form.pincode}
                            onChange={(event) => setForm((current) => ({ ...current, pincode: event.target.value }))}
                          />
                        </label>
                        <label className="customer-form-field">
                          <span>Pickup Time</span>
                          <input
                            type="datetime-local"
                            value={form.pickupTime}
                            onChange={(event) => setForm((current) => ({ ...current, pickupTime: event.target.value }))}
                          />
                        </label>
                        <label className="customer-form-field">
                          <span>Drop Time</span>
                          <input
                            type="datetime-local"
                            value={form.dropTime}
                            onChange={(event) => setForm((current) => ({ ...current, dropTime: event.target.value }))}
                          />
                        </label>
                      </div>
                    </>
                  )}

                  <div style={{ display: "flex", gap: "0.85rem", marginTop: "1.35rem" }}>
                    <button type="button" className="customer-button-primary" onClick={handleSubmit} disabled={saving}>
                      {saving ? "Creating Booking..." : "Confirm Booking"}
                    </button>
                    <button type="button" className="customer-button-secondary" onClick={() => navigate("/customer/bookings")}>
                      View Existing Bookings
                    </button>
                  </div>
                </>
              )}
            </section>

            <aside className="customer-surface">
              <div className="customer-section-head">
                <div>
                  <h2>Booking Summary</h2>
                  <p>Live preview before confirmation.</p>
                </div>
              </div>

              <div className="customer-detail-list">
                <div className="customer-detail-item">
                  <span className="customer-detail__label">Vehicle</span>
                  <span className="customer-detail__value">
                    {selectedVehicle ? [selectedVehicle.make, selectedVehicle.model].filter(Boolean).join(" ") : "Not selected"}
                  </span>
                </div>
                <div className="customer-detail-item">
                  <span className="customer-detail__label">Workshop</span>
                  <span className="customer-detail__value">{selectedWorkshop?.name || "Not selected"}</span>
                </div>
                <div className="customer-detail-item">
                  <span className="customer-detail__label">Brands Covered</span>
                  <span className="customer-detail__value">{selectedWorkshop?.serviceableBrands || "NA"}</span>
                </div>
                <div className="customer-detail-item">
                  <span className="customer-detail__label">Location</span>
                  <span className="customer-detail__value">
                    {selectedWorkshop ? [selectedWorkshop.address?.city, selectedWorkshop.address?.state].filter(Boolean).join(", ") : "NA"}
                  </span>
                </div>
                <div className="customer-detail-item">
                  <span className="customer-detail__label">Selected Services</span>
                  <span className="customer-detail__value">{selectedServices.length}</span>
                </div>
                <div className="customer-detail-item">
                  <span className="customer-detail__label">Selected Packages</span>
                  <span className="customer-detail__value">{selectedPackages.length}</span>
                </div>
                <div className="customer-detail-item">
                  <span className="customer-detail__label">Selected Add-ons</span>
                  <span className="customer-detail__value">{selectedAddOns.length}</span>
                </div>
                <div className="customer-detail-item">
                  <span className="customer-detail__label">Estimated Duration</span>
                  <span className="customer-detail__value">{estimatedDuration} mins</span>
                </div>
                <div className="customer-detail-item">
                  <span className="customer-detail__label">Standalone Services</span>
                  <span className="customer-detail__value">{currency(estimatedServiceTotal)}</span>
                </div>
                <div className="customer-detail-item">
                  <span className="customer-detail__label">Packages</span>
                  <span className="customer-detail__value">{currency(estimatedPackageTotal)}</span>
                </div>
                <div className="customer-detail-item">
                  <span className="customer-detail__label">Add-ons</span>
                  <span className="customer-detail__value">{currency(estimatedAddonTotal)}</span>
                </div>
                <div className="customer-detail-item">
                  <span className="customer-detail__label">Estimated Base Cost</span>
                  <span className="customer-detail__value">{currency(estimatedTotal)}</span>
                </div>
                <div className="customer-detail-item">
                  <span className="customer-detail__label">Chosen Slot</span>
                  <span className="customer-detail__value">
                    {form.bookingTime ? new Date(form.bookingTime).toLocaleString() : "Not selected"}
                  </span>
                </div>
                <div className="customer-detail-item">
                  <span className="customer-detail__label">Pickup / Drop</span>
                  <span className="customer-detail__value">
                    {form.pickupRequired ? "Required" : "Workshop visit"}
                  </span>
                </div>
              </div>

              <div className="customer-empty" style={{ marginTop: "1rem", textAlign: "left" }}>
                Booking confirmation will still pass backend checks for workshop hours, blackout rules, live slot capacity, and duplicate vehicle conflicts before it is saved.
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookService;
