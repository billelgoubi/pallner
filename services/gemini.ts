import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserProfile, DayPlan, Task } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const taskSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Short title of the task" },
    description: { type: Type.STRING, description: "Detailed instruction suitable for the age" }
  },
  required: ["title", "description"]
};

const daySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    dayNumber: { type: Type.INTEGER },
    morningTask: taskSchema,
    afternoonTask: taskSchema,
    eveningTask: taskSchema,
    funTask: taskSchema,
  },
  required: ["dayNumber", "morningTask", "afternoonTask", "eveningTask", "funTask"]
};

const planSchema: Schema = {
  type: Type.ARRAY,
  items: daySchema
};

export const generateHolidayPlan = async (profile: UserProfile): Promise<DayPlan[]> => {
  
  const prompt = `
    Create a 15-day holiday plan for a student with the following profile:
    Name: ${profile.name}
    Age: ${profile.age}
    Education Level: ${profile.level}
    Target Languages to learn: ${profile.languages.join(", ")}.

    The output MUST be in ARABIC language.

    For each day, provide 4 distinct activities:
    1. Morning Task: Quran memorization (adjust amount based on age/level. e.g., small Surahs for young kids, pages for older).
    2. Afternoon Task: Language learning activity (interactive, games, vocab) based on target languages.
    3. Evening Task: Quran reading (Wird) + Islamic/Moral Story reading.
    4. Fun Task: A creative, physical, or family activity (drawing, puzzle, challenge, discussion).

    Ensure the tone is encouraging and suitable for a ${profile.age} year old.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: planSchema,
        systemInstruction: "You are an expert Islamic educator and child development specialist. You create engaging, balanced plans for Muslim children.",
      },
    });

    const rawData = JSON.parse(response.text || "[]");
    
    // Transform raw AI response into our internal state structure
    const structuredPlan: DayPlan[] = rawData.map((day: any) => ({
      dayNumber: day.dayNumber,
      tasks: [
        {
          id: `d${day.dayNumber}-m`,
          title: day.morningTask.title,
          description: day.morningTask.description,
          isCompleted: false,
          type: 'quran_morning'
        },
        {
          id: `d${day.dayNumber}-a`,
          title: day.afternoonTask.title,
          description: day.afternoonTask.description,
          isCompleted: false,
          type: 'language'
        },
        {
          id: `d${day.dayNumber}-e`,
          title: day.eveningTask.title,
          description: day.eveningTask.description,
          isCompleted: false,
          type: 'quran_evening'
        },
        {
          id: `d${day.dayNumber}-f`,
          title: day.funTask.title,
          description: day.funTask.description,
          isCompleted: false,
          type: 'fun'
        }
      ]
    }));

    return structuredPlan;

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("فشل في إنشاء الخطة، يرجى المحاولة مرة أخرى.");
  }
};

const generateSingleImage = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image generation failed:", error);
    return null;
  }
};

export const generateInspirationalImages = async (): Promise<string[]> => {
  // Generate 2 images in parallel
  const prompts = [
    "A bright and cheerful illustration of a clean study desk for a child with colorful books, pencils, a small plant, and sunlight streaming through a window with Islamic geometric patterns. No humans, no faces. 3D cartoon style, high quality, vibrant colors.",
    "A cozy evening scene with a glowing lantern, an open book, and a cup of tea on a wooden table. Background of a dark blue starry sky through a window. Islamic art style. No humans, no faces. Magical atmosphere."
  ];

  const results = await Promise.all(prompts.map(p => generateSingleImage(p)));
  return results.filter((img): img is string => img !== null);
};