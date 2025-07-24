export interface PersonalInfo {
  firstName: string;
  lastName: string;
  location: string;
  age?: string;
  phone?: string;
  email?: string;
  telegram?: string;
  drivingLicense?: string;
  maritalStatus?: string;
  hobbies?: string;
  photo?: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  isCurrentJob: boolean;
  responsibilities: {
    title: string;
    subpoints: string[];
  }[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  year: string;
}

export interface AdditionalEducation {
  id: string;
  institution: string;
  course: string;
  year: string;
}

export interface Skill {
  id: string;
  name: string;
  level: 'Базовый' | 'Опытный' | 'Продвинутый';
}

export interface Language {
  id: string;
  name: string;
  level: string;
}

export interface Quality {
  id: string;
  name: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  workExperience: WorkExperience[];
  education: Education[];
  additionalEducation: AdditionalEducation[];
  skills: Skill[];
  languages: Language[];
  qualities: Quality[];
  aboutMe?: string;
} 