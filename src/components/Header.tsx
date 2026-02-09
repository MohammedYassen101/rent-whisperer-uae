import { Link, useLocation } from "react-router-dom";
import { Calculator, Wrench, Phone, ShieldCheck } from "lucide-react";
import logo from "@/assets/logo.png";

const navItems = [
  { to: "/", label: "Calculator", icon: Calculator },
  { to: "/maintenance", label: "Maintenance", icon: Wrench },
  { to: "/contact", label: "Contact", icon: Phone },
  { to: "/admin", label: "Admin", icon: ShieldCheck },
];

export default function Header() {
  const location = useLocation();

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20 md:h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={logo}
              alt="Alyassia Properties"
              className="h-16 md:h-20 w-auto object-contain"
            />
            <div className="hidden sm:block">
              <div className="text-sm md:text-base font-display font-bold text-foreground tracking-wide">
                Alyassia Properties
              </div>
              <div className="text-[10px] md:text-xs text-muted-foreground">
                L.L.C. O.P.C.
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`
                    flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground/70 hover:text-foreground hover:bg-secondary"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      {/* Gold accent line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />
    </header>
  );
}
