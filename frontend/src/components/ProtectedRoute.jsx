import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        const decoded = jwtDecode(token);
        const userRole = decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

        if (allowedRoles && !allowedRoles.includes(userRole)) {
            // Redirect to their respective dashboard if they try to access a route they aren't allowed to
            return <Navigate to={userRole === 'Admin' ? '/admin-dashboard' : '/student-dashboard'} replace />;
        }
    } catch (e) {
        localStorage.removeItem('token');
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;