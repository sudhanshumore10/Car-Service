import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "../Sidebar/Sidebar";
import "../SMDashboard/ServiceManager.css";
import {
  AddonCatalogItem,
  CatalogOverviewResponse,
  ServiceCatalogItem,
  ServicePackageCatalogItem,
  createCatalogAddon,
  createCatalogPackage,
  createCatalogService,
  getManagerCatalogOverview,
  updateCatalogAddon,
  updateCatalogAddonActive,
  updateCatalogPackage,
  updateCatalogPackageActive,
  updateCatalogService,
  updateCatalogServiceActive,
} from "../../../services/serviceCatalogService";

const emptyServiceForm: ServiceCatalogItem = {
  id: 0,
  name: "",
  description: "",
  durationMinutes: 0,
  bufferMinutes: 0,
  basePrice: 0,
  active: true,
  category: "General",
  tags: "",
  whatIncluded: "",
  taxPercent: 18,
  discount: 0,
};

const emptyPackageForm: ServicePackageCatalogItem = {
  id: 0,
  name: "",
  description: "",
  price: 0,
  active: true,
  category: "General",
  taxPercent: 18,
  discount: 0,
  serviceIds: [],
  serviceNames: [],
};

const emptyAddonForm: AddonCatalogItem = {
  id: 0,
  name: "",
  price: 0,
  description: "",
  active: true,
  durationMinutes: 0,
  excludedAddonIds: [],
  excludedAddonNames: [],
};

