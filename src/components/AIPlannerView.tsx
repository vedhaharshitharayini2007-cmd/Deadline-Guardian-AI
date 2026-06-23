import React, { useState, useEffect, useMemo } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  CalendarRange, 
  Clock, 
  RefreshCcw, 
  CheckCircle2, 
  AlertTriangle, 
  FolderLock,
  ChevronDown,
  ChevronUp,
  Activity,
  Bot,
  HelpCircle,
  HelpCircleIcon
} from 'lucide-react';
import { Task, UserProfile, DailySchedule, DailyScheduleBlock, Subtask } from '../types';
import { db } from '../lib/db';

interface AIPlannerViewProps {
  currentUser: UserProfile;
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onRefreshTasksList: () => void;
}

export default function AIPlannerView({ currentUser, tasks, onUpdateTask, onRefreshTasksList }: AIPlannerViewProps) {
  
  const todayStr = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const [schedule, setSchedule] = useState<DailySchedule | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  
  // Expanded task ID for subtask checklist and recommendation panel
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Initialize schedule
  useEffect(() => {
    const loaded = db.getSchedule(currentUser.uid, todayStr);
    setSchedule(loaded);
  }, [currentUser, todayStr]);

  // Collapsible toggle
  const toggleTaskExpand = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  // Re-Compile schedule using Gemini API proxy
  const handleCompileSchedule = async () => {
    setScheduleLoading(true);
    try {
      const activePendingTasks = tasks.filter(t => !t.completed);
      const generated = await db.generateScheduleWithGemini(
        currentUser.uid, 
        todayStr, 
        activePendingTasks, 
        currentUser.dailyWorkloadLimitHours || 6
      );
      setSchedule(generated);
    } catch (err) {
      console.error(err);
      alert("Encountered connection interruption compiling focus schedule.");
    } finally {
      setScheduleLoading(false);
    }
  };

  // Toggle checklist complete
  const handleToggleBlockComplete = (blockId: string) => {
    if (!schedule) return;
    const updatedBlocks = schedule.blocks.map(b => {
      if (b.id === blockId) {
        return { ...b, completed: !b.completed };
      }
      return b;
    });
    const updatedSchedule = { ...schedule, blocks: updatedBlocks };
    setSchedule(updatedSchedule);
    db.saveSchedule(currentUser.uid, updatedSchedule);
  };

  // Toggle subtask complete within main tasks
  const handleToggleSubtaskComplete = (taskId: string, subtaskId: string) => {
    const parentTask = tasks.find(t => t.id === taskId);
    if (!parentTask) return;

    const updatedSubtasks = parentTask.subtasks.map(s => {
      if (s.id === subtaskId) {
        return { ...s, completed: !s.completed };
      }
      return s;
    });

    // Check if ALL subtasks are complete now. If so, let's offer to complete the task?
    // We update the local storage & re-notify
    onUpdateTask(taskId, { subtasks: updatedSubtasks });
  };

  // Sort tasks by priority
  const prioritizedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => b.priorityScore - a.priorityScore);
  }, [tasks]);

  return (
    <div className="p-4 lg:p-8 space-y-8 select-none font-sans max-w-7xl mx-auto text-zinc-900">
      
      <div className="space-y-1 pb-4 border-b border-zinc-200">
        <h2 className="text-2xl font-black text-zinc-950 tracking-tight flex items-center gap-2 font-sans">
          <BrainCircuit className="w-7 h-7 text-zinc-900" />
          <span>AI Interactive Planner</span>
        </h2>
        <p className="text-xs text-zinc-500">Deconstruct long-form targets into micro-sprints and compile structured, chronologically optimized daily focus blocks.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Daily focus scheduler (5/12 scale) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-2">
              <CalendarRange className="w-4.5 h-4.5 text-zinc-900" />
              <span>Personalized Schedule</span>
            </h3>

            <button 
              onClick={handleCompileSchedule}
              disabled={scheduleLoading}
              className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-850 disabled:bg-zinc-700 text-white font-bold font-mono text-xs uppercase tracking-wider rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,0.15)] border border-zinc-950"
              id="recompile-schedule-btn"
            >
              <RefreshCcw className={`w-3.5 h-3.5 ${scheduleLoading ? 'animate-spin' : ''}`} />
              <span>Compile Plan</span>
            </button>
          </div>

          <div className="bg-white border border-zinc-200 rounded-lg shadow-sm hover:shadow-[3px_3px_0px_0px_rgba(9,9,11,1)] transition-all p-5 space-y-5 relative">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div>
                <span className="text-[9px] font-mono font-bold text-zinc-900 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-sm">CALIBRATION BOUNDS</span>
                <p className="text-xs text-zinc-500 mt-1.5 font-mono">Focus Limit: <span className="font-extrabold text-zinc-950">{currentUser.dailyWorkloadLimitHours} hours</span></p>
              </div>
              <span className="text-xs font-bold text-zinc-500 font-mono">{todayStr}</span>
            </div>

            {scheduleLoading && (
              <div className="py-12 flex flex-col items-center justify-center space-y-4">
                <div className="w-8 h-8 border-3 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold text-zinc-600 font-mono animate-pulse">Formulating optimum chrono sequences...</p>
              </div>
            )}

            {!scheduleLoading && (!schedule || schedule.blocks.length === 0) && (
              <div className="py-12 text-center text-zinc-400 border border-dashed border-zinc-200 rounded-lg space-y-3 shadow-inner">
                <Clock className="w-8 h-8 text-zinc-300 mx-auto" />
                <p className="text-xs font-mono uppercase tracking-wider text-zinc-600 font-bold">No chronometer plan compiled</p>
                <p className="text-[10px] text-zinc-450 max-w-[250px] mx-auto font-sans">Create tasks, toggle importance scales, and click "Compile Plan" to compile your focus sprints.</p>
              </div>
            )}

            {!scheduleLoading && schedule && schedule.blocks.length > 0 && (
              <div className="space-y-4">
                {/* Scrollable chronological checklist */}
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {schedule.blocks.map((block) => {
                    return (
                      <div 
                        key={block.id}
                        className={`p-3.5 rounded-lg border transition-all flex items-start gap-3 justify-between ${
                          block.completed 
                            ? 'bg-zinc-50/50 border-zinc-150 opacity-60' 
                            : 'bg-white border-zinc-200 hover:border-zinc-950 shadow-sm hover:shadow-[3px_3px_0px_0px_rgba(9,9,11,1)]'
                        }`}
                      >
                        <button 
                          onClick={() => handleToggleBlockComplete(block.id)}
                          className={`mt-0.5 flex-shrink-0 w-4.5 h-4.5 rounded border flex items-center justify-center cursor-pointer transition-all ${
                            block.completed 
                              ? 'bg-zinc-950 border-zinc-950 text-white' 
                              : 'bg-white border-zinc-300 hover:border-zinc-950'
                          }`}
                        >
                          {block.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>

                        <div className="flex-1 min-w-0 pr-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[9px] font-mono font-bold text-zinc-800 bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded-none leading-none select-none uppercase">{block.startTime} - {block.endTime}</span>
                            <span className="text-[10px] font-bold text-zinc-400 truncate font-mono">FOR: {block.taskTitle}</span>
                          </div>
                          <p className={`text-zinc-800 text-xs font-bold leading-tight ${block.completed ? 'line-through text-zinc-450 font-normal' : ''}`}>{block.title}</p>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 font-bold bg-zinc-50 border border-zinc-100 px-1.5 py-0.5 rounded shrink-0">{block.durationMinutes}m</span>
                      </div>
                    );
                  })}
                </div>

                {/* Coach guidance notes */}
                {schedule.aiNotes && (
                  <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1.5 font-mono shadow-inner">
                    <span className="text-[9px] uppercase font-bold text-zinc-500 font-mono tracking-widest leading-none flex items-center gap-1">
                      <Bot className="w-3.5 h-3.5 text-zinc-950 animate-pulse" />
                      <span>Coaching Guidelines</span>
                    </span>
                    <p className="text-xs text-zinc-650 leading-relaxed italic">"{schedule.aiNotes}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive boundary evaluator (7/12 scale) */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 font-mono">
            <Activity className="w-4.5 h-4.5 text-zinc-900" />
            <span>Boundary Evaluator & Subtasks</span>
          </h3>

          <div className="space-y-4">
            {prioritizedTasks.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-lg border border-zinc-200 shadow-inner">
                <p className="text-sm text-zinc-500 font-mono">No target goals currently configured. Initialize dashboard goals.</p>
              </div>
            ) : (
              prioritizedTasks.map((task) => {
                const isExpanded = expandedTaskId === task.id;
                const completedSubtasksCount = task.subtasks.filter(s => s.completed).length;
                const totalSubtasksCount = task.subtasks.length;
                const subtasksPct = totalSubtasksCount > 0 ? Math.round((completedSubtasksCount / totalSubtasksCount) * 100) : 0;
                
                const daysUntilDeadline = Math.max(0, Math.ceil((new Date(task.deadline).getTime() - new Date().getTime()) / 86400000));

                return (
                  <div 
                    key={task.id}
                    className={`bg-white border rounded-lg shadow-sm transition-all overflow-hidden ${
                      isExpanded ? 'border-zinc-950 shadow-md ring-1 ring-zinc-950/10' : 'border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    {/* Header trigger block */}
                    <div 
                      onClick={() => toggleTaskExpand(task.id)}
                      className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-50/40 select-none transition-colors"
                    >
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 bg-zinc-100 text-zinc-750 border border-zinc-200 font-bold font-mono text-[9px] leading-none uppercase">{task.category}</span>
                          
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono border leading-none uppercase ${
                            task.riskLevel === "High" ? 'bg-rose-50 text-rose-700 border-rose-250' :
                            task.riskLevel === "Medium" ? 'bg-amber-50 text-amber-700 border-amber-250' :
                            'bg-emerald-50 text-emerald-700 border-emerald-250'
                          }`}>
                            {task.riskLevel} Risk
                          </span>

                          <span className="text-[10px] font-mono text-zinc-500">
                            Due in {daysUntilDeadline} days
                          </span>

                          {task.completed && (
                            <span className="px-2 py-0.5 bg-zinc-950 text-white font-black rounded-sm border border-zinc-900 text-[8px] uppercase font-mono leading-none">Resolved</span>
                          )}
                        </div>

                        <h4 className={`font-extrabold text-zinc-900 text-base leading-tight font-sans ${task.completed ? 'line-through text-zinc-400 font-normal' : ''}`}>{task.title}</h4>
                        
                        {totalSubtasksCount > 0 && (
                          <div className="flex items-center gap-2 text-xs font-mono">
                            <span className="text-[9px] text-zinc-400 font-bold uppercase">Milestones Completed</span>
                            <div className="w-24 bg-zinc-100 rounded-sm h-1.5 overflow-hidden border border-zinc-200">
                              <div className="bg-zinc-950 h-full" style={{ width: `${subtasksPct}%` }} />
                            </div>
                            <span className="text-[10px] font-bold text-zinc-900">{completedSubtasksCount}/{totalSubtasksCount}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-center bg-zinc-55 border border-zinc-200 px-2 py-1 rounded-md min-w-[50px]">
                          <span className="text-[9px] uppercase font-bold text-zinc-400 font-mono leading-none">SCORE</span>
                          <p className="text-lg font-mono font-black text-zinc-900 tracking-tight leading-none mt-1">{task.priorityScore}</p>
                        </div>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
                      </div>
                    </div>

                    {/* Expanding detail canvas */}
                    {isExpanded && (
                      <div className="border-t border-zinc-200 bg-zinc-50/20 p-5 space-y-4">
                        
                        {/* Risk Predictor Card */}
                        <div className="bg-white p-3.5 rounded-lg border border-zinc-200 flex gap-3 items-start shadow-sm">
                          <AlertTriangle className={`w-4 px-0 shrink-0 mt-0.5 ${
                            task.riskLevel === "High" ? 'text-rose-500' : task.riskLevel === "Medium" ? 'text-amber-500' : 'text-emerald-500'
                          }`} />
                          <div className="space-y-1">
                            <h5 className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 font-mono">Risk Predictor Explanation</h5>
                            <p className="text-xs text-zinc-700 leading-relaxed italic font-sans font-medium">"{task.riskExplanation || "Parameters consolidated. Focus boundaries optimal."}"</p>
                          </div>
                        </div>

                        {/* Action recommendation card */}
                        <div className="bg-white p-3.5 rounded-lg border border-zinc-200 flex gap-3 items-start shadow-sm">
                          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <h5 className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 font-mono">Dynamic Recommendation</h5>
                            <p className="text-xs text-zinc-800 leading-relaxed font-sans font-semibold">{task.actionRecommendation || "Ready for focused workflow sequences."}</p>
                          </div>
                        </div>

                        {/* Interactive Task breakdown tree list */}
                        {totalSubtasksCount > 0 && (
                          <div className="space-y-2">
                            <h5 className="text-[9px] font-bold uppercase tracking-widest text-zinc-450 font-mono leading-none">Subtasks Checklist</h5>
                            
                            <div className="space-y-2">
                              {task.subtasks.map((st) => (
                                <div 
                                  key={st.id} 
                                  className="bg-white p-3 rounded-lg border border-zinc-200 flex items-center gap-3 justify-between hover:bg-zinc-50/20 transition-all shadow-sm"
                                >
                                  <div className="flex items-center gap-3 min-w-0 pr-1">
                                    <button 
                                      onClick={() => handleToggleSubtaskComplete(task.id, st.id)}
                                      className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-all ${
                                        st.completed 
                                          ? 'bg-zinc-950 border-zinc-950 text-white' 
                                          : 'bg-white border-zinc-300 hover:border-zinc-950'
                                      }`}
                                    >
                                      {st.completed && <CheckCircle2 className="w-3 h-3" />}
                                    </button>

                                    <span className={`text-xs font-semibold leading-tight truncate ${st.completed ? 'line-through text-zinc-400 font-normal' : 'text-zinc-800'}`}>
                                      {st.title}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-mono text-zinc-500 bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded-sm font-bold shrink-0">{st.durationMinutes}m</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Complete parent toggle action */}
                        <div className="flex flex-wrap gap-2 pt-3 justify-end border-t border-zinc-200">
                          {task.completed ? (
                            <button 
                              onClick={() => onUpdateTask(task.id, { completed: false })}
                              className="px-3.5 py-1.5 border border-zinc-200 text-zinc-650 hover:bg-zinc-50 text-xs font-bold font-mono tracking-wider uppercase rounded transition-colors cursor-pointer"
                            >
                              Reset Active Goal
                            </button>
                          ) : (
                            <button 
                              onClick={() => {
                                onUpdateTask(task.id, { completed: true });
                                const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav"); // playful pop sound
                                audio.volume = 0.2;
                                audio.play().catch(() => {});
                              }}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-mono tracking-wider uppercase rounded border border-emerald-600 cursor-pointer transition-colors shadow-sm"
                            >
                              Mark Goal Settle!
                            </button>
                          )}
                        </div>

                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
