import React, { useEffect, useState, useRef } from 'react';
import '../css/worldViewer.css';
import { fetchWorldInfo } from '../ts/getWorldInfo';
import { useNavigate } from 'react-router-dom';

interface WorldInfo {
  id: string;
  name: string;
  authorName: string;
  description: string;
  imageUrl: string;
  capacity: number;
  visits: number;
  favorites: number;
  Tags: string[];
}

const WorldInfoComponent: React.FC = () => {
  const navigate = useNavigate();
  const [worldInfoList, setWorldInfoList] = useState<WorldInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [worldIdInput, setWorldIdInput] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchDefaultWorld = async () => {
      try {
        const defaultWorldId = 'wrld_175f8d7d-fd44-476a-8242-8aaef5ba5b33';
        const worldInfo = await fetchWorldInfo(defaultWorldId);
        setWorldInfoList([{ ...worldInfo, id: defaultWorldId }]);
      } catch (error) {
        setError('Error retrieving default world information');
      }
    };

    fetchDefaultWorld();
  }, []);

  const handleAddWorld = async () => {
    try {
      const worldInfo = await fetchWorldInfo(worldIdInput);
      setWorldInfoList([...worldInfoList, { ...worldInfo, id: worldIdInput }]);
      setWorldIdInput('');
    } catch (error) {
      setError('Error retrieving world information');
    }
  };

  const handleViewLogs = () => {
    navigate('/worldLogs');
  };

  const handleExportWorldIds = () => {
    const worldIds = worldInfoList.map(world => world.id);
    const jsonOutput = JSON.stringify(worldIds, null, 2);
    
    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'world_ids.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportWorldIds = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const worldIds = JSON.parse(content) as string[];
        
        setWorldInfoList([]); // Clear existing list
        setError(null);

        for (const worldId of worldIds) {
          try {
            const worldInfo = await fetchWorldInfo(worldId);
            setWorldInfoList(prev => [...prev, { ...worldInfo, id: worldId }]);
          } catch (error) {
            console.error(`Error fetching world info for ID ${worldId}:`, error);
            setError(prev => prev ? `${prev}, ${worldId}` : `Error fetching world(s): ${worldId}`);
          }
        }
      } catch (error) {
        setError('Error parsing JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <div>
        <input
          type="text"
          value={worldIdInput}
          onChange={(e) => setWorldIdInput(e.target.value)}
          placeholder="Enter World ID"
        />
        <button onClick={handleAddWorld}>Add World</button>
        <button onClick={handleViewLogs}>View World Logs</button>
        <button onClick={handleExportWorldIds}>Export World IDs</button>
        <input
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleImportWorldIds}
        />
        <button onClick={() => fileInputRef.current?.click()}>Import World IDs</button>
      </div>
      {error && <div>Error: {error}</div>}
      {worldInfoList.map((worldInfo, index) => (
        <div key={index}>
          <h2>{worldInfo.name}</h2>
          <p>World ID: {worldInfo.id}</p>
          <p>Author: {worldInfo.authorName}</p>
          <p>Description: {worldInfo.description}</p>
          <img src={worldInfo.imageUrl} alt={worldInfo.name} className="world-info-image" />
          <p>Capacity: {worldInfo.capacity}</p>
          <p>Visits: {worldInfo.visits}</p>
          <p>Favorites: {worldInfo.favorites}</p>
          <p>Tags: {worldInfo.Tags.join(', ')}</p>
          <hr />
        </div>
      ))}
    </div>
  );
};

export default WorldInfoComponent;