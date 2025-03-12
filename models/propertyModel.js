//测试调用Cat信息API
const axios = require('axios');
const requestCatAPI = () => {
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




const requestRealtyAPI = async () => {
    try {
        const options = {
            method: 'GET',
            url: 'https://realtor16.p.rapidapi.com/search/forrent/coordinates?latitude=29.27052&longitude=-95.74991&radius=30',
            headers: {
                'x-rapidapi-key': 'a545200318mshe35b1e4f95b4289p1a0053jsn086ecbe98a85',
                'x-rapidapi-host': 'realtor16.p.rapidapi.com'
            }
        };

        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        throw new Error(error.response ? error.response.data : 'API Request Failed');
    }
};





module.exports = { requestCatAPI, requestRealtyAPI };