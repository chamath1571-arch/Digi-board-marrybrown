import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Note, NoteLabel } from '@marrybrown/shared';

export default function NotesAlerts() {
  const { user, canEdit } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [formData, setFormData] = useState({
    message: '',
    label: '' as NoteLabel | '',
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('marrybrown_notes');
    if (stored) {
      setNotes(JSON.parse(stored));
    }
  }, []);

  const saveNotes = (newNotes: Note[]) => {
    setNotes(newNotes);
    localStorage.setItem('marrybrown_notes', JSON.stringify(newNotes));
  };

  const detectLabel = (message: string): NoteLabel => {
    const lower = message.toLowerCase();
    if (lower.includes('urgent') || lower.includes('now') || lower.includes('immediately')) {
      return 'critical';
    }
    if (lower.includes('important') || lower.includes('remember')) {
      return 'important';
    }
    return 'tips';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message) return;

    const label = formData.label || detectLabel(formData.message);
    
    const note: Note = {
      id: crypto.randomUUID(),
      message: formData.message,
      label,
      postedBy: user!,
      postedAt: new Date().toISOString(),
      active: true,
    };

    saveNotes([note, ...notes]);
    setFormData({ message: '', label: '' });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleDeactivate = (id: string) => {
    saveNotes(notes.map(n => n.id === id ? { ...n, active: false } : n));
  };

  const getLabelColor = (label: NoteLabel) => {
    switch (label) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'important': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'tips': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLabelIcon = (label: NoteLabel) => {
    switch (label) {
      case 'critical': return '🚨';
      case 'important': return '⚠️';
      case 'tips': return '💡';
      default: return '📝';
    }
  };

  const activeNotes = notes.filter(n => n.active);
  const canCreate = canEdit('notes-alerts');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Special Notes & Alerts</h1>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
          Note posted successfully!
        </div>
      )}

      {/* Create Note Form (Managers/Head Staff only) */}
      {canCreate && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Post New Note</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
                placeholder="Enter your message..."
                required
              />
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label (Optional)
                  <span className="text-xs text-gray-500 block">Auto-detected if not selected</span>
                </label>
                <select
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value as NoteLabel })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Auto-detect</option>
                  <option value="critical">Critical</option>
                  <option value="important">Important</option>
                  <option value="tips">Tips</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  type="submit"
                  className="bg-primary text-white py-2 px-6 rounded-lg font-medium hover:bg-red-700 transition"
                >
                  Post Note
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {!canCreate && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 text-sm">
            Only Shift Managers and Head Staff can post notes. You can view existing notes below.
          </p>
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-4">
        {activeNotes.length === 0 ? (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center text-gray-500">
            No active notes at this time
          </div>
        ) : (
          activeNotes.map(note => (
            <div
              key={note.id}
              className={`bg-white rounded-lg shadow border p-5 ${getLabelColor(note.label)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{getLabelIcon(note.label)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${getLabelColor(note.label)}`}>
                      {note.label}
                    </span>
                  </div>
                  <p className="text-gray-900 mb-3">{note.message}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Posted by: <strong>{note.postedBy.name}</strong></span>
                    <span>•</span>
                    <span>{new Date(note.postedAt).toLocaleString()}</span>
                  </div>
                </div>
                
                {canCreate && (
                  <button
                    onClick={() => handleDeactivate(note.id)}
                    className="ml-4 text-gray-400 hover:text-gray-600 transition"
                    title="Dismiss note"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}