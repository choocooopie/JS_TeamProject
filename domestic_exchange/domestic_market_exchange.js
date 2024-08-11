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

document.addEventListener('DOMContentLoaded', () => {
    const data = [
        ["영국 파운드/달러", "GBPUSD", "1.2732", "하락 0.0029", "- 0.23%"],
        ["유로/달러", "EURUSD", "1.0926", "상승 0.0004", "+ 0.04%"],
        ["호주 달러/달러", "AUDUSD", "0.6577", "하락 0.0005", "- 0.08%"],
        ["달러/홍콩 달러", "USDHKD", "7.7980", "하락 0.0005", "- 0.01%"],
        ["달러/일본 엔", "USDJPY", "146.6600", "상승 0.0900", "+ 0.06%"],
        ["달러/캐나다 달러", "USDCAD", "1.3757", "상승 0.0032", "+ 0.23%"],
        ["달러/아랍에미리트 디르함", "USDAED", "3.6730", "보합 0.0000", "0.00%"],
        ["달러/네델란드 안틸레", "USDANG", "1.8031", "상승 0.0011", "+ 0.06%"],
        ["달러/아르헨티나 페소", "USDARS", "935.7085", "하락 1.3216", "- 0.14%"],
        ["달러/불가리아 레브", "USDBGN", "1.7921", "상승 0.0016", "+ 0.09%"],
        ["달러/브라질 레알", "USDBRL", "5.5050", "상승 0.0120", "+ 0.22%"],
        ["달러/스위스 프랑", "USDCHF", "0.8652", "상승 0.0005", "+ 0.06%"],
        ["달러/칠레 페소", "USDCLP", "932.8200", "하락 0.4800", "- 0.05%"],
        ["달러/중국 위안", "USDCNY", "7.1667", "상승 0.0019", "+ 0.03%"],
        ["달러/콜롬비아 페소", "USDCOP", "4,070.5000", "하락 26.6400", "- 0.65%"],
        ["달러/체코 크로나", "USDCZK", "23.1252", "상승 0.0042", "+ 0.02%"],
        ["달러/덴마크 크로네", "USDDKK", "6.8358", "상승 0.0043", "+ 0.06%"],
        ["달러/피지 달러", "USDFJD", "2.2457", "상승 0.0030", "+ 0.13%"],
        ["달러/헝가리 포린트", "USDHUF", "361.0600", "하락 0.0200", "- 0.01%"],
        ["달러/인도네시아 루피아", "USDIDR", "15,949.9000", "상승 5.5500", "+ 0.03%"],
        ["달러/이스라엘 세켈", "USDILS", "3.7248", "상승 0.0007", "+ 0.02%"],
        ["달러/인도 루피", "USDINR", "83.9530", "상승 0.0020", "0.00%"],
        ["달러/이란 리얄", "USDIRR", "42,092.5000", "하락 12.5000", "- 0.03%"],
        ["달러/요르단 디나르", "USDJOD", "0.7088", "보합 0.0000", "0.00%"],
        ["달러/모로코 디르함", "USDMAD", "9.8525", "상승 0.0369", "+ 0.38%"],
        ["달러/마카오 파타카", "USDMOP", "8.0341", "상승 0.0086", "+ 0.11%"],
        ["달러/멕시코 뉴페소", "USDMXN", "18.8320", "상승 0.0340", "+ 0.18%"],
        ["달러/감비아 달라시", "USDGMD", "69.5000", "보합 0.0000", "0.00%"],
        ["달러/과테말라 케트잘", "USDGTQ", "7.7500", "상승 0.0100", "+ 0.13%"],
        ["달러/조지아 라리", "USDGEL", "2.6900", "하락 0.0050", "- 0.19%"]
    ];

    const tbody = document.getElementById('market-indicators-tbody');

    data.forEach(row => {
        const tr = document.createElement('tr');

        row.forEach((cell, index) => {
            const td = document.createElement('td');

            if (index === 3) { // 전일대비 열에 스타일을 적용
                const change = cell.split(' ')[0]; // '상승' / '하락' / '보합'
                td.classList.add(
                    change === '상승' ? 'text-success' :
                    change === '하락' ? 'text-danger' : 'text-neutral'
                );
            } else if (index === 4) { // 등락률 열에 스타일을 적용
                const change = parseFloat(cell.replace('%', '').trim());
                td.classList.add(
                    change > 0 ? 'text-success' : 
                    change < 0 ? 'text-danger' : 'text-neutral'
                );
            }

            td.textContent = cell;
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });
});











