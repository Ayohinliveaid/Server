//调用房产信息API
const axios = require('axios');
const requestPropertyInfo = () => {
    return new Promise((resolve, reject) => {
        axios.get('https://api.thecatapi.com/v1/images/search?limit=3&mime_types=png', {
            headers: {
                'x-api-key': 'live_QTQoXsscFALX63br8NHnps2gMpgK0qiTiTNot1j6oVNcDDe2fdOzkZYfzcqDA8dK'
            }
        })
            .then(response => {
                const cats = response.data.map(cat => ({
                    id: cat.id,
                    url: cat.url
                }));
                resolve(cats);
            })
            .catch(error => {
                reject(error);
            });
    });
};

module.exports = { requestPropertyInfo };