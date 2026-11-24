"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import {
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Moon,
  Sparkles,
  Sun,
  Upload,
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("bitmark-theme", next ? "dark" : "light");
    } catch {}
  };

  const navItems: NavItem[] = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Upload Batch", href: "/upload", icon: Upload },
    { name: "Review Queue", href: "/review", icon: ClipboardCheck },
    { name: "Marking Scheme", href: "/answerKey", icon: FileText },
    { name: "Generate Marking Scheme", href: "/generateKey", icon: Sparkles },
  ];

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <aside 
      className={`
        sticky top-0 h-screen flex flex-col shrink-0 bg-white border-r border-zinc-200 text-zinc-900 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100 z-50 
        transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-20" : "w-64"}
      `}
    >
      <button 
        onClick={toggleSidebar} 
        className="focus:outline-none hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
      >
        <div className={`flex h-16 items-center border-b border-zinc-200 dark:border-zinc-800 ${isCollapsed ? "justify-center" : "px-6"}`}>
          <img src="favicon.ico" alt="Logo" className="h-6 w-6 text-cyan-600 dark:text-cyan-400 shrink-0" />
          
          {!isCollapsed && (
            <span className="text-xl font-bold tracking-wide ml-2 whitespace-nowrap">
              Bit<span className="text-cyan-600 dark:text-cyan-400">Mark</span>
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
                ${
                  isActive
                    ? "bg-zinc-100 text-cyan-600 dark:bg-zinc-900 dark:text-cyan-400"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                }
              `}
            >
              {isCollapsed ? (
                <Icon className="h-5 w-5 shrink-0" />
              ) : (
                <span className="font-medium text-sm whitespace-nowrap">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-2">
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className={`flex w-full items-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 ${
            isCollapsed ? "justify-center p-2.5" : "px-3 py-2 gap-3"
          }`}
        >
          {isDark ? <Sun className="h-4 w-4 text-amber-400 shrink-0" /> : <Moon className="h-4 w-4 text-zinc-700 shrink-0" />}
          {!isCollapsed && (
            <span className="text-xs font-medium whitespace-nowrap">
              {isDark ? "Light Mode" : "Dark Mode"}
            </span>
          )}
        </button>
      </div>

      <div className={`p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors duration-200 cursor-pointer ${isCollapsed ? "justify-center" : "gap-3"}`}>
        <div className="shrink-0">
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "h-9 w-9 ring-2 ring-zinc-200 dark:ring-zinc-800"
              }
            }}
          />
        </div>
        
        {!isCollapsed && (
          <div className="flex flex-col overflow-hidden whitespace-nowrap">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
              {user?.fullName || "Admin"}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
              {user?.username || "Admin"}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}