import api from "./api";

export type SlotResponse = {
    startTime: string;
    endTime: string;
    capacity: number;
    used: number;
    available: number;
};

export type BookingResponse = {
    id: number;
    workshopId?: number;
    workshopName?: string;
    vehicleId?: number;
    vehicleDisplay?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehiclePlateNumber?: string;
    bookingTime?: string;
    endTime?: string;
    status: string;
    pickupRequired?: boolean;
    pickupTime?: string;
    dropTime?: string;
    pickupStatus?: string;
    dropStatus?: string;
    referenceNumber?: string;
    serviceNames?: string[];
    addonNames?: string[];
    workOrderId?: number;
    estimateStatus?: string;
    approvalStatus?: string;
    invoiceId?: number;
    invoiceReady?: boolean;
};

export type CreateBookingPayload = {
    userId: number;
    vehicleId: number;
    workshopId: number;
    bookingTime: string;
    serviceIds: number[];
    addonIds?: number[];
    pickupRequired?: boolean;
    pickupAddressId?: number;
    dropAddressId?: number;
    pickupTime?: string;
    dropTime?: string;
};

export type PickupRequestResponse = {
    id: number;
    bookingId: number;
    type: string;
    status: string;
    addressId?: number;
    scheduledTime?: string;
    completedTime?: string;
    partnerName?: string;
    partnerPhone?: string;
    proofUrl?: string;
    acknowledgementNote?: string;
    updatedAt?: string;
};

export const getCustomerBookings = async (userId: number | string) => {
    const response = await api.get<BookingResponse[]>("/customer/bookings", {
        params: { userId },
    });
    return response.data;
};

export const cancelBooking = async (bookingId: number | string, userId: number | string) => {
    const response = await api.put<BookingResponse>(`/customer/bookings/${bookingId}/cancel`, null, {
        params: { userId },
    });
    return response.data;
};

export const rescheduleBooking = async (
    bookingId: number | string,
    userId: number | string,
    newTime: string
) => {
    const response = await api.put<BookingResponse>(`/customer/bookings/${bookingId}/reschedule`, null, {
        params: { userId, newTime },
    });
    return response.data;
};

export const getWorkshopBookings = async (workshopId: number | string) => {
    const response = await api.get<BookingResponse[]>(`/customer/bookings/workshop/${workshopId}`);
    return response.data;
};

export const getAvailableSlots = async (
    workshopId: number | string,
    serviceIds: Array<number | string>,
    date: string
) => {
    const response = await api.get<SlotResponse[]>("/customer/scheduling/slots", {
        params: {
            workshopId,
            serviceIds: serviceIds.join(","),
            date,
        },
    });
    return response.data;
};

export const createBooking = async (payload: CreateBookingPayload) => {
    const response = await api.post<BookingResponse>("/customer/bookings/book", payload);
    return response.data;
};

export const getBookingPickups = async (bookingId: number | string, userId: number | string) => {
    const response = await api.get<PickupRequestResponse[]>(`/customer/bookings/${bookingId}/pickup`, {
        params: { userId },
    });
    return response.data;
};

export const cancelPickupRequest = async (pickupId: number | string, userId: number | string) => {
    const response = await api.put<PickupRequestResponse>(`/customer/bookings/pickup/${pickupId}/cancel`, null, {
        params: { userId },
    });
    return response.data;
};

export type UpdatePickupStatusPayload = {
    requestId: number;
    status: string;
    partnerName?: string;
    partnerPhone?: string;
    proofUrl?: string;
    acknowledgementNote?: string;
    scheduledTime?: string;
    completedTime?: string;
};

export const getOperationalPickupsByBooking = async (bookingId: number | string) => {
    const response = await api.get<PickupRequestResponse[]>(`/pickup/booking/${bookingId}`);
    return response.data;
};

export const updatePickupStatus = async (payload: UpdatePickupStatusPayload) => {
    const response = await api.put<PickupRequestResponse>("/pickup/status", payload);
    return response.data;
};
