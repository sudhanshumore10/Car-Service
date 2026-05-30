import api from "./api";

export type AddressPayload = {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
};

export const createAddress = async (payload: AddressPayload) => {
  const response = await api.post<{ id: number }>("/customer/address", payload);
  return response.data;
};
