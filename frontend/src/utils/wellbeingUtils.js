import { jwtDecode } from 'jwt-decode';

export const getUserId = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    // Standard and .NET Core claim names for User ID
    return decoded.nameid || 
           decoded.sub || 
           decoded.id || 
           decoded.unique_name || 
           decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
  } catch (e) {
    console.error("Token decoding failed", e);
    return null;
  }
};
