import { Task, UserProfile, DailySchedule, TaskCategory, ImportanceLevel, RiskLevel, Subtask } from '../types';

// Let's create dynamic demo dates so that upcoming deadlines are always 1 to 5 days ahead of "today"
const getFutureDateString = (daysOffset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

const INITIAL_DEMO_TASKS: Task[] = [
  {
    id: "task-demo-1",
    userId: "demo-user-123",
    title: "Vibe2Ship Final Pitch Deck",
    description: "Prepare and refine the final presentation slides for the Deadline Guardian AI hackathon submission. Must highlight Gemini integration.",
    category: "Hackathon",
    deadline: getFutureDateString(1), // Tomorrow
    estimatedEffortHours: 4,
    importance: "Critical",
    priorityScore: 95,
    riskLevel: "High",
    riskExplanation: "Tomorrow is the pitch deadline! You estimate 4 focus hours remaining, and you also have other exams to study for, putting this slider at severe bottleneck.",
    actionRecommendation: "Block out 2 hours today at 9:00 AM for content drafting. Complete the remaining slides tomorrow morning. Delegate mock voiceovers.",
    reminderSuggestion: "⏰ Urgency Flag: Drop all secondary admin tasks. Your final submission pitch is due in less than 24 hours!",
    subtasks: [
      { id: "sub-1-1", title: "Complete architecture layout slide", completed: true, durationMinutes: 60, sequenceOrder: 1 },
      { id: "sub-1-2", title: "Draft slide for technical API workflows", completed: false, durationMinutes: 120, sequenceOrder: 2 },
      { id: "sub-1-3", title: "Rehearse 3-minute pitch presentation", completed: false, durationMinutes: 60, sequenceOrder: 3 },
    ],
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "task-demo-2",
    userId: "demo-user-123",
    title: "Midterm Exam Preparation (Database Systems)",
    description: "Study relational algebra, SQL optimization, and Firestore security rules chapters. Complete practice exercises.",
    category: "Study",
    deadline: getFutureDateString(3), // In 3 days
    estimatedEffortHours: 8,
    importance: "High",
    priorityScore: 82,
    riskLevel: "Medium",
    riskExplanation: "The exam is in 3 days. With 8 hours of total study requested, you need roughly 2.6 hours of structured study daily, leaving low room for error.",
    actionRecommendation: "Schedule two 90-minute study sprints on relational algebra indexing. Complete chapter 5 model equations first.",
    reminderSuggestion: "📚 Procrastination Alert: Research says a 15-minute diagnostic self-test beats study inertia. Set a timer right now.",
    subtasks: [
      { id: "sub-2-1", title: "Create flash cards for ACID properties", completed: true, durationMinutes: 60, sequenceOrder: 1 },
      { id: "sub-2-2", title: "Apply indexing optimization recipes", completed: false, durationMinutes: 180, sequenceOrder: 2 },
      { id: "sub-2-3", title: "Take 2025 practice midterm paper", completed: false, durationMinutes: 240, sequenceOrder: 3 },
    ],
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "task-demo-3",
    userId: "demo-user-123",
    title: "AWS Cloud Infrastructure Billing Review",
    description: "Conduct monthly check on AWS billing metrics, shut down idle development databases, and optimize S3 lifecycle configurations.",
    category: "Finance",
    deadline: getFutureDateString(5), // In 5 days
    estimatedEffortHours: 1.5,
    importance: "Medium",
    priorityScore: 48,
    riskLevel: "Low",
    riskExplanation: "Low risk. Generous 5 days remaining for a brief checkup requiring less than 2 hours of technical effort.",
    actionRecommendation: "Open AWS Cost Explorer, check S3 bucket patterns, and prune orphan EFS storage nodes.",
    reminderSuggestion: "💰 Saving Opportunity: Complete this brief review to safeguard against accidental pricing overruns.",
    subtasks: [
      { id: "sub-3-s1", title: "Verify S3 Intelligent-Tiering setup", completed: false, durationMinutes: 45, sequenceOrder: 1 },
      { id: "sub-3-s2", title: "Terminate idle sandbox servers", completed: false, durationMinutes: 45, sequenceOrder: 2 },
    ],
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "task-demo-4",
    userId: "demo-user-123",
    title: "Mock Interview with Tech Lead",
    description: "Prepare and mock test coding whiteboard algorithms (Dynamic Programming, Graph Traversal).",
    category: "Work",
    deadline: getFutureDateString(2), // In 2 days
    estimatedEffortHours: 3,
    importance: "High",
    priorityScore: 78,
    riskLevel: "Medium",
    riskExplanation: "Highly urgent setup scheduled in 2 days. While duration is brief, technical preparation requires high focus.",
    actionRecommendation: "Spend 60 minutes solving topological sorting patterns. Practice explaining design decisions aloud.",
    reminderSuggestion: "🤝 Performance Boost: A mock verbal workout reduces interview anxiety by 40%. Practice with a friend.",
    subtasks: [
      { id: "sub-4-1", title: "Review Graph Traversal patterns", completed: true, durationMinutes: 60, sequenceOrder: 1 },
      { id: "sub-4-2", title: "Practice dynamic programming memoization", completed: false, durationMinutes: 120, sequenceOrder: 2 },
    ],
    completed: true,
    completedAt: new Date(Date.now() - 4 * 3600000).toISOString(), // Completed 4 hours ago
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_PROFILE: UserProfile = {
  uid: "demo-user-123",
  email: "developer@vibe2ship.org",
  displayName: "Alex Guardian",
  dailyWorkloadLimitHours: 6,
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
  joinedAt: "2026-06-01"
};

const DEFAULT_SCHEDULE: DailySchedule = {
  userId: "demo-user-123",
  date: new Date().toISOString().split('T')[0],
  blocks: [
    {
      id: "block-1",
      taskId: "task-demo-1",
      taskTitle: "Vibe2Ship Final Pitch Deck",
      title: "Design architecture and system workflows slide",
      startTime: "09:00",
      endTime: "10:30",
      durationMinutes: 90,
      completed: true
    },
    {
      id: "block-2",
      taskId: "task-demo-1",
      taskTitle: "Vibe2Ship Final Pitch Deck",
      title: "Formulate business monetization slide & pitch script",
      startTime: "11:00",
      endTime: "12:30",
      durationMinutes: 90,
      completed: false
    },
    {
      id: "block-3",
      taskId: "task-demo-2",
      taskTitle: "Midterm Exam Preparation",
      title: "Index optimization study and textbook exercises",
      startTime: "13:30",
      endTime: "15:00",
      durationMinutes: 90,
      completed: false
    }
  ],
  aiNotes: "This schedule spaces out cognitive effort. Your morning contains 3 prime focus hours targeted at high-urgency hackathon deliverables, transitioning into technical textbook review in the quiet afternoon."
};

/**
 * Storage helpers with mock support. Syncs on localStorage.
 */
export const db = {
  // Authentication Mock
  getCurrentUser: (): UserProfile | null => {
    const user = localStorage.getItem('dg_user');
    if (!user) {
      // Seed default user for immediate preview readiness
      localStorage.setItem('dg_user', JSON.stringify(DEFAULT_PROFILE));
      return DEFAULT_PROFILE;
    }
    return JSON.parse(user);
  },

  login: (email: string, pass: string): UserProfile => {
    const defaultUser = { ...DEFAULT_PROFILE, email: email, displayName: email.split('@')[0] };
    localStorage.setItem('dg_user', JSON.stringify(defaultUser));
    return defaultUser;
  },

  register: (email: string, name: string): UserProfile => {
    const newUser = {
      uid: Math.random().toString(36).substr(2, 9),
      email,
      displayName: name || email.split('@')[0],
      dailyWorkloadLimitHours: 6,
      joinedAt: new Date().toISOString().split('T')[0],
      avatarUrl: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200`
    };
    localStorage.setItem('dg_user', JSON.stringify(newUser));
    return newUser;
  },

  logout: () => {
    localStorage.removeItem('dg_user');
  },

  // Tasks Database CRUD
  getTasks: (userId: string): Task[] => {
    const stored = localStorage.getItem(`dg_tasks_${userId}`);
    if (!stored) {
      localStorage.setItem(`dg_tasks_${userId}`, JSON.stringify(INITIAL_DEMO_TASKS));
      return INITIAL_DEMO_TASKS;
    }
    return JSON.parse(stored);
  },

  saveTasks: (userId: string, tasks: Task[]) => {
    localStorage.setItem(`dg_tasks_${userId}`, JSON.stringify(tasks));
  },

  addTask: (userId: string, taskData: Partial<Task>): Task => {
    const tasks = db.getTasks(userId);
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      title: taskData.title || "Untitled Goal",
      description: taskData.description || "",
      category: taskData.category || "Other",
      deadline: taskData.deadline || getFutureDateString(3),
      estimatedEffortHours: Number(taskData.estimatedEffortHours) || 2,
      importance: taskData.importance || "Medium",
      priorityScore: taskData.priorityScore || 50,
      riskLevel: taskData.riskLevel || "Low",
      riskExplanation: taskData.riskExplanation || "Reviewing pending assessment parameters.",
      actionRecommendation: taskData.actionRecommendation || "Take step-by-step progress blocks.",
      reminderSuggestion: taskData.reminderSuggestion || "⏱️ Keep visual track of your timeline boundary.",
      subtasks: taskData.subtasks || [],
      completed: false,
      createdAt: new Date().toISOString()
    };
    tasks.unshift(newTask);
    db.saveTasks(userId, tasks);
    return newTask;
  },

  updateTask: (userId: string, taskId: string, updates: Partial<Task>): Task => {
    const tasks = db.getTasks(userId);
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) throw new Error("Task not found");
    
    // Maintain completion timestamp when transitioning to complete status
    let completedAt = tasks[index].completedAt;
    if (updates.completed === true && tasks[index].completed === false) {
      completedAt = new Date().toISOString();
    } else if (updates.completed === false) {
      completedAt = undefined;
    }

    const updatedTask = { ...tasks[index], ...updates, completedAt };
    tasks[index] = updatedTask;
    db.saveTasks(userId, tasks);
    return updatedTask;
  },

  deleteTask: (userId: string, taskId: string) => {
    const tasks = db.getTasks(userId);
    const filtered = tasks.filter(t => t.id !== taskId);
    db.saveTasks(userId, filtered);
  },

  // Daily Schedule Storage
  getSchedule: (userId: string, date: string): DailySchedule => {
    const stored = localStorage.getItem(`dg_schedule_${userId}_${date}`);
    if (!stored) {
      // Return beautiful default schedule matching today's date
      const customDefault = { ...DEFAULT_SCHEDULE, date };
      localStorage.setItem(`dg_schedule_${userId}_${date}`, JSON.stringify(customDefault));
      return customDefault;
    }
    return JSON.parse(stored);
  },

  saveSchedule: (userId: string, schedule: DailySchedule) => {
    localStorage.setItem(`dg_schedule_${userId}_${schedule.date}`, JSON.stringify(schedule));
  },

  // Profile management
  getProfile: (userId: string): UserProfile => {
    const user = db.getCurrentUser();
    if (user && user.uid === userId) return user;
    return DEFAULT_PROFILE;
  },

  updateProfile: (userId: string, updates: Partial<UserProfile>): UserProfile => {
    const user = db.getCurrentUser();
    if (user && user.uid === userId) {
      const updated = { ...user, ...updates };
      localStorage.setItem('dg_user', JSON.stringify(updated));
      return updated;
    }
    return DEFAULT_PROFILE;
  },

  // Call Server-side API for Gemini Analysis
  analyzeTaskWithGemini: async (taskData: {
    title: string;
    description: string;
    category: TaskCategory;
    deadline: string;
    estimatedEffortHours: number;
    importance: ImportanceLevel;
    userCurrentWorkload?: string;
  }): Promise<{
    priorityScore: number;
    riskLevel: RiskLevel;
    riskExplanation: string;
    actionRecommendation: string;
    subtasks: Array<{ title: string; durationMinutes: number; sequenceOrder: number }>;
    reminderSuggestion: string;
    isMock?: boolean;
  }> => {
    try {
      const response = await fetch('/api/analyze-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      if (!response.ok) throw new Error("API call returned error code status");
      return await response.json();
    } catch (err) {
      console.error("Failed server logic. Generating clever mock response on browser.", err);
      // Fallback generator
      const days = Math.max(1, Math.ceil((new Date(taskData.deadline).getTime() - new Date().getTime()) / 86400000));
      const priorityScore = Math.min(100, Math.max(12, Math.round(
        (taskData.importance === "Critical" ? 50 : taskData.importance === "High" ? 35 : taskData.importance === "Medium" ? 20 : 10) +
        (days <= 2 ? 40 : days <= 4 ? 25 : days <= 7 ? 12 : 5) + 
        taskData.estimatedEffortHours * 1.5
      )));
      const riskLevel = days <= 2 && taskData.estimatedEffortHours > 4 ? "High" : days <= 4 ? "Medium" : "Low";
      
      return {
        priorityScore,
        riskLevel,
        riskExplanation: `Analyzing ${taskData.estimatedEffortHours} hrs over ${days} days remaining. Level: ${riskLevel}.`,
        actionRecommendation: `Block early mornings to start core segments of "${taskData.title}". Avoid delayed review.`,
        subtasks: [
          { title: "Define structure and capture requirements", durationMinutes: Math.round(taskData.estimatedEffortHours * 15), sequenceOrder: 1 },
          { title: "Develop core deliverables", durationMinutes: Math.round(taskData.estimatedEffortHours * 30), sequenceOrder: 2 },
          { title: "Polishing & Final Submission review", durationMinutes: Math.round(taskData.estimatedEffortHours * 15), sequenceOrder: 3 }
        ],
        reminderSuggestion: "💡 Plan a short 15-minute diagnostic session immediately to overcome initial barrier.",
        isMock: true
      };
    }
  },

  // Call Server-side API for Gemini Schedule Formulation
  generateScheduleWithGemini: async (userId: string, date: string, tasks: Task[], dailyWorkloadLimitHours: number): Promise<DailySchedule> => {
    try {
      const response = await fetch('/api/generate-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, tasks, dailyWorkloadLimitHours })
      });
      if (!response.ok) throw new Error("Schedule query failed.");
      const data = await response.json();
      const payload: DailySchedule = {
        userId,
        date,
        blocks: data.blocks.map((b: any, index: number) => ({
          id: b.id || `b-${index}-${Date.now()}`,
          taskId: b.taskId || "",
          taskTitle: b.taskTitle || "Focus Block",
          title: b.title || `Study session for ${b.taskTitle}`,
          startTime: b.startTime || "09:00",
          endTime: b.endTime || "10:00",
          durationMinutes: Number(b.durationMinutes) || 60,
          completed: false
        })),
        aiNotes: data.aiNotes || "Work schedule generated."
      };
      db.saveSchedule(userId, payload);
      return payload;
    } catch (err) {
      console.error("Local schedule mockup generator fallback.", err);
      // Browser fallback builder
      const activeTasks = tasks.filter(t => !t.completed).sort((a,b) => b.priorityScore - a.priorityScore);
      const blocks: any[] = [];
      let nextHour = 9;
      let totalMins = 0;
      const budgetMins = dailyWorkloadLimitHours * 60;

      activeTasks.forEach((t, i) => {
        if (totalMins >= budgetMins) return;
        const dur = Math.min(90, budgetMins - totalMins);
        if (dur < 30) return;

        const hrStr = String(nextHour).padStart(2, '0') + ":00";
        nextHour += Math.floor((dur) / 60);
        const endMin = (dur) % 60;
        const endStr = String(nextHour).padStart(2, '0') + `:${String(endMin).padStart(2, '0')}`;
        
        blocks.push({
          id: `block-${t.id}-${i}`,
          taskId: t.id,
          taskTitle: t.title,
          title: `Focus session: ${t.title} [Breakdown ${i+1}]`,
          startTime: hrStr,
          endTime: endStr,
          durationMinutes: dur,
          completed: false
        });
        totalMins += dur;
        nextHour += 1; // 1-hour healthy gap
      });

      const schedPayload: DailySchedule = {
        userId,
        date,
        blocks,
        aiNotes: `Created ${blocks.length} highly strategic blocks mapped within your study limits today of ${dailyWorkloadLimitHours} hrs.`
      };
      db.saveSchedule(userId, schedPayload);
      return schedPayload;
    }
  }
};
