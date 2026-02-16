import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Calendar, Plus, Trash2, Power, PowerOff } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DAYS_OF_WEEK = [
  { value: 0, label: 'Mon' },
  { value: 1, label: 'Tue' },
  { value: 2, label: 'Wed' },
  { value: 3, label: 'Thu' },
  { value: 4, label: 'Fri' },
  { value: 5, label: 'Sat' },
  { value: 6, label: 'Sun' },
];

const PEAK_PROFILES = [
  { name: 'Rush Hour (Peak)', interval: 20, color: 'red' },
  { name: 'Normal Traffic', interval: 30, color: 'amber' },
  { name: 'Off-Peak', interval: 45, color: 'emerald' },
  { name: 'Night Time', interval: 60, color: 'blue' },
];

const Schedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    days_of_week: [],
    start_time: '09:00',
    end_time: '17:00',
    cycle_interval: 30,
    priority: 1,
    active: true,
  });

  const fetchSchedules = async () => {
    try {
      const [schedulesRes, currentRes] = await Promise.all([
        axios.get(`${API}/schedules`),
        axios.get(`${API}/schedules/current`),
      ]);
      setSchedules(schedulesRes.data);
      setCurrentSchedule(currentRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
    const interval = setInterval(fetchSchedules, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/schedules`, formData);
      setShowCreateForm(false);
      setFormData({
        name: '',
        days_of_week: [],
        start_time: '09:00',
        end_time: '17:00',
        cycle_interval: 30,
        priority: 1,
        active: true,
      });
      fetchSchedules();
    } catch (error) {
      console.error('Error creating schedule:', error);
      alert('Error creating schedule');
    }
  };

  const handleToggleSchedule = async (scheduleId, currentActive) => {
    try {
      await axios.patch(`${API}/schedules/${scheduleId}?active=${!currentActive}`);
      fetchSchedules();
    } catch (error) {
      console.error('Error toggling schedule:', error);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;
    
    try {
      await axios.delete(`${API}/schedules/${scheduleId}`);
      fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const handleEnableScheduleMode = async () => {
    try {
      await axios.post(`${API}/settings/enable-schedule`);
      fetchSchedules();
      alert('Schedule mode enabled! System will now use schedules instead of manual settings.');
    } catch (error) {
      console.error('Error enabling schedule mode:', error);
    }
  };

  const toggleDay = (day) => {
    setFormData((prev) => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter((d) => d !== day)
        : [...prev.days_of_week, day].sort(),
    }));
  };

  const applyProfile = (profile) => {
    setFormData((prev) => ({ ...prev, cycle_interval: profile.interval }));
  };

  if (loading) {
    return <div className="text-zinc-400">Loading schedules...</div>;
  }

  return (
    <div className="space-y-6" data-testid="schedules-page">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight uppercase text-zinc-400">Schedule Management</h2>
          <p className="text-sm text-zinc-500 mt-1">Automated signal timing for peak and off-peak hours</p>
        </div>
        <div className="flex space-x-2">
          {currentSchedule?.source === 'manual' && (
            <button
              onClick={handleEnableScheduleMode}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-sm uppercase tracking-wide text-xs px-4 py-2 flex items-center"
            >
              <Power className="w-4 h-4 mr-2" />
              Enable Schedule Mode
            </button>
          )}
          <button
            data-testid="create-schedule-btn"
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-sm uppercase tracking-wide text-xs px-4 py-2 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Schedule
          </button>
        </div>
      </div>

      {/* Current Active Schedule */}
      <div className="bg-zinc-950/50 backdrop-blur-sm border border-zinc-800 rounded-sm p-6">
        <h3 className="text-xl font-medium text-zinc-100 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-blue-500" />
          Currently Active
        </h3>
        {currentSchedule?.active_schedule ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-zinc-100">{currentSchedule.active_schedule.name}</span>
              <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase">
                ACTIVE
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Time Range</div>
                <div className="text-sm font-mono text-zinc-100">
                  {currentSchedule.active_schedule.start_time} - {currentSchedule.active_schedule.end_time}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Cycle Interval</div>
                <div className="text-2xl font-mono font-bold text-blue-400">{currentSchedule.current_interval}s</div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Priority</div>
                <div className="text-sm font-mono text-zinc-100">{currentSchedule.active_schedule.priority}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <PowerOff className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-zinc-500">
              {currentSchedule?.source === 'manual'
                ? 'Manual control active - schedules disabled'
                : 'No schedule active for current time'}
            </p>
            <p className="text-sm text-zinc-600 mt-1">Current interval: {currentSchedule?.current_interval}s</p>
          </div>
        )}
      </div>

      {/* Create Schedule Form */}
      {showCreateForm && (
        <div className="bg-zinc-950/50 backdrop-blur-sm border border-zinc-800 rounded-sm p-6">
          <h3 className="text-xl font-medium text-zinc-100 mb-4">Create New Schedule</h3>
          <form onSubmit={handleCreateSchedule} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-2">
                Schedule Name
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Morning Rush Hour"
                className="w-full bg-zinc-900 border-zinc-800 text-zinc-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded-sm px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-2">
                Days of Week
              </label>
              <div className="flex space-x-2">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={`px-4 py-2 rounded-sm text-xs font-bold uppercase transition-colors ${
                      formData.days_of_week.includes(day.value)
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-2">
                  Start Time
                </label>
                <input
                  required
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full bg-zinc-900 border-zinc-800 text-zinc-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded-sm px-3 py-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-2">
                  End Time
                </label>
                <input
                  required
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full bg-zinc-900 border-zinc-800 text-zinc-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded-sm px-3 py-2 text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-2">
                Traffic Profile (Quick Select)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {PEAK_PROFILES.map((profile) => (
                  <button
                    key={profile.name}
                    type="button"
                    onClick={() => applyProfile(profile)}
                    className={`p-3 rounded-sm border transition-colors ${
                      formData.cycle_interval === profile.interval
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-xs font-bold mb-1">{profile.name}</div>
                    <div className="text-lg font-mono font-bold">{profile.interval}s</div>
                  </button>
                ))}
              </div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-2">
                Custom Cycle Interval (seconds)
              </label>
              <input
                required
                type="number"
                min="5"
                max="300"
                value={formData.cycle_interval}
                onChange={(e) => setFormData({ ...formData, cycle_interval: parseInt(e.target.value) })}
                className="w-full bg-zinc-900 border-zinc-800 text-zinc-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded-sm px-3 py-2 text-sm font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-2">
                Priority (higher = more important)
              </label>
              <input
                required
                type="number"
                min="1"
                max="10"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                className="w-full bg-zinc-900 border-zinc-800 text-zinc-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded-sm px-3 py-2 text-sm font-mono"
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-sm uppercase tracking-wide text-xs px-6 py-2"
              >
                Create Schedule
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 rounded-sm uppercase tracking-wide text-xs px-6 py-2"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Schedules List */}
      <div className="space-y-4">
        <h3 className="text-xl font-medium text-zinc-100">All Schedules</h3>
        {schedules.length === 0 ? (
          <div className="bg-zinc-950/50 backdrop-blur-sm border border-zinc-800 rounded-sm p-12 text-center">
            <Calendar className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">No schedules configured</p>
          </div>
        ) : (
          schedules.map((schedule) => (
            <div
              key={schedule.id}
              data-testid={`schedule-${schedule.id}`}
              className={`bg-zinc-950/50 backdrop-blur-sm border rounded-sm p-6 ${
                schedule.active ? 'border-zinc-800' : 'border-zinc-900 opacity-50'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-zinc-100">{schedule.name}</h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        schedule.active
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-zinc-700/10 text-zinc-500 border border-zinc-700/20'
                      }`}
                    >
                      {schedule.active ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-zinc-400">
                    <div>
                      <span className="font-mono">{schedule.start_time} - {schedule.end_time}</span>
                    </div>
                    <div>
                      Days: {schedule.days_of_week.map((d) => DAYS_OF_WEEK[d].label).join(', ')}
                    </div>
                    <div className="font-mono font-bold text-blue-400">{schedule.cycle_interval}s interval</div>
                    <div>Priority: {schedule.priority}</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleToggleSchedule(schedule.id, schedule.active)}
                    className={`p-2 rounded-sm border transition-colors ${
                      schedule.active
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                        : 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500'
                    }`}
                    title={schedule.active ? 'Disable' : 'Enable'}
                  >
                    {schedule.active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDeleteSchedule(schedule.id)}
                    className="p-2 bg-red-900/20 text-red-400 border border-red-900/50 hover:bg-red-900/40 rounded-sm"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Schedules;
