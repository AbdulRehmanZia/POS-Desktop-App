import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { RiTeamLine } from "react-icons/ri";
import { BiLogOut } from "react-icons/bi";
import {
  Bars3Icon,
  XMarkIcon,
  RectangleStackIcon,
  ShoppingBagIcon,
  TagIcon,
  ChartBarIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useContext, useState, useRef, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import { StoreContext } from "../context/StoreContext";
import { ShoppingCartIcon, Store } from "lucide-react";
import toast from "react-hot-toast";

export default function SideBar({ children }) {
  const { user, logout } = useContext(UserContext);
  const { 
    currentStore, 
    userStores, 
    switchStore,
    clearStoreData 
  } = useContext(StoreContext);
  
  const [isOpen, setIsOpen] = useState(true);
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Get only the last two latest stores
  const latestStores = userStores
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 2);

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      roles: ["admin"],
      icon: <ChartBarIcon className="h-5 w-5" />,
    },
    {
      name: "New Sale",
      path: "/dashboard/new-sale",
      roles: ["admin", "cashier"],
      icon: <ShoppingCartIcon className="h-5 w-5" />,
    },
    {
      name: "Sales",
      path: "/dashboard/sale",
      roles: ["admin", "cashier"],
      icon: <RectangleStackIcon className="h-5 w-5" />,
    },
    {
      name: "Products",
      path: "/dashboard/product",
      roles: ["admin", "cashier"],
      icon: <ShoppingBagIcon className="h-5 w-5" />,
    },
    {
      name: "Categories",
      roles: ["admin", "cashier"],
      path: "/dashboard/category",
      icon: <TagIcon className="h-5 w-5" />,
    },
    {
      name: "Members",
      path: "/dashboard/member",
      roles: ["admin"],
      icon: <RiTeamLine className="h-5 w-5" />,
    },
    
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowStoreDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Listen for user logout to clear store data
  useEffect(() => {
    const handleUserLogout = () => {
      clearStoreData();
    };

    window.addEventListener('user-logout', handleUserLogout);
    return () => {
      window.removeEventListener('user-logout', handleUserLogout);
    };
  }, [clearStoreData]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleStoreSwitch = (store) => {
    switchStore(store);
    setShowStoreDropdown(false);
    toast.success(`Switched to ${store.name}`);
  };

  const handleSwitchStores = () => {
    setShowStoreDropdown(false);
    navigate("/stores");
  };

  return (
    <div className="flex min-h-screen bg-[#F4F9F9]">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-[#1C3333] text-[#F4F9F9] border-r border-[#F4F9F9]/20 shadow-lg transition-[width] duration-300 z-40 
        flex flex-col
        ${isOpen ? "w-72" : "w-20"}`}
      >
        {/* Sidebar Header */}
        <div className="flex mt-6 items-center justify-between px-4 py-4 border-b border-[#F4F9F9]/20">
          {isOpen && (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#F4F9F9] text-[#1C3333] flex items-center justify-center font-bold shadow-md cursor-pointer">
                {user?.fullname?.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-sm">{user?.fullname}</p>
                <p className="text-xs text-[#F4F9F9]/70">
                  {user?.role.toUpperCase()}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-md cursor-pointer hover:bg-[#F4F9F9]/20 transition-all duration-200"
          >
            {isOpen ? (
              <XMarkIcon className="h-5 w-5 text-[#F4F9F9]" />
            ) : (
              <Bars3Icon className="h-5 w-5 text-[#F4F9F9]" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-6 space-y-1 overflow-y-auto flex-1">
          <p
            className={`px-3 text-xs uppercase text-[#F4F9F9]/50 mb-2 ${
              !isOpen && "hidden"
            }`}
          >
            Main
          </p>

          {navItems
            .filter(item => item.roles.includes(user?.role))
            .map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  title={!isOpen ? item.name : ""}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                    ${
                      isActive
                        ? "bg-[#F4F9F9] text-[#1C3333] shadow-md border-l-4"
                        : "text-[#F4F9F9] hover:bg-[#F4F9F9]/20"
                    }`}
                >
                  <span className={`${isActive ? "text-[#1C3333]" : "text-[#F4F9F9]"}`}>
                    {item.icon}
                  </span>
                  {isOpen && <span className="text-sm">{item.name}</span>}
                </Link>
              );
            })}
        </nav>

        {/* Store Selection (Now includes Logout) */}
        <div className="border-t border-[#F4F9F9]/20 px-3 py-4 mt-auto">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowStoreDropdown(!showStoreDropdown)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 bg-[#F4F9F9]/10 hover:bg-[#F4F9F9]/20 text-[#F4F9F9] cursor-pointer ${
                !isOpen && "justify-center"
              }`}
              title={!isOpen ? currentStore?.name : ""}
            >
              <Store className="h-4 w-4 flex-shrink-0" />
              {isOpen && (
                <>
                  <div className="flex-1 text-left">
                    <p className="font-medium truncate text-sm">{currentStore?.name || "Select Store"}</p>
                    <p className="text-xs text-[#F4F9F9]/60">Current Store</p>
                  </div>
                  <ChevronDownIcon className={`h-3 w-3 transition-transform ${showStoreDropdown ? "rotate-180" : ""}`} />
                </>
              )}
            </button>

            {/* Store Drop-Up (Positioned above the button) */}
            {showStoreDropdown && isOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Recent Stores
                  </div>
                  {latestStores.map((store) => (
                    <button
                      key={store.id}
                      onClick={() => handleStoreSwitch(store)}
                      className={`w-full flex items-center gap-3 px-3 py-2 cursor-pointer rounded-md text-sm transition-colors ${
                        currentStore?.id === store.id
                          ? "bg-[#1C3333] text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Store className="h-4 w-4 flex-shrink-0" />
                      <div className="flex-1 text-left">
                        <p className="font-medium truncate text-sm">{store.name}</p>
                        <p className="text-xs opacity-70">
                          {store.ownerId === user?.id ? "Owner" : "Member"}
                        </p>
                      </div>
                      {currentStore?.id === store.id && (
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
                <div className="border-t border-gray-200 p-2">
                  <button
                    onClick={handleSwitchStores}
                    className="w-full px-3 py-2 text-sm text-[#1C3333] hover:bg-gray-100 rounded-md transition-colors text-left cursor-pointer"
                  >
                    View All Stores
                  </button>
                </div>
                {/* Logout Button inside dropdown */}
                <div className="border-t border-gray-200 p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                  >
                    <BiLogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Logout Button (Removed from outside, now inside dropdown) */}
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isOpen ? "ml-72" : "ml-20"
        }`}
      >
        <div className="p-6">
          {/* If children are passed, render them, otherwise render Outlet for nested routes */}
          {children || <Outlet />}
        </div>
      </div>
    </div>
  );
}