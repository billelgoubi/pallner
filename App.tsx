import React, { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { AppData, UserProfile, DayPlan } from './types';
import { saveAppData, getAppData, clearAppData } from './services/storage';
import { generateHolidayPlan, generateInspirationalImages } from './services/gemini';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load data from local storage on mount
    const storedData = getAppData();
    if (storedData) {
      setData(storedData);
    }
    setLoading(false);
  }, []);

  const handleOnboardingComplete = async (profile: UserProfile) => {
    setGenerating(true);
    setError(null);
    try {
      // Execute plan generation and image generation in parallel
      const [plan, images] = await Promise.all([
        generateHolidayPlan(profile),
        generateInspirationalImages()
      ]);
      
      const newData: AppData = {
        profile,
        plan,
        startDate: new Date().toISOString(),
        generatedImages: images
      };
      
      setData(newData);
      saveAppData(newData);
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء إنشاء الخطة، تأكد من الاتصال بالإنترنت.");
    } finally {
      setGenerating(false);
    }
  };

  const handleTaskUpdate = (dayIndex: number, taskId: string, completed: boolean) => {
    if (!data) return;

    const newPlan = [...data.plan];
    const taskIndex = newPlan[dayIndex].tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex > -1) {
      newPlan[dayIndex].tasks[taskIndex].isCompleted = completed;
      
      const newData = { ...data, plan: newPlan };
      setData(newData);
      saveAppData(newData);
    }
  };

  const handleReset = () => {
    clearAppData();
    setData(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <>
        {error && (
            <div className="fixed top-4 right-4 left-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl z-50 text-center">
                {error}
                <button onClick={() => setError(null)} className="mr-4 font-bold">إغلاق</button>
            </div>
        )}
        <Onboarding onComplete={handleOnboardingComplete} isLoading={generating} />
      </>
    );
  }

  return (
    <Dashboard 
      data={data} 
      onUpdateTask={handleTaskUpdate}
      onReset={handleReset}
    />
  );
};

export default App;