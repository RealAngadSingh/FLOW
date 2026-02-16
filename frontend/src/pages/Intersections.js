import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, Clock, Settings } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Intersections = () => {
  const [intersections, setIntersections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingTimingId, setEditingTimingId] = useState(null);
  const [signalState, setSignalState] = useState('');
  const [timingData, setTimingData] = useState({ green: 45, yellow: 5, red: 50 });
  const [cycleInterval, setCycleInterval] = useState(30);
  const [showSettings, setShowSettings] = useState(false);

  const fetchIntersections = async () => {
    try {
      const response = await axios.get(`${API}/intersections`);
      setIntersections(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching intersections:', error);
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setCycleInterval(response.data.signal_cycle_interval);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  useEffect(() => {
    fetchIntersections();
    fetchSettings();
  }, []);

  const handleUpdateSignal = async (intId) => {
    try {
      await axios.patch(`${API}/intersections/${intId}`, {
        current_signal_state: signalState,
      });
      setEditingId(null);
      setSignalState('');
      fetchIntersections();
    } catch (error) {
      console.error('Error updating intersection:', error);
    }
  };

  const handleUpdateTiming = async (intId) => {
    try {
      await axios.patch(`${API}/intersections/${intId}`, {
        signal_timing: timingData,
      });
      setEditingTimingId(null);
      fetchIntersections();
      alert('Signal timing updated successfully!');
    } catch (error) {
      console.error('Error updating timing:', error);
      alert('Error updating timing');
    }
  };

  const handleUpdateStatus = async (intId, newStatus) => {
    try {
      await axios.patch(`${API}/intersections/${intId}`, {
        status: newStatus,
      });
      fetchIntersections();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleUpdateCycleInterval = async () => {
    try {
      await axios.patch(`${API}/settings?signal_cycle_interval=${cycleInterval}`);
      setShowSettings(false);
      alert('Cycle interval updated successfully!');
    } catch (error) {
      console.error('Error updating cycle interval:', error);
      alert('Error updating cycle interval');
    }
  };

  if (loading) {
    return <div className="text-zinc-400">Loading intersections...</div>;
  }

  return (
    <div className="space-y-6" data-testid="intersections-page">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight uppercase text-zinc-400">Intersection Control</h2>
          <p className="text-sm text-zinc-500 mt-1">Manage traffic signals and coordination</p>
        </div>
        <button
          data-testid="settings-btn"
          onClick={() => setShowSettings(!showSettings)}
          className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 rounded-sm uppercase tracking-wide text-xs px-4 py-2 flex items-center"
        >
          <Settings className="w-4 h-4 mr-2" />
          Cycle Settings
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-zinc-950/50 backdrop-blur-sm border border-zinc-800 rounded-sm p-6">
          <h3 className="text-xl font-medium text-zinc-100 mb-4">Signal Cycle Settings</h3>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-2">
                Cycle Interval (seconds)
              </label>
              <input
                data-testid="cycle-interval-input"
                type="number"
                min="5"
                max="300"
                value={cycleInterval}
                onChange={(e) => setCycleInterval(parseInt(e.target.value))}
                className="w-full bg-zinc-900 border-zinc-800 text-zinc-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded-sm px-3 py-2 text-sm font-mono"
              />
              <p className="text-xs text-zinc-500 mt-1">Time between automatic signal changes (5-300 seconds)</p>
            </div>
            <div className="flex space-x-2">
              <button
                data-testid="save-cycle-interval-btn"
                onClick={handleUpdateCycleInterval}
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-sm uppercase tracking-wide text-xs px-6 py-2 mt-6"
              >
                Save
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 rounded-sm uppercase tracking-wide text-xs px-6 py-2 mt-6"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {intersections.map((int) => (
          <div
            key={int.id}
            data-testid={`intersection-${int.id}`}
            className="bg-zinc-950/50 backdrop-blur-sm border border-zinc-800 rounded-sm p-6 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-medium text-zinc-100 mb-1">{int.name}</h3>
                <p className="text-xs text-zinc-500">
                  {int.location.lat.toFixed(4)}, {int.location.lng.toFixed(4)}
                </p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    int.status === 'online'
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : int.status === 'maintenance'
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      : 'bg-zinc-700/10 text-zinc-500 border border-zinc-700/20'
                  }`}
                >
                  {int.status}
                </span>
                <select
                  data-testid={`status-select-${int.id}`}
                  value={int.status}
                  onChange={(e) => handleUpdateStatus(int.id, e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-zinc-100 text-xs rounded-sm px-2 py-1 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="online">Online</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Signal State</span>
                <span className="text-sm font-mono text-zinc-100">{int.current_signal_state}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Coordination Mode</span>
                <span className="text-sm font-mono text-zinc-100">{int.coordination_mode}</span>
              </div>
              <div className="py-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-2">Signal Timing</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-emerald-900/20 border border-emerald-800/50 rounded-sm">
                    <div className="text-xs text-emerald-400 mb-1">GREEN</div>
                    <div className="text-lg font-mono font-bold text-emerald-300">{int.signal_timing.green}s</div>
                  </div>
                  <div className="text-center p-2 bg-amber-900/20 border border-amber-800/50 rounded-sm">
                    <div className="text-xs text-amber-400 mb-1">YELLOW</div>
                    <div className="text-lg font-mono font-bold text-amber-300">{int.signal_timing.yellow}s</div>
                  </div>
                  <div className="text-center p-2 bg-red-900/20 border border-red-800/50 rounded-sm">
                    <div className="text-xs text-red-400 mb-1">RED</div>
                    <div className="text-lg font-mono font-bold text-red-300">{int.signal_timing.red}s</div>
                  </div>
                </div>
              </div>
            </div>

            {editingId === int.id ? (
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <select
                    data-testid={`signal-select-${int.id}`}
                    value={signalState}
                    onChange={(e) => setSignalState(e.target.value)}
                    className="flex-1 bg-zinc-900 border-zinc-800 text-zinc-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded-sm px-3 py-2 text-sm"
                  >
                    <option value="">Select signal state</option>
                    <option value="green-ns">Green NS</option>
                    <option value="green-ew">Green EW</option>
                    <option value="yellow-ns">Yellow NS</option>
                    <option value="yellow-ew">Yellow EW</option>
                    <option value="red-ns">Red NS</option>
                    <option value="red-ew">Red EW</option>
                  </select>
                  <button
                    data-testid={`save-signal-btn-${int.id}`}
                    onClick={() => handleUpdateSignal(int.id)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-sm uppercase tracking-wide text-xs px-4 py-2"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 rounded-sm uppercase tracking-wide text-xs px-4 py-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : editingTimingId === int.id ? (
              <div className="space-y-4">
                <div className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-3">Edit Signal Timing</div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Green (seconds)</label>
                    <input
                      type="number"
                      min="5"
                      max="180"
                      value={timingData.green}
                      onChange={(e) => setTimingData({...timingData, green: parseInt(e.target.value)})}
                      className="w-full bg-zinc-900 border-zinc-800 text-zinc-100 focus:ring-1 focus:ring-emerald-500 rounded-sm px-3 py-2 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Yellow (seconds)</label>
                    <input
                      type="number"
                      min="3"
                      max="10"
                      value={timingData.yellow}
                      onChange={(e) => setTimingData({...timingData, yellow: parseInt(e.target.value)})}
                      className="w-full bg-zinc-900 border-zinc-800 text-zinc-100 focus:ring-1 focus:ring-amber-500 rounded-sm px-3 py-2 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Red (seconds)</label>
                    <input
                      type="number"
                      min="5"
                      max="180"
                      value={timingData.red}
                      onChange={(e) => setTimingData({...timingData, red: parseInt(e.target.value)})}
                      className="w-full bg-zinc-900 border-zinc-800 text-zinc-100 focus:ring-1 focus:ring-red-500 rounded-sm px-3 py-2 text-sm font-mono"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    data-testid={`save-timing-btn-${int.id}`}
                    onClick={() => handleUpdateTiming(int.id)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-sm uppercase tracking-wide text-xs px-4 py-2"
                  >
                    Save Timing
                  </button>
                  <button
                    onClick={() => setEditingTimingId(null)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 rounded-sm uppercase tracking-wide text-xs px-4 py-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-2">
                <button
                  data-testid={`edit-signal-btn-${int.id}`}
                  onClick={() => {
                    setEditingId(int.id);
                    setSignalState(int.current_signal_state);
                  }}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 rounded-sm uppercase tracking-wide text-xs px-4 py-2 flex items-center justify-center"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Adjust Signal
                </button>
                <button
                  data-testid={`edit-timing-btn-${int.id}`}
                  onClick={() => {
                    setEditingTimingId(int.id);
                    setTimingData(int.signal_timing);
                  }}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 rounded-sm uppercase tracking-wide text-xs px-4 py-2 flex items-center justify-center"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Edit Timing
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Intersections;
