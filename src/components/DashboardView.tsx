import React, { useMemo } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  Sparkles, 
  ArrowUpRight, 
  Bot, 
  Flame, 
  Hourglass,
  ArrowRight
} from 'lucide-react';
import { Task, UserProfile } from '../types';

interface DashboardViewProps {
  currentUser: UserProfile;
  tasks: Task[];
  setCurrentTab: (tab: string) => void;
  onToggleCompleteTask?: (taskId: string) => void;
}

export default function DashboardView({ currentUser, tasks, setCurrentTab, onToggleCompleteTask }: DashboardViewProps) {
  
  // Greeting based on actual time
  const welcomeGreeting = useMemo(() => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good Morning";
    if (hr < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  // Compute metrics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    
    // Urgent tasks: Priority score > 75 or Critical importance and not completed
    const urgentTasks = tasks.filter(t => !t.completed && (t.priorityScore >= 75 || t.importance === "Critical"));
    
    // Near deadlines: within next 48 hours and not completed
    const today = new Date();
    const nearDeadlinesCount = tasks.filter(t => {
      if (t.completed) return false;
      const tDate = new Date(t.deadline);
      const diffTime = tDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 2 && diffDays >= 0;
    }).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      pending,
      urgentCount: urgentTasks.length,
      nearDeadlinesCount,
      completionRate,
      urgentTasks
    };
  }, [tasks]);

  // Priority sorted pending tasks for quick view
  const criticalFeed = useMemo(() => {
    return tasks
      .filter(t => !t.completed)
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 3);
  }, [tasks]);

  // Formulate AI recommendation based on current queue metrics
  const aiCoachAdvice = useMemo(() => {
    if (stats.pending === 0) {
      return {
        title: "All Guardrails Cleared!",
        text: "Incredible throughput! You are 100% on top of your deadlines. Utilize this phase for systematic self-learning or leisure blocks.",
        severity: "success" as const
      };
    }
    
    const highRiskCount = tasks.filter(t => !t.completed && t.riskLevel === "High").length;
    if (highRiskCount > 0) {
      return {
        title: "Deadline Collapse Predicted",
        text: `You have ${highRiskCount} tasks flagged with High Risk. Estimated effort exceeds remaining chronological lead. Execute the step-by-step AI Planner breakdowns immediately.`,
        severity: "hazard" as const
      };
    }

    if (stats.urgentCount > 1) {
      return {
        title: "Intense Workload Pressure",
        text: `You have ${stats.urgentCount} High-Priority tasks stacked. Prioritize study sprint blocks over casual administrative tasks. Run the schedule compiler in your AI Planner.`,
        severity: "warn" as const
      };
    }

    return {
      title: "Sustainable Workspace Trajectory",
      text: "Current workloads look well-distributed. Keep reviewing tasks daily and checking subtasks to avoid typical backlog accumulation.",
      severity: "info" as const
    };
  }, [tasks, stats]);

  return (
    <div className="p-4 lg:p-8 space-y-8 select-none font-sans max-w-7xl mx-auto text-zinc-900">
      
      {/* Welcome & Motivational Pitch */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-950 rounded-xl p-6 lg:p-8 text-white border border-zinc-850 shadow-[4px_4px_0px_0px_rgba(9,9,11,0.15)] relative overflow-hidden">
        {/* Decorative thin background accents */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-zinc-900/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-zinc-900/30 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-xs font-mono font-semibold text-zinc-300 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-300" />
            <span>CALIBRATION: {currentUser.dailyWorkloadLimitHours} HRS/DAY LIMIT</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-white font-sans">
            {welcomeGreeting}, {currentUser.displayName}!
          </h2>
          <p className="text-zinc-300 text-sm max-w-xl leading-relaxed">
            Deadline Guardian AI is actively tracking <span className="font-bold border-b border-zinc-700 text-white font-mono">{stats.pending} pending goals</span>. We predicted deadlines, effort thresholds, and structured dynamic execution pipelines to secure your study bounds.
          </p>
        </div>

        <div className="flex md:flex-col items-start md:items-end justify-between md:justify-center gap-2.5 bg-zinc-900 p-4 rounded-lg border border-zinc-800 relative z-10 shrink-0 min-w-[140px] shadow-inner">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span className="font-mono font-black text-2xl tracking-tight text-white">{stats.completionRate}%</span>
          </div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-455 font-mono">COMPLETE RATE</p>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm hover:shadow-[3px_3px_0px_0px_rgba(9,9,11,1)] transition-all flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Assigned Deadlines</p>
            <p className="text-3.5xl font-black text-zinc-950 font-mono tracking-tight leading-none" id="metric-total-tasks">{stats.total}</p>
          </div>
          <div className="w-11 h-11 rounded-md border border-zinc-200 bg-zinc-50 text-zinc-800 flex items-center justify-center group-hover:bg-zinc-950 group-hover:border-zinc-950 group-hover:text-white transition-all">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm hover:shadow-[3px_3px_0px_0px_rgba(9,9,11,1)] transition-all flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Completed Sprints</p>
            <p className="text-3.5xl font-black text-emerald-600 font-mono tracking-tight leading-none" id="metric-completed-tasks">{stats.completed}</p>
          </div>
          <div className="w-11 h-11 rounded-md border border-zinc-200 bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:border-emerald-600 group-hover:text-white transition-all">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm hover:shadow-[3px_3px_0px_0px_rgba(9,9,11,1)] transition-all flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Critical Priorities</p>
            <p className="text-3.5xl font-black text-rose-600 font-mono tracking-tight leading-none" id="metric-urgent-tasks">{stats.urgentCount}</p>
          </div>
          <div className="w-11 h-11 rounded-md border border-zinc-200 bg-rose-50 text-rose-700 flex items-center justify-center group-hover:bg-rose-500 group-hover:border-rose-500 group-hover:text-white transition-all">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm hover:shadow-[3px_3px_0px_0px_rgba(9,9,11,1)] transition-all flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Near Risk (48H)</p>
            <p className="text-3.5xl font-black text-amber-500 font-mono tracking-tight leading-none" id="metric-near-risk">{stats.nearDeadlinesCount}</p>
          </div>
          <div className="w-11 h-11 rounded-md border border-zinc-200 bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-500 group-hover:border-amber-500 group-hover:text-white transition-all">
            <Hourglass className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
        </div>
      </div>

      {/* Main Grid: Critical feed vs recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Urgent Guardian Alert Feed (2/3 scale) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-zinc-900 tracking-tight uppercase font-sans">Highest AI-Score Backlog</h3>
              <p className="text-xs text-zinc-500">Workspace candidates prioritized by computed deadline closeness & expected effort.</p>
            </div>
            <button 
              onClick={() => setCurrentTab('ai-planner')}
              className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 hover:border-zinc-350 text-zinc-900 rounded-md text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>PLANNER</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {criticalFeed.length === 0 ? (
              <div className="bg-white border border-dashed border-zinc-300 p-12 rounded-lg text-center space-y-3 shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-zinc-300 mx-auto" />
                <h4 className="font-bold text-zinc-700 text-sm font-mono">WORKSPACE PIPELINE STABLE</h4>
                <p className="text-xs text-zinc-450 mt-1 max-w-xs mx-auto">There are no outstanding high-priority tasks in your current bounds. Configure goals to see Gemini priority forecasts.</p>
              </div>
            ) : (
              criticalFeed.map((task) => {
                const daysLeft = Math.max(0, Math.ceil((new Date(task.deadline).getTime() - new Date().getTime()) / 86400000));
                
                return (
                  <div 
                    key={task.id}
                    className="p-5 bg-white border border-zinc-200 hover:border-zinc-950 rounded-lg shadow-sm hover:shadow-[3px_3px_0px_0px_rgba(9,9,11,1)] transition-all flex flex-col md:flex-row gap-4 justify-between items-start md:items-center relative overflow-hidden"
                  >
                    {/* Geometric Urgency accent indicator */}
                    <div 
                      className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                        task.riskLevel === "High" ? 'bg-rose-500' : task.riskLevel === "Medium" ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} 
                    />

                    <div className="space-y-2 flex-1 pl-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 bg-zinc-100 text-zinc-750 border border-zinc-150 rounded text-[9px] font-mono font-bold uppercase leading-none">{task.category}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border uppercase leading-none ${
                          task.importance === "Critical" ? 'bg-rose-50/55 text-rose-700 border-rose-200' :
                          task.importance === "High" ? 'bg-amber-50/55 text-amber-700 border-amber-200' :
                          task.importance === "Medium" ? 'bg-blue-50/55 text-blue-700 border-blue-200' : 'bg-zinc-50 text-zinc-600 border-zinc-200'
                        }`}>
                          {task.importance} Importance
                        </span>
                        
                        <span className={`text-[10px] font-bold font-mono ${daysLeft <= 1 ? 'text-rose-600 animate-pulse' : 'text-zinc-500'}`}>
                          DUE {daysLeft === 0 ? 'TODAY' : daysLeft === 1 ? 'TOMORROW' : `IN ${daysLeft} DAYS`}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-zinc-900 text-base leading-tight font-sans">{task.title}</h4>
                      <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed font-sans">{task.description}</p>
                    </div>

                    <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto shrink-0 gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-zinc-100">
                      <div className="text-left md:text-right bg-zinc-50 border border-zinc-150 px-3 py-1.5 rounded-md min-w-[75px]">
                        <div className="flex items-center gap-1 justify-center md:justify-end">
                          <Bot className="w-3.5 h-3.5 text-zinc-600" />
                          <span className="text-[9px] uppercase font-bold text-zinc-400 font-mono leading-none">SCORE</span>
                        </div>
                        <p className="text-2xl font-black text-zinc-900 font-mono tracking-tight leading-none mt-1 text-center md:text-right">{task.priorityScore}</p>
                      </div>

                      {onToggleCompleteTask && (
                        <button 
                          onClick={() => onToggleCompleteTask(task.id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold font-mono tracking-wider uppercase transition-all cursor-pointer shadow-sm border border-emerald-600"
                        >
                          DONE
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* AI Recommendations & Coaching Engine */}
        <div className="space-y-6">
          <h3 className="text-base font-extrabold text-zinc-900 tracking-tight uppercase pb-3 border-b border-zinc-200 flex items-center gap-2">
            <Bot className="w-5 h-5 text-zinc-950" />
            <span>Guardian Co-Pilot</span>
          </h3>

          <div className="bg-white border border-zinc-200 rounded-lg shadow-sm p-6 space-y-6 relative">
            
            {/* Status light card */}
            <div className={`p-4 rounded-lg flex gap-3.5 items-start border ${
              aiCoachAdvice.severity === "hazard" ? 'bg-rose-50 text-rose-850 border-rose-200' :
              aiCoachAdvice.severity === "warn" ? 'bg-amber-50 text-amber-850 border-amber-200' :
              aiCoachAdvice.severity === "success" ? 'bg-emerald-50 text-emerald-850 border-emerald-250' :
              'bg-zinc-50 text-zinc-850 border-zinc-200'
            }`}>
              <Sparkles className="w-5 h-5 shrink-0 mt-0.5 text-zinc-900 animate-spin" style={{ animationDuration: '6s' }} />
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider font-mono opacity-90">{aiCoachAdvice.title}</p>
                <p className="text-xs leading-relaxed opacity-95">{aiCoachAdvice.text}</p>
              </div>
            </div>

            {/* Smart Suggested Notification Bubble */}
            <div className="space-y-3.5">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono leading-none">Smart suggested alerts</h4>
              
              <div className="space-y-3">
                {tasks.filter(t => !t.completed && t.reminderSuggestion).slice(0, 2).map((task) => (
                  <div key={`rem-${task.id}`} className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 flex flex-col gap-1.5 shadow-sm">
                    <p className="text-[9px] uppercase font-bold text-zinc-900 font-mono tracking-wider border-b border-zinc-150 pb-1">FOR: {task.title}</p>
                    <p className="text-xs leading-relaxed text-zinc-700 italic font-mono">"{task.reminderSuggestion}"</p>
                  </div>
                ))}
                
                {tasks.filter(t => !t.completed && t.reminderSuggestion).length === 0 && (
                  <div className="py-4 text-center text-xs text-zinc-400 font-mono border border-dashed border-zinc-200 rounded-md">
                    No active urgency reminders.
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setCurrentTab('ai-planner')}
              className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-850 text-white font-bold text-xs uppercase font-mono tracking-widest rounded-md border border-zinc-950 shadow-[2px_2px_0px_rgba(0,0,0,0.15)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>REVIEW SCHEDULE plan</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
