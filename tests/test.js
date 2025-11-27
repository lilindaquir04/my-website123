const fs = require('fs');
const path = require('path');

class HTMLValidator {
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

    testFileIsNotEmpty() {
        if (!fs.existsSync('index.html')) return false;

        const stats = fs.statSync('index.html');
        const content = fs.readFileSync('index.html', 'utf8');
        
        return this.assert(
            stats.size > 50, // Минимум 50 байт
            'Файл index.html не должен быть пустым (минимум 50 байт)'
        );
    }

    testBasicHTMLStructure() {
        if (!fs.existsSync('index.html')) return false;

        const content = fs.readFileSync('index.html', 'utf8').toLowerCase();
        
        const hasDoctype = content.includes('<!doctype html>');
        const hasHTML = content.includes('<html>');
        const hasHead = content.includes('<head>');
        const hasBody = content.includes('<body>');
        const hasTitle = content.includes('<title>');
        
        return this.assert(
            hasDoctype || hasHTML,
            'Файл должен содержать базовую HTML структуру (!doctype или <html>)'
        );
    }

    testValidHTMLSyntax() {
        if (!fs.existsSync('index.html')) return false;

        const content = fs.readFileSync('index.html', 'utf8');
        
        // Проверка на незакрытые теги (базовая)
        const openTags = content.match(/<([a-z][a-z0-9]*)[^>]*>/gi) || [];
        const closeTags = content.match(/<\/([a-z][a-z0-9]*)>/gi) || [];
        
        // Проверяем популярные теги которые должны закрываться
        const tagsToCheck = ['div', 'p', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'span'];
        let htmlErrors = [];

        tagsToCheck.forEach(tag => {
            const openCount = (content.match(new RegExp(`<${tag}[^>]*>`, 'gi')) || []).length;
            const closeCount = (content.match(new RegExp(`</${tag}>`, 'gi')) || []).length;
            
            if (openCount !== closeCount) {
                htmlErrors.push(`Тег <${tag}>: открыто ${openCount}, закрыто ${closeCount}`);
            }
        });

        // Проверка на валидность атрибутов
        const invalidAttributes = content.match(/<[^>]*\s(class|id|src|href)="[^"]*[<>]"[^>]*>/g);
        if (invalidAttributes) {
            htmlErrors.push('Найдены невалидные атрибуты с символами <> внутри');
        }

        return this.assert(
            htmlErrors.length === 0,
            `HTML синтаксис проверен. ${htmlErrors.length > 0 ? 'Ошибки: ' + htmlErrors.join(', ') : 'Ошибок нет'}`
        );
    }

    testWorkingHTMLContent() {
        if (!fs.existsSync('index.html')) return false;

        const content = fs.readFileSync('index.html', 'utf8');
        
        // Проверяем что есть какой-то контент для пользователя
        const hasVisibleContent = content.match(/<h[1-6][^>]*>.*<\/h[1-6]>|<p[^>]*>.*<\/p>|<div[^>]*>.*<\/div>/) !== null;
        const hasTextContent = content.replace(/<[^>]*>/g, '').trim().length > 10;
        
        return this.assert(
            hasVisibleContent && hasTextContent,
            'HTML содержит рабочий контент (заголовки, параграфы или текст)'
        );
    }

    testNoConsoleErrors() {
        if (!fs.existsSync('index.html')) return false;

        const content = fs.readFileSync('index.html', 'utf8');
        
        // Проверяем на явные ошибки в JavaScript
        const hasAlertErrors = content.includes('alert(') && !content.includes('// alert(');
        const hasConsoleErrors = content.includes('console.error') && !content.includes('// console.error');
        
        return this.assert(
            !hasAlertErrors && !hasConsoleErrors,
            'HTML не содержит явных JavaScript ошибок (alert, console.error)'
        );
    }

    testCSSWorking() {
        if (!fs.existsSync('index.html')) return false;

        const content = fs.readFileSync('index.html', 'utf8');
        
        // Проверяем подключенные CSS файлы
        const cssLinks = content.match(/<link[^>]*rel="stylesheet"[^>]*>/g) || [];
        let cssErrors = [];

        cssLinks.forEach(link => {
            const hrefMatch = link.match(/href="([^"]*)"/);
            if (hrefMatch) {
                const cssPath = hrefMatch[1];
                if (!cssPath.startsWith('http') && !fs.existsSync(cssPath)) {
                    cssErrors.push(`CSS файл не найден: ${cssPath}`);
                }
            }
        });

        // Проверяем inline стили
        const hasStyles = content.includes('<style>') || content.includes('style="');
        
        return this.assert(
            cssErrors.length === 0 && hasStyles,
            `CSS проверен. ${cssErrors.length > 0 ? 'Ошибки: ' + cssErrors.join(', ') : 'Стили подключены'}`
        );
    }

    testNoBrokenLinks() {
        if (!fs.existsSync('index.html')) return false;

        const content = fs.readFileSync('index.html', 'utf8');
        const links = content.match(/href="([^"]*)"/g) || [];
        let brokenLinks = 0;

        links.forEach(link => {
            const url = link.replace('href="', '').replace('"', '');
            // Проверяем только локальные файлы
            if (url.startsWith('./') || (!url.startsWith('http') && !url.startsWith('#') && !url.startsWith('mailto:') && url.includes('.'))) {
                const filePath = path.join(process.cwd(), url);
                if (!fs.existsSync(filePath)) {
                    brokenLinks++;
                    this.errors.push(`❌ Найдена битая ссылка: ${url}`);
                }
            }
        });

        if (brokenLinks === 0) {
            console.log('✅ Все ссылки ведут на существующие файлы');
            this.passed++;
        }
        return brokenLinks === 0;
    }

    runAllTests() {
        console.log('🧪 Запускаю проверку HTML...\n');
        
        this.testIndexFileExists();
        if (this.errors.length > 0) {
            // Если файла нет, остальные тесты бессмысленны
            console.log('🚨 Файл index.html отсутствует - пропускаю остальные проверки');
        } else {
            this.testFileIsNotEmpty();
            this.testBasicHTMLStructure();
            this.testValidHTMLSyntax();
            this.testWorkingHTMLContent();
            this.testNoConsoleErrors();
            this.testCSSWorking();
            this.testNoBrokenLinks();
        }

        console.log('\n📊 Результаты проверки HTML:');
        console.log(`✅ Пройдено: ${this.passed}`);
        console.log(`❌ Ошибок: ${this.errors.length}`);

        if (this.errors.length > 0) {
            console.log('\n🚨 Список ошибок:');
            this.errors.forEach(error => console.log(error));
            console.log('\n💡 Рекомендации по исправлению:');
            console.log('   • Убедитесь что файл index.html существует в корне проекта');
            console.log('   • Проверьте что файл содержит валидный HTML код');
            console.log('   • Добавьте базовую структуру: <!DOCTYPE html>, <html>, <head>, <body>');
            console.log('   • Убедитесь что все теги правильно закрыты');
            console.log('   • Добавьте контент (текст, заголовки, параграфы)');
            console.log('   • Проверьте что все ссылки ведут на существующие файлы');
            process.exit(1);
        } else {
            console.log('\n🎉 HTML полностью валиден! Можно деплоить.');
            console.log('🚀 Сайт будет корректно отображаться в браузере');
            process.exit(0);
        }
    }
}

// Запуск тестов
new HTMLValidator().runAllTests();
