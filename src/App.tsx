import React, { useState, useEffect } from 'react';
import { db } from './lib/db';
import { Task, UserProfile } from './types';
import Navigation from './components/Navigation';
import AuthView from './components/AuthView';
import DashboardView from './components/DashboardView';
import AddEditTaskView from './components/AddEditTaskView';
import AIPlannerView from './components/AIPlannerView';
import ProgressAnalyticsView from './components/ProgressAnalyticsView';
import UserProfileView from './components/UserProfileView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Load user profile and tasks on startup
  useEffect(() => {
    const user = db.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      const userTasks = db.getTasks(user.uid);
      setTasks(userTasks);
    }
  }, []);

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    const userTasks = db.getTasks(user.uid);
    setTasks(userTasks);
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    db.logout();
    setCurrentUser(null);
    setTasks([]);
  };

  const handleAddTask = (newTask: Task) => {
    // Tasks are updated in db inside the AddEditTaskView component,
    // we simply sync the React state here.
    if (currentUser) {
      const updatedList = db.getTasks(currentUser.uid);
      setTasks(updatedList);
    }
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    if (!currentUser) return;
    try {
      db.updateTask(currentUser.uid, taskId, updates);
      const updatedList = db.getTasks(currentUser.uid);
      setTasks(updatedList);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCompleteTask = (taskId: string) => {
    if (!currentUser) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    handleUpdateTask(taskId, { completed: !task.completed });
  };

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = db.updateProfile(currentUser.uid, updates);
    setCurrentUser(updated);
  };

  const handleResetDatabase = () => {
    if (!currentUser) return;
    localStorage.removeItem(`dg_tasks_${currentUser.uid}`);
    localStorage.removeItem(`dg_schedule_${currentUser.uid}_${new Date().toISOString().split('T')[0]}`);
    const seeded = db.getTasks(currentUser.uid);
    setTasks(seeded);
    setCurrentTab('dashboard');
  };

  if (!currentUser) {
    return <AuthView onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-zinc-100/50 flex flex-col lg:flex-row relative z-0">
      
      {/* Responsive Navigation Sidebar/Top Menu overlay */}
      <Navigation 
        currentUser={currentUser}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onLogout={handleLogout}
      />

      {/* Primary Content Canvas */}
      <main className="flex-1 overflow-y-auto max-h-screen">
        {currentTab === 'dashboard' && (
          <DashboardView 
            currentUser={currentUser}
            tasks={tasks}
            setCurrentTab={setCurrentTab}
            onToggleCompleteTask={handleToggleCompleteTask}
          />
        )}

        {currentTab === 'add-task' && (
          <AddEditTaskView 
            currentUser={currentUser}
            onAddTask={handleAddTask}
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 'ai-planner' && (
          <AIPlannerView 
            currentUser={currentUser}
            tasks={tasks}
            onUpdateTask={handleUpdateTask}
            onRefreshTasksList={() => setTasks(db.getTasks(currentUser.uid))}
          />
        )}

        {currentTab === 'progress' && (
          <ProgressAnalyticsView 
            tasks={tasks}
          />
        )}

        {currentTab === 'profile' && (
          <UserProfileView 
            currentUser={currentUser}
            tasks={tasks}
            onUpdateProfile={handleUpdateProfile}
            onResetDatabase={handleResetDatabase}
          />
        )}
      </main>

    </div>
  );
}
