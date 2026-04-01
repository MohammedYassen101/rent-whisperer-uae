import { Link, useLocation } from "react-router-dom";
import { Calculator, Wrench, Phone, ShieldCheck, Menu, X, Globe } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";
import { useLanguage } from "@/hooks/useLanguage";

const navKeys = [
  { to: "/", labelKey: "nav.calculator", icon: Calculator },
  { to: "/maintenance", labelKey: "nav.maintenance", icon: Wrench },
  { to: "/contact", labelKey: "nav.contact", icon: Phone },
  { to: "/admin", labelKey: "nav.admin", icon: ShieldCheck },
];

export default function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <>
      <header className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-24">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src={logo}
                alt="Alyassia Properties"
                className="h-12 md:h-20 w-auto object-contain"
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

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navKeys.map((item) => {
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
                    <span>{t(item.labelKey)}</span>
                  </Link>
                );
              })}

              {/* Language Toggle - Desktop */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-extrabold transition-all duration-200 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg ms-3 ring-2 ring-primary/20"
                aria-label="Toggle language"
              >
                <Globe className="w-5 h-5" />
                <span className="text-base">{language === "en" ? "عربي" : "English"}</span>
              </button>
            </nav>

            {/* Mobile: Language + Hamburger */}
            <div className="md:hidden flex items-center gap-1">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-md transition-all text-sm font-extrabold"
                aria-label="Toggle language"
              >
                <Globe className="w-4 h-4" />
                <span>{language === "en" ? "عربي" : "EN"}</span>
              </button>
              <button
                className="p-2 rounded-md hover:bg-secondary transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-border bg-white animate-fade-in">
            <div className="container mx-auto px-4 py-2 space-y-1">
              {navKeys.map((item) => {
                const isActive = location.pathname === item.to;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-all
                      ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground/70 hover:bg-secondary"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{t(item.labelKey)}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}

        {/* Gold accent line */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />
      </header>
    </>
  );
}
