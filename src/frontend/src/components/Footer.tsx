import { Link } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="text-white" style={{ backgroundColor: "#0f4526" }}>
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/assets/generated/store-logo.dim_128x128.png"
                alt="Logo"
                className="w-10 h-10 rounded-full object-cover border-2"
                style={{ borderColor: "#c8a84b" }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div>
                <div className="font-heading font-bold text-base leading-tight text-white">
                  Venkateshwara
                </div>
                <div
                  className="font-body text-xs tracking-widest uppercase"
                  style={{ color: "#c8a84b" }}
                >
                  Medicals
                </div>
              </div>
            </div>
            <p className="font-body text-sm text-green-200 leading-relaxed">
              Your trusted neighborhood pharmacy providing genuine medicines and
              healthcare products since 2005.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="font-heading font-semibold text-base mb-4"
              style={{ color: "#c8a84b" }}
            >
              Quick Links
            </h4>
            <ul className="space-y-2 font-body text-sm">
              {[
                { label: "Home", to: "/" },
                { label: "Products", to: "/products" },
                { label: "About Us", to: "/about" },
                { label: "Contact", to: "/contact" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-green-200 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4
              className="font-heading font-semibold text-base mb-4"
              style={{ color: "#c8a84b" }}
            >
              Contact Us
            </h4>
            <ul className="space-y-3 font-body text-sm text-green-200">
              <li className="flex items-start gap-2">
                <MapPin
                  className="w-4 h-4 mt-0.5 shrink-0"
                  style={{ color: "#c8a84b" }}
                />
                <span>
                  12, MG Road, Near City Hospital,
                  <br />
                  Hyderabad, Telangana – 500001
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone
                  className="w-4 h-4 shrink-0"
                  style={{ color: "#c8a84b" }}
                />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail
                  className="w-4 h-4 shrink-0"
                  style={{ color: "#c8a84b" }}
                />
                <span>info@venkateshwaramedicals.in</span>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4
              className="font-heading font-semibold text-base mb-4"
              style={{ color: "#c8a84b" }}
            >
              Opening Hours
            </h4>
            <ul className="space-y-2 font-body text-sm text-green-200">
              <li className="flex items-center gap-2">
                <Clock
                  className="w-4 h-4 shrink-0"
                  style={{ color: "#c8a84b" }}
                />
                <div>
                  <div className="font-medium text-white">Mon – Sat</div>
                  <div>8:00 AM – 9:00 PM</div>
                </div>
              </li>
              <li className="flex items-center gap-2">
                <Clock
                  className="w-4 h-4 shrink-0"
                  style={{ color: "#c8a84b" }}
                />
                <div>
                  <div className="font-medium text-white">Sunday</div>
                  <div>9:00 AM – 6:00 PM</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4 font-body text-xs text-green-300">
          <span>© {year} Venkateshwara Medicals. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
