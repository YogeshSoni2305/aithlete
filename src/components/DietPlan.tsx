"use client";

import { useState, useEffect } from "react";
import { DailyDiet, Meal } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ImageIcon, Volume2, VolumeX, Coffee, Sun, Moon, ExternalLink, BookOpen, Flame } from "lucide-react";

interface DietPlanProps {
    plan: DailyDiet[];
}

export default function DietPlan({ plan }: DietPlanProps) {
    const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
    const [selectedRecipeUrl, setSelectedRecipeUrl] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setSpeechSynthesis(window.speechSynthesis);
        }
    }, []);

    const [contentResults, setContentResults] = useState([]);
    const [contentLoading, setContentLoading] = useState(false);

    const handleMealClick = async (mealName: string, recipeUrl?: string) => {
        setSelectedMeal(mealName);
        setSelectedRecipeUrl(recipeUrl || null);
        setImageUrl(null);
        setContentResults([]);

        // Fetch Content immediately
        handleFetchContent(mealName);
    };

    const handleFetchContent = async (query: string) => {
        setContentLoading(true);
        try {
            const res = await fetch(`/api/content?query=${encodeURIComponent(query)}&type=recipe`);
            const data = await res.json();
            if (data.results) setContentResults(data.results);
        } catch (error) {
            console.error("Failed to fetch content", error);
        } finally {
            setContentLoading(false);
        }
    };

    const handleGenerateImage = async (mealName: string) => {
        setLoading(true);
        try {
            const res = await fetch("/api/image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: `Beautiful food photography of ${mealName}, Indian cuisine, clean, modern plating` }),
            });
            const data = await res.json();
            setImageUrl(data.imageUrl);
        } catch (error) {
            console.error("Failed to generate image", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSpeak = () => {
        if (!speechSynthesis) return;

        if (isSpeaking) {
            speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        let text = "Here is your diet plan. ";
        if (plan && Array.isArray(plan)) {
            plan.forEach((day) => {
                text += `${day.day || ""}. Breakfast: ${day.breakfast?.name || ""}. Lunch: ${day.lunch?.name || ""}. Dinner: ${day.dinner?.name || ""}. `;
            });
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        speechSynthesis.speak(utterance);
        setIsSpeaking(true);
    };

    const MealCard = ({ meal, title, icon: Icon }: { meal: Meal; title: string; icon: any }) => (
        <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => handleMealClick(meal.name, meal.recipeUrl)}
            className="group p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-all duration-300 border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-neutral-200 dark:bg-neutral-700">
                        <Icon className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                        {title}
                    </span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ImageIcon className="w-5 h-5 text-neutral-500" />
                </div>
            </div>

            <h4 className="text-lg font-bold mb-2 text-black dark:text-white">{meal.name}</h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">{meal.description}</p>

            <div className="flex flex-wrap gap-2 text-xs mb-2">
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium">
                    <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                    {meal.calories}
                </span>
                <span className="px-3 py-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium">
                    P: {meal.protein}
                </span>
                <span className="px-3 py-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium">
                    C: {meal.carbs}
                </span>
                <span className="px-3 py-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium">
                    F: {meal.fats}
                </span>
            </div>

            {meal.recipeUrl && (
                <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-500">
                    <BookOpen className="w-3 h-3" />
                    <span>Recipe available</span>
                </div>
            )}
        </motion.div>
    );

    const [expandedDay, setExpandedDay] = useState<number | null>(0);

    const toggleDay = (index: number) => {
        setExpandedDay(expandedDay === index ? null : index);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-500">Diet Plan</h2>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSpeak}
                    className="p-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl transition-shadow"
                    aria-label="Read diet plan"
                >
                    {isSpeaking ? (
                        <VolumeX className="w-5 h-5" />
                    ) : (
                        <Volume2 className="w-5 h-5" />
                    )}
                </motion.button>
            </div>

            {/* Image Modal */}
            <AnimatePresence>
                {selectedMeal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                        onClick={() => setSelectedMeal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-2xl w-full relative shadow-2xl my-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedMeal(null)}
                                className="absolute top-4 right-4 p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <h3 className="text-xl font-bold mb-4 pr-12">{selectedMeal}</h3>

                            {/* Image Section */}
                            <div className="aspect-video bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center overflow-hidden mb-6 relative group">
                                {loading ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                                        <span className="text-sm text-neutral-500">Plating your dish...</span>
                                    </div>
                                ) : imageUrl ? (
                                    <img src={imageUrl} alt={selectedMeal} className="w-full h-full object-cover" />
                                ) : (
                                    <button
                                        onClick={() => handleGenerateImage(selectedMeal)}
                                        className="flex flex-col items-center gap-2 text-neutral-500 hover:text-green-500 transition-colors"
                                    >
                                        <div className="p-4 rounded-full bg-white dark:bg-neutral-700 shadow-sm group-hover:scale-110 transition-transform">
                                            <ImageIcon className="w-8 h-8" />
                                        </div>
                                        <span className="text-sm font-medium">Generate AI Photo</span>
                                    </button>
                                )}
                            </div>

                            {/* Recipes Section */}
                            <div className="space-y-4">
                                <h4 className="font-bold flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-orange-500" />
                                    Recipes & Articles
                                </h4>

                                {contentLoading ? (
                                    <div className="text-center py-4 text-neutral-500 text-sm">Searching for recipes...</div>
                                ) : contentResults.length > 0 ? (
                                    <div className="flex flex-col gap-3 w-full max-w-full">
                                        {contentResults.map((item: any, i) => (
                                            <a
                                                key={i}
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors border border-neutral-200 dark:border-neutral-700 w-full overflow-hidden max-w-full"
                                            >
                                                <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 shrink-0">
                                                    <BookOpen className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate pr-2">{item.title}</p>
                                                    <p className="text-xs text-neutral-500 truncate">{item.source}</p>
                                                </div>
                                                <ExternalLink className="w-4 h-4 text-neutral-400 shrink-0" />
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-neutral-500 text-sm italic">
                                        No specific recipes found.
                                        {selectedRecipeUrl && (
                                            <a href={selectedRecipeUrl} target="_blank" className="text-green-500 ml-1 underline">
                                                Basic Link
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Diet Days Accordion */}
            <div className="grid gap-4">
                {(!plan || !Array.isArray(plan) || plan.length === 0) ? (
                    <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                        <p className="text-neutral-500">No diet plan data available.</p>
                    </div>
                ) : (
                    plan.map((day, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`rounded-2xl overflow-hidden border transition-all duration-300 ${expandedDay === index
                            ? "bg-white dark:bg-neutral-900 border-green-500 dark:border-green-500 shadow-lg ring-1 ring-green-500/20"
                            : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-green-300 dark:hover:border-green-700"
                            }`}
                    >
                        <button
                            onClick={() => toggleDay(index)}
                            className="w-full flex items-center justify-between p-6 text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${expandedDay === index
                                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                                    }`}>
                                    {index + 1}
                                </div>
                                <h3 className={`text-lg font-bold transition-colors ${expandedDay === index ? "text-black dark:text-white" : "text-neutral-700 dark:text-neutral-300"
                                    }`}>
                                    {day.day}
                                </h3>
                            </div>
                            <div className={`p-2 rounded-full transition-transform duration-300 ${expandedDay === index ? "rotate-180 bg-neutral-100 dark:bg-neutral-800" : ""}`}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-neutral-500">
                                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </button>

                        <AnimatePresence>
                            {expandedDay === index && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                    <div className="p-6 pt-0 space-y-4 border-t border-neutral-100 dark:border-neutral-800/50 mt-2">
                                        <div className="h-4"></div> {/* Spacer */}
                                        <MealCard meal={day.breakfast} title="Breakfast" icon={Coffee} />
                                        <MealCard meal={day.lunch} title="Lunch" icon={Sun} />
                                        <MealCard meal={day.dinner} title="Dinner" icon={Moon} />

                                        {day.snacks.length > 0 && (
                                            <div className="pt-2">
                                                <h4 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3 pl-1">Snacks</h4>
                                                <div className="space-y-4">
                                                    {day.snacks.map((snack, i) => (
                                                        <MealCard key={i} meal={snack} title={`Snack ${i + 1}`} icon={Coffee} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )))}
            </div>
        </motion.div>
    );
}
