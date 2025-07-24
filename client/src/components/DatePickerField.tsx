import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronUp, ChevronDown } from 'lucide-react';

interface DatePickerFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({ 
  value, 
  onChange, 
  placeholder = "мм.гггг",
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [currentDisplayYear, setCurrentDisplayYear] = useState(new Date().getFullYear());
  const [inputValue, setInputValue] = useState(value || '');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  // Валидация и форматирование ввода
  const formatInput = (input: string, isDeleting: boolean = false) => {
    // Убираем все кроме цифр и точек
    let formatted = input.replace(/[^\d.]/g, '');
    
    // Ограничиваем длину
    if (formatted.length > 7) formatted = formatted.slice(0, 7);
    
    // Автоформатирование только при вводе (не при удалении)
    if (!isDeleting && formatted.length >= 2 && !formatted.includes('.')) {
      // Если ввели третий символ и это цифра, добавляем точку после второго символа
      if (formatted.length > 2) {
        formatted = formatted.slice(0, 2) + '.' + formatted.slice(2);
      }
    }
    
    // Проверяем формат для валидации
    const parts = formatted.split('.');
    if (parts.length === 2) {
      // Валидация месяца только если введены 2 цифры
      if (parts[0].length === 2) {
        const month = parseInt(parts[0]);
        if (month < 1 || month > 12) {
          return inputValue; // Возвращаем предыдущее значение
        }
      }
      
      // Валидация года только если введены 4 цифры
      if (parts[1].length === 4) {
        const year = parseInt(parts[1]);
        if (year < 1900 || year > 2100) {
          return inputValue; // Возвращаем предыдущее значение
        }
      }
    }
    
    return formatted;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const isDeleting = newValue.length < inputValue.length;
    const formatted = formatInput(newValue, isDeleting);
    setInputValue(formatted);
    onChange(formatted);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    
    if (allowedKeys.includes(e.key)) {
      return; // Разрешаем навигационные клавиши
    }
    
    // Разрешаем только цифры и точку
    if (!/^[\d.]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
  };

  const handleMonthSelect = (monthIndex: number) => {
    if (selectedYear) {
      const formatted = `${String(monthIndex + 1).padStart(2, '0')}.${selectedYear}`;
      setInputValue(formatted);
      onChange(formatted);
      setIsOpen(false);
      setSelectedYear(null);
    }
  };

  const generateYearGrid = () => {
    const years = [];
    const startYear = currentDisplayYear - 11;
    
    for (let i = 0; i < 12; i++) {
      years.push(startYear + i);
    }
    
    return years;
  };

  const scrollYearsUp = () => {
    setCurrentDisplayYear(prev => prev - 12);
  };

  const scrollYearsDown = () => {
    setCurrentDisplayYear(prev => prev + 12);
  };

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedYear(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Синхронизация с внешним значением
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  return (
    <div className="date-picker-field" ref={dropdownRef}>
      <div className="date-input-container">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="date-input"
          maxLength={7}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="date-picker-button"
        >
          <Calendar size={16} />
        </button>
      </div>

      {isOpen && (
        <div className="date-picker-dropdown">
          {!selectedYear ? (
            // Сетка годов
            <div className="year-picker">
              <div className="year-header">
                <button 
                  type="button" 
                  onClick={scrollYearsUp}
                  className="year-scroll-btn"
                >
                  <ChevronUp size={16} />
                </button>
                <span className="year-range">
                  {currentDisplayYear - 11} - {currentDisplayYear}
                </span>
                <button 
                  type="button" 
                  onClick={scrollYearsDown}
                  className="year-scroll-btn"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
              
              <div className="year-grid">
                {generateYearGrid().map(year => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => handleYearSelect(year)}
                    className="year-button"
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Выбор месяца
            <div className="month-picker">
              <div className="month-header">
                <button 
                  type="button" 
                  onClick={() => setSelectedYear(null)}
                  className="back-button"
                >
                  ← {selectedYear}
                </button>
              </div>
              
              <div className="month-grid">
                {months.map((month, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleMonthSelect(index)}
                    className="month-button"
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DatePickerField; 