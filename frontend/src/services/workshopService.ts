import api from "./api";


const formatToLocalDateTime = (time: any) => {
    const today = new Date().toISOString().split("T")[0];
    return `${today}T${time}:00`;
}


export const addWorkshop = async (userId: number, form: any) => {

    const payload = {
        userId: userId,
        name: form.name,
        address: {
            addressLine1: form.addressLine1,
            addressLine2: form.addressLine2,
            city: form.city,
            state: form.state,
            country: form.country,
            pincode: form.pincode,
        },
        openTime: formatToLocalDateTime(form.openTime),
        closeTime: formatToLocalDateTime(form.closeTime),
        serviceableBrands: form.brands.join(","),
    };
    console.log(payload);
    return await api.post('/manager/workshop/addWorkshop', payload);
}


export const getWorkshops = async () => {
    return await api.get('/customer/workshops');
}

export const getWorkshopsByManager = async (userId: any) => {
    return await api.get(`/manager/workshop/manager/${userId}`);
}

export const getAllManagerWorkshops = async () => {
    return await api.get("/manager/workshop");
}

export const getManagerScopedWorkshops = async (userId: any) => {
    try {
        const allResponse = await getAllManagerWorkshops();
        const allWorkshops = allResponse.data || [];
        if (allWorkshops.length > 0) {
            return allWorkshops;
        }
    } catch (error) {
        console.warn("Manager workshop listing fallback failed, trying manager-specific lookup", error);
    }

    if (userId) {
        try {
            const managerResponse = await getWorkshopsByManager(userId);
            const managerWorkshops = managerResponse.data || [];
            if (managerWorkshops.length > 0) {
                return managerWorkshops;
            }
        } catch (error) {
            console.warn("Manager-specific workshop lookup failed, falling back to all workshops", error);
        }
    }

    try {
        const allResponse = await getAllManagerWorkshops();
        return allResponse.data || [];
    } catch (error) {
        console.warn("Workshop fallback lookup failed", error);
        return [];
    }
}

