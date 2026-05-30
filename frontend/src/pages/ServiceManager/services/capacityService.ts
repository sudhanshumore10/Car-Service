import api from "../../../api";

// ----------------Workshop

export const updateWorkshop = (id: number, payload: any) =>
  api.put(`/manager/workshop/${id}`, payload);

// ─── Capacity Rules ────────────────────────────────────────────────────────────

export const getCapacityRules = async (workshopId: number) => {
  const res = await api.get(`/slot-capacity-rules/${workshopId}`);
  return res.data;
}

export const addCapacityRule = async (rule: {
  workshopId: number;
  startTime: string;
  endTime: string;
  maxCapacity: number;
}) => {
  const res = await api.post(`/slot-capacity-rules`, rule);
  return res.data;
}

export const deleteCapacityRule = (id: number) =>
  api.delete(`/slot-capacity-rules/${id}`);

// ─── Service Bays ──────────────────────────────────────────────────────────────

export const getServiceBays = (workshopId: number) =>
  api.get(`/manager/bays/${workshopId}`);

export const addServiceBay = (bay: { workshopId: number; bayName: string }) =>
  api.post(`/manager/bays`, bay);

export const deleteServiceBay = (id: number) =>
  api.delete(`/manager/bays/${id}`);

// ─── Technician Shifts ─────────────────────────────────────────────────────────

export const getTechniciansByWorkshop = (workshopId: number) =>
  api.get(`/manager/technicians/workshop/${workshopId}`);

export const getAllTechnicians = () =>
  api.get(`/manager/technicians`);

export const getShiftsByWorkshop = (workshopId: number) =>
  api.get(`/manager/shifts/workshop/${workshopId}`);

export const addShift = (shift: {
  technicianId: number;
  shiftStart: string;
  shiftEnd: string;
}) => {
  const toTimeOnly = (value: string) => {

    if (/^\d{2}:\d{2}$/.test(value)) {
      return value + ':00';
    }


    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toTimeString().slice(0, 8);
    }
    throw new Error('Invalid time format: ' + value);
  };

  return api.post('/manager/shifts', {
    technicianId: shift.technicianId,
    shiftStart: toTimeOnly(shift.shiftStart),
    shiftEnd: toTimeOnly(shift.shiftEnd),
  });
};

export const deleteShift = (id: number) =>
  api.delete(`/manager/shifts/${id}`);

// ─── Blackout Dates ────────────────────────────────────────────────────────────

export const getBlackouts = (workshopId: number) =>
  api.get(`/manager/blackouts/${workshopId}`);

export const addBlackout = (blackout: {
  workshopId: number;
  date: string;
  reason: string;
}) => api.post(`/manager/blackouts`, blackout);

export const deleteBlackout = (id: number) =>
  api.delete(`/manager/blackouts/${id}`);

// ─── Heatmap (bookings per slot) ───────────────────────────────────────────────

export const getHeatmap = (workshopId: number, date: string) =>
  api.get(`/manager/heatmap/${workshopId}?date=${date}`);
