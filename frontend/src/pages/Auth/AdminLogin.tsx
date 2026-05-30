import AuthForm from "../../components/AuthForm/AuthForm";

const AdminLogin = () => {
    return (
        <AuthForm
            title="CarService Admin"
            subtitle="Administrative access for user, audit, and notification control."
            userType="ADMIN"
            redirectPath="/admin/console"
            allowRegister={false}
        />
    );
};

export default AdminLogin;
