const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite'); // iconv-lite 패키지 추가
const cors = require('cors'); // CORS 패키지 추가

const app = express();
const port = 3000;

// CORS 미들웨어 사용
app.use(cors());

// 정적 파일 서빙 (HTML, CSS, JS 파일)
app.use(express.static('public'));

// 주식 데이터 크롤링 및 제공
app.get('/api/stock/:symbol', async (req, res) => {
    const symbol = req.params.symbol;

    try {
        // 네이버 주식 페이지 URL
        const url = `https://finance.naver.com/item/main.nhn?code=${symbol}`;
        
        // HTML 페이지를 arraybuffer로 가져오기
        const response = await axios.get(url, { responseType: 'arraybuffer' });

        // arraybuffer를 EUC-KR에서 UTF-8로 변환
        const html = iconv.decode(response.data, 'euc-kr'); // EUC-KR로 인코딩 변환

        const $ = cheerio.load(html);

        // 주식 데이터 추출 (네이버 페이지의 구조에 따라 조정 필요)
        const stockName = $('div.wrap_company h2').text().trim();
        const stockPrice = $('p.no_today span.blind').first().text().trim();
        const stockHistory = []; // 실제로는 주식의 역사 데이터를 크롤링해야 합니다

        res.json({
            name: stockName,
            price: stockPrice,
            history: stockHistory
        });
    } catch (error) {
        console.error('Error fetching stock data:', error);
        res.status(500).json({ error: 'Failed to fetch stock data' });
    }
});

// 서버 시작
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

