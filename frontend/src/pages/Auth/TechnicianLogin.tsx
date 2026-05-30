import AuthForm from "../../components/AuthForm/AuthForm";

const TechnicianLogin = () => {
    return (
        <div>
            <AuthForm
                title="Technician Login"
                subtitle="Handle service operations efficiently"
                userType="TECHNICIAN"
                redirectPath="/technician/dashboard" />
        </div>
    );
};

export default TechnicianLogin;
