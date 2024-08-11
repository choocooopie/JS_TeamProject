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
        ["미국", "다우 산업", "39,497.54", "51.05", "+0.13%", "08.09 16:20"],
        ["미국", "다우 운송", "15,334.53", "100.64", "-0.65%", "08.09 16:20"],
        ["미국", "나스닥 종합", "16,745.30", "85.28", "+0.51%", "08.09 16:15"],
        ["미국", "나스닥 100", "18,513.10", "99.28", "+0.54%", "08.09 16:15"],
        ["미국", "S&P 500", "5,344.16", "24.85", "+0.47%", "08.09 16:55"],
        ["미국", "필라델피아 반도체", "4,709.45", "20.56", "-0.43%", "08.09 16:15"],
        ["브라질", "브라질 BOVESPA", "130,614.59", "1,953.71", "+1.52%", "08.09"],
        ["중국", "상해종합", "2,862.19", "7.707", "-0.27%", "08.09 15:00"],
        ["중국", "상해 A", "2,999.89", "8.13", "-0.27%", "08.09 15:00"],
        ["중국", "상해 B", "232.87", "0.258", "+0.11%", "08.09 15:00"],
        ["일본", "니케이225", "35,025.00", "193.85", "+0.56%", "08.09 15:15"],
        ["홍콩", "항셍", "17,090.23", "198.40", "+1.17%", "08.09 16:09"],
        ["홍콩", "항셍 차이나기업(H)", "6,017.85", "76.38", "+1.29%", "08.09 16:09"],
        ["홍콩", "항셍 차이나대기업(R)", "3,554.56", "31.38", "+0.89%", "08.09 16:09"],
        ["대만", "대만 가권", "21,469.00", "598.90", "+2.87%", "08.09 13:33"],
        ["인도", "인도 SENSEX", "79,705.91", "819.69", "+1.04%", "08.09 15:59"],
        ["말레이시아", "말레이시아 KLCI", "1,596.05", "5.67", "+0.36%", "08.09 17:00"],
        ["인도네시아", "인도네시아 IDX종합", "7,257.00", "61.88", "+0.86%", "08.09"],
        ["영국", "영국 FTSE 100", "8,168.10", "23.13", "+0.28%", "08.09 16:35"],
        ["프랑스", "프랑스 CAC 40", "7,269.71", "22.26", "+0.31%", "08.09 17:35"],
        ["독일", "독일 DAX", "17,722.88", "42.48", "+0.24%", "08.09 17:30"],
        ["유럽", "유로스톡스 50", "4,675.28", "6.54", "+0.14%", "08.09 17:35"],
        ["러시아", "러시아 RTS", "1,151.93", "2.30", "-0.20%", "06.20"],
        ["이탈리아", "이탈리아 FTSE MIB", "31,782.23", "40.32", "+0.12%", "08.09 17:35"]
    ];

    const tbody = document.getElementById('world-markets-tbody');

    data.forEach(row => {
        const tr = document.createElement('tr');

        row.forEach((cell, index) => {
            const td = document.createElement('td');

            if (index >= 2 && index <= 4) { // 현재가, 전일대비, 등락률 열에 스타일을 적용
                const change = parseFloat(row[4].replace('%', ''));
                td.classList.add(change > 0 ? 'text-success' : 'text-danger');
                td.innerHTML = (index === 4) ? `
                    <span class="change-icon ${change > 0 ? 'up' : 'down'}"></span> ${cell}
                ` : cell;
            } else {
                td.textContent = cell;
            }

            // 다우 산업 및 다우 운송에 호버 스타일 및 모달 기능 추가
            if (row[1] === "다우 산업" || row[1] === "다우 운송") {
                td.classList.add('hover-target'); // 호버 타겟 클래스 추가
                td.addEventListener('click', () => {
                    const modal = document.getElementById('myModal');
                    const modalImage = document.getElementById('modal-image');
                    if (row[1] === "다우 산업") {
                        modalImage.src = 'https://ssl.pstatic.net/imgfinance/chart/world/month3/DJI@DJI.png?1723383393792';
                    } else if (row[1] === "다우 운송") {
                        modalImage.src = 'https://ssl.pstatic.net/imgfinance/chart/world/month3/DJI@DJT.png?1723384033413';
                    }
                    modal.style.display = 'block';
                });
            }

            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    // 모달 닫기 이벤트
    const modal = document.getElementById('myModal');
    const closeBtn = document.querySelector('.close');

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});










