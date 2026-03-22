import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, UserIcon, ChevronDown, LogOutIcon } from "lucide-react";
import Logo from "../assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";

const LandingHeader = () => {
  const [toggleMenu, setToggleMenu] = useState(false);
  const [toggleProfile, setToggleProfile] = useState(false);
  const [hoveredNavItem, setHoveredNavItem] = useState(false);
  const [currentHoveredItem, setCurrentHoveredItem] = useState(null);
  const Navigate = useNavigate();
  const navMenuRef = useRef(null);
  const navMenuVisRef = useRef(null);
  const currentSection = useLocation();

  useEffect(() => {
    if (toggleMenu && navMenuRef.current && navMenuVisRef.current) {
      navMenuRef.current.classList.remove("hidden");
      navMenuVisRef.current.classList.add("bg-blue-50", "text-blue-600", "shadow-sm");
    } else if (navMenuRef.current && navMenuVisRef.current) {
      navMenuRef.current.classList.add("hidden");
      navMenuVisRef.current.classList.remove("bg-blue-50", "text-blue-600", "shadow-sm");
    }
  }, [toggleMenu]);

  const handleSignOut = async () => {};

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
    { id: 'home', label: 'Home', link: '/' },
    { id: "product", label: "Product", subItems: productSubItems },
    { id: "company", label: "Company", subItems: companySubItems },
  ];

  useEffect(() => {
    if (hoveredNavItem === false) setCurrentHoveredItem(null);
  }, [hoveredNavItem]);

  const handleClickNavItem = (link) => {
    Navigate(link);
    setToggleMenu(false);
  };

  const handleClickNavVisibleItem = (item) => {
    if (item.link) Navigate(item.link);
    else {
      setHoveredNavItem((prev) => prev !== "clicked" ? "clicked" : false);
      setCurrentHoveredItem(item.id);
    }
  };

  return (
    <>
      <header className="relative w-full bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="flex justify-between items-center h-16 w-full max-w-none">
            <div className="flex items-center cursor-pointer" onClick={() => Navigate("/")}>
              <img src={Logo} alt="Interviewsta.AI" className="h-10 w-auto" />
            </div>
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleClickNavVisibleItem(item)}
                  className={`px-4 py-2 rounded-lg relative text-sm font-medium transition-all duration-200 ${
                    currentSection.pathname === item.link ? "bg-blue-50 text-blue-600 shadow-sm" : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  } cursor-pointer`}
                  onMouseEnter={() => { item.subItems && setCurrentHoveredItem(item.id); item.subItems && setHoveredNavItem((prev) => prev !== "clicked" ? true : "clicked"); }}
                  onMouseLeave={() => { item.subItems && setHoveredNavItem((prev) => prev !== "clicked" ? false : "clicked"); }}
                >
                  {item.label} {item.subItems ? <ChevronDown className={`absolute -right-1 top-[30%] h-4 w-4 ${currentHoveredItem === item.id ? "rotate-180" : ""} transition-transform duration-200`} /> : null}
                  <AnimatePresence mode="wait">
                    {hoveredNavItem && currentHoveredItem === item.id && (
                      <motion.div className={`${hoveredNavItem ? "absolute" : "hidden"} top-full left-0 w-max overflow-hidden rounded-sm bg-white shadow-2xl shadow-gray-50`} key="NavItemDropdown" initial={{ height: 0 }} animate={{ height: hoveredNavItem ? 'auto' : 0 }} exit={{ height: 0 }}>
                        <ul className="flex flex-col p-4 space-y-2">
                          {item.subItems.map((subItem) => (
                            <li key={subItem.id}>
                              <motion.button onClick={() => handleClickNavItem(subItem.link)} whileHover={{ x: 5 }} className={`block px-4 py-2 text-sm font-medium transition-colors duration-200 ${currentSection.pathname === subItem.link ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"}`}>
                                {subItem.label}
                              </motion.button>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              ))}
            </nav>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setToggleProfile((prev) => !prev)}>
                <div className="hidden absolute top-[calc(100%)] z-10 right-0 w-50 rounded-lg bg-white shadow-lg">
                  <ul className="flex flex-col p-3 space-y-1.5">
                    <li className="inline-flex space-x-2.5 items-center">
                      <div className="size-9 rounded-full bg-amber-400 flex justify-center items-center"><UserIcon className="text-gray-200" /></div>
                      <p className="text-gray-800"></p>
                    </li>
                    <li className="text-red-500 inline-flex space-x-2.5 rounded-lg justify-center items-center hover:text-red-600 hover:bg-gray-100 hover:cursor-pointer" onClick={() => handleSignOut()}>
                      <LogOutIcon className="w-4 h-4" /><p>Log out</p>
                    </li>
                  </ul>
                </div>
              </button>
              <button className="lg:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setToggleMenu((val) => !val)} ref={navMenuVisRef}>
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        <div className="hidden absolute top-full left-0 min-h-[calc(100vh-2rem)] w-full bg-blue-50" ref={navMenuRef}>
          <nav className="!flex !flex-col pt-5 space-y-3 min-h-full w-full">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => handleClickNavItem(item.link)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 block ${currentSection.pathname === item.link ? "bg-blue-50 text-blue-600 shadow-sm" : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"}`}>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
};

export default LandingHeader;
