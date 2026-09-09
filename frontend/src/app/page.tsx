import Dashboard from "@/components/Dashboard";
import { Sidebar } from "@/components/Sidebar";
import { auth } from "@clerk/nextjs/server";

const DashboardPage = async () => {
  const { userId } = await auth.protect();
  
  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <Sidebar />
      <main className="flex flex-col flex-1 items-center justify-center w-full">
        <Dashboard />
      </main>
    </div>
  );
};

export default DashboardPage;