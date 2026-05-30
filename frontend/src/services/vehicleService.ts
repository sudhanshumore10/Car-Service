import api from "./api";

export type VehicleRecord = {
    vehicleId: number;
    customerId?: number;
    make?: string;
    model?: string;
    year?: number;
    vin?: string;
    plateNumber?: string;
    isActive?: boolean;
    vehicleDocument?: {
        docType?: string;
        fileUrl?: string;
    };
};

export const addVehicle = async (userId: number, data: any) => {
    const payload = {
        ...data,
        userId,
        document: {
            docType: data.docType,
            fileUrl: data.fileUrl.split(",")[0],
        },
    };
    return await api.post("/vehicle/addVehicle", payload);
};

export const getVehicles = async (userId: number) => {
    return await api.get<VehicleRecord[]>(`/vehicle/customer/${userId}`);
};

export const updateVehicleStatus = async (
    vehicleId: number,
    userId: number,
    active: boolean
) => {
    return await api.put<VehicleRecord>(`/vehicle/${vehicleId}/status`, null, {
        params: { userId, active },
    });
};
