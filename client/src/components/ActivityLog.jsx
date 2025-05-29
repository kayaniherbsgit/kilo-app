import React, { useState } from 'react';
import '../styles/AdminDashboard.css';

const highlightKeywords = (text = '') => {
  const highlightMap = {
    uploaded: 'highlight',
    created: 'highlight',
    edited: 'highlight',
    updated: 'highlight',
    removed: 'highlight',
    deleted: 'highlight-red'
  };

  const regex = new RegExp(`\\b(${Object.keys(highlightMap).join('|')})\\b`, 'gi');

  return text.replace(regex, (match) => {
    const cls = highlightMap[match.toLowerCase()] || 'highlight';
    return `<span class="${cls}">${match}</span>`;
  });
};

const groupLogsByDate = (logs) => {
  const grouped = {};
  logs.forEach((log) => {
    const dateKey = new Date(log.timestamp).toLocaleDateString();
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(log);
  });
  return grouped;
};

const ActivityLog = ({ logs }) => {
  const [search, setSearch] = useState('');

  const filteredLogs = (logs || []).filter((log) => {
    const action = log.action || '';
    const performedBy = log.performedBy || '';
    const details = log.details || '';
    return (
      action.toLowerCase().includes(search.toLowerCase()) ||
      performedBy.toLowerCase().includes(search.toLowerCase()) ||
      details.toLowerCase().includes(search.toLowerCase())
    );
  });

  const groupedLogs = groupLogsByDate(filteredLogs);

  return (
    <div className="activity-log-section">
      <h3>📋 Activity Logs</h3>
      <input
        type="text"
        placeholder="Search logs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="log-search-input"
      />
      <div className="log-list">
        {Object.keys(groupedLogs).length > 0 ? (
          Object.keys(groupedLogs).map((date) => (
            <div key={date}>
              <h4 style={{ color: '#b4ff39', marginTop: '1rem' }}>{date}</h4>
              {groupedLogs[date].map((log, i) => (
                <div key={i} className="log-entry">
                  <strong>{log.action}</strong> by <span>{log.performedBy}</span>
                  <div
                    style={{ fontSize: '0.85rem', color: '#aaa' }}
                    dangerouslySetInnerHTML={{
                      __html: highlightKeywords(log.details),
                    }}
                  />
                  <div className="timestamp">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="no-logs">No logs found.</div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
