"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Code, Dumbbell, Coffee, Brain, Wallet, Clock } from "lucide-react";
import { useRef } from "react";

export default function AboutPage() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    return (
        <main ref={containerRef} className="bg-white dark:bg-black text-black dark:text-white">
            {/* Navigation */}
            <Navbar />

            {/* Progress Bar */}
            <motion.div
                className="fixed top-[65px] left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 z-50 origin-left"
                style={{ scaleX: scrollYProgress }}
            />

            {/* Chapter 1: The Intro */}
            <section className="min-h-screen flex items-center justify-center px-4 sticky top-0 bg-white dark:bg-black z-10">
                <div className="container mx-auto max-w-4xl text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.div
                            className="w-40 h-40 mx-auto mb-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shadow-xl"
                            whileHover={{ scale: 1.05 }}
                        >
                            <style jsx>{`
                                @keyframes wave {
                                    0% { transform: rotate(0deg); }
                                    10% { transform: rotate(14deg); }
                                    20% { transform: rotate(-8deg); }
                                    30% { transform: rotate(14deg); }
                                    40% { transform: rotate(-4deg); }
                                    50% { transform: rotate(10deg); }
                                    60% { transform: rotate(0deg); }
                                    100% { transform: rotate(0deg); }
                                }
                                .waving-hand {
                                    display: inline-block;
                                    transform-origin: 70% 70%;
                                    animation: wave 2s infinite;
                                }
                            `}</style>
                            <span className="text-6xl waving-hand">
                                👋
                            </span>
                        </motion.div>
                        <h1 className="text-5xl sm:text-7xl font-bold mb-6">
                            Hi, I'm <span className="gradient-text">Abhay</span>
                        </h1>
                        <p className="text-xl sm:text-2xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                            A robotics enthusiast and full-stack developer with a story to tell.
                        </p>
                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="mt-12 text-neutral-400"
                        >
                            Scroll to see how it started ↓
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Chapter 2: The Gym Phase */}
            <section className="min-h-screen flex items-center justify-center px-4 relative z-20 bg-neutral-50 dark:bg-neutral-900 border-t-4 border-neutral-200 dark:border-neutral-800 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] py-20 md:py-0">
                <div className="container mx-auto max-w-4xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="text-6xl sm:text-8xl mb-6">💪</div>
                            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                                The <span className="text-purple-500">Gym Phase</span>
                            </h2>
                            <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                It all started when I hit the gym. I was pumping iron, feeling the burn, and looking in the mirror thinking...
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="bg-white p-6 rounded-2xl shadow-xl border border-neutral-200 transform rotate-2"
                        >
                            <div className="text-center text-black">
                                <p className="text-2xl font-bold italic mb-4">"My mooscles are getting bigger!"</p>
                                <p className="text-sm text-neutral-500">- Me (probably), looking at a 1mm gain</p>
                                <div className="mt-4 flex justify-center gap-2">
                                    <img src="/mooscles.png" alt="Mooscles" className="w-64 h-auto rounded-lg mx-auto" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Chapter 3: The Struggle */}
            <section className="min-h-screen flex items-center justify-center px-4 relative z-20 bg-white dark:bg-black border-t border-neutral-200 dark:border-neutral-800 py-12 md:py-0">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        {/* Left Column: Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="mb-8 lg:mb-12 text-center lg:text-left">
                                <h2 className="text-3xl sm:text-5xl font-bold mb-4 lg:mb-6">
                                    But then... <span className="text-red-500">Reality Hit</span>
                                </h2>
                                <p className="text-base sm:text-xl text-neutral-600 dark:text-neutral-400">
                                    I had the motivation, but life had other plans.
                                </p>
                            </div>

                            <div className="space-y-4 lg:space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className="p-4 lg:p-8 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0 text-red-600 dark:text-red-400">
                                            <Clock className="w-5 h-5 lg:w-6 lg:h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl lg:text-2xl font-bold mb-1 lg:mb-2">No Time</h3>
                                            <p className="text-sm lg:text-base text-neutral-600 dark:text-neutral-400">
                                                Between coding, robotics projects, and debugging infinite loops, who has time to research diet plans?
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                    className="p-4 lg:p-8 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0 text-orange-600 dark:text-orange-400">
                                            <Wallet className="w-5 h-5 lg:w-6 lg:h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl lg:text-2xl font-bold mb-1 lg:mb-2">No Money</h3>
                                            <p className="text-sm lg:text-base text-neutral-600 dark:text-neutral-400">
                                                Personal trainers and dieticians? In this economy? My wallet started crying just thinking about it. 💸
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Right Column: Visuals */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 0.8 }}
                            className="flex items-center justify-center p-4 lg:mt-32"
                        >
                            <motion.div
                                whileHover={{ scale: 1.02, rotate: 1 }}
                                className="relative z-10 w-full flex justify-center"
                            >
                                <img
                                    src="/wallet-reality.png"
                                    alt="My Wallet to Me"
                                    className="w-full sm:w-[120%] max-w-lg mx-auto rotate-0 lg:rotate-2 drop-shadow-2xl"
                                />
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Chapter 4: The Epiphany */}
            <section className="min-h-screen flex items-center justify-center px-4 relative z-20 bg-black text-white overflow-hidden py-12 md:py-0">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>

                <div className="container mx-auto max-w-6xl relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center md:text-left"
                        >
                            <Brain className="w-16 h-16 sm:w-20 sm:h-20 mb-8 text-purple-500 animate-pulse mx-auto md:mx-0" />
                            <h2 className="text-4xl sm:text-6xl font-bold mb-6 sm:mb-8">
                                "Fine, I'll do it myself."
                            </h2>
                            <p className="text-xl sm:text-2xl text-neutral-300 max-w-2xl leading-relaxed">
                                I realized I had the power of code (and AI) on my side. Why pay for a coach when I can build one?
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 0.8 }}
                            className="flex justify-center"
                        >
                            <motion.div
                                whileHover={{ scale: 1.05, rotate: 2 }}
                                className="relative inline-block"
                            >
                                <img
                                    src="/atmanirbhar.png"
                                    alt="Atmanirbhar Baniye"
                                    className="w-full sm:w-[120%] max-w-lg mx-auto rotate-2 drop-shadow-2xl"
                                />
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Chapter 5: The Solution */}
            <section className="min-h-screen flex items-center justify-center px-4 relative z-20 bg-white dark:bg-black overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <motion.path
                            d="M0 50 Q 25 25 50 50 T 100 50"
                            fill="none"
                            stroke="url(#gradient1)"
                            strokeWidth="0.5"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.2 }}
                            transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                            className="text-purple-500"
                        />
                        <motion.path
                            d="M0 30 Q 25 80 50 30 T 100 30"
                            fill="none"
                            stroke="url(#gradient2)"
                            strokeWidth="0.5"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.2 }}
                            transition={{ duration: 2.5, delay: 0.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                            className="text-pink-500"
                        />
                        <motion.path
                            d="M0 70 Q 25 20 50 70 T 100 70"
                            fill="none"
                            stroke="url(#gradient1)"
                            strokeWidth="0.5"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.1 }}
                            transition={{ duration: 3, delay: 0.2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                            className="text-blue-500"
                        />
                        <motion.path
                            d="M0 20 Q 50 80 100 20"
                            fill="none"
                            stroke="url(#gradient2)"
                            strokeWidth="0.5"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.15 }}
                            transition={{ duration: 4, delay: 1, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                            className="text-purple-400"
                        />
                        <motion.path
                            d="M0 80 Q 50 10 100 80"
                            fill="none"
                            stroke="url(#gradient1)"
                            strokeWidth="0.5"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.15 }}
                            transition={{ duration: 3.5, delay: 1.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                            className="text-pink-400"
                        />
                        <defs>
                            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
                                <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
                                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
                                <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
                                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.1, 0.2, 0.1],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute -top-20 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.1, 0.2, 0.1],
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1,
                        }}
                        className="absolute -bottom-20 -right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
                    />
                </div>

                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="text-sm font-bold tracking-widest text-purple-500 uppercase mb-4">Introducing</div>
                        <h2 className="text-6xl sm:text-8xl font-bold mb-8 gradient-text">
                            AIthlete
                        </h2>
                        <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-12 max-w-2xl mx-auto">
                            My personal solution to getting fit without the hassle. Smart, personalized, and free (for me, and now for you).
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/app"
                                className="px-10 py-4 bg-black dark:bg-white text-white dark:text-black text-lg font-medium rounded-full hover:scale-105 hover:shadow-lg transition-all duration-300"
                            >
                                Start Your Journey
                            </Link>
                            <Link
                                href="/"
                                className="px-10 py-4 border border-neutral-300 dark:border-neutral-700 text-black dark:text-white text-lg font-medium rounded-full hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all duration-300"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
            <Footer />
        </main >
    );
}
