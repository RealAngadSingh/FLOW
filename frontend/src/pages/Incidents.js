import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Incidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchIncidents = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await axios.get(`${API}/incidents`, { params });
      setIncidents(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 10000);
    return () => clearInterval(interval);
  }, [filter]);

  const handleResolve = async (incidentId) => {
    try {
      await axios.patch(`${API}/incidents/${incidentId}`, null, {
        params: { status: 'resolved' },
      });
      fetchIncidents();
    } catch (error) {
      console.error('Error resolving incident:', error);
    }
  };

  if (loading) {
    return <div className="text-zinc-400">Loading incidents...</div>;
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'border-red-500/50 bg-red-900/20 text-red-400';
      case 'medium':
        return 'border-amber-500/50 bg-amber-900/20 text-amber-400';
      case 'low':
        return 'border-blue-500/50 bg-blue-900/20 text-blue-400';
      default:
        return 'border-zinc-700 bg-zinc-900/20 text-zinc-400';
    }
  };

  const getIncidentIcon = (type) => {
    return AlertTriangle;
  };

  return (
    <div className="space-y-6" data-testid="incidents-page">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight uppercase text-zinc-400">Incident Management</h2>
        <p className="text-sm text-zinc-500 mt-1">Monitor and respond to traffic incidents</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        {['all', 'active', 'resolved'].map((status) => (
          <button
            key={status}
            data-testid={`filter-${status}`}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-sm uppercase tracking-wide text-xs font-medium transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Incidents List */}
      {incidents.length === 0 ? (
        <div className="bg-zinc-950/50 backdrop-blur-sm border border-zinc-800 rounded-sm p-12 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <p className="text-zinc-400">No incidents to display</p>
        </div>
      ) : (
        <div className="space-y-4">
          {incidents.map((incident) => {
            const Icon = getIncidentIcon(incident.type);
            return (
              <div
                key={incident.id}
                data-testid={`incident-card-${incident.id}`}
                className={`border rounded-sm p-6 ${getSeverityColor(incident.severity)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <Icon className="w-6 h-6 mt-1" />
                    <div>
                      <h3 className="text-lg font-bold uppercase tracking-wide mb-1">
                        {incident.type.replace(/_/g, ' ')}
                      </h3>
                      <p className="text-sm opacity-90">{incident.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase border">
                      {incident.severity}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        incident.status === 'active'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {incident.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">Location</div>
                    <div className="text-sm font-mono">{incident.location}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">Reported</div>
                    <div className="text-sm font-mono">
                      {new Date(incident.timestamp).toLocaleString()}
                    </div>
                  </div>
                  {incident.resolved_at && (
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">Resolved</div>
                      <div className="text-sm font-mono">
                        {new Date(incident.resolved_at).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>

                {incident.status === 'active' && (
                  <button
                    data-testid={`resolve-btn-${incident.id}`}
                    onClick={() => handleResolve(incident.id)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-sm uppercase tracking-wide text-xs px-4 py-2 flex items-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Resolved
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Incidents;
