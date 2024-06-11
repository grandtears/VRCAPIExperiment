import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
  const [worldInfo, setWorldInfo] = useState<WorldInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorldInfo = async () => {
      try {
        const worldId = 'wrld_175f8d7d-fd44-476a-8242-8aaef5ba5b33';
        const response = await axios.get(`/api/1/worlds/${worldId}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0',
          },
        });

        const worldData = response.data;
        const extractedInfo: WorldInfo = {
          name: worldData.name,
          authorName: worldData.authorName,
          description: worldData.description,
          imageUrl: worldData.imageUrl,
          capacity: worldData.capacity,
          visits: worldData.visits,
          favorites: worldData.favorites,
          Tags: worldData.tags,
        };

        setWorldInfo(extractedInfo);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          setError(`Error retrieving world information: ${error.response.status} ${error.response.statusText}`);
        } else {
          setError('Error retrieving world information');
        }
      }
    };

    fetchWorldInfo();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!worldInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{worldInfo.name}</h1>
      <p>Author: {worldInfo.authorName}</p>
      <p>Description: {worldInfo.description}</p>
      <img src={worldInfo.imageUrl} alt={worldInfo.name} />
      <p>Capacity: {worldInfo.capacity}</p>
      <p>Visits: {worldInfo.visits}</p>
      <p>Favorites: {worldInfo.favorites}</p>
      <p>Tags: {worldInfo.Tags.join(', ')}</p>
    </div>
  );
};

export default WorldInfoComponent;