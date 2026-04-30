import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ChickenLogEntry, 
  ChickenType, 
  TIME_SLOTS, 
  CHICKEN_TYPES, 
  PIECES_PER_HEAD,
  DAYS_OF_WEEK,
  FORECAST_ADJUSTMENT 
} from '@marrybrown/shared';

export default function ChickenProduction() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<ChickenLogEntry[]>([]);
  const [formData, setFormData] = useState({
    timeSlot: '',
    chickenType: '' as ChickenType | '',
    headsDropped: '',
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('chicken_production');
    if (stored) {
      setEntries(JSON.parse(stored));
    }
  }, []);

  const saveEntries = (newEntries: ChickenLogEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem('chicken_production', JSON.stringify(newEntries));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.timeSlot || !formData.chickenType || !formData.headsDropped) return;
    
    const headsDropped = parseInt(formData.headsDropped);
    if (headsDropped <= 0) return;

    const now = new Date();
    const entry: ChickenLogEntry = {
      id: crypto.randomUUID(),
      date: now.toISOString().split('T')[0],
      timeSlot: formData.timeSlot,
      chickenType: formData.chickenType as ChickenType,
      headsDropped,
      pieces: headsDropped * PIECES_PER_HEAD,
      submittedBy: user!,
      timestamp: now.toISOString(),
    };

    saveEntries([...entries, entry]);
    setFormData({ timeSlot: '', chickenType: '', headsDropped: '' });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const today = new Date().toISOString().split('T')[0];
  const todayEntries = entries.filter(e => e.date === today);
  const todayTotalHeads = todayEntries.reduce((sum, e) => sum + e.headsDropped, 0);
  const todayTotalPieces = todayEntries.reduce((sum, e) => sum + e.pieces, 0);

  // Calculate peak hour
  const headsBySlot: Record<string, number> = {};
  todayEntries.forEach(e => {
    headsBySlot[e.timeSlot] = (headsBySlot[e.timeSlot] || 0) + e.headsDropped;
  });
  const peakHour = Object.entries(headsBySlot).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Weekly summary (current week)
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
  const weeklyData = weekDates.map((date, i) => {
    const dayEntries = entries.filter(e => e.date === date);
    const originalHeads = dayEntries
      .filter(e => e.chickenType === 'Bone-in Original')
      .reduce((sum, e) => sum + e.headsDropped, 0);
    const spicyHeads = dayEntries
      .filter(e => e.chickenType === 'Bone-in Spicy')
      .reduce((sum, e) => sum + e.headsDropped, 0);
    return {
      day: DAYS_OF_WEEK[i],
      date,
      originalHeads,
      spicyHeads,
      heads: dayEntries.reduce((sum, e) => sum + e.headsDropped, 0),
      pieces: dayEntries.reduce((sum, e) => sum + e.pieces, 0),
    };
  });

  const weeklyTotalHeads = weeklyData.reduce((sum, d) => sum + d.heads, 0);
  const weeklyTotalOriginal = weeklyData.reduce((sum, d) => sum + d.originalHeads, 0);
  const weeklyTotalSpicy = weeklyData.reduce((sum, d) => sum + d.spicyHeads, 0);
  const weeklyAvgHeads = Math.round(weeklyTotalHeads / 7);

  // Simulated historical data for forecast
  const simulatedWeeklyTotals = [280, 310, 295, weeklyTotalHeads];
  const avgWeeklyProduction = Math.round(simulatedWeeklyTotals.reduce((a, b) => a + b, 0) / 4);
  const recommendedOrder = Math.ceil(avgWeeklyProduction * FORECAST_ADJUSTMENT);

  // Original vs Spicy split calculation
  const totalOriginal = weeklyTotalOriginal;
  const totalSpicy = weeklyTotalSpicy;
  const totalForSplit = totalOriginal + totalSpicy;
  const originalPercent = totalForSplit > 0 ? Math.round((totalOriginal / totalForSplit) * 100) : 50;
  const spicyPercent = totalForSplit > 0 ? Math.round((totalSpicy / totalForSplit) * 100) : 50;
  const recommendedOriginal = Math.round(recommendedOrder * originalPercent / 100);
  const recommendedSpicy = recommendedOrder - recommendedOriginal;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Chicken Production Log</h1>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
          Production logged successfully!
        </div>
      )}

      {/* Daily Entry Form */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Log Production</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
            <select
              value={formData.timeSlot}
              onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="">Select time slot</option>
              {TIME_SLOTS.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chicken Type</label>
            <select
              value={formData.chickenType}
              onChange={(e) => setFormData({ ...formData, chickenType: e.target.value as ChickenType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="">Select type</option>
              {CHICKEN_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Note: This log tracks bone-in chicken only. Bone-in chicken is dropped in heads. One head equals 9 pieces. Fillets and strips are not tracked here as they are prepared in variable quantities.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heads Dropped</label>
            <input
              type="number"
              min="1"
              value={formData.headsDropped}
              onChange={(e) => setFormData({ ...formData, headsDropped: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Number of heads"
              required
            />
          </div>
          
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition"
            >
              Log Production
            </button>
          </div>
        </form>
      </div>

      {/* Daily Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Heads Today</p>
          <p className="text-2xl font-bold text-gray-900">{todayTotalHeads}</p>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Pieces Today</p>
          <p className="text-2xl font-bold text-gray-900">{todayTotalPieces}</p>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Peak Hour</p>
          <p className="text-2xl font-bold text-gray-900">{peakHour}</p>
        </div>
      </div>

      {/* Today's Production Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Today's Production</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Time Slot</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Chicken Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Heads</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Pieces</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Submitted By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {todayEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No production logged today
                  </td>
                </tr>
              ) : (
                todayEntries.map(entry => (
                  <tr key={entry.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{entry.timeSlot}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{entry.chickenType}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{entry.headsDropped}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{entry.pieces}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{entry.submittedBy.name}</td>
                  </tr>
                ))
              )}
            </tbody>
            {todayEntries.length > 0 && (
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-sm font-medium text-gray-900">Daily Total</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">{todayTotalHeads}</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">{todayTotalPieces}</td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Weekly Production Summary */}
      <div className="bg-white rounded-lg shadow border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Weekly Production Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Day</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Original Heads</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Spicy Heads</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total Heads</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total Pieces</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {weeklyData.map((day, i) => (
                <tr key={i} className={day.date === today ? 'bg-yellow-50' : ''}>
                  <td className="px-4 py-3 text-sm text-gray-900">{day.day}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{day.date}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{day.originalHeads}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{day.spicyHeads}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{day.heads}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{day.pieces}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={2} className="px-4 py-3 text-sm font-medium text-gray-900">Weekly Total</td>
                <td className="px-4 py-3 text-sm font-bold text-gray-900">{weeklyTotalOriginal}</td>
                <td className="px-4 py-3 text-sm font-bold text-gray-900">{weeklyTotalSpicy}</td>
                <td className="px-4 py-3 text-sm font-bold text-gray-900">{weeklyTotalHeads}</td>
                <td className="px-4 py-3 text-sm font-bold text-gray-900">{weeklyTotalHeads * PIECES_PER_HEAD}</td>
              </tr>
              <tr>
                <td colSpan={2} className="px-4 py-3 text-sm font-medium text-gray-900">Weekly Average</td>
                <td className="px-4 py-3 text-sm font-bold text-gray-900">{Math.round(weeklyTotalOriginal / 7)}</td>
                <td className="px-4 py-3 text-sm font-bold text-gray-900">{Math.round(weeklyTotalSpicy / 7)}</td>
                <td className="px-4 py-3 text-sm font-bold text-gray-900">{weeklyAvgHeads}</td>
                <td className="px-4 py-3 text-sm font-bold text-gray-900">{weeklyAvgHeads * PIECES_PER_HEAD}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Forecast Panel */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Future Demand Forecast</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Average Weekly Production (Last 4 Weeks)</p>
            <p className="text-2xl font-bold text-gray-900">{avgWeeklyProduction} heads</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Recommended Order for Next Week</p>
            <p className="text-2xl font-bold text-primary">{recommendedOrder} heads</p>
            <p className="text-sm text-gray-500 mt-1">≈ {recommendedOrder * PIECES_PER_HEAD} pieces</p>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600 mb-2">
            Based on recent sales: {originalPercent}% Original, {spicyPercent}% Spicy
          </p>
          <p className="text-sm font-medium text-gray-900">
            Recommended: {recommendedOriginal} heads Original, {recommendedSpicy} heads Spicy
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Note: Forecast is based on recorded weekly averages. Adjust manually if special events or public holidays apply.
        </p>
      </div>
    </div>
  );
}