import React, { useState, useEffect } from 'react';
import { AppData, Task, DayPlan } from '../types';
import { Sun, Moon, Book, Palette, CheckCircle2, Circle, Settings, Youtube, Instagram, Facebook, UserPlus, Share2 } from 'lucide-react';

interface DashboardProps {
  data: AppData;
  onUpdateTask: (dayIndex: number, taskId: string, completed: boolean) => void;
  onReset: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, onUpdateTask, onReset }) => {
  const [activeDay, setActiveDay] = useState<number>(0);
  const [showParentModal, setShowParentModal] = useState(false);

  // Calculate stats
  const totalTasks = data.plan.reduce((acc, day) => acc + day.tasks.length, 0);
  const completedTasks = data.plan.reduce((acc, day) => acc + day.tasks.filter(t => t.isCompleted).length, 0);
  const progress = Math.round((completedTasks / totalTasks) * 100);

  const currentDayPlan = data.plan[activeDay];
  
  const morningImage = data.generatedImages && data.generatedImages[0];
  const eveningImage = data.generatedImages && data.generatedImages[1];

  const getTaskIcon = (type: Task['type']) => {
    switch(type) {
      case 'quran_morning': return <Sun className="w-6 h-6 text-yellow-500" />;
      case 'language': return <Book className="w-6 h-6 text-blue-500" />;
      case 'quran_evening': return <Moon className="w-6 h-6 text-indigo-500" />;
      case 'fun': return <Palette className="w-6 h-6 text-purple-500" />;
    }
  };

  const getTaskColor = (type: Task['type']) => {
    switch(type) {
      case 'quran_morning': return 'bg-yellow-50 border-yellow-200';
      case 'language': return 'bg-blue-50 border-blue-200';
      case 'quran_evening': return 'bg-indigo-50 border-indigo-200';
      case 'fun': return 'bg-purple-50 border-purple-200';
    }
  };

  const handleAppShare = async () => {
    const url = window.location.href;
    const title = "مُبدع العطلة";
    const text = "جرب هذا التطبيق الرائع لتنظيم وقت أطفالك في العطلة!";

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        console.log('Share failed', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        alert("تم نسخ رابط التطبيق! يمكنك لصقه وإرساله لأصدقائك.");
      } catch (err) {
        alert("الرابط: " + url);
      }
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 pb-20">
      {/* Hero Header with Image */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        {morningImage && (
            <div className="w-full h-32 md:h-48 overflow-hidden relative">
                <img src={morningImage} alt="Holiday Vibes" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
            </div>
        )}
        
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center relative z-20 -mt-8">
          <div>
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-orange-100">
                <h1 className="text-xl font-bold text-gray-800">مرحباً {data.profile?.name} 👋</h1>
                <div className="text-sm text-gray-500">اليوم {activeDay + 1} من 15</div>
            </div>
          </div>
          <button onClick={() => setShowParentModal(true)} className="p-2 bg-white rounded-full hover:bg-gray-100 shadow-sm border border-gray-100">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-100">
          <div 
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        
        {/* Motivation Card with Background Image if available */}
        <div 
            className="rounded-3xl p-6 text-white shadow-lg flex justify-between items-center relative overflow-hidden"
            style={eveningImage ? { 
                backgroundImage: `url(${eveningImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            } : {
                background: 'linear-gradient(to right, #2dd4bf, #34d399)'
            }}
        >
          {eveningImage && <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>}
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-1 text-shadow">تقدم مذهل! 🌟</h2>
            <p className="opacity-90 font-medium">لقد أنجزت {completedTasks} مهمة. استمر يا بطل!</p>
          </div>
          <div className="relative z-10 text-4xl font-black bg-white/20 w-20 h-20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30">
            {progress}%
          </div>
        </div>

        {/* Day Selector */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {data.plan.map((day, idx) => {
            const isDone = day.tasks.every(t => t.isCompleted);
            const isCurrent = idx === activeDay;
            return (
              <button
                key={day.dayNumber}
                onClick={() => setActiveDay(idx)}
                className={`flex-shrink-0 w-14 h-20 rounded-2xl flex flex-col items-center justify-center transition-all ${
                  isCurrent 
                    ? 'bg-orange-500 text-white shadow-lg scale-105' 
                    : isDone 
                      ? 'bg-green-100 text-green-700 border-2 border-green-200'
                      : 'bg-white text-gray-400 border-2 border-transparent'
                }`}
              >
                <span className="text-xs font-medium">يوم</span>
                <span className="text-xl font-bold">{day.dayNumber}</span>
                {isDone && <CheckCircle2 className="w-4 h-4 mt-1" />}
              </button>
            )
          })}
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                جدول اليوم
                <span className="text-sm font-normal text-gray-500 bg-white px-2 py-1 rounded-lg border">
                   {activeDay + 1} / 15
                </span>
            </h3>

            {currentDayPlan.tasks.map((task) => (
              <div 
                key={task.id}
                className={`group relative overflow-hidden rounded-2xl border-l-8 p-5 transition-all duration-300 ${
                    task.isCompleted ? 'bg-white opacity-75 border-gray-300' : `${getTaskColor(task.type)} shadow-sm hover:shadow-md bg-white`
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 p-2 rounded-xl bg-white shadow-sm`}>
                    {getTaskIcon(task.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold text-lg mb-1 ${task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                      {task.title}
                    </h4>
                    <p className={`text-sm ${task.isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                      {task.description}
                    </p>
                  </div>
                  <button 
                    onClick={() => onUpdateTask(activeDay, task.id, !task.isCompleted)}
                    className="mt-1 transition-transform active:scale-90"
                  >
                    {task.isCompleted ? (
                      <CheckCircle2 className="w-8 h-8 text-green-500 fill-green-100" />
                    ) : (
                      <Circle className="w-8 h-8 text-gray-300 hover:text-orange-400" />
                    )}
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* Actions - New Button */}
        <div className="pt-4">
            <button 
                onClick={() => {
                    if(window.confirm('هل أنت متأكد من تسجيل مشارك آخر؟ سيتم حذف الجدول الحالي.')) {
                        onReset();
                    }
                }}
                className="w-full bg-white border-2 border-orange-200 text-orange-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-50 hover:border-orange-300 transition-colors shadow-sm"
            >
                <UserPlus className="w-5 h-5" /> مشارك آخر
            </button>
        </div>

        {/* Social Links Footer */}
        <div className="border-t border-gray-200 mt-12 pt-8 text-center pb-8">
            <h3 className="text-gray-500 font-bold mb-4">شارك وانشر الخير</h3>
            <div className="flex justify-center flex-wrap gap-4 px-4">
                <button 
                  onClick={handleAppShare}
                  className="bg-green-500 text-white px-6 py-3 rounded-2xl shadow-sm hover:bg-green-600 hover:shadow-md hover:-translate-y-1 transition-all flex items-center gap-2 font-bold"
                >
                  <Share2 className="w-5 h-5" /> شارك التطبيق
                </button>
            </div>
            
            <div className="mt-8 flex justify-center gap-6">
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-2xl shadow-sm text-red-500 hover:text-red-600 hover:shadow-md hover:-translate-y-1 transition-all">
                    <Youtube className="w-6 h-6" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-2xl shadow-sm text-pink-500 hover:text-pink-600 hover:shadow-md hover:-translate-y-1 transition-all">
                    <Instagram className="w-6 h-6" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-2xl shadow-sm text-blue-600 hover:text-blue-700 hover:shadow-md hover:-translate-y-1 transition-all">
                    <Facebook className="w-6 h-6" />
                </a>
            </div>
            <p className="text-gray-400 text-xs mt-4">© 2025 مُبدع العطلة</p>
        </div>

      </main>

      {/* Parent Modal */}
      {showParentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md">
                <h3 className="text-xl font-bold mb-4 text-gray-800">إعدادات الوالدين 🛡️</h3>
                <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-600 mb-2">اسم الطفل: <span className="font-bold">{data.profile?.name}</span></p>
                        <p className="text-sm text-gray-600">المرحلة: <span className="font-bold">{data.profile?.level}</span></p>
                    </div>
                    
                    <button 
                        onClick={() => {
                            if(window.confirm('هل أنت متأكد من حذف جميع البيانات والبدء من جديد؟')) {
                                onReset();
                            }
                        }}
                        className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition"
                    >
                        حذف البيانات والبدء من جديد
                    </button>
                    
                    <button 
                        onClick={() => setShowParentModal(false)}
                        className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300"
                    >
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};