import api from "./api";

export type CustomerProfile = {
    userId: number;
    fullName?: string;
    email?: string;
    phone?: string;
    address?: {
        addressLine1?: string;
        addressLine2?: string;
        city?: string;
        state?: string;
        country?: string;
        pincode?: string;
    };
};

export const getProfile = async (userId: number) => {
    return await api.get<CustomerProfile>(`/customer/${userId}`);
};

export const updateProfile = async (userId: number, data: any) => {
    const payload = {
        fullName: data.fullName,
        phone: data.phone,
        address: {
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2,
            city: data.city,
            state: data.state,
            country: data.country,
            pincode: data.pincode,
        },
    };
    return await api.put<CustomerProfile>(`/customer/profile/${userId}`, payload);
};
