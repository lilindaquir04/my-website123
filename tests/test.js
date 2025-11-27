// tests/test.js
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
            stats.size > 50,
            'Файл index.html не должен быть пустым (минимум 50 байт)'
        );
    }

    testValidHTMLSyntax() {
        if (!fs.existsSync('index.html')) return false;

        const content = fs.readFileSync('index.html', 'utf8');
        
        // Проверяем ВСЕ HTML файлы в проекте
        const htmlFiles = this.getAllHTMLFiles();
        let totalErrors = [];
        
        htmlFiles.forEach(file => {
            const fileContent = fs.readFileSync(file, 'utf8');
            const errors = this.checkHTMLSyntax(fileContent, file);
            totalErrors = totalErrors.concat(errors);
        });

        const hasErrors = totalErrors.length > 0;
        
        if (hasErrors) {
            console.log('🔍 Найдены ошибки в HTML:');
            totalErrors.forEach(error => console.log(`   ${error}`));
        }
        
        return this.assert(
            !hasErrors,
            `HTML синтаксис проверен. Файлов проверено: ${htmlFiles.length}`
        );
    }

    getAllHTMLFiles() {
        const files = [];
        
        function scanDirectory(dir) {
            const items = fs.readdirSync(dir);
            
            items.forEach(item => {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory() && !item.startsWith('.')) {
                    scanDirectory(fullPath);
                } else if (item.endsWith('.html')) {
                    files.push(fullPath);
                }
            });
        }
        
        scanDirectory('.');
        return files;
    }

    checkHTMLSyntax(content, filename) {
        const errors = [];
        
        // Проверяем популярные теги которые должны закрываться
        const tagsToCheck = ['div', 'p', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'span', 'a'];
        
        tagsToCheck.forEach(tag => {
            const openRegex = new RegExp(`<${tag}[^>]*>`, 'gi');
            const closeRegex = new RegExp(`</${tag}>`, 'gi');
            
            const openCount = (content.match(openRegex) || []).length;
            const closeCount = (content.match(closeRegex) || []).length;
            
            if (openCount !== closeCount) {
                errors.push(`Файл ${filename}: тег <${tag}> - открыто ${openCount}, закрыто ${closeCount}`);
            }
        });

        return errors;
    }

    testWorkingHTMLContent() {
        if (!fs.existsSync('index.html')) return false;

        const content = fs.readFileSync('index.html', 'utf8');
        const hasVisibleContent = content.match(/<h[1-6][^>]*>.*<\/h[1-6]>|<p[^>]*>.*<\/p>|<div[^>]*>.*<\/div>/) !== null;
        const hasTextContent = content.replace(/<[^>]*>/g, '').trim().length > 10;
        
        return this.assert(
            hasVisibleContent && hasTextContent,
            'HTML содержит рабочий контент'
        );
    }

    testNoConsoleErrors() {
        if (!fs.existsSync('index.html')) return false;

        const content = fs.readFileSync('index.html', 'utf8');
        const hasAlertErrors = content.includes('alert(') && !content.includes('// alert(');
        const hasConsoleErrors = content.includes('console.error') && !content.includes('// console.error');
        
        return this.assert(
            !hasAlertErrors && !hasConsoleErrors,
            'HTML не содержит явных JavaScript ошибок'
        );
    }

    testCSSWorking() {
        if (!fs.existsSync('index.html')) return false;

        const content = fs.readFileSync('index.html', 'utf8');
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
            console.log('🚨 Файл index.html отсутствует - пропускаю остальные проверки');
        } else {
            this.testFileIsNotEmpty();
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
            process.exit(1);
        } else {
            console.log('\n🎉 HTML полностью валиден! Можно деплоить.');
            process.exit(0);
        }
    }
}

// Запуск тестов
new HTMLValidator().runAllTests();
