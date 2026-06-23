import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environmental variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini API client if API key exists
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY is not defined. Using mock fallback mode.");
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Healthy route
app.get('/api/health', (req, res) => {
  res.json({
    status: "ok",
    hasGeminiApiKey: !!process.env.GEMINI_API_KEY,
    appUrl: process.env.APP_URL || "http://localhost:3000"
  });
});

/**
 * 1. AI-Powered Task breakdown & Analysis Endpoint
 * Analyzes urgency, importance, deadline, estimated effort, and generates:
 *  - Priority Score
 *  - Risk Prediction & Level
 *  - Breakdown subtasks
 *  - Actions recommendations
 *  - Smart reminders
 */
app.post('/api/analyze-task', async (req, res) => {
  const { title, description, category, deadline, estimatedEffortHours, importance, userCurrentWorkload } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Task title is required." });
  }

  const ai = getGeminiClient();

  // If no Gemini client is available, generate an intelligent mockup calculations so user can still demo
  if (!ai) {
    // Elegant fallbacks depending on urgency
    const daysUntilDeadline = deadline ? Math.max(0, Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 7;
    
    let baseScore = 30;
    if (importance === "Critical") baseScore += 40;
    else if (importance === "High") baseScore += 25;
    else if (importance === "Medium") baseScore += 12;

    if (daysUntilDeadline <= 1) baseScore += 30;
    else if (daysUntilDeadline <= 3) baseScore += 20;
    else if (daysUntilDeadline <= 7) baseScore += 10;

    const priorityScore = Math.min(100, Math.max(0, Math.round(baseScore + (estimatedEffortHours || 2) * 2)));

    let riskLevel: "Low" | "Medium" | "High" = "Low";
    let riskExplanation = "This task has ample lead time and moderate complexity. You're fully on track.";
    
    if (daysUntilDeadline <= 2 && estimatedEffortHours > 4) {
      riskLevel = "High";
      riskExplanation = `High risk because the deadline is in ${daysUntilDeadline} days, and you need approximately ${estimatedEffortHours} hours to finish, indicating possible time squeeze.`;
    } else if (daysUntilDeadline <= 4 || estimatedEffortHours > 8) {
      riskLevel = "Medium";
      riskExplanation = `Moderate risk due to the task's scale (${estimatedEffortHours} hrs) vs. remaining days (${daysUntilDeadline} days to deadline).`;
    }

    const mockSubtasks = [
      { id: "sub-1", title: `Initial research and outline for ${title}`, durationMinutes: Math.round((estimatedEffortHours * 60) * 0.25), sequenceOrder: 1, completed: false },
      { id: "sub-2", title: `Core execution / drafting first version`, durationMinutes: Math.round((estimatedEffortHours * 60) * 0.5), sequenceOrder: 2, completed: false },
      { id: "sub-3", title: `Refinement and double-checking checklist`, durationMinutes: Math.round((estimatedEffortHours * 60) * 0.25), sequenceOrder: 3, completed: false }
    ];

    return res.json({
      priorityScore,
      riskLevel,
      riskExplanation,
      actionRecommendation: `We recommend blocking out ${estimatedEffortHours} total hours this week. Start with the subtasks. Avoid multitasking and focus entirely on "${title}" during high-energy blocks.`,
      subtasks: mockSubtasks,
      reminderSuggestion: `💡 Don't put it off! Just 15 minutes of starter effort on "${title}" will beat the procrastination resistance.`,
      isMock: true
    });
  }

  try {
    const daysUntilDeadline = deadline ? Math.max(0, Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 7;
    
    const prompt = `You are the core logic for the "Deadline Guardian AI" productivity backend.
Analyze the following task and generate structured productivity metrics, prioritization scoring, task breakdown layout, risks, and proactive advice.

TASK DETAILS:
Title: "${title}"
Description: "${description || 'None'}"
Category: "${category}"
Deadline: "${deadline}" (${daysUntilDeadline} days remaining from today)
Estimated Effort: ${estimatedEffortHours} hours
Importance Level: "${importance}"
User's Overall Workload: "${userCurrentWorkload || 'Normal'}"

Generate your response strictly as a JSON object, with no markdown formatting tags and no extra conversational text outside the JSON. The JSON structure MUST be:
{
  "priorityScore": <number between 0 and 100 based on importance, deadline urgency, and effort>,
  "riskLevel": "<"Low" or "Medium" or "High" depending on if the user is likely to miss the deadline>",
  "riskExplanation": "<short explanation analyzing days remaining vs estimated hours vs importance>",
  "actionRecommendation": "<1-2 sentences of extremely specific and proactive initial step>",
  "subtasks": [
    {
      "title": "<title of subtask 1>",
      "durationMinutes": <estimated minutes for subtask 1>,
      "sequenceOrder": 1
    },
    {
      "title": "<title of subtask 2>",
      "durationMinutes": <estimated minutes for subtask 2>,
      "sequenceOrder": 2
    },
    {
      "title": "<title of subtask 3>",
      "durationMinutes": <estimated minutes for subtask 3>,
      "sequenceOrder": 3
    }
  ],
  "reminderSuggestion": "<a highly actionable, context-aware smart warning/reminder text for the user>"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    return res.json(parsed);

  } catch (error: any) {
    console.error("Gemini API Error in analyze-task:", error);
    return res.status(500).json({ error: "Failure to analyze task with Gemini. Falling back to offline prediction." });
  }
});

/**
 * 2. Daily Schedule Planner Generator Endpoint
 * Recommends focus blocks throughout the day based on user limit and pending task priorities.
 */
app.post('/api/generate-schedule', async (req, res) => {
  const { date, tasks, dailyWorkloadLimitHours } = req.body;

  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    return res.json({
      blocks: [],
      aiNotes: "No active tasks are available to construct your guard plan! Please add some goals to formulate a smart track."
    });
  }

  const ai = getGeminiClient();

  // If no Gemini client is available, generate an elegant mock schedule that matches task details
  if (!ai) {
    const sortedTasks = [...tasks].sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
    const blocks: any[] = [];
    let currentHour = 9; // Start at 9:00 AM
    let totalAssignedMinutes = 0;
    const maxMinutes = (dailyWorkloadLimitHours || 6) * 60;

    for (let i = 0; i < sortedTasks.length; i++) {
      const task = sortedTasks[i];
      if (totalAssignedMinutes >= maxMinutes) break;

      // Extract a portion to complete today
      const remainingMinutes = Math.min(120, maxMinutes - totalAssignedMinutes);
      if (remainingMinutes < 30) break;

      const duration = remainingMinutes > 90 ? 90 : remainingMinutes;
      const startStr = `${String(currentHour).padStart(2, '0')}:00`;
      
      const rawEndHour = currentHour + Math.floor(duration / 60);
      const rawEndMin = duration % 60;
      const endStr = `${String(rawEndHour).padStart(2, '0')}:${String(rawEndMin).padStart(2, '0')}`;

      blocks.push({
        id: `block-${task.id}-${i}`,
        taskId: task.id,
        taskTitle: task.title,
        title: `Focus session: ${task.title} (Core Execution)`,
        startTime: startStr,
        endTime: endStr,
        durationMinutes: duration,
        completed: false
      });

      currentHour = rawEndHour + 1; // Take a 1 hour gap/break block or lunch
      totalAssignedMinutes += duration;
    }

    return res.json({
      blocks,
      aiNotes: `Daily Planner calibrated based on your ${dailyWorkloadLimitHours}-hour threshold. We scheduled your highest priority goals first, with healthy transition buffers between them to counteract study fatigue.`
    });
  }

  try {
    const formattedTaskDetails = tasks.map((t: any) => 
      `- [${t.category}] "${t.title}" (Priority Score: ${t.priorityScore}, Effort: ${t.estimatedEffortHours}h, Deadline: ${t.deadline}, Importance: ${t.importance})`
    ).join("\n");

    const prompt = `You are "Deadline Guardian AI" scheduler engine.
Build a daily schedule outline for date: "${date}" based on tasks available.
The user's maximum workload limit for today is ${dailyWorkloadLimitHours} hours. This limit dictates that the sum total of active focus durationMinutes cannot exceed ${dailyWorkloadLimitHours * 60} minutes.

PENDING TASK CANDIDATES:
${formattedTaskDetails}

Design a personalized schedule block layout starting at 09:00 AM. Distribute tasks chronologically based on priority scores. Leave short gaps/breaks between consecutive blocks. Include a "Lunch Break" block or transition pauses if applicable, which do not count towards the workload hours limit.

Generate your response strictly as a JSON object, with no markdown formatting tags and no extra conversational text outside the JSON. The JSON structure MUST be:
{
  "blocks": [
    {
      "taskId": "<task id from candidate task list>",
      "taskTitle": "<title of task>",
      "title": "<specific execution target, e.g., 'Draft documentation intro' or 'Solve algebra questions'>",
      "startTime": "09:00",
      "endTime": "10:30",
      "durationMinutes": 90
    }
  ],
  "aiNotes": "<1-3 bullet points of high-level coaching advice to keep user accountable today>"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    return res.json(parsed);

  } catch (error: any) {
    console.error("Gemini API Error in generate-schedule:", error);
    return res.status(500).json({ error: "Failed to build daily planner via Gemini. Please try again." });
  }
});


// Serve files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    console.log(`Serving static files from production build directory: ${distPath}`);
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Deadline Guardian Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
