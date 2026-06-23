import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Activity, 
  Clock, 
  Award, 
  Hourglass,
  HelpCircle,
  HelpCircleIcon
} from 'lucide-react';
import { Task, TaskCategory } from '../types';

interface ProgressAnalyticsViewProps {
  tasks: Task[];
}

export default function ProgressAnalyticsView({ tasks }: ProgressAnalyticsViewProps) {
  
  // Calculate statistics
  const analytics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Total estimated hours
    const totalHoursPending = tasks
      .filter(t => !t.completed)
      .reduce((sum, t) => sum + Number(t.estimatedEffortHours || 0), 0);

    const totalHoursCompleted = tasks
      .filter(t => t.completed)
      .reduce((sum, t) => sum + Number(t.estimatedEffortHours || 0), 0);

    // Filter categories count
    const categoryDataMap: Record<TaskCategory, { completed: number; pending: number }> = {
      Work: { completed: 0, pending: 0 },
      Study: { completed: 0, pending: 0 },
      Life: { completed: 0, pending: 0 },
      Finance: { completed: 0, pending: 0 },
      Health: { completed: 0, pending: 0 },
      Hackathon: { completed: 0, pending: 0 },
      Other: { completed: 0, pending: 0 }
    };

    tasks.forEach(task => {
      const cat = task.category || "Other";
      if (!categoryDataMap[cat]) {
        categoryDataMap[cat] = { completed: 0, pending: 0 };
      }
      if (task.completed) {
        categoryDataMap[cat].completed += 1;
      } else {
        categoryDataMap[cat].pending += 1;
      }
    });

    const categoryChartData = (Object.keys(categoryDataMap) as TaskCategory[]).map(cat => ({
      name: cat,
      Completed: categoryDataMap[cat].completed,
      Pending: categoryDataMap[cat].pending
    })).filter(item => item.Completed > 0 || item.Pending > 0);

    // Pie chart Data
    const statusPieData = [
      { name: 'Completed Sprints', value: completed, color: '#10b981' },
      { name: 'Active Backlog', value: pending, color: '#6366f1' }
    ].filter(d => d.value > 0);

    // Category workload effort hours chart
    const categoryEffortData = (Object.keys(categoryDataMap) as TaskCategory[]).map(cat => {
      const catTasks = tasks.filter(t => t.category === cat);
      const totalHours = catTasks.reduce((sum, t) => sum + Number(t.estimatedEffortHours || 0), 0);
      return {
        name: cat,
        hours: totalHours
      };
    }).filter(item => item.hours > 0);

    // Average Priority Scores
    const activePriorityAvg = pending > 0 
      ? Math.round(tasks.filter(t => !t.completed).reduce((sum, t) => sum + t.priorityScore, 0) / pending) 
      : 0;

    return {
      total,
      completed,
      pending,
      completionRate,
      totalHoursPending,
      totalHoursCompleted,
      categoryChartData,
      statusPieData,
      categoryEffortData,
      activePriorityAvg
    };
  }, [tasks]);

  return (
    <div className="p-4 lg:p-8 space-y-8 select-none font-sans max-w-7xl mx-auto text-zinc-900">
      
      <div className="space-y-1 pb-4 border-b border-zinc-200">
        <h2 className="text-2xl font-black text-zinc-950 tracking-tight flex items-center gap-2 font-sans uppercase">
          <Activity className="w-7 h-7 text-zinc-900" />
          <span>Productivity & Progress Analytics</span>
        </h2>
        <p className="text-xs text-zinc-500">Real-time breakdown of workload effort stress, completion efficiency, and chronological task volumes.</p>
      </div>

      {/* Top statistics indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm hover:shadow-[3px_3px_0px_0px_rgba(9,9,11,1)] transition-all space-y-3">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-[10px] uppercase tracking-widest font-bold font-mono">Quota Cleared</span>
            <Award className="w-5 h-5 text-zinc-900" />
          </div>
          <div>
            <p className="text-3xl font-black text-zinc-950 font-mono tracking-tight leading-none mb-1">{analytics.completionRate}%</p>
            <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed font-sans">Task resolution ratio and schedule correctness.</p>
          </div>
          <div className="h-2 w-full bg-zinc-100 border border-zinc-200 rounded-sm overflow-hidden shadow-inner">
            <div className="bg-zinc-950 h-full transition-all duration-500" style={{ width: `${analytics.completionRate}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm hover:shadow-[3px_3px_0px_0px_rgba(9,9,11,1)] transition-all space-y-3">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-[10px] uppercase tracking-widest font-bold font-mono">Active Workload</span>
            <Clock className="w-5 h-5 text-zinc-900" />
          </div>
          <div>
            <p className="text-3xl font-black text-zinc-950 font-mono tracking-tight leading-none mb-1">{analytics.totalHoursPending} hrs</p>
            <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed font-sans">Sprints estimated focus hours in outstanding queue.</p>
          </div>
          <div className="h-2 w-full bg-zinc-100 border border-zinc-200 rounded-sm overflow-hidden shadow-inner">
            <div className="bg-zinc-950 h-full transition-all duration-500" style={{ width: `${Math.min(100, (analytics.totalHoursPending / 40) * 100)}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm hover:shadow-[3px_3px_0px_0px_rgba(9,9,11,1)] transition-all space-y-3">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-[10px] uppercase tracking-widest font-bold font-mono">Completed Sprints</span>
            <CheckCircle className="w-5 h-5 text-zinc-900" />
          </div>
          <div>
            <p className="text-3xl font-black text-zinc-950 font-mono tracking-tight leading-none mb-1">{analytics.totalHoursCompleted} hrs</p>
            <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed font-sans">Dynamic resolved workload bounds successfully evaluated.</p>
          </div>
          <div className="h-2 w-full bg-zinc-100 border border-zinc-200 rounded-sm overflow-hidden shadow-inner">
            <div className="bg-zinc-900 h-full transition-all duration-500" style={{ width: `${Math.min(100, (analytics.totalHoursCompleted / 40) * 100)}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm hover:shadow-[3px_3px_0px_0px_rgba(9,9,11,1)] transition-all space-y-3">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-[10px] uppercase tracking-widest font-bold font-mono">Urgency Index Average</span>
            <TrendingUp className="w-5 h-5 text-zinc-900" />
          </div>
          <div>
            <p className="text-3xl font-black text-zinc-950 font-mono tracking-tight leading-none mb-1">{analytics.activePriorityAvg}</p>
            <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed font-sans">Mean urgency penalty metric of workspace goals.</p>
          </div>
          <div className="h-2 w-full bg-zinc-100 border border-zinc-200 rounded-sm overflow-hidden shadow-inner">
            <div className="bg-zinc-950 h-full transition-all duration-500" style={{ width: `${analytics.activePriorityAvg}%` }} />
          </div>
        </div>
      </div>

      {/* Charts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Metric 1: Pending vs Completed (Pie representation) */}
        <div className="bg-white p-6 border border-zinc-200 rounded-lg shadow-sm hover:shadow-[3px_3px_0px_0px_rgba(9,9,11,1)] transition-all space-y-5">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-zinc-900 tracking-tight font-sans uppercase">Active Backlog vs Completed Sprints</h3>
            <p className="text-xs text-zinc-450">Current volume distribution of active constraints and completed pipelines.</p>
          </div>
 
          <div className="h-64 flex items-center justify-center relative font-mono">
            {analytics.total === 0 ? (
              <p className="text-xs text-zinc-400 font-mono">No telemetry parameters available.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Completed Sprints', value: analytics.completed, color: '#18181b' },
                      { name: 'Active Backlog', value: analytics.pending, color: '#e4e4e7' }
                    ].filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[
                      { name: 'Completed Sprints', value: analytics.completed, color: '#18181b' },
                      { name: 'Active Backlog', value: analytics.pending, color: '#e4e4e7' }
                    ].filter(d => d.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#d4d4d8" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} items`, 'Quantity']} />
                  <Legend verticalAlign="bottom" height={36} iconType="square" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Metric 2: Category Distribution (Bar representation) */}
        <div className="bg-white p-6 border border-zinc-200 rounded-lg shadow-sm hover:shadow-[3px_3px_0px_0px_rgba(9,9,11,1)] transition-all space-y-5">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-zinc-900 tracking-tight font-sans uppercase">Category Distribution (Task volume counts)</h3>
            <p className="text-xs text-zinc-450">Outstanding versus completed goals separated by functional classification.</p>
          </div>

          <div className="h-64 font-mono">
            {analytics.categoryChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-zinc-400 font-mono">No category datasets found.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.categoryChartData} barGap={6}>
                  <XAxis dataKey="name" stroke="#71717a" fontSize={11} fontStyle="normal" />
                  <YAxis stroke="#71717a" fontSize={11} allowDecimals={false} />
                  <Tooltip />
                  <Legend iconType="square" />
                  <Bar dataKey="Pending" fill="#e4e4e7" stroke="#a1a1aa" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Completed" fill="#18181b" radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Metric 3: Effort load per category */}
        <div className="bg-white p-6 border border-zinc-200 rounded-lg shadow-sm hover:shadow-[3px_3px_0px_0px_rgba(9,9,11,1)] transition-all space-y-5 lg:col-span-2 font-mono">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-zinc-900 tracking-tight font-sans uppercase">Workload stress index (Hours Allocated per Category)</h3>
            <p className="text-xs text-zinc-450 font-sans">Cumulative estimated hours required per workspace category.</p>
          </div>

          <div className="h-[220px]">
            {analytics.categoryEffortData.length === 0 ? (
              <div className="h-full flex items-center justify-center font-sans">
                <p className="text-xs text-zinc-400">Specify effort sliders inside goal composer to model load stress indices.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.categoryEffortData} layout="vertical">
                  <XAxis type="number" stroke="#71717a" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={11} width={80} />
                  <Tooltip formatter={(value) => [`${value} hrs`, 'Estimated Load']} />
                  <Bar dataKey="hours" fill="#18181b" radius={[0, 0, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
