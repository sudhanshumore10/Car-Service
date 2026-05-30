import { Navigate } from "react-router-dom";

type ProtectedRouteProps = {
    children: JSX.Element;
    allowedRoles?: string[];
};

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const rawUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!rawUser || !token) {
        return <Navigate to="/" replace />;
    }

    const user = JSON.parse(rawUser);
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user?.userType)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
