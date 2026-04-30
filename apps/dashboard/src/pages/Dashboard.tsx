import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shift, Task, Note, SauceInventory } from '@marrybrown/shared';

const MANDATORY_TASKS = [
  { name: 'Cook backup rice at 12:00pm', isFridayOnly: false },
  { name: 'Prepare ingredients for burgers and rice dishes', isFridayOnly: false },
  { name: 'Refill cheese sauce', isFridayOnly: false },
  { name: 'Refill mayonnaise', isFridayOnly: false },
  { name: 'Refill other condiments', isFridayOnly: false },
  { name: 'Marinate chickens', isFridayOnly: false },
  { name: 'Restock consumables (cardboard boxes, drink cups, paper bags, napkins)', isFridayOnly: false },
  { name: 'Oil change — weekly (Friday only)', isFridayOnly: true },
];

const quickAccessItems = [
  { title: 'Chicken Production Log', icon: '🍗', path: '/chicken-production' },
  { title: 'Sauce Tracker', icon: '🥫', path: '/sauce-tracker' },
  { title: 'Notes and Alerts', icon: '📝', path: '/notes-alerts' },
  { title: 'Task Management', icon: '✅', path: '/tasks' },
  { title: 'Daily Shifts', icon: '📅', path: '/daily-shifts' },
  { title: 'Weekly Roster', icon: '📆', path: '/weekly-roster' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [sauceInventory, setSauceInventory] = useState<SauceInventory[]>([]);

  const today = new Date().toISOString().split('T')[0];
  const isFriday = new Date().getDay() === 5;

  const API_URL = 'http://localhost:4000';

  const loadAllData = () => {
    // Load shifts
    const storedShifts = localStorage.getItem('marrybrown_daily_shifts');
    if (storedShifts) {
      const allShifts: Shift[] = JSON.parse(storedShifts);
      setShifts(allShifts.filter(s => s.date === today));
    }

    // Load tasks
    const storedTasks = localStorage.getItem('marrybrown_tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }

    // Load notes
    const storedNotes = localStorage.getItem('marrybrown_notes');
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes));
    }

    // Load sauce inventory from API
    fetch(`${API_URL}/sauces`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSauceInventory(data.data);
        }
      })
      .catch(err => console.error('Failed to fetch sauce inventory:', err));
  };

  useEffect(() => {
    loadAllData();

    // Listen for storage changes (other tabs)
    const handleStorageChange = () => {
      loadAllData();
    };
    window.addEventListener('storage', handleStorageChange);

    // Re-fetch when window regains focus (navigate back to dashboard)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadAllData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Shift grouping
  const fohShifts = shifts.filter(s => s.area === 'FOH').sort((a, b) => a.startTime.localeCompare(b.startTime));
  const bohShifts = shifts.filter(s => s.area === 'BOH').sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Tasks
  const mandatoryTasks = tasks.filter(t => t.label === 'mandatory');
  const completedCount = mandatoryTasks.filter(t => t.completed).length;
  const totalCount = mandatoryTasks.length;

  // Sauces
  const lowStockCount = sauceInventory.filter(i => i.lowStock).length;

  const handleToggleTask = (taskId: string) => {
    const updatedTasks: Task[] = tasks.map(t => {
      if (t.id === taskId) {
        const newCompleted = !t.completed;
        return {
          ...t,
          completed: newCompleted,
          completedBy: newCompleted ? user ?? undefined : undefined,
          completedAt: newCompleted ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });
    setTasks(updatedTasks);
    localStorage.setItem('marrybrown_tasks', JSON.stringify(updatedTasks));
  };

  // Notes
  const activeNotes = notes
    .filter(n => n.active)
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
    .slice(0, 4);

  const getNoteBorderColor = (label: string) => {
    switch (label) {
      case 'critical': return 'border-l-red-500';
      case 'important': return 'border-l-orange-500';
      case 'tips': return 'border-l-gray-400';
      default: return 'border-l-gray-300';
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's an overview of today's operations at MarryBrown Plenty Valley.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">✅</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tasks Completed</p>
              <p className="text-xl font-bold text-gray-900">{completedCount}/{totalCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">⚠️</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Low Stock Sauces</p>
              <p className="text-xl font-bold text-gray-900">{lowStockCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">📝</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Notes</p>
              <p className="text-xl font-bold text-gray-900">{activeNotes.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today at a Glance Section */}
      <div className="border-t border-gray-200 pt-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today at a Glance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 bg-white rounded-lg shadow border border-gray-200 overflow-hidden min-h-[400px]">
          
          {/* Column 1: Daily Shifts */}
          <div className="p-5 border-b md:border-b-0 md:border-r border-gray-200">
            <h3 className="text-base font-semibold text-primary mb-4">Daily Shifts</h3>
            
            {fohShifts.length === 0 && bohShifts.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No shifts scheduled today</p>
            ) : (
              <div className="space-y-4">
                {fohShifts.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-2">FOH</h4>
                    <div className="space-y-1">
                      {fohShifts.map(shift => (
                        <div key={shift.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-900">{shift.memberName}</span>
                          <span className="text-gray-500">{shift.startTime} - {shift.endTime}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {bohShifts.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-2">BOH</h4>
                    <div className="space-y-1">
                      {bohShifts.map(shift => (
                        <div key={shift.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-900">{shift.memberName}</span>
                          <span className="text-gray-500">{shift.startTime} - {shift.endTime}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Column 2: Today's Tasks */}
          <div className="p-5 border-b md:border-b-0 md:border-r border-gray-200">
            <h3 className="text-base font-semibold text-primary mb-1">Today's Tasks</h3>
            <p className="text-xs text-gray-500 mb-4">{completedCount} of {totalCount} tasks completed</p>
            
            <div className="space-y-2">
              {MANDATORY_TASKS
                .filter(t => !t.isFridayOnly || isFriday)
                .map((taskDef) => {
                  const task = mandatoryTasks.find(t => t.name === taskDef.name);
                  const completed = task?.completed ?? false;
                  const taskId = task?.id ?? '';
                  
                  return (
                    <div
                      key={taskDef.name}
                      className={`flex items-start gap-2 text-sm ${completed ? 'opacity-60' : ''}`}
                    >
                      <button
                        onClick={() => taskId && handleToggleTask(taskId)}
                        className={`w-5 h-5 mt-0.5 rounded border flex-shrink-0 flex items-center justify-center transition ${
                          completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-primary'
                        }`}
                      >
                        {completed && <span className="text-xs">✓</span>}
                      </button>
                      <div className="flex-1 min-w-0">
                        <span className={`${completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                          {taskDef.name}
                        </span>
                        {taskDef.isFridayOnly && (
                          <span className="ml-1 inline-block px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] rounded-full align-middle">
                            Friday
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Column 3: Notes & Alerts */}
          <div className="p-5">
            <h3 className="text-base font-semibold text-primary mb-4">Notes & Alerts</h3>
            
            {activeNotes.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No active notes</p>
            ) : (
              <div className="space-y-3">
                {activeNotes.map(note => (
                  <div
                    key={note.id}
                    className={`border-l-4 ${getNoteBorderColor(note.label)} bg-gray-50 rounded-r-lg p-3`}
                  >
                    <p className="text-sm text-gray-800">{note.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      posted by {note.postedBy.name} at {formatTime(note.postedAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Access Section */}
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h2>
        <div className="flex flex-wrap gap-2">
          {quickAccessItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-primary font-medium hover:shadow-md transition"
            >
              <span>{item.icon}</span>
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}