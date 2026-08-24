"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  LayoutDashboard,
  UploadCloud,
  ListChecks,
  FileText,
  History,
  LucideIcon
} from "lucide-react";
import { useState } from "react";

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems: NavItem[] = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Upload Batch", href: "/upload", icon: UploadCloud },
    { name: "Review Queue", href: "/review", icon: ListChecks },
    { name: "Marking Scheme", href: "/scheme", icon: FileText },
    { name: "History", href: "/history", icon: History },
  ];

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <aside 
      className={`
        sticky top-0 h-screen flex flex-col shrink-0 bg-slate-900 border-r border-slate-700 text-slate-100 z-50 
        transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-20" : "w-64"}
      `}
    >
      <button 
        onClick={toggleSidebar} 
        className="focus:outline-none hover:bg-slate-800 transition-colors"
      >
        <div className={`flex h-16 items-center border-b border-slate-700 ${isCollapsed ? "justify-center" : "px-6"}`}>
          <img src="favicon.ico" alt="Logo" className="h-6 w-6 text-cyan-400 shrink-0" />
          
          {!isCollapsed && (
            <span className="text-xl font-bold tracking-wide ml-2 whitespace-nowrap">
              Bit<span className="text-cyan-400">Mark</span>
            </span>
          )}
        </div>
      </button>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : undefined} 
              className={`
                group flex items-center rounded-md transition-colors duration-200
                ${isCollapsed ? "justify-center p-3" : "px-3 py-2.5 justify-start"}
                ${isActive ? "bg-slate-800 text-cyan-400" : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"}
              `}
            >
              <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-100"}`} />
              
              {!isCollapsed && (
                <span className="font-medium text-sm ml-3 whitespace-nowrap">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className={`p-4 border-t border-slate-700 flex items-center hover:bg-slate-800 transition-colors duration-200 cursor-pointer ${isCollapsed ? "justify-center" : "gap-3"}`}>
        <div className="shrink-0">
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "h-9 w-9 ring-2 ring-slate-700"
              }
            }}
          />
        </div>
        
        {!isCollapsed && (
          <div className="flex flex-col overflow-hidden whitespace-nowrap">
            <span className="text-sm font-medium text-slate-100 truncate">
              {user?.fullName || "Admin"}
            </span>
            <span className="text-xs text-slate-400 truncate">
              {user?.username || "Admin"}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}