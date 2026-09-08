import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  UserCircle,
  LayoutDashboard,
  FolderKanban,
  Home,
} from "lucide-react";

import { useAuth } from "../context/Authcontext";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: Home,
    },
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Projects",
      path: "/projects",
      icon: FolderKanban,
    },
    {
      name: "My Profile",
      path: "/profile",
      icon: UserCircle,
    },
  ];

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* =========================
            LOGO
        ========================= */}

        <div
          className="cursor-default text-lg font-bold text-white transition-colors duration-200 hover:text-indigo-300"
        >
          Collab PM
        </div>

        {/* =========================
            DESKTOP NAVIGATION
        ========================= */}

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon className="h-4 w-4" />

                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* =========================
            DESKTOP USER / LOGOUT
        ========================= */}

        <div className="hidden items-center gap-4 md:flex">
         {user && (
  <div
    className="flex max-w-[200px] items-center gap-2 px-2 py-1.5 text-sm text-slate-400"
    title={user.email}
  >
    <UserCircle className="h-4 w-4 shrink-0" />

    <span className="truncate">
      {user.name || user.email}
    </span>
  </div>
)}

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-400 transition-colors duration-200 hover:border-white/20 hover:text-white"
          >
            Logout
          </button>
        </div>

        {/* =========================
            MOBILE MENU BUTTON
        ========================= */}

        <button
          type="button"
          onClick={() =>
            setIsMenuOpen((prev) => !prev)
          }
          className="rounded-lg border border-white/10 px-3 py-2 text-slate-300 transition-colors duration-200 hover:bg-white/5 md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* =========================
          MOBILE NAVIGATION
      ========================= */}

      {isMenuOpen && (
        <div className="border-t border-white/10 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">

            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() =>
                    setIsMenuOpen(false)
                  }
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />

                  {item.name}
                </NavLink>
              );
            })}

            {user && (
              <div className="mt-3 border-t border-white/10 pt-3">

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate("/profile");
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-slate-400 transition-colors duration-200 hover:bg-white/5 hover:text-white"
                >
                  <UserCircle className="h-4 w-4" />

                  <span className="truncate">
                    {user.name || user.email}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-1 w-full rounded-lg px-4 py-3 text-left text-sm text-slate-400 transition-colors duration-200 hover:bg-white/5 hover:text-white"
                >
                  Logout
                </button>

              </div>
            )}

          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;