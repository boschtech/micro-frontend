import type { ReactNode } from "react";
import { Link } from "react-router";
import { Navbar } from "./Navbar";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-bosch-ink text-bosch-text">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-7xl px-6 pb-16 pt-[140px] lg:px-8">
        {children}
      </main>
      <footer className="border-t border-bosch-border bg-black px-6 py-8 text-center text-sm text-white/60 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3">
          <Link to="/" aria-label="Bosch Technologies">
            <img
              src="/logo.png"
              alt="Bosch Technologies"
              className="h-auto w-[160px]"
            />
          </Link>
          <p>&copy; {new Date().getFullYear()} Bosch Technologies. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
