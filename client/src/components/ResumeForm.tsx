import React, { useState, useRef, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Upload, ChevronUp, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { ResumeData } from '../types/Resume';
import WorkResponsibilitiesField from './WorkResponsibilitiesField';
import DatePickerField from './DatePickerField';

interface ResumeFormProps {
  onSubmit: (data: ResumeData) => void;
  initialData?: ResumeData | null;
}

const ResumeForm: React.FC<ResumeFormProps> = ({ onSubmit, initialData }) => {
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Загрузка данных из localStorage при инициализации (исправлено)
  const getInitialData = () => {
    if (initialData) return initialData;
    
    try {
      const savedData = localStorage.getItem('resumeFormData');
      if (savedData && savedData.trim()) {
        const parsedData = JSON.parse(savedData);
        
        // Проверяем валидность данных
        if (parsedData && typeof parsedData === 'object') {
          return parsedData;
        }
      }
    } catch (error) {
      console.warn('Ошибка при загрузке сохраненных данных:', error);
      // Очищаем поврежденные данные
      try {
        localStorage.removeItem('resumeFormData');
      } catch (e) {
        console.warn('Не удалось очистить поврежденные данные:', e);
      }
    }
    
    return {
      personalInfo: {
        firstName: '',
        lastName: '',
        location: '',
        age: '',
        phone: '',
        email: '',
        telegram: '',
        drivingLicense: '',
        maritalStatus: '',
        hobbies: '',
        photo: ''
      },
      workExperience: [],
      education: [],
      additionalEducation: [],
      skills: [],
      languages: [],
      qualities: [],
      aboutMe: ''
    };
  };
  
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    watch
  } = useForm<ResumeData>({
    defaultValues: getInitialData()
  });

  // Устанавливаем фото превью после инициализации формы
  useEffect(() => {
    const initialData = getInitialData();
    if (initialData?.personalInfo?.photo) {
      setPhotoPreview(initialData.personalInfo.photo);
    }
  }, []); // Запускаем только один раз при монтировании

  // Автосохранение в localStorage (исправлено)
  const watchedValues = watch();
  
  useEffect(() => {
    // Добавляем проверку на валидность данных и предотвращаем бесконечные циклы
    if (!watchedValues) return;
    
    // Проверяем, что это не первоначальная загрузка
    const isInitialRender = Object.keys(watchedValues).length === 0 || 
      (watchedValues.personalInfo?.firstName === '' && watchedValues.workExperience?.length === 0);
    
    if (isInitialRender) return;
    
    const timeoutId = setTimeout(() => {
      try {
        // Проверяем, что данные не пустые
        const dataToSave = JSON.stringify(watchedValues);
        if (dataToSave && dataToSave.length < 5000000) { // Лимит 5MB
          const currentSaved = localStorage.getItem('resumeFormData');
          // Сохраняем только если данные изменились
          if (currentSaved !== dataToSave) {
            localStorage.setItem('resumeFormData', dataToSave);
          }
        }
      } catch (error) {
        console.warn('Ошибка при сохранении данных:', error);
        // Если ошибка - очищаем поврежденные данные
        try {
          localStorage.removeItem('resumeFormData');
        } catch (e) {
          console.warn('Не удалось очистить поврежденные данные:', e);
        }
      }
    }, 2000); // Увеличиваем задержку до 2 секунд

    return () => clearTimeout(timeoutId);
  }, [JSON.stringify(watchedValues)]); // Используем JSON.stringify для правильного сравнения

  const {
    fields: workFields,
    append: appendWork,
    remove: removeWork,
    move: moveWork
  } = useFieldArray({
    control,
    name: 'workExperience'
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
    move: moveEducation
  } = useFieldArray({
    control,
    name: 'education'
  });

  const {
    fields: additionalEducationFields,
    append: appendAdditionalEducation,
    remove: removeAdditionalEducation,
    move: moveAdditionalEducation
  } = useFieldArray({
    control,
    name: 'additionalEducation'
  });

  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
    move: moveSkill
  } = useFieldArray({
    control,
    name: 'skills'
  });

  const {
    fields: languageFields,
    append: appendLanguage,
    remove: removeLanguage,
    move: moveLanguage
  } = useFieldArray({
    control,
    name: 'languages'
  });

  const {
    fields: qualityFields,
    append: appendQuality,
    remove: removeQuality,
    move: moveQuality
  } = useFieldArray({
    control,
    name: 'qualities'
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Проверяем тип файла
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Поддерживаемые форматы: JPG, PNG, GIF, WebP, BMP');
        return;
      }

      // Проверяем размер файла (максимум 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('Размер файла не должен превышать 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhotoPreview(base64);
        setValue('personalInfo.photo', base64);
        toast.success('Фото успешно загружено!');
      };
      reader.onerror = () => {
        toast.error('Ошибка при загрузке фото');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoPreview('');
    setValue('personalInfo.photo', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Фото удалено');
  };

  const formatPhoneNumber = (value: string) => {
    // Убираем все не-цифры кроме +
    const phoneNumber = value.replace(/[^\d+]/g, '');
    
    // Если начинается с +7, форматируем как российский номер
    if (phoneNumber.startsWith('+7') || phoneNumber.startsWith('7')) {
      const digits = phoneNumber.replace(/^\+?7/, '');
      if (digits.length === 0) return '+7';
      if (digits.length <= 3) return `+7 (${digits}`;
      if (digits.length <= 6) return `+7 (${digits.slice(0, 3)}) ${digits.slice(3)}`;
      if (digits.length <= 8) return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
      return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`;
    }
    
    // Для других номеров простое форматирование
    if (phoneNumber.length <= 3) return phoneNumber;
    if (phoneNumber.length <= 6) return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
    if (phoneNumber.length <= 8) return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
    return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 8)}-${phoneNumber.slice(8, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setValue('personalInfo.phone', formatted);
  };

  // Функция для ограничения ввода только цифрами
  const handleNumericInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    
    if (allowedKeys.includes(e.key)) {
      return; // Разрешаем навигационные клавиши
    }
    
    if (!/^\d$/.test(e.key)) {
      e.preventDefault(); // Блокируем всё кроме цифр
    }
  };

  // Функция для преобразования mm.yyyy в YYYY-MM
  const convertDateFormat = (dateStr: string): string => {
    if (!dateStr || !dateStr.includes('.')) return dateStr;
    
    const [month, year] = dateStr.split('.');
    if (month && year && month.length === 2 && year.length === 4) {
      return `${year}-${month}`;
    }
    
    return dateStr;
  };

  // Функция для обратного преобразования YYYY-MM в mm.yyyy
  const convertDateFormatBack = (dateStr: string): string => {
    if (!dateStr || !dateStr.includes('-')) return dateStr;
    
    const [year, month] = dateStr.split('-');
    if (month && year && month.length === 2 && year.length === 4) {
      return `${month}.${year}`;
    }
    
    return dateStr;
  };

  const onFormSubmit = (data: ResumeData) => {
    // Преобразуем формат дат из mm.yyyy в YYYY-MM для совместимости
    const processedData = {
      ...data,
      workExperience: data.workExperience.map(work => ({
        ...work,
        startDate: work.startDate ? convertDateFormat(work.startDate) : '',
        endDate: work.endDate ? convertDateFormat(work.endDate) : ''
      }))
    };

    // Фильтруем пустые поля и разделы
    const filteredData = {
      ...processedData,
      workExperience: processedData.workExperience.filter(work => 
        work.company.trim() || work.position.trim()
      ),
      education: data.education.filter(edu => 
        edu.institution.trim() || edu.degree.trim()
      ),
      additionalEducation: data.additionalEducation.filter(edu => 
        edu.institution.trim() || edu.course.trim()
      ),
      skills: data.skills.filter(skill => 
        skill.name.trim()
      ),
      languages: data.languages.filter(lang => 
        lang.name.trim()
      ),
      qualities: data.qualities.filter(quality => 
        quality.name.trim()
      )
    };

    onSubmit(filteredData);
    
    // Очищаем сохраненные данные после успешной отправки
    try {
      localStorage.removeItem('resumeFormData');
    } catch (error) {
      console.warn('Ошибка при очистке сохраненных данных:', error);
    }
    
    toast.success('Резюме создано! Переходим к предпросмотру...');
  };

  // Функция очистки формы
  const handleClearForm = () => {
    if (window.confirm('Вы уверены, что хотите очистить все данные формы?')) {
      try {
        localStorage.removeItem('resumeFormData');
        window.location.reload(); // Перезагружаем страницу для сброса формы
      } catch (error) {
        console.warn('Ошибка при очистке данных:', error);
      }
    }
  };

  return (
    <div className="resume-form">
      <div className="container">
        <div className="form-header">
          <h1>Создание резюме</h1>
          <button 
            type="button" 
            className="clear-form-btn"
            onClick={handleClearForm}
            title="Очистить всю форму"
          >
            <Trash2 size={18} />
            Очистить форму
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onFormSubmit)}>
          {/* Личные данные */}
          <section className="form-section">
            <h2>Личные данные</h2>
            
            <div className="photo-upload">
              <div className="photo-preview" onClick={handlePhotoClick}>
                {photoPreview ? (
                  <div className="photo-container">
                    <img src={photoPreview} alt="Preview" />
                    <button 
                      type="button" 
                      className="remove-photo-btn"
                      onClick={handleRemovePhoto}
                      title="Удалить фото"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="photo-placeholder">
                    <Upload size={24} />
                    <span>Добавить фото</span>
                    <small>JPG, PNG, GIF, WebP, BMP (до 5MB)</small>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp"
                onChange={handlePhotoUpload}
                className="photo-input"
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Имя *</label>
                <input
                  {...register('personalInfo.firstName', { required: 'Имя обязательно' })}
                  type="text"
                />
                {errors.personalInfo?.firstName && (
                  <span className="error">{errors.personalInfo.firstName.message}</span>
                )}
              </div>

              <div className="form-group">
                <label>Фамилия *</label>
                <input
                  {...register('personalInfo.lastName', { required: 'Фамилия обязательна' })}
                  type="text"
                />
                {errors.personalInfo?.lastName && (
                  <span className="error">{errors.personalInfo.lastName.message}</span>
                )}
              </div>

              <div className="form-group">
                <label>Местоположение</label>
                <input
                  {...register('personalInfo.location')}
                  type="text"
                  placeholder="Город, район"
                />
              </div>

              <div className="form-group">
                <label>Возраст</label>
                <input
                  {...register('personalInfo.age')}
                  type="text"
                  placeholder="25 лет"
                  onKeyPress={handleNumericInput}
                />
              </div>

              <div className="form-group">
                <label>Телефон</label>
                <input
                  {...register('personalInfo.phone', { onChange: handlePhoneChange })}
                  type="tel"
                  placeholder="+7 XXX XXX-XX-XX"
                />
                {errors.personalInfo?.phone && (
                  <span className="error">{errors.personalInfo.phone.message}</span>
                )}
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  {...register('personalInfo.email')}
                  type="email"
                  placeholder="email@example.com"
                />
              </div>

              <div className="form-group">
                <label>Telegram</label>
                <input
                  {...register('personalInfo.telegram')}
                  type="text"
                  placeholder="@username"
                />
              </div>

              <div className="form-group">
                <label>Водительские права</label>
                <select {...register('personalInfo.drivingLicense')}>
                  <option value="">Выберите вариант</option>
                  <option value="Да">Да</option>
                  <option value="Нет">Нет</option>
                  <option value="Категория A">Категория A</option>
                  <option value="Категория B">Категория B</option>
                  <option value="Категория C">Категория C</option>
                  <option value="Категория D">Категория D</option>
                  <option value="Категории A, B">Категории A, B</option>
                  <option value="Категории B, C">Категории B, C</option>
                </select>
              </div>

              <div className="form-group">
                <label>Семейное положение</label>
                <select {...register('personalInfo.maritalStatus')}>
                  <option value="">Выберите вариант</option>
                  <option value="Холост">Холост</option>
                  <option value="Незамужем">Незамужем</option>
                  <option value="Женат">Женат</option>
                  <option value="Замужем">Замужем</option>
                  <option value="В разводе">В разводе</option>
                  <option value="Вдовец">Вдовец</option>
                  <option value="Вдова">Вдова</option>
                  <option value="Гражданский брак">Гражданский брак</option>
                </select>
              </div>

              <div className="form-group">
                <label>Занятость</label>
                <select {...register('personalInfo.hobbies')}>
                  <option value="">Выберите тип занятости</option>
                  <option value="Полная занятость">Полная занятость</option>
                  <option value="Частичная занятость">Частичная занятость</option>
                  <option value="Временная работа">Временная работа</option>
                  <option value="Сезонная работа">Сезонная работа</option>
                  <option value="Удаленная работа">Удаленная работа</option>
                  <option value="Гибкий график">Гибкий график</option>
                  <option value="Стажировка">Стажировка</option>
                  <option value="Проектная работа">Проектная работа</option>
                  <option value="Фриланс">Фриланс</option>
                  <option value="Полная, удаленная">Полная занятость, удаленная работа</option>
                  <option value="Частичная, гибкий график">Частичная занятость, гибкий график</option>
                </select>
              </div>
            </div>
          </section>

          {/* Опыт работы */}
          <section className="form-section">
            <div className="section-header">
              <h2>Опыт работы</h2>
              <button
                type="button"
                onClick={() => appendWork({
                  id: Date.now().toString(),
                  company: '',
                  position: '',
                  startDate: '',
                  endDate: '',
                  isCurrentJob: false,
                  responsibilities: [{ title: '', subpoints: [''] }]
                })}
                className="add-button"
              >
                <Plus size={16} />
                Добавить опыт
              </button>
            </div>

            <div className="dynamic-section-list">
              {workFields.map((field, index) => (
                <div
                  key={field.id}
                  className={`dynamic-section ${index === 0 ? 'first-item' : ''} ${index === workFields.length - 1 ? 'last-item' : ''}`}
                >
                  <div className="section-controls">
                    <button
                      type="button"
                      onClick={() => moveWork(index, index - 1)}
                      className="move-up-button"
                      disabled={index === 0}
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveWork(index, index + 1)}
                      className="move-down-button"
                      disabled={index === workFields.length - 1}
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeWork(index)}
                      className="remove-button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Компания</label>
                      <input
                        {...register(`workExperience.${index}.company`)}
                        type="text"
                        placeholder="Название компании"
                      />
                    </div>

                    <div className="form-group">
                      <label>Должность</label>
                      <input
                        {...register(`workExperience.${index}.position`)}
                        type="text"
                        placeholder="Название должности"
                      />
                    </div>

                    <div className="form-group">
                      <label>Период начала</label>
                      <DatePickerField
                        value={convertDateFormatBack(watch(`workExperience.${index}.startDate`) || '')}
                        onChange={(value) => setValue(`workExperience.${index}.startDate`, value)}
                        placeholder="мм.гггг"
                      />
                    </div>

                    <div className="form-group">
                      <label>Период окончания</label>
                      <DatePickerField
                        value={convertDateFormatBack(watch(`workExperience.${index}.endDate`) || '')}
                        onChange={(value) => setValue(`workExperience.${index}.endDate`, value)}
                        placeholder="мм.гггг"
                        disabled={watch(`workExperience.${index}.isCurrentJob`)}
                      />
                    </div>

                    <div className="form-group">
                      <div className="checkbox-wrapper">
                        <input
                          {...register(`workExperience.${index}.isCurrentJob`)}
                          type="checkbox"
                          id={`currentJob-${index}`}
                        />
                        <label htmlFor={`currentJob-${index}`} className="checkbox-label">
                          По настоящее время
                        </label>
                      </div>
                    </div>

                    <div className="form-group full-width">
                      <label>Обязанности</label>
                      <WorkResponsibilitiesField
                        nestIndex={index}
                        control={control}
                        register={register}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Образование */}
          <section className="form-section">
            <div className="section-header">
              <h2>Образование</h2>
              <button
                type="button"
                onClick={() => appendEducation({
                  id: Date.now().toString(),
                  institution: '',
                  degree: '',
                  field: '',
                  year: ''
                })}
                className="add-button"
              >
                <Plus size={16} />
                Добавить образование
              </button>
            </div>

            <div className="dynamic-section-list">
              {educationFields.map((field, index) => (
                <div
                  key={field.id}
                  className={`dynamic-section ${index === 0 ? 'first-item' : ''} ${index === educationFields.length - 1 ? 'last-item' : ''}`}
                >
                  <div className="section-controls">
                    <button
                      type="button"
                      onClick={() => moveEducation(index, index - 1)}
                      className="move-up-button"
                      disabled={index === 0}
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveEducation(index, index + 1)}
                      className="move-down-button"
                      disabled={index === educationFields.length - 1}
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="remove-button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Учебное заведение</label>
                      <input
                        {...register(`education.${index}.institution`)}
                        type="text"
                        placeholder="Название учебного заведения"
                      />
                    </div>

                    <div className="form-group">
                      <label>Степень</label>
                      <select {...register(`education.${index}.degree`)}>
                        <option value="">Выберите степень</option>
                        <option value="Среднее профессиональное образование">Среднее профессиональное образование</option>
                        <option value="Бакалавриат">Бакалавриат</option>
                        <option value="Магистратура">Магистратура</option>
                        <option value="Аспирантура">Аспирантура</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Направление</label>
                      <input
                        {...register(`education.${index}.field`)}
                        type="text"
                        placeholder="Направление подготовки"
                      />
                    </div>

                    <div className="form-group">
                      <label>Год</label>
                      <input
                        {...register(`education.${index}.year`)}
                        type="text"
                        placeholder="2024"
                        onKeyPress={handleNumericInput}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Дополнительное образование */}
          <section className="form-section">
            <div className="section-header">
              <h2>Курсы</h2>
              <button
                type="button"
                onClick={() => appendAdditionalEducation({
                  id: Date.now().toString(),
                  institution: '',
                  course: '',
                  year: ''
                })}
                className="add-button"
              >
                <Plus size={16} />
                Добавить курс
              </button>
            </div>

            <div className="dynamic-section-list">
              {additionalEducationFields.map((field, index) => (
                <div
                  key={field.id}
                  className={`dynamic-section ${index === 0 ? 'first-item' : ''} ${index === additionalEducationFields.length - 1 ? 'last-item' : ''}`}
                >
                  <div className="section-controls">
                    <button
                      type="button"
                      onClick={() => moveAdditionalEducation(index, index - 1)}
                      className="move-up-button"
                      disabled={index === 0}
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveAdditionalEducation(index, index + 1)}
                      className="move-down-button"
                      disabled={index === additionalEducationFields.length - 1}
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAdditionalEducation(index)}
                      className="remove-button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Организация</label>
                      <input
                        {...register(`additionalEducation.${index}.institution`)}
                        type="text"
                        placeholder="Название организации"
                      />
                    </div>

                    <div className="form-group">
                      <label>Курс</label>
                      <input
                        {...register(`additionalEducation.${index}.course`)}
                        type="text"
                        placeholder="Название курса"
                      />
                    </div>

                    <div className="form-group">
                      <label>Год</label>
                      <input
                        {...register(`additionalEducation.${index}.year`)}
                        type="text"
                        placeholder="2022"
                        onKeyPress={handleNumericInput}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Навыки */}
          <section className="form-section">
            <div className="section-header">
              <h2>Навыки / Технологии</h2>
              <button
                type="button"
                onClick={() => appendSkill({
                  id: Date.now().toString(),
                  name: '',
                  level: 'Базовый'
                })}
                className="add-button"
              >
                <Plus size={16} />
                Добавить навык / технологию
              </button>
            </div>

            <div className="dynamic-section-list">
              {skillFields.map((field, index) => (
                <div
                  key={field.id}
                  className={`dynamic-section ${index === 0 ? 'first-item' : ''} ${index === skillFields.length - 1 ? 'last-item' : ''}`}
                >
                  <div className="section-controls">
                    <button
                      type="button"
                      onClick={() => moveSkill(index, index - 1)}
                      className="move-up-button"
                      disabled={index === 0}
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSkill(index, index + 1)}
                      className="move-down-button"
                      disabled={index === skillFields.length - 1}
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="remove-button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Навык</label>
                      <input
                        {...register(`skills.${index}.name`)}
                        type="text"
                        placeholder="Название навыка / технологии"
                      />
                    </div>

                    <div className="form-group">
                      <label>Уровень</label>
                      <select {...register(`skills.${index}.level`)}>
                        <option value="Базовый">Базовый</option>
                        <option value="Опытный">Опытный</option>
                        <option value="Продвинутый">Продвинутый</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Языки */}
          <section className="form-section">
            <div className="section-header">
              <h2>Языки</h2>
              <button
                type="button"
                onClick={() => appendLanguage({
                  id: Date.now().toString(),
                  name: '',
                  level: ''
                })}
                className="add-button"
              >
                <Plus size={16} />
                Добавить язык
              </button>
            </div>

            <div className="dynamic-section-list">
              {languageFields.map((field, index) => (
                <div
                  key={field.id}
                  className={`dynamic-section ${index === 0 ? 'first-item' : ''} ${index === languageFields.length - 1 ? 'last-item' : ''}`}
                >
                  <div className="section-controls">
                    <button
                      type="button"
                      onClick={() => moveLanguage(index, index - 1)}
                      className="move-up-button"
                      disabled={index === 0}
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveLanguage(index, index + 1)}
                      className="move-down-button"
                      disabled={index === languageFields.length - 1}
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeLanguage(index)}
                      className="remove-button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Язык</label>
                      <input
                        {...register(`languages.${index}.name`)}
                        type="text"
                        placeholder="Название языка"
                      />
                    </div>

                    <div className="form-group">
                      <label>Уровень</label>
                      <select {...register(`languages.${index}.level`)}>
                        <option value="">Выберите уровень</option>
                        <option value="A1 - Начальный">A1 - Начальный</option>
                        <option value="A2 - Элементарный">A2 - Элементарный</option>
                        <option value="B1 - Средний">B1 - Средний</option>
                        <option value="B2 - Выше среднего">B2 - Выше среднего</option>
                        <option value="C1 - Продвинутый">C1 - Продвинутый</option>
                        <option value="C2 - Профессиональный">C2 - Профессиональный</option>
                        <option value="Родной">Родной язык</option>
                        <option value="Свободно">Свободное владение</option>
                        <option value="Разговорный">Разговорный уровень</option>
                        <option value="Технический">Технический уровень</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Качества */}
          <section className="form-section">
            <div className="section-header">
              <h2>Качества</h2>
              <button
                type="button"
                onClick={() => appendQuality({
                  id: Date.now().toString(),
                  name: ''
                })}
                className="add-button"
              >
                <Plus size={16} />
                Добавить качество
              </button>
            </div>

            <div className="dynamic-section-list">
              {qualityFields.map((field, index) => (
                <div
                  key={field.id}
                  className={`dynamic-section ${index === 0 ? 'first-item' : ''} ${index === qualityFields.length - 1 ? 'last-item' : ''}`}
                >
                  <div className="section-controls">
                    <button
                      type="button"
                      onClick={() => moveQuality(index, index - 1)}
                      className="move-up-button"
                      disabled={index === 0}
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveQuality(index, index + 1)}
                      className="move-down-button"
                      disabled={index === qualityFields.length - 1}
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeQuality(index)}
                      className="remove-button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="form-group">
                    <label>Качество</label>
                    <input
                      {...register(`qualities.${index}.name`)}
                      type="text"
                      placeholder="Название качества"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* О себе */}
          <section className="form-section">
            <h2>О себе</h2>
            <div className="form-group">
              <textarea
                {...register('aboutMe')}
                placeholder="Краткое описание ваших профессиональных качеств, целей и достижений. Расскажите о себе как о специалисте."
                rows={4}
              />
            </div>
          </section>

          <div className="form-actions">
            <button type="submit" className="submit-button">
              Создать резюме
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResumeForm; 