const catFacts = [
    "Коты спят 16 часов в день! 😴",
    "У котиков по 5 пальцев на передних лапках и по 4 на задних 🐾",
    "Коты могут поворачивать уши на 180 градусов! 📡",
    "Мурлыкание кошек лечит стресс у людей 💖",
    "Коты не чувствуют сладкий вкус 🍬",
    "Усы помогают котикам ориентироваться в пространстве 🧭",
    "Коты могут прыгать в 5 раз выше своего роста! 🦘",
    "Каждый котик имеет уникальный отпечаток носа 👃",
    "Коты общаются с помощью хвоста 🐈",
    "Домашние котики живут в 3 раза дольше уличных 🏠"
];

let smileCount = localStorage.getItem('smileCount') || 0;
document.getElementById('count').textContent = smileCount;

function showFact() {
    const factElement = document.getElementById('fact');
    const randomFact = catFacts[Math.floor(Math.random() * catFacts.length)];
    
    factElement.innerHTML = randomFact;
    factElement.style.display = 'block';
    
    // Добавляем случайную эмодзи для веселья
    const emojis = ['🐱', '😸', '😹', '😺', '😻', '😼', '😽', '🙀', '😿', '😾'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    setTimeout(() => {
        factElement.innerHTML += `<br><span style="font-size: 2em;">${randomEmoji}</span>`;
    }, 500);
}

function incrementCounter() {
    smileCount++;
    document.getElementById('count').textContent = smileCount;
    localStorage.setItem('smileCount', smileCount);
    
    // Веселая анимация
    const countElement = document.getElementById('count');
    countElement.style.transform = 'scale(1.5)';
    setTimeout(() => {
        countElement.style.transform = 'scale(1)';
    }, 300);
    
    // Случайный комплимент
    const compliments = [
        "Отлично! 😊", 
        "Еще одна улыбка! 🌟", 
        "Котики рады! 🐱", 
        "Продолжаем! 💫",
        "Мур-мур! 🎉"
    ];
    const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
    
    // Создаем летающий текст
    createFlyingText(randomCompliment);
}

function createFlyingText(text) {
    const flyingText = document.createElement('div');
    flyingText.textContent = text;
    flyingText.style.cssText = `
        position: fixed;
        font-size: 1.5em;
        color: #ff6b6b;
        font-weight: bold;
        pointer-events: none;
        z-index: 1000;
        animation: flyUp 2s ease-out forwards;
    `;
    
    // Случайная позиция вверху
    flyingText.style.left = Math.random() * 80 + 10 + '%';
    flyingText.style.top = '80%';
    
    document.body.appendChild(flyingText);
    
    // Удаляем после анимации
    setTimeout(() => {
        flyingText.remove();
    }, 2000);
}

// Добавляем стили для летающего текста
const style = document.createElement('style');
style.textContent = `
    @keyframes flyUp {
        0% {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translateY(-100px) scale(0.5);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

console.log('🐱 Котики загружены и готовы радовать!');
