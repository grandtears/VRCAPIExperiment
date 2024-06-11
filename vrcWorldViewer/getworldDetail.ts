const axios = require('axios');

//const worldId = 'wrld_f5f8b3dc-6f33-4b34-97f3-83add2fb224d';
const worldId = 'wrld_175f8d7d-fd44-476a-8242-8aaef5ba5b33';

axios.get(`https://vrchat.com/api/1/worlds/${worldId}`, {
  headers: {
    'User-Agent': 'Mozilla/5.0' // User-Agentヘッダーを追加
  }
})
  .then(response => {
    const worldData = response.data;

    // レスポンスデータから必要な情報のみを抽出
    const worldInfo = {
      name: worldData.name,
      authorName: worldData.authorName,
      description: worldData.description,
      imageUrl: worldData.imageUrl,
      capacity: worldData.capacity,
      visits: worldData.visits,
      favorites: worldData.favorites,
      Tags: worldData.tags
    };

    console.log('World information:');
    console.log(worldInfo);
  })
  .catch(error => {
    if (error.response) {
      // ステータスコードとエラーメッセージを表示
      console.error(`Error retrieving world information: ${error.response.status} ${error.response.statusText}`);
      console.error(error.response.data); // エラーの詳細を表示
    } else {
      console.error('Error retrieving world information:', error.message);
    }
  });
