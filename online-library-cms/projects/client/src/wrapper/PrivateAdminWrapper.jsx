import { Navigate, Outlet, useLocation } from "react-router";
import axios from "axios";
import { useState, useEffect } from "react";
import { remove } from "../store/reducer/authSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

const PrivateAdminWrapper = () => {
    const location = useLocation();
    const [userData, setUserData] = useState({});
    const token = localStorage.getItem("token")
    const dispatch = useDispatch()
    const adminRole = useSelector((state) => state.auth.profile?.user?.role)

    const fetchUserData = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const user = response.data.data;
            setUserData(user);
            if (user && user.role !== "admin") {
                return <Navigate to="/" state={{ from: location }} replace />;
            }
        } catch (error) {
            dispatch(remove())
            localStorage.removeItem("token")
            console.log(error.message);
        }
    };
    useEffect(() => {
        if (token) {
            fetchUserData();
        }
    }, [token]);

    
    if(adminRole && adminRole !== "admin") {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default PrivateAdminWrapper;