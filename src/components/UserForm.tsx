"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { UserData } from "@/types";
import {
    Loader2, ChevronRight, ChevronLeft, User, Ruler, Weight,
    Target, Activity, MapPin, Utensils, FileText, Check,
    TrendingDown, TrendingUp, Zap, Trophy, Home, Dumbbell,
    Sun, Leaf, Drumstick, Sprout, Egg, Ban, Flame
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserFormProps {
    onSubmit: (data: UserData) => void;
    isLoading: boolean;
}

const STEPS = [
    { id: 1, title: "About You", description: "Let's get to know you" },
    { id: 2, title: "Your Goals", description: "What are you aiming for?" },
    { id: 3, title: "Final Touches", description: "Preferences & History" }
];

const FUN_FACTS = [
    "Did you know? Muscle tissue burns 3x more calories than fat, even at rest! 🔥",
    "Your heart beats about 100,000 times a day. Keep it strong! ❤️",
    "Listening to music can increase workout performance by 15%. 🎵",
    "Water makes up 75% of your muscles. Stay hydrated! 💧",
    "The body has more than 600 muscles. Let's work them out! 💪",
    "Consistency is key. Small steps every day lead to big results. 🚀",
    "Sleep is when your muscles repair and grow. Get those 8 hours! 😴",
    "A 1-hour workout is only 4% of your day. You got this! ⏰"
];


export default function UserForm({ onSubmit, isLoading }: UserFormProps) {
    const { user, isLoaded } = useUser();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<UserData>({
        name: "",
        age: "" as any,
        gender: "Male",
        height: "" as any,
        weight: "" as any, // Changed from 70 to empty
        goal: "Weight Loss",
        level: "Beginner",
        location: "Home",
        dietaryPreferences: "Veg",
        medicalHistory: "",
    });

    // Fun Loading State
    const [loadingFactIndex, setLoadingFactIndex] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLoading) {
            interval = setInterval(() => {
                setLoadingFactIndex((prev) => (prev + 1) % FUN_FACTS.length);
            }, 2500);
        }
        return () => clearInterval(interval);
    }, [isLoading]);


    useEffect(() => {
        if (isLoaded && user) {
            setFormData(prev => ({
                ...prev,
                name: prev.name || user.fullName || user.firstName || ""
            }));
        }
    }, [isLoaded, user]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "age" || name === "height" || name === "weight"
                ? (value === "" ? "" : Number(value))
                : value,
        }));
    };

    const handleSelect = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleNext = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep((prev) => prev + 1);
        } else {
            onSubmit(formData);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const isStepValid = () => {
        if (currentStep === 1) {
            return formData.name && formData.age && formData.height && formData.weight;
        }
        return true;
    };

    // Icon Helpers
    const getGoalIcon = (goal: string) => {
        switch (goal) {
            case "Weight Loss": return <TrendingDown className="w-6 h-6 mb-2" />;
            case "Muscle Gain": return <Dumbbell className="w-6 h-6 mb-2" />;
            case "Maintenance": return <Activity className="w-6 h-6 mb-2" />;
            case "Endurance": return <Flame className="w-6 h-6 mb-2" />;
            default: return <Target className="w-6 h-6 mb-2" />;
        }
    };

    const getLevelIcon = (level: string) => {
        switch (level) {
            case "Beginner": return <Sprout className="w-6 h-6 mb-2" />;
            case "Intermediate": return <TrendingUp className="w-6 h-6 mb-2" />;
            case "Advanced": return <Trophy className="w-6 h-6 mb-2" />;
            default: return <Activity className="w-6 h-6 mb-2" />;
        }
    };

    const getLocationIcon = (location: string) => {
        switch (location) {
            case "Home": return <Home className="w-6 h-6 mb-2" />;
            case "Gym": return <Dumbbell className="w-6 h-6 mb-2" />;
            case "Outdoor": return <Sun className="w-6 h-6 mb-2" />;
            default: return <MapPin className="w-6 h-6 mb-2" />;
        }
    };

    const getDietIcon = (diet: string) => {
        switch (diet) {
            case "Veg": return <Leaf className="w-5 h-5 mb-2" />;
            case "Non-Veg": return <Drumstick className="w-5 h-5 mb-2" />;
            case "Veg + Non-Veg": return <Utensils className="w-5 h-5 mb-2" />;
            case "Vegan": return <Sprout className="w-5 h-5 mb-2" />;
            case "Keto": return <Egg className="w-5 h-5 mb-2" />; // Egg is a good proxy for Keto
            case "None": return <Ban className="w-5 h-5 mb-2" />;
            default: return <Utensils className="w-5 h-5 mb-2" />;
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Progress Header */}
            <div className="mb-12">
                <div className="flex justify-between items-center mb-4 relative">
                    {STEPS.map((step) => (
                        <div key={step.id} className="flex flex-col items-center relative z-10 w-1/3">
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 bg-neutral-950 dark:bg-neutral-900",
                                    currentStep >= step.id
                                        ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border-neutral-300 dark:border-neutral-700"
                                )}
                            >
                                {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                            </div>
                            <span className={cn(
                                "absolute -bottom-8 text-xs font-medium whitespace-nowrap transition-colors duration-300",
                                currentStep >= step.id ? "text-black dark:text-white" : "text-neutral-400"
                            )}>
                                {step.title}
                            </span>
                        </div>
                    ))}
                    {/* Connecting Line */}
                    <div className="absolute top-5 left-0 w-full h-0.5 bg-neutral-200 dark:bg-neutral-800 -z-0 block" />
                    <div
                        className="absolute top-5 left-0 h-0.5 bg-black dark:bg-white -z-0 block transition-all duration-300"
                        style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                    />
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-10 shadow-xl"
            >
                <form onSubmit={(e) => e.preventDefault()}>
                    <AnimatePresence mode="wait">
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8"
                            >
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold mb-2">Tell us about yourself</h2>
                                    <p className="text-neutral-500">We need these details to calculate your metrics accurately.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="Full Name" icon={<User className="w-4 h-4" />}>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full bg-transparent outline-none p-2 text-base md:text-lg text-black dark:text-white placeholder:text-neutral-400"
                                            placeholder=""
                                        />
                                    </InputGroup>
                                    <InputGroup label="Gender" icon={<User className="w-4 h-4" />}>
                                        <div className="flex gap-2 w-full">
                                            {["Male", "Female", "Other"].map((g) => (
                                                <button
                                                    key={g}
                                                    type="button"
                                                    onClick={() => handleSelect("gender", g)}
                                                    className={cn(
                                                        "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all",
                                                        formData.gender === g
                                                            ? "bg-black dark:bg-white text-white dark:text-black"
                                                            : "bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-black dark:text-white"
                                                    )}
                                                >
                                                    {g}
                                                </button>
                                            ))}
                                        </div>
                                    </InputGroup>
                                    <InputGroup label="Age" icon={<Activity className="w-4 h-4" />}>
                                        <input
                                            type="number"
                                            name="age"
                                            value={formData.age}
                                            onChange={handleChange}
                                            className="w-full bg-transparent outline-none p-2 text-base md:text-lg text-black dark:text-white placeholder:text-neutral-400"
                                            placeholder="25"
                                        />
                                    </InputGroup>
                                    <InputGroup label="Height (cm)" icon={<Ruler className="w-4 h-4" />}>
                                        <input
                                            type="number"
                                            name="height"
                                            value={formData.height}
                                            onChange={handleChange}
                                            className="w-full bg-transparent outline-none p-2 text-base md:text-lg text-black dark:text-white placeholder:text-neutral-400"
                                            placeholder="175"
                                        />
                                    </InputGroup>
                                    <InputGroup label="Weight (kg)" icon={<Weight className="w-4 h-4" />}>
                                        <input
                                            type="number"
                                            name="weight"
                                            value={formData.weight}
                                            onChange={handleChange}
                                            className="w-full bg-transparent outline-none p-2 text-base md:text-lg text-black dark:text-white placeholder:text-neutral-400"
                                            placeholder="70"
                                        />
                                    </InputGroup>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8"
                            >
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold mb-2">Define your goals</h2>
                                    <p className="text-neutral-500">What do you want to achieve with AIthlete?</p>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-3 block">Fitness Goal</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {["Weight Loss", "Muscle Gain", "Maintenance", "Endurance"].map((goal) => (
                                                <SelectionCard
                                                    key={goal}
                                                    label={goal}
                                                    selected={formData.goal === goal}
                                                    onClick={() => handleSelect("goal", goal)}
                                                    icon={getGoalIcon(goal)}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-3 block">Current Level</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {["Beginner", "Intermediate", "Advanced"].map((level) => (
                                                <SelectionCard
                                                    key={level}
                                                    label={level}
                                                    selected={formData.level === level}
                                                    onClick={() => handleSelect("level", level)}
                                                    icon={getLevelIcon(level)}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-3 block">Workout Location</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {["Home", "Gym", "Outdoor"].map((loc) => (
                                                <SelectionCard
                                                    key={loc}
                                                    label={loc}
                                                    selected={formData.location === loc}
                                                    onClick={() => handleSelect("location", loc)}
                                                    icon={getLocationIcon(loc)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8"
                            >
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold mb-2">Final Details</h2>
                                    <p className="text-neutral-500">Tailor your plan to your lifestyle.</p>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-3 block">Dietary Preference</label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {["Veg", "Non-Veg", "Veg + Non-Veg"].map((diet) => (
                                                <SelectionCard
                                                    key={diet}
                                                    label={diet}
                                                    selected={formData.dietaryPreferences === diet}
                                                    onClick={() => handleSelect("dietaryPreferences", diet)}
                                                    icon={getDietIcon(diet)}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-3 block">Medical History (Optional)</label>
                                        <div className="relative group">
                                            <div className="absolute top-3 left-4 text-neutral-400">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <textarea
                                                name="medicalHistory"
                                                value={formData.medicalHistory}
                                                onChange={handleChange}
                                                className="w-full px-12 py-4 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-transparent focus:border-neutral-300 dark:focus:border-neutral-700 outline-none transition-all resize-none h-32 text-black dark:text-white"
                                                placeholder="Any injuries, allergies, or medical conditions we should know about..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-12 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                        <button
                            type="button"
                            onClick={handleBack}
                            className={cn(
                                "px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-black dark:text-white",
                                currentStep === 1 && "invisible"
                            )}
                        >
                            <ChevronLeft className="w-4 h-4" /> Back
                        </button>

                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={!isStepValid() || isLoading}
                            className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-95"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                                </>
                            ) : currentStep === 3 ? (
                                <>Generate Plan <Activity className="w-4 h-4" /></>
                            ) : (
                                <>Next Step <ChevronRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </div>
                </form>

                {/* Fun Loading Overlay */}
                <AnimatePresence>
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm rounded-3xl p-8 text-center"
                        >
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 10, -10, 0]
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="mb-6 p-6 bg-black dark:bg-white rounded-full"
                            >
                                <Dumbbell className="w-12 h-12 text-white dark:text-black" />
                            </motion.div>

                            <h3 className="text-2xl font-bold mb-4">Generating your plan...</h3>

                            <motion.div
                                key={loadingFactIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="max-w-md"
                            >
                                <p className="text-neutral-500 text-lg font-medium">
                                    "{FUN_FACTS[loadingFactIndex]}"
                                </p>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

// Helper Components
function InputGroup({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="group">
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2 block ml-1">{label}</label>
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-900 rounded-xl border-2 border-transparent group-focus-within:border-black dark:group-focus-within:border-white transition-all overflow-hidden px-3">
                <div className="text-neutral-400 mr-2">{icon}</div>
                {children}
            </div>
        </div>
    );
}

function SelectionCard({ label, icon, selected, onClick }: { label: string; icon: React.ReactNode; selected: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 h-full w-full",
                selected
                    ? "border-black dark:border-white bg-black/5 dark:bg-white/10 text-black dark:text-white scale-[1.02]"
                    : "border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900"
            )}
        >
            <div className={selected ? "text-black dark:text-white" : "text-neutral-400"}>
                {icon}
            </div>
            <span className="font-medium text-sm mt-2">{label}</span>
        </button>
    );
}
