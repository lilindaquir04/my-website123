// tests/test.js
const fs = require('fs');
const path = require('path');

class TestRunner {
    constructor() {
        this.errors = [];
        this.passed = 0;
    }

    assert(condition, message) {
        if (!condition) {
            this.errors.push(`❌ ${message}`);
            return false;
        } else {
            console.log(`✅ ${message}`);
            this.passed++;
            return true;
        }
    }

    testIndexFileExists() {
        const fileExists = fs.existsSync('index.html');
        return this.assert(
            fileExists, 
            'Файл index.html должен существовать в корне проекта'
        );
    }

    testIndexFileIsHTML() {
        if (!fs.existsSync('index.html')) {
            this.errors.push('❌ Не могу проверить HTML - файл index.html отсутствует');
            return false;
        }

        const content = fs.readFileSync('index.html', 'utf8').toLowerCase();
        const hasHTML = content.includes('<!doctype html>') || content.includes('<html>');
        
        return this.assert(
            hasHTML,
            'Файл index.html должен содержать HTML разметку'
        );
    }

    testNoBrokenLinks() {
        if (!fs.existsSync('index.html')) {
            return false;
        }

        const content = fs.readFileSync('index.html', 'utf8');
        const links = content.match(/href="([^"]*)"/g) || [];
        let brokenLinks = 0;

        links.forEach(link => {
            const url = link.replace('href="', '').replace('"', '');
            // Проверяем только локальные файлы
            if (url.startsWith('./') || (!url.startsWith('http') && !url.startsWith('#') && !url.startsWith('mailto:'))) {
                const filePath = path.join(process.cwd(), url);
                if (!fs.existsSync(filePath)) {
                    brokenLinks++;
                    this.errors.push(`❌ Найдена битая ссылка: ${url}`);
                }
            }
        });

        if (brokenLinks === 0) {
            console.log('✅ Все ссылки в порядке');
            this.passed++;
        }
        return brokenLinks === 0;
    }

    runAllTests() {
        console.log('🧪 Запускаю тесты...\n');
        
        this.testIndexFileExists();
        this.testIndexFileIsHTML();
        this.testNoBrokenLinks();

        console.log('\n📊 Результаты тестов:');
        console.log(`✅ Пройдено: ${this.passed}`);
        console.log(`❌ Ошибок: ${this.errors.length}`);

        if (this.errors.length > 0) {
            console.log('\n🚨 Список ошибок:');
            this.errors.forEach(error => console.log(error));
            console.log('\n💡 Рекомендации:');
            console.log('   - Убедитесь что файл index.html существует в корне проекта');
            console.log('   - Проверьте что index.html содержит валидный HTML код');
            console.log('   - Убедитесь что все ссылки в index.html ведут на существующие файлы');
            process.exit(1);
        } else {
            console.log('\n🎉 Все тесты прошли успешно! Можно деплоить.');
            process.exit(0);
        }
    }
}

// Запуск тестов
new TestRunner().runAllTests();
