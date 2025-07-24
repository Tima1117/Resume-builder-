import React, { useState } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ResumeData } from '../types/Resume';
import { PhoneSVG, LocationSVG, EmailSVG, TelegramSVG, AgeSVG } from './CustomIcons';

interface ResumePreviewProps {
  data: ResumeData;
  onBack: () => void;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ data, onBack }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true);
      toast.loading('Генерируем PDF...', { id: 'pdf-generation' });
      
      const response = await axios.post('/api/generate-pdf', data, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${data.personalInfo.lastName}_${data.personalInfo.firstName}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF успешно скачан!', { id: 'pdf-generation' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Ошибка при генерации PDF', { id: 'pdf-generation' });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderSkillLevel = (level: string) => {
    const levels = ['Базовый', 'Опытный', 'Продвинутый'];
    const currentLevel = levels.indexOf(level);
    
    return (
      <div className="skill-level">
        {levels.map((_, index) => (
          <div
            key={index}
            className={`skill-bar ${index <= currentLevel ? 'filled' : ''}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="resume-preview">
      <div className="preview-header">
        <button onClick={onBack} className="back-button">
          <ArrowLeft size={20} />
          Назад к редактированию
        </button>
        <div className="preview-actions">
          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="download-button"
          >
            <Download size={20} />
            {isGenerating ? 'Генерация...' : 'Скачать PDF'}
          </button>
        </div>
      </div>

      <div className="resume-container">
        <div className="resume-page">
          {/* Header with name and photo */}
          <div className="resume-header">
            <div className="header-content">
              <h1 className="full-name">
                {data.personalInfo.lastName.toUpperCase()} {data.personalInfo.firstName.toUpperCase()}
              </h1>
              <div className="header-info">
                <div className="location">
                  <LocationSVG size={16} /> {data.personalInfo.location}
                </div>
                {data.personalInfo.age && (
                  <div className="age">
                    <AgeSVG size={16} /> Возраст: {data.personalInfo.age}
                  </div>
                )}
              </div>
            </div>
            {data.personalInfo.photo && (
              <div className="photo-container">
                <img src={data.personalInfo.photo} alt="Profile" className="profile-photo" />
              </div>
            )}
          </div>

          <div className="resume-body">
            <div className="left-column">
              {/* Work Experience */}
              {data.workExperience.length > 0 && (
                <section className="resume-section">
                  <h2>Опыт работы</h2>
                  {data.workExperience.map((work, index) => (
                    <div key={index} className="work-item work-experience-item">
                      <div className="work-header">
                        <h3>{work.company}</h3>
                        <span className="period">
                          {work.startDate && new Date(work.startDate + '-01').toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                          {work.startDate && ' — '}
                          {work.isCurrentJob ? 'по настоящее время' : 
                           work.endDate ? new Date(work.endDate + '-01').toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }) : ''}
                        </span>
                      </div>
                      <div className="position">{work.position}:</div>
                      {work.responsibilities.length > 0 && (
                        <div className="responsibilities">
                          {work.responsibilities.map((responsibility, idx) => (
                            <div key={idx} className="responsibility-group">
                              {responsibility.title && (
                                <div className="responsibility-title">{responsibility.title}</div>
                              )}
                              {responsibility.subpoints.length > 0 && (
                                <div className="responsibility-subpoints">
                                  {responsibility.subpoints.map((subpoint, subIdx) => (
                                    subpoint.trim() && (
                                      <div key={subIdx} className="responsibility-subpoint">
                                        • {subpoint.trim()}
                                      </div>
                                    )
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </section>
              )}

              {/* Education */}
              {data.education.length > 0 && (
                <section className="resume-section">
                  <h2>Образование</h2>
                  {data.education.map((edu, index) => (
                    <div key={index} className="education-item">
                      <div className="education-header">
                        <h3>{edu.institution}</h3>
                        <span className="year">{edu.year}</span>
                      </div>
                      <div className="degree-info">
                        {edu.field}, {edu.degree}
                      </div>
                    </div>
                  ))}
                </section>
              )}

              {/* Additional Education */}
              {data.additionalEducation.length > 0 && (
                <section className="resume-section">
                  <h2>Курсы</h2>
                  {data.additionalEducation.map((course, index) => (
                    <div key={index} className="course-item additional-education-item">
                      <div className="course-header">
                        <h3>{course.institution}</h3>
                        <span className="year">{course.year}</span>
                      </div>
                      <div className="course-name">{course.course}</div>
                    </div>
                  ))}
                </section>
              )}

              {/* About Me */}
              {data.aboutMe && (
                <section className="resume-section summary-section">
                  <h2>О себе</h2>
                  <div className="about-text">
                    {data.aboutMe}
                  </div>
                </section>
              )}
            </div>

            <div className="right-column">
              {/* Contacts */}
              <section className="contact-section">
                <h2>Контакты</h2>
                <div className="contact-list">
                  {data.personalInfo.phone && (
                    <div className="contact-item">
                      <PhoneSVG size={16} /> {data.personalInfo.phone}
                    </div>
                  )}
                  {data.personalInfo.email && (
                    <div className="contact-item">
                      <EmailSVG size={16} /> {data.personalInfo.email}
                    </div>
                  )}
                  {data.personalInfo.telegram && (
                    <div className="contact-item">
                      <TelegramSVG size={16} /> {data.personalInfo.telegram}
                    </div>
                  )}
                </div>

                {(data.personalInfo.drivingLicense || data.personalInfo.maritalStatus || data.personalInfo.hobbies) && (
                  <div className="additional-info">
                    {data.personalInfo.drivingLicense && (
                      <div className="info-row">
                        <span className="label">Водительские права:</span>
                        <span>{data.personalInfo.drivingLicense}</span>
                      </div>
                    )}
                    {data.personalInfo.maritalStatus && (
                      <div className="info-row">
                        <span className="label">Семейное положение:</span>
                        <span>{data.personalInfo.maritalStatus}</span>
                      </div>
                    )}
                    {data.personalInfo.hobbies && (
                      <div className="info-row">
                        <span className="label">Занятость:</span>
                        <span>{data.personalInfo.hobbies}</span>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Languages */}
              {data.languages.length > 0 && (
                <section className="right-section">
                  <h2>Языки</h2>
                  <div className="languages-list">
                    {data.languages.map((language, index) => (
                      <div key={index} className="language-item">
                        <div className="language-name">{language.name}</div>
                        <div className="language-level">{language.level}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Skills */}
              {data.skills.length > 0 && (
                <section className="right-section skills-section">
                  <h2>Навыки / Технологии</h2>
                  <div className="skills-list">
                    {data.skills.map((skill, index) => (
                      <div key={index} className="skill-item">
                        <div className="skill-header">
                          <span className="skill-name">{skill.name}</span>
                          <span className="skill-level-text">{skill.level}</span>
                        </div>
                        {renderSkillLevel(skill.level)}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Qualities */}
              {data.qualities.length > 0 && (
                <section className="right-section">
                  <h2>Качества</h2>
                  <div className="qualities-list">
                    {data.qualities.map((quality, index) => (
                      <div key={index} className="quality-item">
                        • {quality.name}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePreview; 