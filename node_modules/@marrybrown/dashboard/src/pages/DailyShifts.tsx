import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shift, ShiftArea } from '@marrybrown/shared';

export default function DailyShifts() {
  const { canEdit } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [formData, setFormData] = useState({
    memberName: '',
    area: '' as ShiftArea | '',
    startTime: '',
    endTime: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const stored = localStorage.getItem('marrybrown_daily_shifts');
    if (stored) {
      const allShifts: Shift[] = JSON.parse(stored);
      setShifts(allShifts.filter(s => s.date === today));
    }
  }, []);

  const saveShifts = (newShifts: Shift[]) => {
    const stored = localStorage.getItem('marrybrown_daily_shifts');
    const allShifts: Shift[] = stored ? JSON.parse(stored) : [];
    const otherDays = allShifts.filter(s => s.date !== today);
    const updated = [...otherDays, ...newShifts];
    localStorage.setItem('marrybrown_daily_shifts', JSON.stringify(updated));
    setShifts(newShifts);
  };

  const checkOverlap = (start: string, end: string, area: ShiftArea, excludeId?: string): boolean => {
    const areaShifts = shifts.filter(s => s.area === area && s.id !== excludeId);
    const newStart = parseInt(start.replace(':', ''));
    const newEnd = parseInt(end.replace(':', ''));

    return areaShifts.some(s => {
      const existingStart = parseInt(s.startTime.replace(':', ''));
      const existingEnd = parseInt(s.endTime.replace(':', ''));
      return (newStart < existingEnd && newEnd > existingStart);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.memberName || !formData.area || !formData.startTime || !formData.endTime) {
      setError('All fields are required');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      setError('Start time must be before end time');
      return;
    }

    if (checkOverlap(formData.startTime, formData.endTime, formData.area)) {
      setError('This shift overlaps with an existing shift in the same area');
      return;
    }

    const shift: Shift = {
      id: crypto.randomUUID(),
      date: today,
      memberName: formData.memberName,
      area: formData.area as ShiftArea,
      startTime: formData.startTime,
      endTime: formData.endTime,
    };

    saveShifts([...shifts, shift]);
    setFormData({ memberName: '', area: '', startTime: '', endTime: '' });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleDelete = (id: string) => {
    saveShifts(shifts.filter(s => s.id !== id));
  };

  const fohShifts = shifts.filter(s => s.area === 'FOH').sort((a, b) => a.startTime.localeCompare(b.startTime));
  const bohShifts = shifts.filter(s => s.area === 'BOH').sort((a, b) => a.startTime.localeCompare(b.startTime));

  const canModify = canEdit('daily-shifts');

  const findGaps = (areaShifts: Shift[]): string[] => {
    if (areaShifts.length < 2) return [];
    const gaps: string[] = [];
    for (let i = 0; i < areaShifts.length - 1; i++) {
      if (areaShifts[i].endTime < areaShifts[i + 1].startTime) {
        gaps.push(`${areaShifts[i].endTime} - ${areaShifts[i + 1].startTime}`);
      }
    }
    return gaps;
  };

  const fohGaps = findGaps(fohShifts);
  const bohGaps = findGaps(bohShifts);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Daily Shift Board</h1>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
          Shift added successfully!
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {(fohGaps.length > 0 || bohGaps.length > 0) && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
          <p className="font-medium">Coverage Gap Warnings:</p>
          {fohGaps.length > 0 && <p>FOH: {fohGaps.join(', ')}</p>}
          {bohGaps.length > 0 && <p>BOH: {bohGaps.join(', ')}</p>}
        </div>
      )}

      {canModify && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Shift</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                <option value="FOH">FOH (Front of House)</option>
                <option value="BOH">BOH (Back of House)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
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
                Add Shift
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">FOH Shifts (Front of House)</h2>
          </div>
          <div className="p-4">
            {fohShifts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No FOH shifts scheduled</div>
            ) : (
              <div className="space-y-2">
                {fohShifts.map(shift => (
                  <div key={shift.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{shift.memberName}</p>
                      <p className="text-sm text-gray-600">{shift.startTime} - {shift.endTime}</p>
                    </div>
                    {canModify && (
                      <button
                        onClick={() => handleDelete(shift.id)}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">BOH Shifts (Back of House)</h2>
          </div>
          <div className="p-4">
            {bohShifts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No BOH shifts scheduled</div>
            ) : (
              <div className="space-y-2">
                {bohShifts.map(shift => (
                  <div key={shift.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{shift.memberName}</p>
                      <p className="text-sm text-gray-600">{shift.startTime} - {shift.endTime}</p>
                    </div>
                    {canModify && (
                      <button
                        onClick={() => handleDelete(shift.id)}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}