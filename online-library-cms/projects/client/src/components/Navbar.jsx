import React from 'react';
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import ModalLogout from './ModalLogout';

export default function Navbar() {
  const token = localStorage.getItem("token")
  const profile = useSelector((state) => state.auth.profile?.user)
  const location = useLocation()

  const adminRoutes = [
    { menu: "Dashboard", to: "/dashboard", include: "/dashboard"},
    { menu: "Books", to: "/admin/book", include: "/admin/book"},
    { menu: "History", to: "/admin/history", include: "/admin/history" },
  ]

  const userRoutes = [
    { menu: "Home", to: "/" },
    { menu: "Profile", to: "/user/profile" , include: "/user"},
  ]

  const routes = token && profile?.role === "admin" ? adminRoutes : userRoutes

  return (
    <div className='flex shadow-lg font-inter'>
      <div className="w-full h-full col-span-1 grid grid-cols-2 items-center">
        <div className='text-5xl font-bold text-blue-800 px-5 text-center'>LIBRARY</div>
      </div>
      <div className="w-full col-span-1 flex justify-end gap-20 content-center">
        <div className="flex items-end justify-between gap-10">
          {routes.map(({ menu, to , include }, idx) => (
            <Link
              to={to}
              className={`px-4 h-full flex items-center justify-center ${
                (location.pathname === '/' && !include) || location.pathname.includes(include)
                  ? `text-blue-600 font-bold border-b-4 border-blue-600`
                  : `text-darkgrey`
              }`}
              key={idx}
            >
              <div>{menu}</div>
            </Link>
          ))}
        </div>
        <div className='grid px-5 justify-center content-center'>
          <ModalLogout />
        </div>
      </div>
    </div>
  );
}
