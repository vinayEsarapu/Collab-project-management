import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
    },
    {
      name: "Projects",
      path: "/projects",
    },
    /*{
      name: "Issues",
      path: "/issues",
    },*/
  ];

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <NavLink
          to="/dashboard"
          onClick={() => setIsMenuOpen(false)}
          className="text-lg font-bold text-white"
        >
          Collab PM
        </NavLink>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Desktop User / Logout */}
        <div className="hidden items-center gap-4 md:flex">
          {user && (
            <span className="max-w-[180px] truncate text-sm text-slate-400">
              {user.name || user.email}
            </span>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-400 transition-colors duration-200 hover:border-white/20 hover:text-white"
          >
            Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="rounded-lg border border-white/10 px-3 py-2 text-slate-300 transition-colors duration-200 hover:bg-white/5 md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="border-t border-white/10 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}

            {user && (
              <div className="mt-3 border-t border-white/10 pt-3">
                <p className="truncate px-4 py-2 text-sm text-slate-500">
                  {user.name || user.email}
                </p>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-lg px-4 py-3 text-left text-sm text-slate-400 transition-colors duration-200 hover:bg-white/5 hover:text-white"
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