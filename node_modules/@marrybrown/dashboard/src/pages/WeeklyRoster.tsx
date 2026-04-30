import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shift, ShiftArea, DAYS_OF_WEEK } from '@marrybrown/shared';

export default function WeeklyRoster() {
  const { canEdit } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [published, setPublished] = useState(false);
  const [formData, setFormData] = useState({
    day: '',
    memberName: '',
    area: '' as ShiftArea | '',
    startTime: '',
    endTime: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const getWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date.toISOString().split('T')[0];
    });
  };

  const weekDates = getWeekDates();

  useEffect(() => {
    const stored = localStorage.getItem('marrybrown_weekly_roster');
    if (stored) {
      const data = JSON.parse(stored);
      setShifts(data.shifts || []);
      setPublished(data.published || false);
    }
  }, []);

  const saveRoster = (newShifts: Shift[], isPublished: boolean) => {
    setShifts(newShifts);
    setPublished(isPublished);
    localStorage.setItem('marrybrown_weekly_roster', JSON.stringify({
      shifts: newShifts,
      published: isPublished,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (published) {
      setError('Roster is published. Changes must be made via Daily Shift Board.');
      return;
    }

    if (!formData.day || !formData.memberName || !formData.area || !formData.startTime || !formData.endTime) {
      setError('All fields are required');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      setError('Start time must be before end time');
      return;
    }

    const dayIndex = parseInt(formData.day);
    const date = weekDates[dayIndex];

    const shift: Shift = {
      id: crypto.randomUUID(),
      date,
      memberName: formData.memberName,
      area: formData.area as ShiftArea,
      startTime: formData.startTime,
      endTime: formData.endTime,
    };

    saveRoster([...shifts, shift], published);
    setFormData({ day: '', memberName: '', area: '', startTime: '', endTime: '' });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleDelete = (id: string) => {
    if (published) {
      setError('Roster is published. Changes must be made via Daily Shift Board.');
      return;
    }
    saveRoster(shifts.filter(s => s.id !== id), published);
  };

  const handlePublish = () => {
    saveRoster(shifts, true);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const canModify = canEdit('weekly-roster');
  const today = new Date().toISOString().split('T')[0];

  const getShiftsForDay = (date: string) => {
    return shifts.filter(s => s.date === date);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Weekly Digital Roster</h1>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
          Changes saved successfully!
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {published && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
          This roster is published. Use Daily Shift Board to make date-specific changes.
        </div>
      )}

      {canModify && !published && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Shift</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
              <select
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select day</option>
                {DAYS_OF_WEEK.map((day, i) => (
                  <option key={day} value={i}>{day}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Staff Name</label>
              <input
                type="text"
                value={formData.memberName}
                onChange={(e) => setFormData({ ...formData, memberName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
              <select
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value as ShiftArea })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select area</option>
                <option value="FOH">FOH</option>
                <option value="BOH">BOH</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      )}

      {canModify && !published && shifts.length > 0 && (
        <div className="mb-6">
          <button
            onClick={handlePublish}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition"
          >
            Publish Roster
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map((day, i) => {
              const date = weekDates[i];
              const isToday = date === today;
              const dayShifts = getShiftsForDay(date);
              const fohShifts = dayShifts.filter(s => s.area === 'FOH');
              const bohShifts = dayShifts.filter(s => s.area === 'BOH');

              return (
                <div
                  key={day}
                  className={`bg-white rounded-lg shadow border ${isToday ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'}`}
                >
                  <div className={`p-3 border-b ${isToday ? 'bg-primary text-white' : 'bg-gray-50'}`}>
                    <p className="font-semibold text-sm">{day}</p>
                    <p className="text-xs opacity-75">{date}</p>
                  </div>
                  <div className="p-2 space-y-2 min-h-[200px]">
                    {fohShifts.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-blue-600 mb-1">FOH</p>
                        {fohShifts.map(shift => (
                          <div key={shift.id} className="bg-blue-50 rounded p-2 mb-1 flex justify-between items-start">
                            <div>
                              <p className="text-xs font-medium">{shift.memberName}</p>
                              <p className="text-xs text-gray-600">{shift.startTime}-{shift.endTime}</p>
                            </div>
                            {canModify && !published && (
                              <button
                                onClick={() => handleDelete(shift.id)}
                                className="text-gray-400 hover:text-red-500 text-xs"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {bohShifts.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-green-600 mb-1">BOH</p>
                        {bohShifts.map(shift => (
                          <div key={shift.id} className="bg-green-50 rounded p-2 mb-1 flex justify-between items-start">
                            <div>
                              <p className="text-xs font-medium">{shift.memberName}</p>
                              <p className="text-xs text-gray-600">{shift.startTime}-{shift.endTime}</p>
                            </div>
                            {canModify && !published && (
                              <button
                                onClick={() => handleDelete(shift.id)}
                                className="text-gray-400 hover:text-red-500 text-xs"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {dayShifts.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-4">No shifts</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}