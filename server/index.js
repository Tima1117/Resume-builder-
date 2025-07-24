const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const htmlPdf = require('html-pdf-node');
const htmlPdfLib = require('html-pdf');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true, // Разрешить все origins для ngrok
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// Функция для генерации HTML резюме
const generateResumeHTML = (data) => {
  const { personalInfo, workExperience, education, additionalEducation, skills, languages, qualities, aboutMe } = data;
  
  const renderSkillBars = (level) => {
    const levels = ['Базовый', 'Опытный', 'Продвинутый'];
    const currentLevel = levels.indexOf(level);
    return levels.map((_, index) => 
      `<div class="skill-bar ${index <= currentLevel ? 'filled' : ''}"></div>`
    ).join('');
  };

  return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Резюме - ${personalInfo.lastName} ${personalInfo.firstName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            background: white;
        }
        
        .resume-page {
            width: 210mm;
            min-height: 297mm;
            margin: 0;
            padding: 0;
            background: white;
        }
        
        .resume-header {
            background: #f8f9fa;
            color: #2c3e50;
            padding: 30px 40px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 5px solid #dee2e6;
        }
        
        .header-content {
            flex: 1;
        }
        
        .full-name {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
            letter-spacing: 2px;
        }
        
        .header-info {
            display: flex;
            flex-direction: column;
            gap: 5px;
            font-size: 14px;
        }
        
        .location, .age {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .photo-container {
            margin-left: 30px;
        }
        
        .profile-photo {
            width: 120px;
            height: 120px;
            border-radius: 10px;
            object-fit: cover;
            border: 4px solid white;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        
        .resume-body {
            display: flex;
            min-height: calc(297mm - 200px);
        }
        
        .left-column {
            flex: 2;
            padding: 30px 40px;
            background: white;
        }
        
        .right-column {
            flex: 1;
            padding: 30px 30px;
            background: #f8f9fa;
            border-left: 1px solid #e9ecef;
        }
        
        .resume-section {
            margin-bottom: 30px;
        }
        
        .resume-section h2,
        .contact-section h2,
        .right-section h2 {
            font-size: 16px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #3498db;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .work-item, .work-experience-item {
            margin-bottom: 25px;
            padding-left: 15px;
            border-left: 3px solid #3498db;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        
        .work-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 5px;
        }
        
        .work-header h3 {
            font-size: 14px;
            font-weight: bold;
            color: #2c3e50;
            margin: 0;
        }
        
        .period {
            font-size: 11px;
            color: #7f8c8d;
            font-style: italic;
        }
        
        .position {
            font-size: 13px;
            color: #34495e;
            font-style: italic;
            margin-bottom: 8px;
        }
        
        .responsibilities {
            margin-top: 8px;
        }
        
        .responsibility-item {
            margin-bottom: 3px;
            padding-left: 15px;
            position: relative;
            font-size: 11px;
            line-height: 1.4;
        }
        
        .responsibility-item:before {
            content: "•";
            position: absolute;
            left: 0;
            color: #3498db;
            font-weight: bold;
        }
        
        .responsibility-title {
            font-weight: bold;
            margin-bottom: 4px;
        }
        
        .education-item, .course-item, .additional-education-item {
            margin-bottom: 20px;
            padding-left: 15px;
            border-left: 3px solid #e74c3c;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        
        .education-header, .course-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 5px;
        }
        
        .education-header h3, .course-header h3 {
            font-size: 13px;
            font-weight: bold;
            color: #2c3e50;
            margin: 0;
            line-height: 1.3;
        }
        
        .year {
            font-size: 11px;
            color: #7f8c8d;
            font-style: italic;
        }
        
        .degree-info, .course-name {
            font-size: 11px;
            color: #34495e;
            line-height: 1.3;
        }
        
        .about-text {
            font-size: 11px;
            line-height: 1.5;
            color: #2c3e50;
            text-align: justify;
        }
        
        .contact-section {
            margin-bottom: 25px;
        }
        
        .contact-list {
            margin-bottom: 15px;
        }
        
        .contact-item {
            margin-bottom: 8px;
            font-size: 11px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .additional-info {
            border-top: 1px solid #e9ecef;
            padding-top: 15px;
        }
        
        .info-row {
            margin-bottom: 8px;
            font-size: 10px;
        }
        
        .info-row .label {
            font-weight: bold;
            color: #2c3e50;
            display: block;
            margin-bottom: 2px;
        }
        
        .right-section {
            margin-bottom: 25px;
        }
        
        .languages-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .language-item {
            padding: 8px;
            background: white;
            border-radius: 6px;
            border-left: 3px solid #f39c12;
        }
        
        .language-name {
            font-size: 12px;
            font-weight: bold;
            color: #2c3e50;
        }
        
        .language-level {
            font-size: 10px;
            color: #7f8c8d;
        }
        
        .skills-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .skill-item {
            background: white;
            padding: 10px;
            border-radius: 6px;
            border-left: 3px solid #9b59b6;
        }
        
        .skill-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
        }
        
        .skill-name {
            font-size: 11px;
            font-weight: bold;
            color: #2c3e50;
        }
        
        .skill-level-text {
            font-size: 9px;
            color: #7f8c8d;
        }
        
        .skill-level {
            display: flex;
            gap: 3px;
        }
        
        .skill-bar {
            width: 15px;
            height: 4px;
            background: #ecf0f1;
            border-radius: 2px;
        }
        
        .skill-bar.filled {
            background: #9b59b6;
        }
        
        .qualities-list {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        
        .quality-item {
            font-size: 11px;
            color: #2c3e50;
            padding: 4px 0;
        }
        
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            /* УЛЬТРА строгие правила разрыва страниц */
            .resume-section {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                display: table !important;
                width: 100% !important;
                table-layout: fixed !important;
                position: relative !important;
                margin-bottom: 25px;
            }
            
            .work-item,
            .work-experience-item,
            .education-item,
            .course-item,
            .additional-education-item {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                display: block !important;
                position: relative !important;
            }
            
            .right-section,
            .contact-section {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                display: table !important;
                width: 100% !important;
                table-layout: fixed !important;
                position: relative !important;
            }
            
            h1, h2, h3 {
                page-break-after: avoid !important;
                page-break-inside: avoid !important;
                break-after: avoid !important;
                break-inside: avoid !important;
                orphans: 99 !important;
                widows: 99 !important;
            }
            
            * {
                orphans: 99 !important;
                widows: 99 !important;
            }
            
            /* Принудительный контроль разрывов */
            .resume-section,
            .right-section {
                overflow: visible !important;
                height: auto !important;
            }
        }
    </style>
</head>
<body>
    <div class="resume-page">
        <div class="resume-header">
            <div class="header-content">
                <h1 class="full-name">${personalInfo.lastName.toUpperCase()} ${personalInfo.firstName.toUpperCase()}</h1>
                <div class="header-info">
                    <div class="location">📍 ${personalInfo.location}</div>
                    ${personalInfo.age ? `<div class="age">📅 Возраст: ${personalInfo.age}</div>` : ''}
                </div>
            </div>
            ${personalInfo.photo ? `
                <div class="photo-container">
                    <img src="${personalInfo.photo}" alt="Profile" class="profile-photo" />
                </div>
            ` : ''}
        </div>

        <div class="resume-body">
            <div class="left-column">
                ${workExperience.length > 0 ? `
                    <section class="resume-section">
                        <h2>Опыт работы</h2>
                        ${workExperience.map(work => `
                            <div class="work-item work-experience-item">
                                <div class="work-header">
                                    <h3>${work.company}</h3>
                                    <span class="period">
                                        ${work.startDate ? (() => {
                                          try {
                                            return new Date(work.startDate + '-01').toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
                                          } catch (e) {
                                            return work.startDate;
                                          }
                                        })() : ''}
                                        ${work.startDate ? ' — ' : ''}
                                        ${work.isCurrentJob ? 'по настоящее время' : 
                                          work.endDate ? (() => {
                                            try {
                                              return new Date(work.endDate + '-01').toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
                                            } catch (e) {
                                              return work.endDate;
                                            }
                                          })() : ''}
                                    </span>
                                </div>
                                <div class="position">${work.position}:</div>
                                ${work.responsibilities && work.responsibilities.length > 0 ? `
                                    <div class="responsibilities">
                                        ${work.responsibilities.map(responsibility => {
                                            // Поддержка новой структуры (объекты с title и subpoints)
                                            if (typeof responsibility === 'object' && responsibility.title) {
                                                let html = responsibility.title ? `<div class="responsibility-title" style="font-weight: bold; margin-bottom: 4px;">${responsibility.title}</div>` : '';
                                                if (responsibility.subpoints && responsibility.subpoints.length > 0) {
                                                    html += responsibility.subpoints.map(subpoint => 
                                                        subpoint.trim() ? `<div class="responsibility-item">• ${subpoint.trim()}</div>` : ''
                                                    ).join('');
                                                }
                                                return html;
                                            }
                                            // Поддержка старой структуры (строки)
                                            else if (typeof responsibility === 'string') {
                                                return responsibility.split('\n').map(resp => 
                                                    resp.trim() ? `<div class="responsibility-item">${resp.trim()}</div>` : ''
                                                ).join('');
                                            }
                                            return '';
                                        }).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </section>
                ` : ''}

                ${education.length > 0 ? `
                    <section class="resume-section">
                        <h2>Образование</h2>
                        ${education.map(edu => `
                            <div class="education-item">
                                <div class="education-header">
                                    <h3>${edu.institution}</h3>
                                    <span class="year">${edu.year}</span>
                                </div>
                                <div class="degree-info">${edu.field}, ${edu.degree}</div>
                            </div>
                        `).join('')}
                    </section>
                ` : ''}

                ${additionalEducation.length > 0 ? `
                    <section class="resume-section">
                        <h2>Курсы</h2>
                        ${additionalEducation.map(course => `
                            <div class="course-item additional-education-item">
                                <div class="course-header">
                                    <h3>${course.institution}</h3>
                                    <span class="year">${course.year}</span>
                                </div>
                                <div class="course-name">${course.course}</div>
                            </div>
                        `).join('')}
                    </section>
                ` : ''}

                ${aboutMe ? `
                    <section class="resume-section">
                        <h2>О себе</h2>
                        <div class="about-text">${aboutMe}</div>
                    </section>
                ` : ''}
            </div>

            <div class="right-column">
                <section class="contact-section">
                    <h2>Контакты</h2>
                    <div class="contact-list">
                        ${personalInfo.phone ? `<div class="contact-item">📞 ${personalInfo.phone}</div>` : ''}
                        ${personalInfo.email ? `<div class="contact-item">📧 ${personalInfo.email}</div>` : ''}
                        ${personalInfo.telegram ? `<div class="contact-item">📱 ${personalInfo.telegram}</div>` : ''}
                    </div>

                    ${personalInfo.drivingLicense || personalInfo.maritalStatus || personalInfo.hobbies ? `
                        <div class="additional-info">
                            ${personalInfo.drivingLicense ? `
                                <div class="info-row">
                                    <span class="label">Водительские права:</span>
                                    <span>${personalInfo.drivingLicense}</span>
                                </div>
                            ` : ''}
                            ${personalInfo.maritalStatus ? `
                                <div class="info-row">
                                    <span class="label">Семейное положение:</span>
                                    <span>${personalInfo.maritalStatus}</span>
                                </div>
                            ` : ''}
                            ${personalInfo.hobbies ? `
                                <div class="info-row">
                                    <span class="label">Занятость:</span>
                                    <span>${personalInfo.hobbies}</span>
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}
                </section>

                ${languages.length > 0 ? `
                    <section class="right-section">
                        <h2>Языки</h2>
                        <div class="languages-list">
                            ${languages.map(language => `
                                <div class="language-item">
                                    <div class="language-name">${language.name}</div>
                                    <div class="language-level">${language.level}</div>
                                </div>
                            `).join('')}
                        </div>
                    </section>
                ` : ''}

                ${skills.length > 0 ? `
                    <section class="right-section">
                        <h2>Навыки / Технологии</h2>
                        <div class="skills-list">
                            ${skills.map(skill => `
                                <div class="skill-item">
                                    <div class="skill-header">
                                        <span class="skill-name">${skill.name}</span>
                                        <span class="skill-level-text">${skill.level}</span>
                                    </div>
                                    <div class="skill-level">
                                        ${renderSkillBars(skill.level)}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </section>
                ` : ''}

                ${qualities.length > 0 ? `
                    <section class="right-section">
                        <h2>Качества</h2>
                        <div class="qualities-list">
                            ${qualities.map(quality => `
                                <div class="quality-item">• ${quality.name}</div>
                            `).join('')}
                        </div>
                    </section>
                ` : ''}
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

// API endpoint для генерации PDF
app.post('/api/generate-pdf', async (req, res) => {
  // Функция транслитерации кириллицы
  function transliterate(text) {
    const cyrillicToLatin = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
      'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
      'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
      'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
      'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
      'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
      'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
      'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
      'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
      'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
    };
    
    return text.split('').map(char => cyrillicToLatin[char] || char).join('');
  }

  try {
    console.log('Получен запрос на генерацию PDF');
    const resumeData = req.body;
    
    // Проверяем структуру данных
    if (!resumeData || !resumeData.personalInfo) {
      console.error('Некорректные данные резюме');
      return res.status(400).json({ error: 'Некорректные данные резюме' });
    }
    
    console.log('Данные резюме получены:', {
      personalInfo: resumeData.personalInfo.firstName,
      workExperience: resumeData.workExperience?.length || 0,
      education: resumeData.education?.length || 0
    });
    
    // Генерируем HTML
    const html = generateResumeHTML(resumeData);
    console.log('HTML сгенерирован успешно, размер:', html.length, 'символов');
    
    // Проверяем HTML на наличие ошибок
    if (html.includes('undefined') || html.includes('[object Object]')) {
      console.error('HTML содержит ошибки!');
      return res.status(500).json({ error: 'Ошибка в данных резюме' });
    }
    
        let pdf;
    
    try {
      // Пытаемся использовать Playwright
      console.log('Запускаем Playwright...');
      
      const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;
      
      const launchOptions = {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-web-security'
        ]
      };
      
      if (isVercel) {
        console.log('Vercel окружение обнаружено');
        launchOptions.args.push(
          '--single-process',
          '--no-zygote',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        );
      } else {
        console.log('Локальное окружение');
      }
      
      const browser = await chromium.launch(launchOptions);
      console.log('Playwright браузер запущен успешно');
      const page = await browser.newPage();
      
      // Устанавливаем HTML контент
      console.log('Устанавливаем HTML контент...');
      await page.setContent(html, { waitUntil: 'networkidle0' });
      console.log('HTML контент установлен');
      
      // Генерируем PDF
      console.log('Начинаем генерацию PDF...');
      pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0mm',
          right: '0mm',
          bottom: '0mm',
          left: '0mm'
        }
      });
      
      console.log('PDF сгенерирован успешно с Playwright, размер:', pdf.length, 'байт');
      await browser.close();
      
         } catch (playwrightError) {
       console.error('Playwright не работает:', playwrightError.message);
       console.log('Переключаемся на html-pdf-node...');
       
       try {
         // Fallback 1: используем html-pdf-node
         const options = {
           format: 'A4',
           printBackground: true,
           margin: {
             top: '0mm',
             right: '0mm',
             bottom: '0mm',
             left: '0mm'
           },
           args: [
             '--no-sandbox',
             '--disable-setuid-sandbox',
             '--disable-dev-shm-usage',
             '--disable-gpu'
           ]
         };
         
         const file = { content: html };
         pdf = await htmlPdf.generatePdf(file, options);
         console.log('PDF сгенерирован успешно с html-pdf-node, размер:', pdf.length, 'байт');
         
       } catch (htmlPdfError) {
         console.error('html-pdf-node тоже не работает:', htmlPdfError.message);
                   console.log('Переключаемся на html-pdf...');
          
          // Fallback 2: используем html-pdf (более старая, но часто работает)
          const options = {
            format: 'A4',
            border: {
              top: '0mm',
              right: '0mm',
              bottom: '0mm',
              left: '0mm'
            },
            type: 'pdf',
            quality: '75',
            phantomArgs: [
              '--load-images=yes',
              '--ignore-ssl-errors=yes',
              '--ssl-protocol=any',
              '--web-security=false'
            ]
          };
          
          pdf = await new Promise((resolve, reject) => {
            htmlPdfLib.create(html, options).toBuffer((err, buffer) => {
              if (err) {
                reject(err);
              } else {
                resolve(buffer);
              }
            });
          });
          
          console.log('PDF сгенерирован успешно с html-pdf, размер:', pdf.length, 'байт');
       }
     }
    console.log('Браузер закрыт');
    
    // Проверяем, что это действительно PDF
    const pdfHeaderBytes = pdf.slice(0, 8);
    const pdfHeader = String.fromCharCode(...pdfHeaderBytes);
    console.log('PDF заголовок:', pdfHeader);
    console.log('Это PDF?', pdfHeader.startsWith('%PDF'));
    
    if (!pdfHeader.startsWith('%PDF')) {
      console.error('Сгенерированный файл не является PDF!');
      const first50Bytes = pdf.slice(0, 50);
      const first50String = String.fromCharCode(...first50Bytes);
      console.log('Первые 50 байт как строка:', first50String);
      return res.status(500).json({ error: 'Ошибка генерации PDF' });
    }
    
    // Отправляем PDF как response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdf.length.toString());
    res.setHeader('Cache-Control', 'no-cache');
    const firstName = transliterate(resumeData.personalInfo.firstName || 'User');
    const lastName = transliterate(resumeData.personalInfo.lastName || 'Resume');
    const safeFileName = `${lastName}_${firstName}_Resume.pdf`
      .replace(/[^\w\-_\.]/g, '_'); // Убираем оставшиеся небезопасные символы
    console.log('Отправляем файл:', safeFileName, 'размер:', pdf.length, 'байт');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"`);
    res.end(pdf); // Используем res.end() вместо res.send()
    console.log('PDF отправлен клиенту');
    
  } catch (error) {
    console.error('Ошибка при генерации PDF:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Ошибка генерации PDF. Попробуйте позже.',
      details: error.message
    });
  }
});

// Обработка всех остальных запросов (для React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log('Для генерации PDF требуется Google Chrome или Chromium');
}); 