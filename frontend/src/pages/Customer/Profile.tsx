import { useState } from "react";
import CustomerNavbar from "../../components/CustomerNavbar/CustomerNavbar";

import {validateProfile} from "../../utils/validation";
import toast from "react-hot-toast";

const Profile = () => {
    const storedUser = JSON.parse(localStorage.getItem("user")||"{}");
    const[form,setForm] = useState({
        name: storedUser.name||"",
        contact: storedUser.contact||"",
        address: storedUser.address||""
    });
    const [errors,setErrors] = useState<any>({});
    const handleChange = (e:any) =>{
        setForm({...form,[e.target.name]:e.target.value});
    };

    const handleSubmit =() => {
        const err = validateProfile(form);
        setErrors(err);

        if(Object.keys(err).length===0){
            localStorage.setItem("user",JSON.stringify(form));
            toast.success("Profile Upadate");
        }
    };

    return(
        <>
        <CustomerNavbar/>
        <div className="form-conatiner"><h2>Manage Profile</h2>
        <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange}>
        </input>
        <p className="error">{errors.name}</p>

        <input name="contact" placeholder="Contact Number" value={form.contact} onChange={handleChange}>
        </input>
        <p className="error">{errors.contact}</p>

        <input name="address" placeholder="Address" value={form.address} onChange={handleChange}>
        </input>
        <p className="error">{errors.address}</p>

        <button onClick={handleSubmit}>Save Changes</button>
        
        </div>
        </>
    );
};

export default Profile;
