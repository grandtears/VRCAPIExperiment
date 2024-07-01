// WorldService.ts
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

export const fetchWorldInfo = async (worldId: string): Promise<WorldInfo> => {
  try {
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

    return extractedInfo;
  } catch (error) {
    throw error;
  }
};