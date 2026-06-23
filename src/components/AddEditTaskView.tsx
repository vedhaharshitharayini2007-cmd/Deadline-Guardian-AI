import React, { useState } from 'react';
import { 
  Sparkles, 
  Save, 
  BrainCircuit, 
  Calendar, 
  Clock, 
  ChevronRight, 
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Bot
} from 'lucide-react';
import { Task, TaskCategory, ImportanceLevel, RiskLevel, Subtask } from '../types';
import { db } from '../lib/db';

interface AddEditTaskViewProps {
  currentUser: any;
  onAddTask: (task: Task) => void;
  setCurrentTab: (tab: string) => void;
}

export default function AddEditTaskView({ currentUser, onAddTask, setCurrentTab }: AddEditTaskViewProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Work');
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3); // Default 3 days out
    return d.toISOString().split('T')[0];
  });
  const [estimatedEffortHours, setEstimatedEffortHours] = useState<number>(3);
  const [importance, setImportance] = useState<ImportanceLevel>('High');

  // AI evaluation states
  const [analyzing, setAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<{
    priorityScore: number;
    riskLevel: RiskLevel;
    riskExplanation: string;
    actionRecommendation: string;
    subtasks: Array<{ title: string; durationMinutes: number; sequenceOrder: number }>;
    reminderSuggestion: string;
    isMock?: boolean;
  } | null>(null);

  const [savingLoading, setSavingLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleAIAnalyze = async () => {
    if (!title) {
      alert("Please enter a task title first so Gemini can analyze context.");
      return;
    }
    setAnalyzing(true);
    setAiReport(null);

    try {
      const response = await db.analyzeTaskWithGemini({
        title,
        description,
        category,
        deadline,
        estimatedEffortHours,
        importance,
        userCurrentWorkload: "Normal (Calibrated Limit of 6 Hours/day)"
      });
      setAiReport(response);
    } catch (err) {
      console.error(err);
      alert("Encountered connection exception. Falling back to dynamic baseline calculations.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setSavingLoading(true);

    try {
      let finalReport = aiReport;
      
      // If user did not analyze with Gemini, run automated evaluation on submission to calculate scores
      if (!finalReport) {
        finalReport = await db.analyzeTaskWithGemini({
          title,
          description,
          category,
          deadline,
          estimatedEffortHours,
          importance,
          userCurrentWorkload: "Normal"
        });
      }

      const formattedSubtasks: Subtask[] = finalReport.subtasks.map((st, idx) => ({
        id: `st-${Date.now()}-${idx}`,
        title: st.title,
        completed: false,
        durationMinutes: st.durationMinutes,
        sequenceOrder: st.sequenceOrder
      }));

      const newTask = db.addTask(currentUser.uid, {
        title,
        description,
        category,
        deadline,
        estimatedEffortHours,
        importance,
        priorityScore: finalReport.priorityScore,
        riskLevel: finalReport.riskLevel,
        riskExplanation: finalReport.riskExplanation,
        actionRecommendation: finalReport.actionRecommendation,
        reminderSuggestion: finalReport.reminderSuggestion,
        subtasks: formattedSubtasks,
      });

      onAddTask(newTask);
      setSuccessMsg("Task added and evaluated successfully!");
      
      setTimeout(() => {
        setCurrentTab('dashboard');
      }, 1000);

    } catch (err) {
      console.error(err);
      alert("Encountered an error saving task configurations.");
    } finally {
      setSavingLoading(false);
    }
  };

  const categories: TaskCategory[] = ["Work", "Study", "Life", "Finance", "Health", "Hackathon", "Other"];
  const importanceLevels: ImportanceLevel[] = ["Low", "Medium", "High", "Critical"];

  return (
    <div className="p-4 lg:p-8 select-none font-sans max-w-4xl mx-auto space-y-8 text-zinc-900">
      
      <div className="space-y-1 pb-4 border-b border-zinc-200">
        <h2 className="text-2xl font-black text-zinc-950 tracking-tight font-sans uppercase">Create & Analyze Goal</h2>
        <p className="text-xs text-zinc-500">Provide assignment, exam, or project attributes. Google Gemini evaluates scoring, subtasks, and schedule blocks instantly.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        
        {/* Form panel (3/5 scale) */}
        <form onSubmit={handleSubmit} className="md:col-span-3 bg-white border border-zinc-200 p-6 rounded-lg shadow-sm hover:shadow-[3px_3px_0px_0px_rgba(9,9,11,1)] transition-all space-y-5" id="add-task-form">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono mb-1.5" htmlFor="task-title">
              Task Title / Name
            </label>
            <input
              id="task-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-50 focus:bg-white border border-zinc-200 focus:border-zinc-950 rounded-md text-sm font-semibold transition-all outline-none font-mono placeholder-zinc-450"
              placeholder="E.g., Vibe2Ship Final Pitch Prep"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono mb-1.5" htmlFor="task-description">
              Context / Description
            </label>
            <textarea
              id="task-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-50 focus:bg-white border border-zinc-200 focus:border-zinc-950 rounded-md text-sm font-semibold transition-all outline-none resize-none font-mono placeholder-zinc-450"
              placeholder="E.g., Design slides highlighting real-time LLM caching patterns. Need mock draft."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono mb-1.5" htmlFor="task-category">
                Category
              </label>
              <select
                id="task-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 rounded-md text-sm font-semibold font-mono transition-all outline-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono mb-1.5" htmlFor="task-deadline">
                Deadline Date
              </label>
              <input
                id="task-deadline"
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 rounded-md text-sm font-semibold font-mono transition-all outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono" htmlFor="task-effort">
                  Estimated Effort
                </label>
                <span className="text-xs font-mono font-bold text-zinc-950 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-sm">{estimatedEffortHours} hrs</span>
              </div>
              <input
                id="task-effort"
                type="range"
                min="1"
                max="30"
                step="1"
                value={estimatedEffortHours}
                onChange={(e) => setEstimatedEffortHours(Number(e.target.value))}
                className="w-full accent-zinc-950 h-2 bg-zinc-100 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono mb-1.5" htmlFor="task-importance">
                Importance Level
              </label>
              <select
                id="task-importance"
                value={importance}
                onChange={(e) => setImportance(e.target.value as ImportanceLevel)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 rounded-md text-sm font-semibold font-mono transition-all outline-none cursor-pointer"
              >
                {importanceLevels.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl} Importance</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleAIAnalyze}
              disabled={analyzing}
              className="flex-1 py-3 px-4 bg-white hover:bg-zinc-55 border border-zinc-950 text-zinc-950 font-bold font-mono text-xs uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,0.15)]"
              id="analyze-with-gemini-btn"
            >
              <BrainCircuit className="w-4 h-4 text-zinc-900 animate-pulse" />
              <span>{analyzing ? "AI EVALUATING..." : "Run AI Prediction"}</span>
            </button>

            <button
              type="submit"
              disabled={savingLoading}
              className={`flex-1 py-3 px-4 font-bold font-mono text-xs uppercase tracking-wider text-white rounded-md shadow-[2px_2px_0px_rgba(0,0,0,0.15)] transition-all flex items-center justify-center gap-2 cursor-pointer ${
                savingLoading ? "bg-zinc-700 cursor-not-allowed" : "bg-zinc-950 hover:bg-zinc-850"
              }`}
              id="submit-task-btn"
            >
              <Save className="w-4 h-4" />
              <span>{savingLoading ? "COMPILING..." : "Save Goal"}</span>
            </button>
          </div>

          {successMsg && (
            <div className="p-3 bg-semibold rounded bg-emerald-50 border border-emerald-200 flex gap-2 items-center text-xs text-emerald-800 font-mono">
              <CheckCircle className="w-4 h-4 text-emerald-755" />
              <span>{successMsg}</span>
            </div>
          )}
        </form>

        {/* AI report panel (2/5 scale) */}
        <div className="md:col-span-2 space-y-6">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 font-mono">
            <Bot className="w-4.5 h-4.5 text-zinc-950" />
            <span>AI Guardian Prediction</span>
          </h3>

          <div className="bg-zinc-950 text-zinc-100 rounded-lg shadow-sm hover:shadow-[3px_3px_0px_0px_rgba(9,9,11,1)] transition-all p-5 border border-zinc-850 relative overflow-hidden min-h-[300px] flex flex-col justify-between">
            {/* Absolute visual context label */}
            <div className="absolute right-[-10px] bottom-[-15px] opacity-[0.03] text-[90px] font-mono leading-none select-none pointer-events-none">AI</div>

            {analyzing && (
              <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                <div>
                  <p className="text-xs font-bold tracking-wider text-white font-mono uppercase animate-pulse">Consulting Google Gemini...</p>
                  <p className="text-[10px] text-zinc-400 mt-2 max-w-[200px] mx-auto leading-relaxed">Evaluating risk curves, predicting effort thresholds, and decomposing milestone subtasks.</p>
                </div>
              </div>
            )}

            {!analyzing && !aiReport && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-4">
                <BrainCircuit className="w-10 h-10 text-zinc-700 stroke-[1.5]" />
                <h4 className="font-bold text-zinc-300 text-sm font-mono uppercase tracking-wide">Interactive AI evaluation</h4>
                <p className="text-xs text-zinc-400 max-w-sm font-sans">
                  Execute <span className="text-amber-400 font-bold border-b border-zinc-800">"Run AI Prediction"</span> on the workspace creator form to obtain detailed predicted analytics:
                </p>
                <div className="text-[10px] text-zinc-400 space-y-1 text-left font-mono">
                  <p>✔ Priority Score parameters (0-100)</p>
                  <p>✔ Delay hazard indices (High/Med/Low)</p>
                  <p>✔ Dynamic milestone segmentations</p>
                  <p>✔ Custom action sequence recommenders</p>
                </div>
              </div>
            )}

            {aiReport && (
              <div className="space-y-4 flex-1">
                {/* Metric metrics */}
                <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-zinc-400 font-mono tracking-widest block header-label">URGENCY SCORE</span>
                    <p className="text-3xl font-black text-white font-mono leading-none mt-1">{aiReport.priorityScore}<span className="text-xs text-zinc-500 font-normal">/100</span></p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold text-zinc-400 font-mono tracking-widest block header-label">HAZARD INDEX</span>
                    <div className="mt-1">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider font-mono ${
                        aiReport.riskLevel === "High" ? "bg-rose-955 text-rose-300 border border-rose-900" :
                        aiReport.riskLevel === "Medium" ? "bg-amber-955 text-amber-300 border border-amber-900" :
                        "bg-zinc-900 text-zinc-300 border border-zinc-800"
                      }`}>
                        {aiReport.riskLevel} Risk
                      </span>
                    </div>
                  </div>
                </div>

                {/* Risk Explanation */}
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-zinc-400 font-mono tracking-widest leading-none block">Delay Risk Predictor</span>
                  <p className="text-xs text-zinc-200 leading-relaxed font-semibold italic">"{aiReport.riskExplanation}"</p>
                </div>

                {/* Subtask breakdown visualization */}
                <div className="space-y-2 border-t border-zinc-850 pt-3">
                  <span className="text-[9px] uppercase font-bold text-zinc-400 font-mono tracking-widest leading-none block">Segmented Milestones</span>
                  
                  <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                    {aiReport.subtasks.map((st, i) => (
                      <div key={i} className="bg-zinc-900 p-2 border border-zinc-850 rounded flex items-center justify-between gap-2 shadow-inner">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-4.5 h-4.5 rounded bg-zinc-805 text-zinc-200 text-xs flex items-center justify-center font-mono shrink-0 font-bold border border-zinc-800">{st.sequenceOrder}</span>
                          <span className="text-xs font-mono text-zinc-200 truncate">{st.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 shrink-0">{st.durationMinutes}m</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Proactive Coaching advice */}
                <div className="p-3 bg-zinc-900 border border-zinc-850 rounded-md space-y-1 mt-2">
                  <span className="text-[9px] uppercase font-bold text-amber-400 font-mono tracking-widest leading-none flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Dynamic Advice</span>
                  </span>
                  <p className="text-[11px] text-zinc-300 leading-relaxed font-semibold font-mono">{aiReport.actionRecommendation}</p>
                </div>
              </div>
            )}

            {aiReport && (
              <div className="mt-4 pt-3 border-t border-zinc-850 flex items-center justify-between text-[10px]/none text-zinc-400 font-mono">
                <span className="flex items-center gap-1">
                  <Bot className="w-3.5 h-3.5 text-zinc-300" />
                  <span>GEMINI CRITERIA</span>
                </span>
                <span className="tracking-wide">2.5 flash</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
