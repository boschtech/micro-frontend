import { NavLink, Link } from "react-router";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/products", label: "Products" },
  { to: "/orders", label: "Orders" },
] as const;

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-bosch-border bg-black/95 backdrop-blur">
      <nav className="mx-auto flex h-[100px] max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-3"
          aria-label="Bosch Tech"
        >
          <img
            src="/logo.png"
            alt="Bosch Technologies"
            className="block h-auto w-[180px]"
          />
          <span className="sr-only">Bosch Tech</span>
        </Link>

        <ul className="flex items-center gap-8">
          {links.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `relative text-sm font-medium transition-colors after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:bg-bosch-gold after:transition-all ${
                    isActive
                      ? "text-bosch-gold after:w-full"
                      : "text-gray-600 after:w-0 hover:text-bosch-gold hover:after:w-full"
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink
              to="/orders/new"
              className="rounded-md bg-bosch-gold px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-bosch-gold-dark"
            >
              New Order
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}
