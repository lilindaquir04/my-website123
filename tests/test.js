const fs = require('fs');

function testIndexFileExists() {
    if (!fs.existsSync('index.html')) {
        throw new Error('index.html не найден!');
    }
    console.log('✅ index.html существует');
}

function testIndexContainsHTML() {
    const content = fs.readFileSync('index.html', 'utf8');
    if (!content.includes('<!DOCTYPE html>') && !content.includes('<html>')) {
        throw new Error('index.html не содержит HTML структуру');
    }
    console.log('✅ index.html содержит HTML');
}

// Запуск тестов
try {
    testIndexFileExists();
    testIndexContainsHTML();
    console.log('🎉 Все тесты прошли успешно!');
    process.exit(0);
} catch (error) {
    console.error('❌ Тест провален:', error.message);
    process.exit(1);
}
