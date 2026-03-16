"use client";

import { useState, useEffect } from "react";
import { DailyWorkout } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ImageIcon, Volume2, VolumeX, Zap, ExternalLink, Play } from "lucide-react";

interface WorkoutPlanProps {
    plan: DailyWorkout[];
}

export default function WorkoutPlan({ plan }: WorkoutPlanProps) {
    const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
    const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
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

    const handleExerciseClick = async (exerciseName: string, videoUrl?: string) => {
        setSelectedExercise(exerciseName);
        setSelectedVideoUrl(videoUrl || null);
        setImageUrl(null);
        setContentResults([]);

        // Fetch Content immediately
        handleFetchContent(exerciseName);
    };

    const handleFetchContent = async (query: string) => {
        setContentLoading(true);
        try {
            const res = await fetch(`/api/content?query=${encodeURIComponent(query)}&type=video`);
            const data = await res.json();
            if (data.results) setContentResults(data.results);
        } catch (error) {
            console.error("Failed to fetch content", error);
        } finally {
            setContentLoading(false);
        }
    };

    const handleGenerateImage = async (exerciseName: string) => {
        setLoading(true);
        try {
            const res = await fetch("/api/image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: `Minimalist fitness photo of ${exerciseName} exercise, professional, clean` }),
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

        let text = "Here is your workout plan. ";
        plan?.forEach((day) => {
            text += `${day.day || ""}. Focus on ${day.focus || ""}. `;
            day.exercises?.forEach((ex) => {
                text += `${ex.name || ""}, ${ex.sets || ""} sets of ${ex.reps || ""} reps. `;
            });
        });

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        speechSynthesis.speak(utterance);
        setIsSpeaking(true);
    };

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
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">Workout Plan</h2>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSpeak}
                    className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition-shadow"
                    aria-label="Read workout plan"
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
                {selectedExercise && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                        onClick={() => setSelectedExercise(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-2xl w-full relative shadow-2xl my-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedExercise(null)}
                                className="absolute top-4 right-4 p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <h3 className="text-xl font-bold mb-4 pr-12">{selectedExercise}</h3>

                            {/* Image Section */}
                            <div className="aspect-video bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center overflow-hidden mb-6 relative group">
                                {loading ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                                        <span className="text-sm text-neutral-500">Creating visual...</span>
                                    </div>
                                ) : imageUrl ? (
                                    <img src={imageUrl} alt={selectedExercise} className="w-full h-full object-cover" />
                                ) : (
                                    <button
                                        onClick={() => handleGenerateImage(selectedExercise)}
                                        className="flex flex-col items-center gap-2 text-neutral-500 hover:text-purple-500 transition-colors"
                                    >
                                        <div className="p-4 rounded-full bg-white dark:bg-neutral-700 shadow-sm group-hover:scale-110 transition-transform">
                                            <ImageIcon className="w-8 h-8" />
                                        </div>
                                        <span className="text-sm font-medium">Generate AI Demo</span>
                                    </button>
                                )}
                            </div>

                            {/* Tutorials Section */}
                            <div className="space-y-4">
                                <h4 className="font-bold flex items-center gap-2">
                                    <Play className="w-4 h-4 text-red-500" />
                                    Video Tutorials
                                </h4>

                                {contentLoading ? (
                                    <div className="text-center py-4 text-neutral-500 text-sm">Finding best tutorials...</div>
                                ) : contentResults.length > 0 ? (
                                    <div className="flex flex-col gap-3 w-full max-w-full">
                                        {contentResults.map((video: any, i) => (
                                            <a
                                                key={i}
                                                href={video.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors border border-neutral-200 dark:border-neutral-700 w-full overflow-hidden max-w-full"
                                            >
                                                {video.thumbnail && (
                                                    <img src={video.thumbnail} alt="" className="w-20 h-12 object-cover rounded-lg shrink-0" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate pr-2">{video.title}</p>
                                                    <p className="text-xs text-neutral-500 truncate">{video.source}</p>
                                                </div>
                                                <ExternalLink className="w-4 h-4 text-neutral-400 shrink-0" />
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-neutral-500 text-sm italic">
                                        No tutorials found.
                                        {selectedVideoUrl && (
                                            <a href={selectedVideoUrl} target="_blank" className="text-purple-500 ml-1 underline">
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

            {/* Workout Days Accordion */}
            <div className="grid gap-4">
                {plan?.map((day, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`rounded-2xl overflow-hidden border transition-all duration-300 ${expandedDay === index
                            ? "bg-white dark:bg-neutral-900 border-purple-500 dark:border-purple-500 shadow-lg ring-1 ring-purple-500/20"
                            : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-purple-300 dark:hover:border-purple-700"
                            }`}
                    >
                        <button
                            onClick={() => toggleDay(index)}
                            className="w-full flex items-center justify-between p-6 text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${expandedDay === index
                                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                                    }`}>
                                    {index + 1}
                                </div>
                                <div>
                                    <h3 className={`text-lg font-bold transition-colors ${expandedDay === index ? "text-black dark:text-white" : "text-neutral-700 dark:text-neutral-300"
                                        }`}>
                                        {day.day}
                                    </h3>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                                        <Zap className="w-3 h-3" />
                                        {day.focus}
                                    </p>
                                </div>
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
                                        {day.exercises?.length > 0 ? (
                                            day.exercises.map((exercise, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    onClick={() => handleExerciseClick(exercise.name, exercise.videoUrl)}
                                                    className="group relative p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/30 hover:bg-purple-50 dark:hover:bg-purple-900/10 cursor-pointer transition-all duration-200 border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-white dark:bg-neutral-800 text-neutral-500 border border-neutral-200 dark:border-neutral-700">
                                                                    Ex {i + 1}
                                                                </span>
                                                                <h4 className="font-semibold text-base text-black dark:text-white">
                                                                    {exercise.name}
                                                                </h4>
                                                            </div>

                                                            {exercise.notes && (
                                                                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 pl-1">{exercise.notes}</p>
                                                            )}

                                                            <div className="flex flex-wrap gap-3 text-xs">
                                                                <div className="flex items-center gap-1 px-2 py-1 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                                                                    <span className="text-neutral-400">Sets</span>
                                                                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">{exercise.sets}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1 px-2 py-1 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                                                                    <span className="text-neutral-400">Reps</span>
                                                                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">{exercise.reps}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1 px-2 py-1 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                                                                    <span className="text-neutral-400">Rest</span>
                                                                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">{exercise.rest}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                                                            <div className="p-2 rounded-full bg-white dark:bg-neutral-700 shadow-sm">
                                                                <ImageIcon className="w-4 h-4 text-purple-500" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-neutral-500">
                                                No exercises scheduled.
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
