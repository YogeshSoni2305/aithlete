"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Tracker from "@/components/Tracker";
import { motion } from "framer-motion";

export default function TrackerPage() {
    return (
        <main className="min-h-screen bg-neutral-50 dark:bg-black text-black dark:text-white transition-colors duration-500 pt-24 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10 animate-pulse" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -z-10 animate-pulse delay-1000" />

            <Navbar />

            <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="text-center mb-12">
                        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                            Track Your <span className="gradient-text">Progress</span>
                        </h1>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                            Monitor your workouts, meals, and weight journey all in one place.
                        </p>
                    </div>

                    <Tracker />
                </motion.div>
            </div>
            <Footer />
        </main >
    );
}
