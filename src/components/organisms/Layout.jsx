import React, { useState, useContext } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import { motion } from "framer-motion";
import { AuthContext } from "../../App";

const LogoutButton = () => {
  const { logout } = useContext(AuthContext);
  
  return (
    <button
      onClick={logout}
      className="group flex w-full gap-x-3 rounded-lg p-2 text-sm leading-6 font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
    >
      <ApperIcon
        name="LogOut"
        size={20}
        className="shrink-0 text-gray-400 group-hover:text-red-600"
      />
      Logout
    </button>
  );
};

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

const navigation = [
    { name: "Dashboard", href: "/", icon: "BarChart3" },
    { name: "Contacts", href: "/contacts", icon: "Users" },
    { name: "Deals", href: "/deals", icon: "Target" },
    { name: "Tasks", href: "/tasks", icon: "CheckSquare" },
    { name: "Activities", href: "/activities", icon: "Clock" },
    { name: "Quotes", href: "/quotes", icon: "FileText" }
  ];

  const isActive = (href) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                <ApperIcon name="Zap" size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">FlowCRM</span>
            </div>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          `group flex gap-x-3 rounded-lg p-2 text-sm leading-6 font-semibold transition-all duration-200 ${
                            isActive
                              ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white"
                              : "text-gray-700 hover:text-primary-600 hover:bg-primary-50"
                          }`
                        }
                      >
                        <ApperIcon
                          name={item.icon}
                          size={20}
                          className={({ isActive }) =>
                            `shrink-0 ${
                              isActive ? "text-white" : "text-gray-400 group-hover:text-primary-600"
                            }`
                          }
                        />
                        {item.name}
                      </NavLink>
                    </li>
                  ))}
</ul>
              </li>
              <li className="mt-auto">
                <LogoutButton />
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`relative z-50 lg:hidden ${mobileMenuOpen ? "" : "hidden"}`}>
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          className="fixed inset-y-0 left-0 z-50 w-64 bg-white px-6 py-6 overflow-y-auto transform transition-transform duration-300 ease-in-out"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                <ApperIcon name="Zap" size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">FlowCRM</span>
            </div>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ApperIcon name="X" size={24} />
            </button>
          </div>
          <nav className="mt-6">
            <ul role="list" className="space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `group flex gap-x-3 rounded-lg p-2 text-sm leading-6 font-semibold transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white"
                          : "text-gray-700 hover:text-primary-600 hover:bg-primary-50"
                      }`
                    }
                  >
                    <ApperIcon
                      name={item.icon}
                      size={20}
                      className={isActive(item.href) ? "text-white" : "text-gray-400 group-hover:text-primary-600"}
                    />
                    {item.name}
                  </NavLink>
                </li>
              ))}
</ul>
            <div className="mt-auto pt-4">
              <LogoutButton />
            </div>
          </nav>
        </motion.div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <ApperIcon name="Menu" size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
              <ApperIcon name="Zap" size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">FlowCRM</span>
          </div>
        </div>

        <main className="min-h-[calc(100vh-4rem)] lg:min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;