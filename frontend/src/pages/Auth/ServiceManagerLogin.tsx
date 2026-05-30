import AuthForm from "../../components/AuthForm/AuthForm";

const ServiceManagerLogin = () => {
    return (
        <div>
            <AuthForm title="Service Manager Login"
                subtitle="Manage services efficiently"
                userType="MANAGER"
                redirectPath="/manager/dashboard" />
        </div>
    );
};
export default ServiceManagerLogin;
