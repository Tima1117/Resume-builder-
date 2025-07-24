import React from 'react';
import { useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

interface WorkResponsibilitiesFieldProps {
  nestIndex: number;
  control: any;
  register: any;
}

const WorkResponsibilitiesField: React.FC<WorkResponsibilitiesFieldProps> = ({ 
  nestIndex, 
  control, 
  register 
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `workExperience.${nestIndex}.responsibilities`
  });

  const addResponsibility = () => {
    append({ title: '', subpoints: [''] });
  };

  const removeResponsibility = (index: number) => {
    remove(index);
  };

  return (
    <div className="responsibilities-container">
      {fields.map((responsibility, responsibilityIndex) => (
        <ResponsibilityItem
          key={responsibility.id}
          nestIndex={nestIndex}
          responsibilityIndex={responsibilityIndex}
          control={control}
          register={register}
          onRemove={() => removeResponsibility(responsibilityIndex)}
        />
      ))}
      
      <button 
        type="button" 
        onClick={addResponsibility}
        className="add-responsibility-btn"
      >
        <Plus size={16} />
        Добавить обязанность
      </button>
    </div>
  );
};

interface ResponsibilityItemProps {
  nestIndex: number;
  responsibilityIndex: number;
  control: any;
  register: any;
  onRemove: () => void;
}

const ResponsibilityItem: React.FC<ResponsibilityItemProps> = ({
  nestIndex,
  responsibilityIndex,
  control,
  register,
  onRemove
}) => {
  const { fields: subFields, append: appendSub, remove: removeSub } = useFieldArray({
    control,
    name: `workExperience.${nestIndex}.responsibilities.${responsibilityIndex}.subpoints`
  });

  const addSubpoint = () => {
    appendSub('');
  };

  const removeSubpoint = (subIndex: number) => {
    removeSub(subIndex);
  };

  return (
    <div className="responsibility-item">
      <div className="responsibility-header">
        <input
          {...register(`workExperience.${nestIndex}.responsibilities.${responsibilityIndex}.title`)}
          placeholder="Основной пункт (например: Проект веб-приложения)"
          className="responsibility-title"
        />
        <button 
          type="button" 
          onClick={onRemove}
          className="remove-button"
          title="Удалить обязанность"
        >
          <Trash2 size={16} />
        </button>
      </div>
      
      <div className="subpoints-container">
        {subFields.map((subpoint, subIndex) => (
          <div key={subpoint.id} className="subpoint-item">
            <span className="subpoint-bullet">•</span>
            <input
              {...register(`workExperience.${nestIndex}.responsibilities.${responsibilityIndex}.subpoints.${subIndex}`)}
              placeholder="Конкретная задача или достижение"
              className="subpoint-input"
            />
            <button 
              type="button" 
              onClick={() => removeSubpoint(subIndex)}
              className="remove-subpoint-btn"
              title="Удалить подпункт"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        
        <button 
          type="button" 
          onClick={addSubpoint}
          className="add-subpoint-btn"
        >
          <Plus size={14} />
          Добавить подпункт
        </button>
      </div>
    </div>
  );
};

export default WorkResponsibilitiesField; 