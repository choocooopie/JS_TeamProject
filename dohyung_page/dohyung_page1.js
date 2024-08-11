// script.js
const weatherAPIKey = '81c32e0166c08b96a43605797a7bd659';
const newsAPIKey = '8853b42cfa264087b27d071901006ce8';


document.addEventListener('DOMContentLoaded', () => {
    loadWeather();
    document.getElementById('newsButton').addEventListener('click', loadNews);
    
});

function loadWeather() {
    const weatherDiv = document.getElementById('weather');
    const city = 'Seoul'; // 원하는 도시로 변경 가능

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherAPIKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            const temp = data.main.temp;
            const weatherDescription = data.weather[0].description;
            weatherDiv.innerHTML = `현재 서울 날씨: ${temp}°C, ${weatherDescription}`;
        })
        .catch(error => {
            console.error('날씨 API 호출 오류:', error);
            weatherDiv.innerHTML = '날씨 정보를 불러오는 데 실패했습니다.';
        });
}


function fetchNews() {
    const apiKey = '8853b42cfa264087b27d071901006ce8';
    const apiUrl = `https://newsapi.org/v2/top-headlines?country=kr&apiKey=${apiKey}`;
    
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const newsList = document.getElementById('news-list');
            newsList.innerHTML = '';
            data.articles.forEach(article => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <a href="${article.url}" target="_blank">
                        
                        ${article.title}
                    </a>`;
                newsList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error fetching news:', error));
}

document.addEventListener('DOMContentLoaded', fetchNews);










    function lookupWord() {
        const word = document.getElementById('word-input').value;
        const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
        
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const resultDiv = document.getElementById('dictionary-result');
                resultDiv.innerHTML = ''; // 기존 결과 초기화
                
                if (data.title === "No Definitions Found") {
                    resultDiv.innerHTML = '단어를 찾을 수 없습니다.';
                } else {
                    const meaning = data[0].meanings[0].definitions[0].definition;
                    resultDiv.innerHTML = `<strong>${word}:</strong> ${meaning}`;
                }
            })
            .catch(error => console.error('Error fetching dictionary data:', error));
    }