import React from "react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white/90 backdrop-blur shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">M-PARCEL Delivery Hub</h1>
          <p className="text-xs text-slate-500">Powering reliable parcel movement across Africa</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800">{user?.name || "Operations"}</p>
            <p className="text-xs capitalize text-slate-500">{user?.role || "team"}</p>
          </div>
          <button
            onClick={logout}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

