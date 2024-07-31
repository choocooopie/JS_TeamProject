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
            const stockPrice = data.price;
            const stockHistory = data.history; // 실제로는 주식 역사 데이터

            // DOM 업데이트
            document.getElementById('stock-name').innerText = stockName;
            document.getElementById('stock-price').innerText = `가격: ${stockPrice}`;

            // 차트 업데이트
            updateChart(stockHistory);
        } else {
            console.error('응답 형식이 JSON이 아닙니다.');
            console.error(await response.text());
        }
    } catch (error) {
        console.error('주식 정보를 가져오는 데 오류가 발생했습니다.', error);
    }
}




