const axios = require('axios');

const url = 'https://api.vrchat.cloud/api/1/config';

//user-agentのヘッダを付与する
axios.defaults.headers.common['User-Agent'] = 'MyProject/1.0 my@email.com';
axios.get(url)
  .then(response => {
    console.log(response.data.clientApiKey);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });