import { useState } from "react";
import "./AuthForm.css";
import { validateAuth } from "../../utils/validation";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../../services/authService";
import toast from "react-hot-toast";
import custLogin from "../../assets/images/custLogin.svg"
type Props = {
    title: string;
    subtitle: string;
    userType: string;
    redirectPath: string;
    allowRegister?: boolean;
};

const AuthForm = ({ title, subtitle, userType, redirectPath, allowRegister = true }: Props) => {

    const [activeTab, setActiveTab] = useState("login");
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [contact, setContact] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [errors, setErrors] = useState<any>({});

    const resetForm = () => {
        setEmail("");
        setPassword("");
        setFullName("");
        setContact("");
        setErrors({});
    };

    const handleSubmit = async () => {
        if (submitting) return;
        const formData = { email, password, fullName, contact };
        const validationError = validateAuth(formData,
            activeTab === "register"
        );
        setErrors(validationError);
        if (Object.keys(validationError).length > 0) {
            return;
        }
        setSubmitting(true);
        try {
            if (activeTab === "register") {
                const res = await registerUser({
                    fullName: fullName,
                    email,
                    password,
                    phone: contact,
                    userType
                });

                if (res && res.status === 200) {
                    toast.success("Registration Successfull!!");
                    setActiveTab("login");
                    resetForm();
                } else {
                    toast.error("Registration failed!!");
                }
            } else {
                const res = await loginUser({
                    email,
                    password,
                    userType
                });
                if (res && res.status === 200) {
                    toast.success("Login Successfull!!");
                    localStorage.setItem("token", res.data.token);
                    localStorage.setItem("user", JSON.stringify({
                        id: res.data.userId ?? res.data.id ?? null,
                        userId: res.data.userId ?? res.data.id ?? null,
                        fullName: res.data.fullName || "",
                        phone: res.data.phoneNo || res.data.phone || "",
                        phoneNo: res.data.phoneNo || res.data.phone || "",
                        email: res.data.email || "",
                        role: res.data.role || userType,
                        userType: res.data.role || userType
                    }));
                    navigate(redirectPath);
                }


            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.errorMessage || "Something went wrong");
        } finally {
            setSubmitting(false);
        }

    };

    return (
        <div className="auth-page">
            <div className="auth-left">
                <div className="auth-card">
                    <h2 className="auth-title">{title}</h2>
                    <p className="auth-subtitle">{subtitle}</p>

                    <div className="auth-tabs">
                        <button className={activeTab === "login" ? "active" : ""}
                            onClick={() => { setActiveTab("login"); resetForm(); }}>Login</button>

                        {allowRegister && (
                            <button className={activeTab === "register" ? "active" : ""}
                                onClick={() => { setActiveTab("register"); resetForm(); }}>Register</button>
                        )}
                    </div>

                    {activeTab === "login" ? (
                        <>
                            <div className="row">
                                <label>Email</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
                                {errors.email && <p className="error">{errors.email}</p>}
                                <label>Password</label>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="*********" />
                                {errors.password && <p className="error">{errors.password}</p>}

                                <button className="auth-btn" onClick={handleSubmit} disabled={submitting}>
                                    {submitting ? "Signing In..." : "Sign In"}
                                </button>
                                {allowRegister && (
                                    <p className="auth-footer">Don't have an account?{" "}
                                        <span className="auth-link" onClick={() => { setActiveTab("register"); resetForm(); }}>Register now</span></p>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="row">
                                <label>Full Name</label>
                                <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your Name" />
                                {errors.fullName && <p className="error">{errors.fullName}</p>}

                                <label>Email</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
                                {errors.email && <p className="error">{errors.email}</p>}

                                <label>Password</label>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="*******" />
                                {errors.password && <p className="error">{errors.password}</p>}

                                <label>Contact Number</label>
                                <input type="tel" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="e.g. 9898675645" />
                                {errors.contact && <p className="error">{errors.contact}</p>}

                                <button className="auth-btn" onClick={handleSubmit} disabled={submitting}>
                                    {submitting ? "Creating..." : "Create Account"}
                                </button>
                                <p className="auth-footer">Already have an account?{" "}
                                    <span className="auth-link" onClick={() => { setActiveTab("login"); resetForm(); }}>Sign in</span></p>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="auth-right">
                <img src={custLogin} className="image-box" alt="Customer login illustration" />
            </div>
        </div>
    );
};

export default AuthForm;
