import api from "./api";

export type ServiceCatalogItem = {
  id: number;
  name: string;
  description?: string;
  durationMinutes?: number;
  bufferMinutes?: number;
  basePrice?: number;
  active?: boolean;
  category?: string;
  tags?: string;
  whatIncluded?: string;
  taxPercent?: number;
  discount?: number;
};

export type ServicePackageCatalogItem = {
  id: number;
  name: string;
  description?: string;
  price?: number;
  active?: boolean;
  category?: string;
  taxPercent?: number;
  discount?: number;
  serviceIds?: number[];
  serviceNames?: string[];
};

export type AddonCatalogItem = {
  id: number;
  name: string;
  price?: number;
  description?: string;
  active?: boolean;
  durationMinutes?: number;
  excludedAddonIds?: number[];
  excludedAddonNames?: string[];
};

export type ServicePriceHistoryEntry = {
  id: number;
  serviceId: number;
  serviceName: string;
  oldPrice?: number;
  newPrice?: number;
  changedAt?: string;
  changedBy?: string;
};

export type CatalogOverviewResponse = {
  services: ServiceCatalogItem[];
  packages: ServicePackageCatalogItem[];
  addOns: AddonCatalogItem[];
  priceHistory: ServicePriceHistoryEntry[];
};

export const getCatalogServices = async () => {
  const response = await api.get<ServiceCatalogItem[]>("/catalog/services");
  return response.data;
};

export const getCatalogPackages = async () => {
  const response = await api.get<ServicePackageCatalogItem[]>("/catalog/packages");
  return response.data;
};

export const getCatalogAddOns = async () => {
  const response = await api.get<AddonCatalogItem[]>("/catalog/addons");
  return response.data;
};

export const getManagerCatalogServices = async () => {
  const response = await api.get<ServiceCatalogItem[]>("/manager/catalog/services");
  return response.data;
};

export const getManagerCatalogOverview = async () => {
  const response = await api.get<CatalogOverviewResponse>("/manager/catalog/overview");
  return response.data;
};

export const createCatalogService = async (payload: Omit<ServiceCatalogItem, "id">) => {
  const response = await api.post<ServiceCatalogItem>("/manager/catalog/services", payload);
  return response.data;
};

export const updateCatalogService = async (
  id: number,
  payload: Omit<ServiceCatalogItem, "id">
) => {
  const response = await api.put<ServiceCatalogItem>(`/manager/catalog/services/${id}`, payload);
  return response.data;
};

export const updateCatalogServiceActive = async (id: number, active: boolean) => {
  const response = await api.patch<ServiceCatalogItem>(`/manager/catalog/services/${id}/active`, { active });
  return response.data;
};

export const createCatalogPackage = async (payload: Omit<ServicePackageCatalogItem, "id">) => {
  const response = await api.post<ServicePackageCatalogItem>("/manager/catalog/packages", payload);
  return response.data;
};

export const updateCatalogPackage = async (
  id: number,
  payload: Omit<ServicePackageCatalogItem, "id">
) => {
  const response = await api.put<ServicePackageCatalogItem>(`/manager/catalog/packages/${id}`, payload);
  return response.data;
};

export const updateCatalogPackageActive = async (id: number, active: boolean) => {
  const response = await api.patch<ServicePackageCatalogItem>(`/manager/catalog/packages/${id}/active`, { active });
  return response.data;
};

export const createCatalogAddon = async (payload: Omit<AddonCatalogItem, "id">) => {
  const response = await api.post<AddonCatalogItem>("/manager/catalog/addons", payload);
  return response.data;
};

export const updateCatalogAddon = async (
  id: number,
  payload: Omit<AddonCatalogItem, "id">
) => {
  const response = await api.put<AddonCatalogItem>(`/manager/catalog/addons/${id}`, payload);
  return response.data;
};

export const updateCatalogAddonActive = async (id: number, active: boolean) => {
  const response = await api.patch<AddonCatalogItem>(`/manager/catalog/addons/${id}/active`, { active });
  return response.data;
};
