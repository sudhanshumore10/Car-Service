import api from "./api";

export type ReportFilters = {
  startDate?: string;
  endDate?: string;
};

const withParams = (filters?: ReportFilters) => ({
  params: filters?.startDate || filters?.endDate ? filters : undefined,
});

export const getReportSummary = async (filters?: ReportFilters) =>
  api.get("/manager/reports/summary", withParams(filters));

export const getTopServices = async (filters?: ReportFilters) =>
  api.get("/manager/reports/top-services", withParams(filters));

export const getTechnicianProductivity = async (filters?: ReportFilters) =>
  api.get("/manager/reports/technician-productivity", withParams(filters));

export const getWorkOrderStatusDistribution = async (filters?: ReportFilters) =>
  api.get("/manager/reports/work-order-status", withParams(filters));

export const getRevenueByWorkshop = async (filters?: ReportFilters) =>
  api.get("/manager/reports/revenue-by-workshop", withParams(filters));

export const getPartsUsage = async (filters?: ReportFilters) =>
  api.get("/manager/reports/parts-usage", withParams(filters));

export const getBookingVolume = async (filters?: ReportFilters) =>
  api.get("/manager/reports/booking-volume", withParams(filters));
