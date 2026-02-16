import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Video, Upload, PlayCircle, StopCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const VideoFeeds = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [selectedIntersection, setSelectedIntersection] = useState('int-001');

  const fetchFeeds = async () => {
    try {
      const response = await axios.get(`${API}/feeds`);
      setFeeds(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching feeds:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('intersection_id', selectedIntersection);

    try {
      const response = await axios.post(`${API}/feeds/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadResult(response.data);
      setUploading(false);
    } catch (error) {
      console.error('Error uploading video:', error);
      setUploadResult({ status: 'error', message: error.message });
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="text-zinc-400">Loading video feeds...</div>;
  }

  return (
    <div className="space-y-6" data-testid="video-feeds-page">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight uppercase text-zinc-400">Video Feed Management</h2>
        <p className="text-sm text-zinc-500 mt-1">Monitor camera feeds and process video uploads</p>
      </div>

      {/* Upload Section */}
      <div className="bg-zinc-950/50 backdrop-blur-sm border border-zinc-800 rounded-sm p-6">
        <h3 className="text-xl font-medium text-zinc-100 mb-4 flex items-center">
          <Upload className="w-5 h-5 mr-2" />
          Upload Video for Processing
        </h3>
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
          <select
            data-testid="intersection-select"
            value={selectedIntersection}
            onChange={(e) => setSelectedIntersection(e.target.value)}
            className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded-sm px-4 py-2 text-sm"
          >
            <option value="int-001">Main St & 1st Ave</option>
            <option value="int-002">Broadway & 5th St</option>
            <option value="int-003">Park Ave & 12th St</option>
            <option value="int-004">Oak Blvd & Elm St</option>
            <option value="int-005">Market St & 3rd Ave</option>
          </select>
          <label
            data-testid="upload-video-label"
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-sm uppercase tracking-wide text-xs px-6 py-2 cursor-pointer flex items-center justify-center"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Processing...' : 'Choose Video File'}
            <input
              type="file"
              data-testid="video-upload-input"
              accept=".mp4,.avi,.mov"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
        {uploadResult && (
          <div
            data-testid="upload-result"
            className={`mt-4 p-4 rounded-sm border ${
              uploadResult.status === 'success'
                ? 'bg-emerald-900/20 border-emerald-500/50 text-emerald-400'
                : 'bg-red-900/20 border-red-500/50 text-red-400'
            }`}
          >
            <div className="font-bold mb-2">{uploadResult.status === 'success' ? 'Upload Successful!' : 'Upload Failed'}</div>
            {uploadResult.status === 'success' ? (
              <div className="text-sm space-y-1">
                <div>File: {uploadResult.filename}</div>
                <div>Frames: {uploadResult.frame_count}</div>
                <div>Resolution: {uploadResult.resolution}</div>
                <div>Detections: {uploadResult.detections_count}</div>
                <div className="text-xs opacity-75 mt-2">{uploadResult.message}</div>
              </div>
            ) : (
              <div className="text-sm">{uploadResult.message}</div>
            )}
          </div>
        )}
      </div>

      {/* Video Feeds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {feeds.map((feed) => (
          <div
            key={feed.id}
            data-testid={`feed-card-${feed.id}`}
            className="bg-zinc-950/50 backdrop-blur-sm border border-zinc-800 rounded-sm overflow-hidden hover:border-zinc-700 transition-colors"
          >
            {/* Video Thumbnail */}
            <div className="relative aspect-video bg-zinc-900">
              <img src={feed.url} alt={feed.name} className="w-full h-full object-cover" />
              <div className="scanline absolute inset-0"></div>
              {feed.status === 'active' && (
                <span className="absolute top-2 right-2 bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase animate-pulse-red">
                  LIVE
                </span>
              )}
            </div>

            {/* Feed Info */}
            <div className="p-4">
              <h4 className="text-lg font-medium text-zinc-100 mb-2">{feed.name}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Resolution:</span>
                  <span className="text-zinc-100 font-mono">{feed.resolution}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">FPS:</span>
                  <span className="text-zinc-100 font-mono">{feed.fps}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Status:</span>
                  <span
                    className={`font-mono text-xs ${
                      feed.status === 'active' ? 'text-emerald-400' : 'text-zinc-500'
                    }`}
                  >
                    {feed.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoFeeds;
