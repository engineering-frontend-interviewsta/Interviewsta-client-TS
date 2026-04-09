import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "../components/shared/ThemeToggle";
import BrandLogo from "../components/shared/BrandLogo";

const LandingHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredNavItem, setHoveredNavItem] = useState(false);
  const [currentHoveredItem, setCurrentHoveredItem] = useState(null);
  const Navigate = useNavigate();
  const currentSection = useLocation();

  // Task 3.1 — scroll-aware frosted-glass background
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const productSubItems = [
    { id: "video-interviews", label: "Video Interviews", link: "/video-interviews" },
    { id: "resume-analysis", label: "Resume Analysis", link: "/resume" },
    { id: "dashboard", label: "Dashboard", link: "/dashboard" },
  ];
  const companySubItems = [
    { id: "about-us", label: "About Us", link: "/about" },
    { id: "contact", label: "Contact", link: "/contact" },
  ];

  const navItems = [
    { id: "home", label: "Home", link: "/" },
    { id: "pricing", label: "Pricing", link: "/pricing" },
    { id: "product", label: "Product", subItems: productSubItems },
    { id: "company", label: "Company", subItems: companySubItems },
  ];

  useEffect(() => {
    if (hoveredNavItem === false) setCurrentHoveredItem(null);
  }, [hoveredNavItem]);

  const handleClickNavItem = (link) => {
    Navigate(link);
    setMobileOpen(false);
  };

  const handleClickNavVisibleItem = (item) => {
    if (item.link) Navigate(item.link);
    else {
      setHoveredNavItem((prev) => (prev !== "clicked" ? "clicked" : false));
      setCurrentHoveredItem(item.id);
    }
  };

  const isActive = (link) => link && currentSection.pathname === link;

  return (
    <>
      {/* Task 3.1 — frosted-glass header */}
      <header
        className={`w-full sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "backdrop-blur-md bg-[var(--color-header-surface)] shadow-[0_1px_12px_var(--color-header-shadow)] border-b border-[var(--color-border-light)]"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="flex items-center h-16 w-full max-w-none">
            {/* Logo */}
            <div
              className="flex items-center cursor-pointer"
              onClick={() => Navigate("/")}
            >
              <BrandLogo alt="Interviewsta.AI" className="h-7 w-auto" />
            </div>

            <div className="ml-auto flex items-center gap-5">
              <ThemeToggle />

              {/* Desktop nav */}
              <nav className="hidden lg:flex items-center space-x-1">
                {navItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleClickNavVisibleItem(item)}
                    className={`px-4 py-2 rounded-lg relative text-sm font-medium transition-all duration-200 cursor-pointer select-none ${
                      isActive(item.link)
                        ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] shadow-sm"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
                    }`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleClickNavVisibleItem(item);
                      }
                    }}
                    onMouseEnter={() => {
                      if (item.subItems) {
                        setCurrentHoveredItem(item.id);
                        setHoveredNavItem((prev) =>
                          prev !== "clicked" ? true : "clicked"
                        );
                      }
                    }}
                    onMouseLeave={() => {
                      if (item.subItems) {
                        setHoveredNavItem((prev) =>
                          prev !== "clicked" ? false : "clicked"
                        );
                      }
                    }}
                  >
                    {item.label}
                    {item.subItems ? (
                      <ChevronDown
                        className={`absolute -right-1 top-[30%] h-4 w-4 transition-transform duration-200 ${
                          currentHoveredItem === item.id ? "rotate-180" : ""
                        }`}
                      />
                    ) : null}

                    {/* Desktop dropdown */}
                    <AnimatePresence mode="wait">
                      {hoveredNavItem && currentHoveredItem === item.id && (
                        <motion.div
                          key="NavItemDropdown"
                          className="absolute top-full left-0 w-max overflow-hidden rounded-lg bg-[var(--color-surface)] border border-[var(--color-border-light)] shadow-[var(--shadow-dropdown)]"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ul className="flex flex-col p-3 space-y-1">
                            {item.subItems.map((subItem) => (
                              <li key={subItem.id}>
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleClickNavItem(subItem.link);
                                  }}
                                  whileHover={{ x: 4 }}
                                  className={`block w-full text-left px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                                    isActive(subItem.link)
                                      ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                                      : "text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
                                  }`}
                                >
                                  {subItem.label}
                                </motion.button>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </nav>

              {/* Task 3.3 — CTA buttons */}
              <div className="hidden lg:flex items-center gap-3">
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors duration-200"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-hover)] transition-colors duration-200"
                >
                  Get Started
                </Link>
              </div>

              {/* Mobile hamburger */}
              <button
                className="lg:hidden p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-lg transition-colors"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Task 3.2 — AnimatePresence mobile overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="lg:hidden bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-[var(--shadow-md)]"
            >
              <nav className="flex flex-col px-4 py-4 space-y-1">
                {navItems.map((item) => (
                  <React.Fragment key={item.id}>
                    {item.link ? (
                      /* Plain nav item */
                      <button
                        onClick={() => handleClickNavItem(item.link)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleClickNavItem(item.link);
                          }
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive(item.link)
                            ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] shadow-sm"
                            : "text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
                        }`}
                      >
                        {item.label}
                      </button>
                    ) : (
                      /* Parent with inline sub-items */
                      <div>
                        <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
                          {item.label}
                        </p>
                        <div className="flex flex-col space-y-0.5 pl-2">
                          {item.subItems.map((subItem) => (
                            <button
                              key={subItem.id}
                              onClick={() => handleClickNavItem(subItem.link)}
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  handleClickNavItem(subItem.link);
                                }
                              }}
                              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isActive(subItem.link)
                                  ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] shadow-sm"
                                  : "text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
                              }`}
                            >
                              {subItem.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}

                {/* Mobile CTA buttons */}
                <div className="flex flex-col gap-2 pt-3 border-t border-[var(--color-border-light)]">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors duration-200"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] transition-colors duration-200"
                  >
                    Get Started
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default LandingHeader;
