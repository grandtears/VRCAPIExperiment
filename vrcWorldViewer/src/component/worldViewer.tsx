// WorldInfoComponent.tsx
import React, { useEffect, useState } from 'react';
import '../css/worldViewer.css';
import { fetchWorldInfo } from '../ts/getWorldInfo';
import { useNavigate } from 'react-router-dom';

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

const WorldInfoComponent: React.FC = () => {
  const navigate = useNavigate();
  const [worldInfoList, setWorldInfoList] = useState<WorldInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [worldIdInput, setWorldIdInput] = useState<string>('');

  useEffect(() => {
    const fetchDefaultWorld = async () => {
      try {
        const defaultWorldId = 'wrld_175f8d7d-fd44-476a-8242-8aaef5ba5b33';
        const worldInfo = await fetchWorldInfo(defaultWorldId);
        setWorldInfoList([worldInfo]);
      } catch (error) {
        setError('Error retrieving default world information');
      }
    };

    fetchDefaultWorld();
  }, []);

  const handleAddWorld = async () => {
    try {
      const worldInfo = await fetchWorldInfo(worldIdInput);
      setWorldInfoList([...worldInfoList, worldInfo]);
      setWorldIdInput('');
    } catch (error) {
      setError('Error retrieving world information');
    }
  };

  const handleViewLogs = () => {
    navigate('/worldLogs');
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
      </div>
      {error && <div>Error: {error}</div>}
      {worldInfoList.map((worldInfo, index) => (
        <div key={index}>
          <h2>{worldInfo.name}</h2>
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