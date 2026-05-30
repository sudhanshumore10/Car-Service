import { errorMessages } from "./errorMessages";

type FormData={
    email:string;
    password:string;
    fullName?:string;
    contact?:string;
};

export const validateAuth=(data:FormData,isRegister:boolean)=>{
    let errors:any={};

    if(!data.email){
        errors.email=errorMessages.emailRequired;

    } else if(!/\S+@\S+.\S+/.test(data.email)){
        errors.email=errorMessages.emailInvalid;
    }

    if(!data.password){
        errors.password=errorMessages.passwordRequired;

    } else if(data.password.length<6){
        errors.password=errorMessages.passwordInvalid;
    }

    if(isRegister){
        const name=data.fullName?.trim();
        if(!name){
            errors.fullName=errorMessages.fullNameRequired;
        }
        else if(!/^[A-Za-z]+(\s[A-Za-z]+)+$/.test(name)){
            errors.fullName=errorMessages.fullNameInvalid;
        }

        const phone = String(data.contact).trim();
        if(!phone){
            errors.contact=errorMessages.contactRequired;

        } else if( !/^[6789][0-9]{9}$/.test(phone)){
            errors.contact=errorMessages.contactInvalid;
        }
    }
    return errors;
};

export const validateProfile = (data:any)=>{
    let errors:any={};

    if(!/^[A-Z][a-z]+ [A-Z][a-z]+$/.test(data.name))
        errors.name="Invalid full name";

    if(!/^[6-9]\d{9}$/.test(data.contact))
        errors.contact="Invalid contact";

    if(!data.address)
        errors.address="Address required";

    return errors;
};

export const validateVehicle = (data:any)=>{
    let errors:any={};

    if(!data.make) errors.make="Required";
    if(!data.model) errors.model="Required";
    if(!data.year || data.year < 1990) errors.year="Invalid year";
    if(!data.vin) errors.vin ="Required";
    if(!data.plateNumber) errors.plateNumber="Required";

    if(!data.docType) errors.docType="Select document type";
    if(!data.fileUrl) errors.fileUrl="Upload document";

    // const vehicles = JSON.parse(localStorage.getItem("vehicles") || "[]");

    // if(vehicles.some((v:any)=>v.vin === data.vin))
    //     errors.vin="VIN must be unique";

    // if(vehicles.some((v:any)=>v.plate===data.plate))
    //     errors.plate="Plate must be unique";

    return errors;
};