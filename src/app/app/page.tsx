"use client";

import { useState, useEffect } from "react";
import UserForm from "@/components/UserForm";
import WorkoutPlan from "@/components/WorkoutPlan";
import DietPlan from "@/components/DietPlan";
import { GeneratedPlan, UserData } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Utensils, RefreshCw, Download, Sparkles, ArrowLeft } from "lucide-react";
import { exportToPDF } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function AppPage() {
    const [plan, setPlan] = useState<GeneratedPlan | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"workout" | "diet">("workout");
    const [dailyQuote, setDailyQuote] = useState<string>("");

    useEffect(() => {
        // Fetch saved plan from DB
        const fetchPlan = async () => {
            console.log("Fetching existing plan...");
            try {
                const res = await fetch("/api/plan");
                console.log("Fetch plan status:", res.status);
                if (res.ok) {
                    const data = await res.json();
                    console.log("Fetched plan data:", data);
                    if (data) setPlan(data);
                }
            } catch (error) {
                console.error("Error fetching plan:", error);
            }
        };

        fetchPlan();

        // Fetch daily quote
        fetch("/api/quote")
            .then(res => res.json())
            .then(data => setDailyQuote(data.quote))
            .catch(() => setDailyQuote("Your only limit is you."));
    }, []);

    // Remove the localStorage useEffect
    // useEffect(() => {
    //     if (plan) {
    //         localStorage.setItem("ai-fitness-plan", JSON.stringify(plan));
    //     }
    // }, [plan]);

        const handleGenerate = async (userData: UserData) => {
        console.log("Starting plan generation for:", userData.name);
        setLoading(true);
        try {
            // 1. Generate Plan
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });

            console.log("Generate API status:", res.status);
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error("Generate API error:", errorData);
                throw new Error(errorData.error || "Failed to generate plan");
            }

            const generatedPlan = await res.json();
            console.log("Generated plan successfully:", generatedPlan);
            setPlan(generatedPlan);

            // 2. Save Plan to DB
            console.log("Saving plan to database...");
            const saveRes = await fetch("/api/plan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(generatedPlan),
            });
            console.log("Save plan status:", saveRes.status);

        } catch (error) {
            console.error(error);
            alert("Something went wrong! Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-neutral-50 dark:bg-black text-black dark:text-white transition-colors duration-500">
            {/* Navigation */}
            <Navbar />

            <div className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-12 max-w-7xl">
                <AnimatePresence mode="wait">
                    {!plan ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            {/* Header */}
                            <div className="text-center mb-12">
                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4"
                                >
                                    Create Your <span className="gradient-text">Perfect Plan</span>
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto"
                                >
                                    Tell us about yourself and we'll create a personalized fitness journey just for you
                                </motion.p>
                            </div>

                            <UserForm onSubmit={handleGenerate} isLoading={loading} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="plan"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-8"
                        >
                            {/* Header */}
                            <div className="text-center mb-8">
                                <motion.h1
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-4xl sm:text-5xl font-bold mb-2"
                                >
                                    Your <span className="gradient-text">Personalized Plan</span>
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-neutral-600 dark:text-neutral-400"
                                >
                                    Crafted specifically for your goals and fitness level
                                </motion.p>
                            </div>

                            {/* Tab Navigation + Actions */}
                            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-800">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                    {/* Tabs */}
                                    <div className="relative flex bg-neutral-100 dark:bg-neutral-800 rounded-full p-1">
                                        <motion.div
                                            className="absolute inset-y-1 rounded-full gradient-primary"
                                            initial={false}
                                            animate={{
                                                x: activeTab === "workout" ? 0 : "100%",
                                            }}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            style={{ width: "calc(50% - 4px)" }}
                                        />
                                        <button
                                            onClick={() => setActiveTab("workout")}
                                            className={`relative z-10 px-8 py-3 text-sm font-medium rounded-full transition-colors ${activeTab === "workout"
                                                ? "text-black"
                                                : "text-neutral-600 dark:text-neutral-400"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Dumbbell className="w-4 h-4" />
                                                <span>Workout</span>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("diet")}
                                            className={`relative z-10 px-8 py-3 text-sm font-medium rounded-full transition-colors ${activeTab === "diet"
                                                ? "text-black"
                                                : "text-neutral-600 dark:text-neutral-400"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Utensils className="w-4 h-4" />
                                                <span>Diet</span>
                                            </div>
                                        </button>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => exportToPDF(plan, "fitness-plan")}
                                            className="p-3 rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-purple-500 dark:hover:border-purple-500 transition-colors"
                                            aria-label="Export to PDF"
                                        >
                                            <Download className="w-5 h-5" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setPlan(null)}
                                            className="flex items-center gap-2 px-6 py-3 rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-purple-500 dark:hover:border-purple-500 transition-colors"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            <span>New Plan</span>
                                        </motion.button>
                                    </div>
                                </div>
                            </div>

                            {/* Plan Content */}
                            <div id="plan-content">
                                <AnimatePresence mode="wait">
                                    {activeTab === "workout" ? (
                                        <WorkoutPlan key="workout" plan={plan?.workoutPlan || []} />
                                    ) : (
                                        <DietPlan key="diet" plan={plan?.dietPlan || []} />
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Motivation Quote */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5 rounded-2xl p-8 text-center border border-purple-200 dark:border-purple-900"
                            >
                                <p className="text-lg font-medium text-neutral-700 dark:text-neutral-300 italic">
                                    "{plan?.motivation || "Your only limit is you."}"
                                </p>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>


            </div>
            <Footer />
        </main >
    );
}
