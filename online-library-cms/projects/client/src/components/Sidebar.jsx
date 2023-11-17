import React from "react";
import { HiUser } from "react-icons/hi"
import { IoIosTimer } from "react-icons/io";
import { IoFileTrayFull } from "react-icons/io5";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
    const location = useLocation();

    const routes = [
        { to: "/user/profile", icon: HiUser, name: "Profile" },
        { to: "/user/ongoing-book", icon: IoIosTimer, name: "Ongoing" },
        { to: "/user/borrow-history", icon: IoFileTrayFull, name: "History" },
    ]
    return (
        <>
            <div className="font-rob text-base grid content-between">
                <div>
                    {routes.map(({ to, icon: Icon, name }, idx) => (
                        <Link key={idx} to={to} className={`mx-2 flex h-14 text-blue-700 bg-gray-100 items-center hover:bg-blue-800 hover:text-white my-1 py-2 rounded-2xl ${location.pathname === to ? "border-b-4 border-blue-600 rounded-none" : ""}`}>
                            <div className="w-8 h-8 flex items-center justify-center mx-2">
                                <Icon size={30} />
                            </div>
                            <div className={`hidden sm:block ml-1`}>{name}</div>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    )
}