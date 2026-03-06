import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@tanstack/react-router";
import { Menu, Phone, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "../store/cartStore";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());
  const setCartOpen = useCartStore((s) => s.setCartOpen);
  const router = useRouter();

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Products", to: "/products" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
  ];

  const currentPath = router.state.location.pathname;

  return (
    <header
      className="sticky top-0 z-50 w-full shadow-sm"
      style={{ backgroundColor: "#1a6b3c" }}
    >
      {/* Top bar */}
      <div
        className="hidden md:flex items-center justify-end px-6 py-1.5 text-xs font-body"
        style={{ backgroundColor: "#0f4526", color: "#d4b96a" }}
      >
        <Phone className="w-3 h-3 mr-1.5" />
        <span>+91 98765 43210</span>
        <span className="mx-3 opacity-40">|</span>
        <span>Mon–Sat: 8:00 AM – 9:00 PM</span>
      </div>

      {/* Main navbar */}
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/assets/generated/store-logo.dim_128x128.png"
            alt="Venkateshwara Medicals Logo"
            className="w-10 h-10 rounded-full object-cover border-2"
            style={{ borderColor: "#c8a84b" }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div>
            <div
              className="font-heading font-bold text-lg leading-tight"
              style={{ color: "#ffffff" }}
            >
              Venkateshwara
            </div>
            <div
              className="font-body text-xs tracking-widest uppercase"
              style={{ color: "#c8a84b" }}
            >
              Medicals
            </div>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded font-body text-sm font-medium transition-all duration-200 ${
                currentPath === link.to
                  ? "text-white"
                  : "text-green-100 hover:text-white"
              }`}
              style={
                currentPath === link.to
                  ? {
                      backgroundColor: "rgba(200,168,75,0.25)",
                      color: "#c8a84b",
                    }
                  : {}
              }
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Cart + Mobile toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative p-2 rounded-full transition-colors hover:bg-white/10"
            aria-label="Open cart"
          >
            <ShoppingCart className="w-6 h-6 text-white" />
            {itemCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center font-body"
                style={{ backgroundColor: "#c8a84b", color: "#0f4526" }}
              >
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className="md:hidden p-2 rounded text-white hover:bg-white/10"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t border-white/10 px-4 py-3 flex flex-col gap-1"
          style={{ backgroundColor: "#1a6b3c" }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`px-4 py-2.5 rounded font-body text-sm font-medium transition-colors ${
                currentPath === link.to
                  ? "text-white"
                  : "text-green-100 hover:text-white hover:bg-white/10"
              }`}
              style={
                currentPath === link.to
                  ? {
                      backgroundColor: "rgba(200,168,75,0.2)",
                      color: "#c8a84b",
                    }
                  : {}
              }
            >
              {link.label}
            </Link>
          ))}
          <div
            className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2 text-xs font-body"
            style={{ color: "#d4b96a" }}
          >
            <Phone className="w-3 h-3" />
            <span>+91 98765 43210</span>
          </div>
        </div>
      )}
    </header>
  );
}
