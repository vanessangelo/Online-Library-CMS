import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { useState, useEffect } from "react";
import { remove } from "../store/reducer/authSlice";
import { useDispatch } from "react-redux";

const PrivateUserWrapper = () => {
    const location = useLocation();
    const [userData, setUserData] = useState({});
    const token = localStorage.getItem("token");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userRole = useSelector((state) => state.auth.profile?.user?.role)

    const fetchUserData = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const user = response.data.data;
            setUserData(user);
            if (user && user.role !== "user") {
                return <Navigate to="/dashboard" state={{ from: location }} replace />;
            }
        } catch (error) {
            console.log("removed profile user wrapper")
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

    if(userRole && userRole !== "user") {
        console.log("kena")
        return <Navigate to="/dashboard" state={{ from: location }} replace />;
    }
    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};  

export default PrivateUserWrapper;