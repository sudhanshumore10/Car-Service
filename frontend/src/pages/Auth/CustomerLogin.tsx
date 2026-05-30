import AuthForm from "../../components/AuthForm/AuthForm";

const CustomerLogin = () => {
    return (
        <div>
            <AuthForm title="Welcome to CarService"
                subtitle="Drive in. We take care of the rest."
                userType="CUSTOMER"
                redirectPath="/customer/dashboard" />
        </div>
    );
};
export default CustomerLogin;