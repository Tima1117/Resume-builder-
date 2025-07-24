import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import ResumeForm from './components/ResumeForm';
import ResumePreview from './components/ResumePreview';
import ErrorBoundary from './components/ErrorBoundary';
import { ResumeData } from './types/Resume';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<'form' | 'preview'>('form');
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);

  const handleFormSubmit = (data: ResumeData) => {
    setResumeData(data);
    setCurrentView('preview');
  };

  const handleBackToForm = () => {
    setCurrentView('form');
  };

  return (
    <ErrorBoundary>
      <div className="App">
        <Toaster position="top-right" />
        {currentView === 'form' ? (
          <ResumeForm onSubmit={handleFormSubmit} initialData={resumeData} />
        ) : (
          <ResumePreview data={resumeData!} onBack={handleBackToForm} />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App; 