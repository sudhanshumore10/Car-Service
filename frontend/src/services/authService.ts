import api from "./api";

export const registerUser = async(data:any)=>{
    console.log(data);
    return await api.post("/auth/register",data);
};

export const loginUser = async (data:any)=>{
    console.log(data);
    return await api.post("/auth/login",data);
};
