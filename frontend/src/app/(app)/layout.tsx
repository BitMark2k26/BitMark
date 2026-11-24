import type { Metadata } from "next";
import "../globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "BitMark",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {  
  return (
      <div className="flex min-h-screen bg-slate-900">
        <Sidebar />
        <main className="min-w-0 flex-1">
        {children}
        </main>
      </div>
  );
}