const currency = (value?: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const dateTime = (value?: string) => (value ? new Date(value).toLocaleString() : "NA");

const ServiceCatalog = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState<CatalogOverviewResponse>({
    services: [],
    packages: [],
    addOns: [],
    priceHistory: [],
  });
  const [serviceForm, setServiceForm] = useState<ServiceCatalogItem>(emptyServiceForm);
  const [packageForm, setPackageForm] = useState<ServicePackageCatalogItem>(emptyPackageForm);
  const [addonForm, setAddonForm] = useState<AddonCatalogItem>(emptyAddonForm);

  const loadCatalog = async () => {
    try {
      setLoading(true);
      setCatalog(await getManagerCatalogOverview());
    } catch (error: any) {
      toast.error(error.response?.data?.errorMessage || "Failed to load catalog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const filteredServices = useMemo(() => {
    const nextQuery = query.trim().toLowerCase();
    if (!nextQuery) return catalog.services;
    return catalog.services.filter((item) =>
      [item.name, item.description, item.category, item.tags, item.whatIncluded]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(nextQuery)
    );
  }, [catalog.services, query]);

  const filteredPackages = useMemo(() => {
    const nextQuery = query.trim().toLowerCase();
    if (!nextQuery) return catalog.packages;
    return catalog.packages.filter((item) =>
      [item.name, item.description, item.category, ...(item.serviceNames || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(nextQuery)
    );
  }, [catalog.packages, query]);

  const filteredAddOns = useMemo(() => {
    const nextQuery = query.trim().toLowerCase();
    if (!nextQuery) return catalog.addOns;
    return catalog.addOns.filter((item) =>
      [item.name, item.description, ...(item.excludedAddonNames || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(nextQuery)
    );
  }, [catalog.addOns, query]);

  const resetServiceForm = () => setServiceForm(emptyServiceForm);
  const resetPackageForm = () => setPackageForm(emptyPackageForm);
  const resetAddonForm = () => setAddonForm(emptyAddonForm);

  const handleServiceSave = async () => {
    if (!serviceForm.name?.trim()) {
      toast.error("Service name is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...serviceForm,
        durationMinutes: Number(serviceForm.durationMinutes || 0),
        bufferMinutes: Number(serviceForm.bufferMinutes || 0),
        basePrice: Number(serviceForm.basePrice || 0),
        taxPercent: Number(serviceForm.taxPercent || 0),
        discount: Number(serviceForm.discount || 0),
      };
      if (serviceForm.id) {
        await updateCatalogService(serviceForm.id, payload);
      } else {
        await createCatalogService(payload);
      }
      await loadCatalog();
      resetServiceForm();
      toast.success(serviceForm.id ? "Service updated" : "Service created");
    } catch (error: any) {
      toast.error(error.response?.data?.errorMessage || "Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  const handlePackageSave = async () => {
    if (!packageForm.name?.trim()) {
      toast.error("Package name is required");
      return;
    }
    if (!packageForm.serviceIds?.length) {
      toast.error("Choose at least one service for the package");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...packageForm,
        price: Number(packageForm.price || 0),
        taxPercent: Number(packageForm.taxPercent || 0),
        discount: Number(packageForm.discount || 0),
      };
      if (packageForm.id) {
        await updateCatalogPackage(packageForm.id, payload);
      } else {
        await createCatalogPackage(payload);
      }
      await loadCatalog();
      resetPackageForm();
      toast.success(packageForm.id ? "Package updated" : "Package created");
    } catch (error: any) {
      toast.error(error.response?.data?.errorMessage || "Failed to save package");
    } finally {
      setSaving(false);
    }
  };

  const handleAddonSave = async () => {
    if (!addonForm.name?.trim()) {
      toast.error("Add-on name is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...addonForm,
        price: Number(addonForm.price || 0),
        durationMinutes: Number(addonForm.durationMinutes || 0),
      };
      if (addonForm.id) {
        await updateCatalogAddon(addonForm.id, payload);
      } else {
        await createCatalogAddon(payload);
      }
      await loadCatalog();
      resetAddonForm();
      toast.success(addonForm.id ? "Add-on updated" : "Add-on created");
    } catch (error: any) {
      toast.error(error.response?.data?.errorMessage || "Failed to save add-on");
    } finally {
      setSaving(false);
    }
  };

  const togglePackageService = (serviceId: number) => {
    setPackageForm((current) => ({
      ...current,
      serviceIds: current.serviceIds?.includes(serviceId)
        ? current.serviceIds.filter((id) => id !== serviceId)
        : [...(current.serviceIds || []), serviceId],
    }));
  };

  const toggleAddonExclusion = (addonId: number) => {
    setAddonForm((current) => ({
      ...current,
      excludedAddonIds: current.excludedAddonIds?.includes(addonId)
        ? current.excludedAddonIds.filter((id) => id !== addonId)
        : [...(current.excludedAddonIds || []), addonId],
    }));
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
              <h2>Service Catalog Workbench</h2>
              <p>Manage services, packages, add-ons, exclusions, and pricing history from one place.</p>
            </div>
            <div style={{ minWidth: "260px" }}>
              <input
                className="form-control"
                placeholder="Search services, packages, add-ons..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="customer-empty">Loading catalog...</div>
          ) : (
            <>
              <div className="bottom-grid">
                <div className="main-card">
                  <h3 style={{ marginBottom: "1rem" }}>{serviceForm.id ? `Edit Service #${serviceForm.id}` : "Add Service"}</h3>
                  <div className="customer-form-grid">
                    <label className="customer-form-field">
                      <span>Name</span>
                      <input value={serviceForm.name || ""} onChange={(e) => setServiceForm((current) => ({ ...current, name: e.target.value }))} />
                    </label>
                    <label className="customer-form-field">
                      <span>Category</span>
                      <input value={serviceForm.category || ""} onChange={(e) => setServiceForm((current) => ({ ...current, category: e.target.value }))} />
                    </label>
                    <label className="customer-form-field">
                      <span>Base Price</span>
                      <input type="number" value={serviceForm.basePrice || 0} onChange={(e) => setServiceForm((current) => ({ ...current, basePrice: Number(e.target.value) }))} />
                    </label>
                    <label className="customer-form-field">
                      <span>Tax %</span>
                      <input type="number" value={serviceForm.taxPercent || 0} onChange={(e) => setServiceForm((current) => ({ ...current, taxPercent: Number(e.target.value) }))} />
                    </label>
                    <label className="customer-form-field">
                      <span>Discount</span>
                      <input type="number" value={serviceForm.discount || 0} onChange={(e) => setServiceForm((current) => ({ ...current, discount: Number(e.target.value) }))} />
                    </label>
                    <label className="customer-form-field">
                      <span>Tags</span>
                      <input value={serviceForm.tags || ""} onChange={(e) => setServiceForm((current) => ({ ...current, tags: e.target.value }))} />
                    </label>
                    <label className="customer-form-field">
                      <span>Duration (mins)</span>
                      <input type="number" value={serviceForm.durationMinutes || 0} onChange={(e) => setServiceForm((current) => ({ ...current, durationMinutes: Number(e.target.value) }))} />
                    </label>
                    <label className="customer-form-field">
                      <span>Buffer (mins)</span>
                      <input type="number" value={serviceForm.bufferMinutes || 0} onChange={(e) => setServiceForm((current) => ({ ...current, bufferMinutes: Number(e.target.value) }))} />
                    </label>
                  </div>
                  <label className="customer-form-field" style={{ marginTop: "1rem" }}>
                    <span>Description</span>
                    <textarea className="form-control" rows={3} value={serviceForm.description || ""} onChange={(e) => setServiceForm((current) => ({ ...current, description: e.target.value }))} />
                  </label>
                  <label className="customer-form-field" style={{ marginTop: "1rem" }}>
                    <span>What's Included</span>
                    <textarea className="form-control" rows={3} value={serviceForm.whatIncluded || ""} onChange={(e) => setServiceForm((current) => ({ ...current, whatIncluded: e.target.value }))} />
                  </label>
                  <label className="customer-checkbox" style={{ marginTop: "1rem" }}>
                    <input type="checkbox" checked={Boolean(serviceForm.active)} onChange={(e) => setServiceForm((current) => ({ ...current, active: e.target.checked }))} />
                    <span>Visible in booking catalog</span>
                  </label>
                  <div style={{ display: "flex", gap: "0.85rem", marginTop: "1.25rem" }}>
                    <button type="button" className="customer-button-primary" onClick={handleServiceSave} disabled={saving}>
                      {saving ? "Saving..." : serviceForm.id ? "Update Service" : "Create Service"}
                    </button>
                    <button type="button" className="customer-button-secondary" onClick={resetServiceForm}>
                      Clear
                    </button>
                  </div>
                </div>

                <div className="main-card">
                  <div className="customer-section-head">
                    <div>
                      <h3>Services</h3>
                      <p>Customer-bookable services with pricing metadata and what's included.</p>
                    </div>
                  </div>
                  <div style={{ display: "grid", gap: "0.85rem", maxHeight: "740px", overflow: "auto", paddingRight: "6px" }}>
                    {filteredServices.map((service) => (
                      <div key={service.id} className="info-card" style={{ textAlign: "left" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "start" }}>
                          <div>
                            <p className="label">{service.name}</p>
                            <p className="sub-label">{service.description || "No description provided."}</p>
                          </div>
                          <span className={`status-pill ${service.active ? "status-confirmed" : "status-cancelled"}`}>
                            {service.active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="bottom-grid" style={{ marginTop: "0.85rem" }}>
                          <div><h4>Category</h4><p>{service.category || "General"}</p></div>
                          <div><h4>Duration</h4><p>{service.durationMinutes || 0} mins</p></div>
                          <div><h4>Buffer</h4><p>{service.bufferMinutes || 0} mins</p></div>
                          <div><h4>Base Price</h4><p>{currency(Number(service.basePrice || 0))}</p></div>
                          <div><h4>Tax</h4><p>{service.taxPercent || 0}%</p></div>
                          <div><h4>Discount</h4><p>{currency(Number(service.discount || 0))}</p></div>
                        </div>
                        {(service.tags || service.whatIncluded) && (
                          <p className="sub-label" style={{ marginTop: "0.7rem" }}>
                            {[service.tags, service.whatIncluded].filter(Boolean).join(" • ")}
                          </p>
                        )}
                        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.95rem" }}>
                          <button type="button" className="customer-button-secondary" onClick={() => setServiceForm(service)}>
                            Edit
                          </button>
                          <button type="button" className="customer-button-secondary" onClick={() => updateCatalogServiceActive(service.id, !service.active).then(loadCatalog).catch((error: any) => toast.error(error.response?.data?.errorMessage || "Failed to update service status"))}>
                            {service.active ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bottom-grid" style={{ marginTop: "1.4rem" }}>
                <div className="main-card">
                  <h3 style={{ marginBottom: "1rem" }}>{packageForm.id ? `Edit Package #${packageForm.id}` : "Add Service Package"}</h3>
                  <div className="customer-form-grid">
                    <label className="customer-form-field">
                      <span>Name</span>
                      <input value={packageForm.name || ""} onChange={(e) => setPackageForm((current) => ({ ...current, name: e.target.value }))} />
                    </label>
                    <label className="customer-form-field">
                      <span>Category</span>
                      <input value={packageForm.category || ""} onChange={(e) => setPackageForm((current) => ({ ...current, category: e.target.value }))} />
                    </label>
                    <label className="customer-form-field">
                      <span>Package Price</span>
                      <input type="number" value={packageForm.price || 0} onChange={(e) => setPackageForm((current) => ({ ...current, price: Number(e.target.value) }))} />
                    </label>
                    <label className="customer-form-field">
                      <span>Tax %</span>
                      <input type="number" value={packageForm.taxPercent || 0} onChange={(e) => setPackageForm((current) => ({ ...current, taxPercent: Number(e.target.value) }))} />
                    </label>
                    <label className="customer-form-field">
                      <span>Discount</span>
                      <input type="number" value={packageForm.discount || 0} onChange={(e) => setPackageForm((current) => ({ ...current, discount: Number(e.target.value) }))} />
                    </label>
                    <label className="customer-checkbox" style={{ alignSelf: "end" }}>
                      <input type="checkbox" checked={Boolean(packageForm.active)} onChange={(e) => setPackageForm((current) => ({ ...current, active: e.target.checked }))} />
                      <span>Active package</span>
                    </label>
                  </div>
                  <label className="customer-form-field" style={{ marginTop: "1rem" }}>
                    <span>Description</span>
                    <textarea className="form-control" rows={3} value={packageForm.description || ""} onChange={(e) => setPackageForm((current) => ({ ...current, description: e.target.value }))} />
                  </label>
                  <div className="customer-form-field" style={{ marginTop: "1rem" }}>
                    <span>Package Services</span>
                    <div className="customer-service-picker" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                      {catalog.services.map((service) => (
                        <label key={service.id} className={`customer-service-option${packageForm.serviceIds?.includes(service.id) ? " selected" : ""}`}>
                          <div className="customer-service-option__toggle">
                            <input
                              type="checkbox"
                              checked={packageForm.serviceIds?.includes(service.id) || false}
                              onChange={() => togglePackageService(service.id)}
                            />
                          </div>
                          <div className="customer-service-option__copy">
                            <h3>{service.name}</h3>
                            <p>{service.category || "General"} • {currency(Number(service.basePrice || 0))}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.85rem", marginTop: "1.25rem" }}>
                    <button type="button" className="customer-button-primary" onClick={handlePackageSave} disabled={saving}>
                      {saving ? "Saving..." : packageForm.id ? "Update Package" : "Create Package"}
                    </button>
                    <button type="button" className="customer-button-secondary" onClick={resetPackageForm}>Clear</button>
                  </div>
                </div>

                <div className="main-card">
                  <div className="customer-section-head">
                    <div>
                      <h3>Packages</h3>
                      <p>Bundled services with customer-facing pricing and activation controls.</p>
                    </div>
                  </div>
                  <div style={{ display: "grid", gap: "0.85rem", maxHeight: "740px", overflow: "auto", paddingRight: "6px" }}>
                    {filteredPackages.map((item) => (
                      <div key={item.id} className="info-card" style={{ textAlign: "left" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "start" }}>
                          <div>
                            <p className="label">{item.name}</p>
                            <p className="sub-label">{item.description || "No description provided."}</p>
                          </div>
                          <span className={`status-pill ${item.active ? "status-confirmed" : "status-cancelled"}`}>
                            {item.active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="bottom-grid" style={{ marginTop: "0.85rem" }}>
                          <div><h4>Price</h4><p>{currency(Number(item.price || 0))}</p></div>
                          <div><h4>Category</h4><p>{item.category || "General"}</p></div>
                          <div><h4>Tax</h4><p>{item.taxPercent || 0}%</p></div>
                          <div><h4>Discount</h4><p>{currency(Number(item.discount || 0))}</p></div>
                        </div>
                        <p className="sub-label" style={{ marginTop: "0.7rem" }}>{item.serviceNames?.join(", ") || "No service mapping"}</p>
                        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.95rem" }}>
                          <button type="button" className="customer-button-secondary" onClick={() => setPackageForm(item)}>
                            Edit
                          </button>
                          <button type="button" className="customer-button-secondary" onClick={() => updateCatalogPackageActive(item.id, !item.active).then(loadCatalog).catch((error: any) => toast.error(error.response?.data?.errorMessage || "Failed to update package status"))}>
                            {item.active ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bottom-grid" style={{ marginTop: "1.4rem" }}>
                <div className="main-card">
                  <h3 style={{ marginBottom: "1rem" }}>{addonForm.id ? `Edit Add-on #${addonForm.id}` : "Add Add-on"}</h3>
                  <div className="customer-form-grid">
                    <label className="customer-form-field">
                      <span>Name</span>
                      <input value={addonForm.name || ""} onChange={(e) => setAddonForm((current) => ({ ...current, name: e.target.value }))} />
                    </label>
                    <label className="customer-form-field">
                      <span>Price</span>
                      <input type="number" value={addonForm.price || 0} onChange={(e) => setAddonForm((current) => ({ ...current, price: Number(e.target.value) }))} />
                    </label>
                    <label className="customer-form-field">
                      <span>Duration (mins)</span>
                      <input type="number" value={addonForm.durationMinutes || 0} onChange={(e) => setAddonForm((current) => ({ ...current, durationMinutes: Number(e.target.value) }))} />
                    </label>
                    <label className="customer-checkbox" style={{ alignSelf: "end" }}>
                      <input type="checkbox" checked={Boolean(addonForm.active)} onChange={(e) => setAddonForm((current) => ({ ...current, active: e.target.checked }))} />
                      <span>Active add-on</span>
                    </label>
                  </div>
                  <label className="customer-form-field" style={{ marginTop: "1rem" }}>
                    <span>Description</span>
                    <textarea className="form-control" rows={3} value={addonForm.description || ""} onChange={(e) => setAddonForm((current) => ({ ...current, description: e.target.value }))} />
                  </label>
                  <div className="customer-form-field" style={{ marginTop: "1rem" }}>
                    <span>Excluded Add-ons</span>
                    <div className="customer-service-picker" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                      {catalog.addOns
                        .filter((item) => item.id !== addonForm.id)
                        .map((item) => (
                          <label key={item.id} className={`customer-service-option${addonForm.excludedAddonIds?.includes(item.id) ? " selected" : ""}`}>
                            <div className="customer-service-option__toggle">
                              <input
                                type="checkbox"
                                checked={addonForm.excludedAddonIds?.includes(item.id) || false}
                                onChange={() => toggleAddonExclusion(item.id)}
                              />
                            </div>
                            <div className="customer-service-option__copy">
                              <h3>{item.name}</h3>
                              <p>{currency(Number(item.price || 0))}</p>
                            </div>
                          </label>
                        ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.85rem", marginTop: "1.25rem" }}>
                    <button type="button" className="customer-button-primary" onClick={handleAddonSave} disabled={saving}>
                      {saving ? "Saving..." : addonForm.id ? "Update Add-on" : "Create Add-on"}
                    </button>
                    <button type="button" className="customer-button-secondary" onClick={resetAddonForm}>Clear</button>
                  </div>
                </div>

                <div className="main-card">
                  <div className="customer-section-head">
                    <div>
                      <h3>Add-ons</h3>
                      <p>Optional upsell items with substitution and exclusion support.</p>
                    </div>
                  </div>
                  <div style={{ display: "grid", gap: "0.85rem", maxHeight: "740px", overflow: "auto", paddingRight: "6px" }}>
                    {filteredAddOns.map((item) => (
                      <div key={item.id} className="info-card" style={{ textAlign: "left" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "start" }}>
                          <div>
                            <p className="label">{item.name}</p>
                            <p className="sub-label">{item.description || "No description provided."}</p>
                          </div>
                          <span className={`status-pill ${item.active ? "status-confirmed" : "status-cancelled"}`}>
                            {item.active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="bottom-grid" style={{ marginTop: "0.85rem" }}>
                          <div><h4>Price</h4><p>{currency(Number(item.price || 0))}</p></div>
                          <div><h4>Duration</h4><p>{item.durationMinutes || 0} mins</p></div>
                        </div>
                        {item.excludedAddonNames && item.excludedAddonNames.length > 0 && (
                          <p className="sub-label" style={{ marginTop: "0.7rem" }}>Excludes: {item.excludedAddonNames.join(", ")}</p>
                        )}
                        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.95rem" }}>
                          <button type="button" className="customer-button-secondary" onClick={() => setAddonForm(item)}>
                            Edit
                          </button>
                          <button type="button" className="customer-button-secondary" onClick={() => updateCatalogAddonActive(item.id, !item.active).then(loadCatalog).catch((error: any) => toast.error(error.response?.data?.errorMessage || "Failed to update add-on status"))}>
                            {item.active ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="main-card" style={{ marginTop: "1.4rem" }}>
                <div className="customer-section-head">
                  <div>
                    <h3>Price History</h3>
                    <p>Versioning trail for service price changes.</p>
                  </div>
                </div>
                {catalog.priceHistory.length === 0 ? (
                  <div className="customer-empty">No price changes recorded yet.</div>
                ) : (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Service</th>
                          <th>Old Price</th>
                          <th>New Price</th>
                          <th>Changed At</th>
                          <th>Changed By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {catalog.priceHistory.map((entry) => (
                          <tr key={entry.id}>
                            <td>{entry.serviceName}</td>
                            <td>{currency(Number(entry.oldPrice || 0))}</td>
                            <td>{currency(Number(entry.newPrice || 0))}</td>
                            <td>{dateTime(entry.changedAt)}</td>
                            <td>{entry.changedBy || "SYSTEM"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCatalog;
