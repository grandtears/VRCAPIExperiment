import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseLogFiles, WorldEntry } from '../ts/logParser';
import { fetchWorldInfo } from '../ts/getWorldInfo';
import '../css/worldLogViewer.css';

interface WorldInfo {
  name: string;
  authorName: string;
  description: string;
  imageUrl: string;
  capacity: number;
  visits: number;
  favorites: number;
  Tags: string[];
}

interface GroupedEntries {
  [date: string]: WorldEntry[];
}

const WorldLogViewer: React.FC = () => {
  const navigate = useNavigate();
  const [worldEntries, setWorldEntries] = useState<WorldEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<WorldEntry | null>(null);
  const [selectedWorldInfo, setSelectedWorldInfo] = useState<WorldInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const entries = await parseLogFiles(fileArray);
      console.log("Parsed entries:", entries.map(entry => ({
        ...entry,
        users: Array.from(entry.users)
      })));
      setWorldEntries(entries);
    }
  };

  const groupedEntries = useMemo(() => {
    return worldEntries.reduce((acc: GroupedEntries, entry) => {
      const date = entry.date.split(' ')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(entry);
      return acc;
    }, {});
  }, [worldEntries]);

  const handleShowDetail = useCallback(async (entry: WorldEntry) => {
    console.log("Original entry:", entry);
    console.log("Original users:", Array.from(entry.users));

    setSelectedEntry(entry);
    setSelectedWorldInfo(null);
    setError(null);

    try {
      const worldInfo = await fetchWorldInfo(entry.worldId);
      setSelectedWorldInfo(worldInfo);
    } catch (error) {
      setError('Error retrieving world information');
    }
  }, []);

  const userList = useMemo(() => {
    if (selectedEntry && selectedEntry.users) {
      return Array.from(selectedEntry.users);
    }
    return [];
  }, [selectedEntry]);

  useEffect(() => {
    console.log("Current worldEntries:", worldEntries);
  }, [worldEntries]);

  return (
    <div className="world-log-viewer">
      <h1>World Log Viewer</h1>
      <input
        type="file"
        multiple
        accept=".log,.txt"
        onChange={handleFileSelect}
      />
      <div className="two-column-layout">
        <div className="left-column">
          {Object.keys(groupedEntries).length > 0 && (
            <div>
              <h2>World Entries:</h2>
              {Object.entries(groupedEntries).map(([date, entries]) => (
                <div key={date}>
                  <h3>{date}</h3>
                  <ul>
                    {entries.map((entry, index) => (
                      <li key={index}>
                        Time: {entry.date.split(' ')[1]}, 
                        World: {entry.worldName || 'Unknown'} 
                        VisitTime : {entry.visitTime}
                        InstanceType : {entry.instanceType}
                        <button onClick={() => handleShowDetail(entry)}>Show Detail</button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="right-column">
          {selectedEntry && (
            <div>
              <h2>Selected World Detail</h2>
              {error && <p className="error">Error: {error}</p>}
              {selectedWorldInfo ? (
                <div className="world-info-container">
                  <h3>{selectedWorldInfo.name}</h3>
                  <p>World Name from Log: {selectedEntry.worldName || 'Unknown'}</p>
                  <p>World ID: {selectedEntry.worldId}</p>
                  <p>Instance ID: {selectedEntry.instanceId}</p>
                  <img src={selectedWorldInfo.imageUrl} alt={selectedWorldInfo.name} className="world-info-image" />
                  <p>Author: {selectedWorldInfo.authorName}</p>
                  <p>Description: {selectedWorldInfo.description}</p>
                  <p>Capacity: {selectedWorldInfo.capacity}</p>
                  <p>Visits: {selectedWorldInfo.visits}</p>
                  <p>Favorites: {selectedWorldInfo.favorites}</p>
                  <p>Tags: {selectedWorldInfo.Tags.join(', ')}</p>
                  <h4>Users in this instance:</h4>
                  {userList.length > 0 ? (
                    <ul>
                      {userList.map((user, index) => (
                        <li key={index}>{user}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No users found in this instance.</p>
                  )}
                </div>
              ) : (
                <p>Loading world information...</p>
              )}
            </div>
          )}
        </div>
      </div>
      <button onClick={() => navigate('/')}>Back to World Info</button>
    </div>
  );
};

export default WorldLogViewer;
