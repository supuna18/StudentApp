import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    // Check if there's a token in local storage
    const token = localStorage.getItem('token');

    // If there's no token, redirect to login page
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // If there's a token, allow access to the protected route
    return children;
};

export default ProtectedRoute;