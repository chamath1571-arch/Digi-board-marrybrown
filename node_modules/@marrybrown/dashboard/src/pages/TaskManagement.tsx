import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Task, TaskHistoryEntry } from '@marrybrown/shared';

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

export default function TaskManagement() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [history, setHistory] = useState<TaskHistoryEntry[]>([]);
  const [variableTaskName, setVariableTaskName] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const isFriday = new Date().getDay() === 5;

  useEffect(() => {
    const stored = localStorage.getItem('marrybrown_tasks');
    const storedHistory = localStorage.getItem('marrybrown_task_history');
    const lastReset = localStorage.getItem('marrybrown_tasks_last_reset');

    if (stored) {
      setTasks(JSON.parse(stored));
    }

    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }

    if (lastReset !== today) {
      initializeTasks();
      localStorage.setItem('marrybrown_tasks_last_reset', today);
    } else if (!stored) {
      initializeTasks();
    }
  }, []);

  const initializeTasks = () => {
    const initialTasks: Task[] = MANDATORY_TASKS
      .filter(t => !t.isFridayOnly || isFriday)
      .map(t => ({
        id: crypto.randomUUID(),
        name: t.name,
        label: 'mandatory' as const,
        completed: false,
        isFridayOnly: t.isFridayOnly,
      }));
    setTasks(initialTasks);
    saveTasks(initialTasks);
  };

  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem('marrybrown_tasks', JSON.stringify(newTasks));
  };

  const saveHistory = (newHistory: TaskHistoryEntry[]) => {
    setHistory(newHistory);
    localStorage.setItem('marrybrown_task_history', JSON.stringify(newHistory));
  };

  const handleToggleTask = (taskId: string) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        const newCompleted = !t.completed;
        if (newCompleted) {
          const historyEntry: TaskHistoryEntry = {
            id: crypto.randomUUID(),
            taskName: t.name,
            completedBy: user!,
            completedAt: new Date().toISOString(),
          };
          saveHistory([historyEntry, ...history]);
        }
        return {
          ...t,
          completed: newCompleted,
          completedBy: newCompleted ? user : undefined,
          completedAt: newCompleted ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });
    saveTasks(updatedTasks);
  };

  const handleAddVariableTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!variableTaskName.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      name: variableTaskName.trim(),
      label: 'variable',
      completed: false,
    };

    saveTasks([...tasks, newTask]);
    setVariableTaskName('');
  };

  const handleDeleteVariableTask = (taskId: string) => {
    saveTasks(tasks.filter(t => t.id !== taskId));
  };

  const mandatoryTasks = tasks.filter(t => t.label === 'mandatory');
  const variableTasks = tasks.filter(t => t.label === 'variable');

  const completedMandatory = mandatoryTasks.filter(t => t.completed).length;
  const completedVariable = variableTasks.filter(t => t.completed).length;

  const allMandatoryComplete = mandatoryTasks.length > 0 && completedMandatory === mandatoryTasks.length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Task Management Board</h1>

      <div className="bg-white rounded-lg shadow border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Mandatory Tasks
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({completedMandatory}/{mandatoryTasks.length} completed)
            </span>
          </h2>
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${mandatoryTasks.length > 0 ? (completedMandatory / mandatoryTasks.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {allMandatoryComplete && (
          <div className="mx-4 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            All mandatory tasks complete!
          </div>
        )}

        <div className="p-4 space-y-2">
          {mandatoryTasks.map(task => (
            <div
              key={task.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
              }`}
            >
              <button
                onClick={() => handleToggleTask(task.id)}
                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition ${
                  task.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 hover:border-primary'
                }`}
              >
                {task.completed && '✓'}
              </button>
              <span className={`flex-1 ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                {task.name}
              </span>
              {task.isFridayOnly && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                  Friday
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Variable Tasks
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({completedVariable}/{variableTasks.length} completed)
            </span>
          </h2>
        </div>

        <div className="p-4">
          <form onSubmit={handleAddVariableTask} className="flex gap-2 mb-4">
            <input
              type="text"
              value={variableTaskName}
              onChange={(e) => setVariableTaskName(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition"
            >
              Add Task
            </button>
          </form>

          {variableTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No variable tasks added yet
            </div>
          ) : (
            <div className="space-y-2">
              {variableTasks.map(task => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition ${
                      task.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-primary'
                    }`}
                  >
                    {task.completed && '✓'}
                  </button>
                  <span className={`flex-1 ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                    {task.name}
                  </span>
                  <button
                    onClick={() => handleDeleteVariableTask(task.id)}
                    className="text-gray-400 hover:text-red-500 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition"
        >
          <h2 className="text-lg font-semibold text-gray-900">Task History</h2>
          <span className="text-gray-500">{showHistory ? '▲' : '▼'}</span>
        </button>

        {showHistory && (
          <div className="border-t border-gray-200 p-4">
            {history.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No task history yet
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {history.map(entry => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{entry.taskName}</p>
                      <p className="text-sm text-gray-500">
                        Completed by {entry.completedBy.name} at{' '}
                        {new Date(entry.completedAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-green-500">✓</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}