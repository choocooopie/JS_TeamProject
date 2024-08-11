//서버 JS
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const cors = require('cors');

const app = express();
const port = 3000;

// CORS 미들웨어 사용
app.use(cors({
    origin: '*', // 모든 도메인 허용
}));

// 정적 파일 서빙 (HTML, CSS, JS 파일)
app.use(express.static('public'));

// 숫자를 천 단위 구분 기호로 포맷하는 함수
function formatNumber(num) {
    const number = parseFloat(num.replace(/,/g, '').replace(/[^0-9.-]/g, ''));
    return isNaN(number) ? 'N/A' : number.toLocaleString();
}

// 인기 종목 30개 제공
app.get('/api/popular-stocks', async (req, res) => {
    try {
        const url = `https://finance.naver.com/sise/sise_quant.naver?sosok=0`; // 페이지 URL 예시
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const html = iconv.decode(response.data, 'euc-kr');
        const $ = cheerio.load(html);

        const allStocks = [];
        $('table.type_2 tbody tr').each((index, element) => {
            if (index >= 2) { // 모든 항목 추출
                const $element = $(element);

                const rank = $element.find('td:nth-child(1)').text().trim(); // 순위
                const name = $element.find('td:nth-child(2)').text().trim(); // 종목명
                const price = formatNumber($element.find('td:nth-child(3)').text().trim()); // 현재가
                const change = $element.find('td:nth-child(4)').text().trim(); // 전일비
                const rate = $element.find('td:nth-child(5)').text().trim(); // 등락률
                const volume = formatNumber($element.find('td:nth-child(6)').text().trim()); // 거래량
                const amount = formatNumber($element.find('td:nth-child(7)').text().trim()); // 거래대금
                const bid = formatNumber($element.find('td:nth-child(8)').text().trim()); // 매수호가
                const ask = formatNumber($element.find('td:nth-child(9)').text().trim()); // 매도호가
                const marketCap = formatNumber($element.find('td:nth-child(10)').text().trim()); // 시가총액
                const per = $element.find('td:nth-child(11)').text().trim(); // PER
                const roe = $element.find('td:nth-child(12)').text().trim(); // ROE

                if (name && price && change && rate && volume && amount && bid && ask && marketCap && per && roe) {
                    allStocks.push({ rank, name, price, change, rate, volume, amount, bid, ask, marketCap, per, roe });
                }
            }
        });

        // 페이지네이션 처리
        const page = parseInt(req.query.page) || 1; // 페이지 번호 (기본값: 1)
        const limit = 20; // 페이지당 항목 수
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        const paginatedStocks = allStocks.slice(startIndex, endIndex);
        const totalPages = Math.ceil(allStocks.length / limit);

        res.json({ stocks: paginatedStocks, totalPages });
    } catch (error) {
        console.error('Error fetching popular stocks:', error);
        res.status(500).json({ error: 'Failed to fetch popular stocks' });
    }
});


// 세계 증시 데이터 제공
app.get('/api/world-markets', async (req, res) => {
    try {
        const url = 'https://finance.naver.com/world/';
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const html = iconv.decode(response.data, 'euc-kr');
        const $ = cheerio.load(html);

        const data = [];
        const table = $('div.section_quot table').first();
        const headers = [];

        // 테이블 헤더 추출
        table.find('thead tr').first().find('th').each((i, th) => {
            headers.push($(th).text().trim());
        });

        // 테이블 바디 데이터 추출
        table.find('tbody tr').each((i, row) => {
            const rowData = {};
            $(row).find('td').each((j, td) => {
                const header = headers[j];
                if (header) {
                    rowData[header] = $(td).text().trim();
                }
            });
            if (Object.keys(rowData).length > 0) {
                data.push(rowData);
            }
        });

        res.json(data);
    } catch (error) {
        console.error('세계 증시 데이터를 가져오는 데 오류가 발생했습니다.', error);
        res.status(500).json({ error: 'Failed to fetch world markets data' });
    }
});

// 코스피 차트 이미지 제공
app.get('/api/kospi-chart-image', async (req, res) => {
    const imageUrl = 'https://ssl.pstatic.net/imgfinance/chart/sise/siseMainKOSPI.png';
    try {
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        res.setHeader('Content-Type', 'image/png');
        res.send(imageResponse.data);
    } catch (error) {
        console.error('Error fetching kospi chart image:', error);
        res.status(500).send('Error fetching kospi chart image');
    }
});

// 코스닥 차트 이미지 제공
app.get('/api/kosdaq-chart-image', async (req, res) => {
    const imageUrl = 'https://ssl.pstatic.net/imgfinance/chart/sise/siseMainKOSDAQ.png?sid=1723016005221';
    try {
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        res.setHeader('Content-Type', 'image/png');
        res.send(imageResponse.data);
    } catch (error) {
        console.error('Error fetching kosdaq chart image:', error);
        res.status(500).send('Error fetching kosdaq chart image');
    }
});



// 서버 시작
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${port}`);
});











