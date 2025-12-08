"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import {
    Plus,
    Trash2,
    Dumbbell,
    Utensils,
    Scale,
    TrendingUp,
    Calendar,
    RotateCcw
} from "lucide-react";
import { WorkoutLog, MealLog, WeightLog } from "@/types";

export default function Tracker() {
    const [activeTab, setActiveTab] = useState<"workout" | "meal" | "weight">("workout");
    const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
    const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
    const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);

    // Form states
    // Form states
    const [workoutForm, setWorkoutForm] = useState({ exercise: "", sets: "", reps: "", weight: "", date: new Date().toISOString().split("T")[0] });
    const [mealForm, setMealForm] = useState({ name: "", calories: "", protein: "", carbs: "", fats: "", date: new Date().toISOString().split("T")[0] });
    const [weightForm, setWeightForm] = useState({ weight: "", date: new Date().toISOString().split("T")[0] });

    // Flush functionality state
    const [showFlushConfirm, setShowFlushConfirm] = useState(false);
    const [flushInput, setFlushInput] = useState("");


    useEffect(() => {
        // Fetch logs from DB
        const fetchLogs = async () => {
            try {
                const [workouts, meals, weights] = await Promise.all([
                    fetch("/api/tracker?type=workout").then(res => res.json()),
                    fetch("/api/tracker?type=meal").then(res => res.json()),
                    fetch("/api/tracker?type=weight").then(res => res.json())
                ]);

                if (Array.isArray(workouts)) setWorkoutLogs(workouts);
                if (Array.isArray(meals)) setMealLogs(meals);
                if (Array.isArray(weights)) setWeightLogs(weights);
            } catch (error) {
                console.error("Error fetching logs:", error);
            }
        };

        fetchLogs();
    }, []);

    const addWorkout = async () => {
        if (!workoutForm.exercise) return;
        const selectedDate = workoutForm.date || new Date().toISOString().split("T")[0];
        const newLog = {
            date: selectedDate,
            exercise: workoutForm.exercise,
            sets: Number(workoutForm.sets) || 0,
            reps: Number(workoutForm.reps) || 0,
            weight: Number(workoutForm.weight) || 0,
        };

        try {
            const res = await fetch("/api/tracker", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "workout", data: newLog }),
            });
            if (res.ok) {
                const savedLog = await res.json();
                setWorkoutLogs([savedLog, ...workoutLogs]);
                setWorkoutForm({ exercise: "", sets: "", reps: "", weight: "", date: new Date().toISOString().split("T")[0] });
            }
        } catch (error) {
            console.error("Error saving workout:", error);
            alert("Failed to save workout. Check console for details.");
        }
    };

    const addMeal = async () => {
        if (!mealForm.name) return;
        const selectedDate = mealForm.date || new Date().toISOString().split("T")[0];
        const newLog = {
            date: selectedDate,
            name: mealForm.name,
            calories: Number(mealForm.calories) || 0,
            protein: Number(mealForm.protein) || 0,
            carbs: Number(mealForm.carbs) || 0,
            fats: Number(mealForm.fats) || 0,
        };

        try {
            const res = await fetch("/api/tracker", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "meal", data: newLog }),
            });
            if (res.ok) {
                const savedLog = await res.json();
                setMealLogs([savedLog, ...mealLogs]);
                setMealForm({ name: "", calories: "", protein: "", carbs: "", fats: "", date: new Date().toISOString().split("T")[0] });
            } else {
                alert("Failed to save meal. Server returned error.");
            }
        } catch (error) {
            console.error("Error saving meal:", error);
            alert("Failed to save meal. Check console for details.");
        }
    };

    const addWeight = async () => {
        if (!weightForm.weight) return;
        const selectedDate = weightForm.date || new Date().toISOString().split("T")[0];
        const newLog = {
            date: selectedDate,
            weight: Number(weightForm.weight),
        };

        try {
            const res = await fetch("/api/tracker", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "weight", data: newLog }),
            });
            if (res.ok) {
                const savedLog = await res.json();
                const filtered = weightLogs.filter(w => w.date.toString().split("T")[0] !== selectedDate);
                setWeightLogs([...filtered, savedLog].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
                setWeightForm({ weight: "", date: new Date().toISOString().split("T")[0] });
            } else {
                alert("Failed to save weight. Server returned error.");
            }
        } catch (error) {
            console.error("Error saving weight:", error);
            alert("Failed to save weight. Check console for details.");
        }
    };

    const flushWeightData = () => {
        setShowFlushConfirm(true);
        setFlushInput("");
    };

    const confirmFlush = async () => {
        if (flushInput !== "FLUSH") return;

        try {
            const res = await fetch("/api/tracker?type=weight&all=true", {
                method: "DELETE",
            });

            if (res.ok) {
                setWeightLogs([]);
                setShowFlushConfirm(false);
                alert("All weight data flushed.");
            } else {
                alert("Failed to flush data.");
            }
        } catch (error) {
            console.error("Error flushing data:", error);
            alert("Error flushing data.");
        }
    };


    const deleteWorkout = (id: string) => {
        // TODO: Implement delete API
        setWorkoutLogs(workoutLogs.filter(w => w.id !== id));
    };

    const deleteMeal = (id: string) => {
        // TODO: Implement delete API
        setMealLogs(mealLogs.filter(m => m.id !== id));
    };

    // Calculate daily macros
    const today = new Date().toISOString().split("T")[0];
    const todaysMeals = mealLogs.filter(m => m.date === today);
    const dailyMacros = todaysMeals.reduce((acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fats: acc.fats + meal.fats,
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

    return (
        <div className="space-y-8">
            {/* Tabs */}
            {/* Tabs */}
            <div className="flex justify-center mb-8">
                <div className="inline-flex bg-neutral-100/50 dark:bg-neutral-800/50 backdrop-blur-md p-1.5 rounded-full border border-neutral-200/50 dark:border-neutral-700/50">
                    {[
                        { id: "workout", icon: Dumbbell, label: "Workout" },
                        { id: "meal", icon: Utensils, label: "Meals" },
                        { id: "weight", icon: Scale, label: "Weight" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`relative px-6 py-2.5 rounded-full text-sm font-semibold transition-colors duration-300 flex items-center gap-2 z-10 ${activeTab === tab.id
                                ? "text-black dark:text-white"
                                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                                }`}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white dark:bg-neutral-700 shadow-md rounded-full -z-10"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === "workout" && (
                    <motion.div
                        key="workout"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Add Workout Form */}
                        {/* Add Workout Form */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-8 rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 shadow-xl shadow-purple-500/5"
                        >
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
                                    <Plus className="w-6 h-6" />
                                </div>
                                Log New Workout
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">Date</label>
                                    <input
                                        type="date"
                                        value={workoutForm.date}
                                        onChange={e => setWorkoutForm({ ...workoutForm, date: e.target.value })}
                                        className="w-full p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium text-neutral-600 dark:text-neutral-300"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">Exercise</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Bench Press"
                                        value={workoutForm.exercise}
                                        onChange={e => setWorkoutForm({ ...workoutForm, exercise: e.target.value })}
                                        className="w-full p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">Sets</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={workoutForm.sets}
                                        onChange={e => setWorkoutForm({ ...workoutForm, sets: e.target.value })}
                                        className="w-full p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">Reps</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={workoutForm.reps}
                                        onChange={e => setWorkoutForm({ ...workoutForm, reps: e.target.value })}
                                        className="w-full p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">Weight (kg)</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={workoutForm.weight}
                                        onChange={e => setWorkoutForm({ ...workoutForm, weight: e.target.value })}
                                        className="w-full p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={addWorkout}
                                className="mt-8 w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transform hover:-translate-y-0.5 transition-all duration-300"
                            >
                                Add Logs
                            </button>
                        </motion.div>

                        {/* Workout List */}
                        <div className="space-y-4">
                            {workoutLogs.map((log) => (
                                <motion.div
                                    key={log.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 flex justify-between items-center"
                                >
                                    <div>
                                        <h4 className="font-bold text-lg">{log.exercise}</h4>
                                        <div className="text-sm text-neutral-500 flex gap-4">
                                            <span>{log.sets} sets</span>
                                            <span>{log.reps} reps</span>
                                            <span>{log.weight} kg</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {log.date}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteWorkout(log.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </motion.div>
                            ))}
                            {workoutLogs.length === 0 && (
                                <div className="text-center py-12 text-neutral-500">
                                    No workouts logged yet. Start training! 💪
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {activeTab === "meal" && (
                    <motion.div
                        key="meal"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        {/* Daily Summary */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { label: "Calories", value: dailyMacros.calories, unit: "kcal", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800" },
                                { label: "Protein", value: dailyMacros.protein, unit: "g", color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-200 dark:border-green-800" },
                                { label: "Carbs", value: dailyMacros.carbs, unit: "g", color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-200 dark:border-orange-800" },
                                { label: "Fats", value: dailyMacros.fats, unit: "g", color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20", border: "border-yellow-200 dark:border-yellow-800" },
                            ].map((macro) => (
                                <div key={macro.label} className={`${macro.bg} p-6 rounded-3xl border ${macro.border} text-center transition-transform hover:scale-105 duration-300`}>
                                    <div className={`text-3xl font-bold ${macro.color} mb-1`}>{macro.value}</div>
                                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest opacity-80">{macro.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Add Meal Form */}
                        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-8 rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 shadow-xl shadow-green-500/5">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
                                    <Plus className="w-6 h-6" />
                                </div>
                                Log Meal
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-5 mb-5">
                                <div className="space-y-2 col-span-1 md:col-span-1">
                                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">Date</label>
                                    <input
                                        type="date"
                                        value={mealForm.date}
                                        onChange={e => setMealForm({ ...mealForm, date: e.target.value })}
                                        className="w-full p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-medium text-neutral-600 dark:text-neutral-300"
                                    />
                                </div>
                                <div className="space-y-2 col-span-1 md:col-span-4">
                                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">Meal Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Grilled Chicken Salad"
                                        value={mealForm.name}
                                        onChange={e => setMealForm({ ...mealForm, name: e.target.value })}
                                        className="w-full p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-medium"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">Calories</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={mealForm.calories}
                                        onChange={e => setMealForm({ ...mealForm, calories: e.target.value })}
                                        className="w-full p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">Protein (g)</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={mealForm.protein}
                                        onChange={e => setMealForm({ ...mealForm, protein: e.target.value })}
                                        className="w-full p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">Carbs (g)</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={mealForm.carbs}
                                        onChange={e => setMealForm({ ...mealForm, carbs: e.target.value })}
                                        className="w-full p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">Fats (g)</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={mealForm.fats}
                                        onChange={e => setMealForm({ ...mealForm, fats: e.target.value })}
                                        className="w-full p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-medium"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={addMeal}
                                className="mt-8 w-full py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold rounded-2xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transform hover:-translate-y-0.5 transition-all duration-300"
                            >
                                Add Meal
                            </button>
                        </div>

                        {/* Meal List */}
                        <div className="space-y-4">
                            {mealLogs.map((log) => (
                                <motion.div
                                    key={log.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div>
                                        <h4 className="font-bold text-lg mb-2">{log.name}</h4>
                                        <div className="flex flex-wrap gap-2 text-sm font-medium">
                                            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">{log.calories} kcal</span>
                                            <span className="px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">P: {log.protein}g</span>
                                            <span className="px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">C: {log.carbs}g</span>
                                            <span className="px-3 py-1 rounded-full bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">F: {log.fats}g</span>
                                            <span className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {log.date}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteMeal(log.id)}
                                        className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors ml-4"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </motion.div>
                            ))}
                            {mealLogs.length === 0 && (
                                <div className="text-center py-16 text-neutral-500 italic bg-neutral-50 dark:bg-neutral-900/50 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800">
                                    No meals logged yet. Eat well, live well! 🥗
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {activeTab === "weight" && (
                    <motion.div
                        key="weight"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        {/* Weight Chart */}
                        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-8 rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 shadow-xl shadow-blue-500/5 h-[450px]">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-bold flex items-center gap-3">
                                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    Weight Progress
                                </h3>
                                <button
                                    onClick={flushWeightData}
                                    className="text-xs font-semibold flex items-center gap-2 text-red-500 hover:text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all uppercase tracking-wider border border-transparent hover:border-red-200 dark:hover:border-red-900/50"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    Flush Data
                                </button>
                            </div>
                            <div className="h-[320px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={weightLogs}>
                                        <defs>
                                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#555" opacity={0.1} vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            dy={15}
                                        />
                                        <YAxis
                                            stroke="#888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            domain={['dataMin - 2', 'dataMax + 2']}
                                            dx={-15}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}
                                            itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                            labelStyle={{ color: '#888', marginBottom: '0.5rem', fontSize: '12px' }}
                                            formatter={(value) => [`${value} kg`, "Weight"]}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="weight"
                                            stroke="#3b82f6"
                                            strokeWidth={4}
                                            fillOpacity={1}
                                            fill="url(#colorWeight)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Add Weight Form */}
                        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-8 rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 shadow-xl shadow-blue-500/5 flex flex-col md:flex-row gap-6 items-end">
                            <div className="w-full md:w-48">
                                <label className="block text-xs font-semibold mb-2 text-neutral-500 uppercase tracking-wider ml-1">Date</label>
                                <input
                                    type="date"
                                    value={weightForm.date}
                                    onChange={e => setWeightForm({ ...weightForm, date: e.target.value })}
                                    className="w-full p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-neutral-600 dark:text-neutral-300"
                                />
                            </div>
                            <div className="flex-1 w-full">
                                <label className="block text-xs font-semibold mb-2 text-neutral-500 uppercase tracking-wider ml-1">Current Weight (kg)</label>
                                <input
                                    type="number"
                                    placeholder="0.0"
                                    value={weightForm.weight}
                                    onChange={e => setWeightForm({ ...weightForm, weight: e.target.value })}
                                    className="w-full p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-lg"
                                />
                            </div>
                            <button
                                onClick={addWeight}
                                className="w-full md:w-auto py-4 px-10 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap"
                            >
                                Log Weight
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Flush Confirmation Modal */}
            <AnimatePresence>
                {showFlushConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-md w-full border border-neutral-200 dark:border-neutral-800 shadow-xl"
                        >
                            <h3 className="text-xl font-bold mb-2 text-red-500 flex items-center gap-2">
                                <Trash2 className="w-5 h-5" />
                                Flush Weight Data?
                            </h3>
                            <p className="text-neutral-500 mb-6">
                                This action cannot be undone. To confirm deletion of all weight logs, please type <span className="font-bold text-black dark:text-white">FLUSH</span> below.
                            </p>

                            <input
                                type="text"
                                placeholder="Type FLUSH to confirm"
                                value={flushInput}
                                onChange={(e) => setFlushInput(e.target.value)}
                                className="w-full p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 mb-6 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowFlushConfirm(false)}
                                    className="flex-1 py-3 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmFlush}
                                    disabled={flushInput !== "FLUSH"}
                                    className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Delete Everything
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
