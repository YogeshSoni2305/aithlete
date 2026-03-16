export interface UserData {
    name: string;
    age: number;
    gender: "Male" | "Female" | "Other";
    height: number; // in cm
    weight: number; // in kg
    goal: "Weight Loss" | "Muscle Gain" | "Maintenance" | "Endurance";
    level: "Beginner" | "Intermediate" | "Advanced";
    location: "Home" | "Gym" | "Outdoor";
    dietaryPreferences: "Veg" | "Non-Veg" | "Veg + Non-Veg" | "Vegan" | "Keto" | "None";
    medicalHistory?: string;
}

export interface Exercise {
    name: string;
    sets: string;
    reps: string;
    rest: string;
    notes?: string;
    videoUrl?: string;
}

export interface DailyWorkout {
    day: string;
    focus: string;
    exercises: Exercise[];
}

export interface Meal {
    name: string;
    description: string;
    calories: string;
    protein: string;
    carbs: string;
    fats: string;
    recipeUrl?: string;
}

export interface DailyDiet {
    day: string;
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snacks: Meal[];
}

export interface GeneratedPlan {
    workoutPlan: DailyWorkout[];
    dietPlan: DailyDiet[];
    tips: string[];
    motivation: string;
}

export interface WorkoutLog {
    id: string;
    date: string;
    exercise: string;
    sets: number;
    reps: number;
    weight: number;
}

export interface MealLog {
    id: string;
    date: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

export interface WeightLog {
    date: string;
    weight: number;
}
