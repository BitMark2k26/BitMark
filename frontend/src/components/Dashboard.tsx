import DashboardPage from "@/app/page";
import { auth } from "@clerk/nextjs/server";
import { Files, AlertTriangle, BrainCircuit } from "lucide-react";

const Dashboard=async ()=>{
  await auth.protect();

  const activeBatches = [
    { id: "BCH-092", course: "CS301 Midterm", progress: "45/50", status: "Action Needed" },
    { id: "BCH-093", course: "EE205 Quiz 4", progress: "120/120", status: "Completed" },
    { id: "BCH-094", course: "MATH101 Final", progress: "18/300", status: "Processing" },
  ];

  return (
    <div className="p-8 w-full max-w-6xl mx-auto text-slate-100">
      
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-slate-400 mt-1">System overview and grading queue.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* Total Processed */}
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">Total Processed</p>
            <p className="text-3xl font-bold">1,248</p>
          </div>
          <Files className="h-8 w-8 text-slate-500 opacity-50" />
        </div>

        {/* Pending Review */}
        <div className="bg-slate-800 border border-amber-500/50 p-6 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-amber-400 text-sm font-medium mb-1">Pending Review</p>
            <p className="text-3xl font-bold text-amber-500">12</p>
          </div>
          <AlertTriangle className="h-8 w-8 text-amber-500 opacity-50" />
        </div>

        {/* Confidence Score */}
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">Avg Confidence</p>
            <p className="text-3xl font-bold text-emerald-400">92.4%</p>
          </div>
          <BrainCircuit className="h-8 w-8 text-slate-500 opacity-50" />
        </div>

      </div>

      {/* Simplified Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold">Recent Batches</h2>
        </div>
        
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-sm border-b border-slate-700">
              <th className="px-6 py-3 font-medium">Batch ID</th>
              <th className="px-6 py-3 font-medium">Course</th>
              <th className="px-6 py-3 font-medium">Progress</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50 text-sm">
            {activeBatches.map((batch) => (
              <tr key={batch.id} className="hover:bg-slate-700/30">
                <td className="px-6 py-4 font-medium">{batch.id}</td>
                <td className="px-6 py-4 text-slate-300">{batch.course}</td>
                <td className="px-6 py-4 text-slate-300">{batch.progress}</td>
                <td className="px-6 py-4">
                  <span className={`
                    ${batch.status === 'Action Needed' ? 'text-amber-400' : ''}
                    ${batch.status === 'Completed' ? 'text-emerald-400' : ''}
                    ${batch.status === 'Processing' ? 'text-cyan-400' : ''}
                  `}>
                    {batch.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
export default Dashboard;