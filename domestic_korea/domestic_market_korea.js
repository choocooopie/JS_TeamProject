// 숫자를 천 단위 구분 기호로 포맷하는 함수
function formatNumber(num) {
    const number = parseFloat(num.replace(/,/g, '').replace(/[^0-9.-]/g, ''));
    return isNaN(number) ? 'N/A' : number.toLocaleString(); // NaN 대신 'N/A' 표시
}

// 등락률 포맷 함수
function formatRate(rate) {
    if (!rate || rate === 'N/A') return 'N/A';
    // rate에서 불필요한 문자 제거
    const value = parseFloat(rate.replace(/,/g, '').replace(/[^0-9.-]/g, ''));
    if (isNaN(value)) return 'N/A';
    return (value >= 0 ? `+${value}%` : `${value}%`);
}

// 주식 정보를 가져오는 함수
async function fetchStockData() {
    const symbol = document.getElementById('stock-symbol').value.trim();
    if (!symbol) {
        alert('종목 코드를 입력해 주세요.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/stock/${symbol}`);
        
        // 응답이 JSON인지 확인
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            
            // 데이터 처리
            const stockName = data.name;
            const stockPrice = formatNumber(data.price); // 가격 포맷
            const stockChange = formatNumber(data.change); // 전일대비
            const stockRate = formatRate(data.rate); // 등락률 포맷

            // 상승/하락 상태에 따라 텍스트와 스타일을 설정
            const isRising = parseFloat(data.rate.replace(/,/g, '').replace(/[^0-9.-]/g, '')) >= 0;
            const changeClass = isRising ? 'text-success' : 'text-danger';
            const rateIconClass = isRising ? 'up' : 'down';

            // DOM 업데이트
            document.getElementById('stock-name').innerText = stockName;
            document.getElementById('stock-price').innerText = `가격: ${stockPrice}`;
            document.getElementById('stock-change').innerHTML = `
                <span class="change-icon ${rateIconClass}"></span> ${stockChange}
            `;
            document.getElementById('stock-rate').innerHTML = `
                <span class="change-icon ${rateIconClass}"></span> 등락률: ${stockRate}
            `;

            // 차트 업데이트 (실제로는 차트 데이터를 추가해야 합니다)
            updateChart([/* 차트 데이터 추가 */]);
        } else {
            console.error('응답 형식이 JSON이 아닙니다.');
            console.error(await response.text());
        }
    } catch (error) {
        console.error('주식 정보를 가져오는 데 오류가 발생했습니다.', error);
    }
}

// 인기 종목 30개를 가져와서 페이지에 표시하는 함수
async function fetchPopularStocks(page = 1) {
    try {
        const response = await fetch(`http://localhost:3000/api/popular-stocks?page=${page}`);
        const data = await response.json();

        if (data.stocks && Array.isArray(data.stocks)) {
            const list = document.getElementById('popular-stocks-list');
            list.innerHTML = ''; // 리스트 초기화

            // 테이블 구조 생성
            const table = document.createElement('table');
            table.classList.add('table', 'table-striped', 'popular-stocks');

            const thead = document.createElement('thead');
            thead.innerHTML = `
                <tr>
                    <th>순위</th>
                    <th>종목명</th>
                    <th>현재가</th>
                    <th>전일비</th>
                    <th>등락률</th>
                    <th>거래량</th>
                    <th>거래대금</th>
                    <th>매수호가</th>
                    <th>매도호가</th>
                    <th>시가총액</th>
                    <th>PER</th>
                    <th>ROE</th>
                </tr>
            `;
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            data.stocks.forEach(stock => {
                const row = document.createElement('tr');

                // 상승/하락 색상 및 아이콘 추가
                const rateValue = parseFloat(stock.rate.replace(/,/g, '').replace(/[^0-9.-]/g, ''));
                const changeClass = rateValue >= 0 ? 'text-success' : 'text-danger';
                const rateIconClass = rateValue >= 0 ? 'up' : 'down';

                row.innerHTML = `
                    <td>${stock.rank}</td>
                    <td>${stock.name}</td>
                    <td>${formatNumber(stock.price)}</td>
                    <td class="${changeClass}"><span class="change-icon ${rateIconClass}"></span> ${formatNumber(stock.change)}</td>
                    <td class="${changeClass}">${formatRate(stock.rate)}</td>
                    <td>${formatNumber(stock.volume)}</td>
                    <td>${formatNumber(stock.amount)}</td>
                    <td>${formatNumber(stock.bid)}</td>
                    <td>${formatNumber(stock.ask)}</td>
                    <td>${formatNumber(stock.marketCap)}</td>
                    <td>${stock.per}</td>
                    <td>${stock.roe}</td>
                `;
                tbody.appendChild(row);
            });

            table.appendChild(tbody);
            list.appendChild(table);

            // 페이지네이션 버튼 생성
            const pagination = document.getElementById('pagination');
            pagination.innerHTML = ''; // 페이지네이션 초기화

            for (let i = 1; i <= data.totalPages; i++) {
                const button = document.createElement('button');
                button.textContent = i;
                button.classList.add('pagination-button');
                button.addEventListener('click', () => fetchPopularStocks(i));
                pagination.appendChild(button);
            }
        } else {
            console.error('인기 종목 데이터를 가져오는 데 실패했습니다.');
        }
    } catch (error) {
        console.error('인기 종목 데이터를 가져오는 데 오류가 발생했습니다.', error);
    }
}

//차트 js코드
async function fetchChartImage(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error('Error fetching chart image:', error);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const kospiImageUrl = 'http://localhost:3000/api/kospi-chart-image';
    const kosdaqImageUrl = 'http://localhost:3000/api/kosdaq-chart-image';
    
    const kospiChart = document.getElementById('kospiChart');
    const kosdaqChart = document.getElementById('kosdaqChart');

    const kospiImage = await fetchChartImage(kospiImageUrl);
    if (kospiImage) {
        kospiChart.src = kospiImage;
    } else {
        kospiChart.alt = '코스피 차트 이미지를 불러오는 데 실패했습니다.';
    }

    const kosdaqImage = await fetchChartImage(kosdaqImageUrl);
    if (kosdaqImage) {
        kosdaqChart.src = kosdaqImage;
    } else {
        kosdaqChart.alt = '코스닥 차트 이미지를 불러오는 데 실패했습니다.';
    }
});


// 초기 데이터 로드
fetchPopularStocks();




