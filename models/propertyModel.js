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
            url: 'https://realtor16.p.rapidapi.com/search/forsale/coordinates?latitude=29.27052&longitude=-95.74991&radius=100',
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

//暂时请求本地文件获取json数据，节约api
const fs = require('fs');
const path = '/Users/ZhengZhixiang/Desktop/realtyAPI.json'; // 替换为你的实际路径
const requestLocalJSON = async () => {
    try {
        // 读取文件内容
        const data = fs.readFileSync(path, 'utf8');

        // 解析 JSON 数据
        const parsedData = JSON.parse(data);
        return parsedData;
    } catch (err) {
        throw new Error('读取文件失败:', err);
    }
}









module.exports = { requestCatAPI, requestRealtyAPI, requestLocalJSON };