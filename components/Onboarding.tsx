import React, { useState } from 'react';
import { UserProfile, EducationLevel } from '../types';
import { BookOpen, Star, Loader2, Youtube, Instagram, Facebook, Share2 } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  isLoading: boolean;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, isLoading }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(10);
  const [level, setLevel] = useState<EducationLevel>(EducationLevel.PRIMARY);
  const [languages, setLanguages] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && age) {
      onComplete({
        name,
        age,
        level,
        languages: languages.split(',').map(l => l.trim()).filter(Boolean)
      });
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-8">
      <div className="bg-white max-w-lg w-full rounded-3xl shadow-xl overflow-hidden border-4 border-orange-100">
        <div className