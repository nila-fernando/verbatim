"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import { UploadPanel } from "@/components/upload/upload-panel";
import { ChatContainer } from "@/components/chat/ChatContainer";

const GRADIENT_COLORS = [
  "#0A0A0A",
  "#1a1a2e",
  "#16213e",
  "#0f3460",
  "#533483",
  "#e94560",
  "#2979FF",
];
const GRADIENT_STOPS = [30, 45, 55, 65, 75, 85, 100];

export default function Home() {
  const [started, setStarted] = useState(false);

  return (
    <main className="relative min-h-screen">
      {/* Persistent gradient — shared between hero and app so the transition feels seamless */}
      <AnimatedGradientBackground
        Breathing
        startingGap={110}
        breathingRange={20}
        animationSpeed={0.08}
        topOffset={-10}
        gradientColors={GRADIENT_COLORS}
        gradientStops={GRADIENT_STOPS}
      />
      <div className="absolute inset-0 z-[1] bg-black/20" />

      <AnimatePresence mode="wait">
        {!started ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4"
          >
            <div className="flex flex-col items-center space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-center font-display text-6xl font-semibold lowercase tracking-tight text-white drop-shadow-[0_10px_40px_rgba(255,255,255,0.15)] md:text-7xl"
              >
                verbatim
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.6 }}
                className="text-center text-lg lowercase text-white/70"
              >
                (aka the TA that actually read everything)
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mx-auto max-w-xl text-center lowercase text-white/50"
              >
                upload your lecture slides, research papers, or course notes.
                {" "}ask anything :) verbatim finds the answer and cites the
                exact page it came from.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.6 }}
                className="pt-2"
              >
                <button
                  onClick={() => setStarted(true)}
                  className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-base font-medium text-white backdrop-blur transition hover:bg-white/20"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex h-screen flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="shrink-0 px-6 pt-5 pb-3 lg:px-8">
              <h1 className="font-display text-lg font-semibold lowercase tracking-tight text-white/80">
                verbatim
              </h1>
            </div>

            {/* Main content — full width, two columns on desktop */}
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 px-6 pb-6 lg:grid-cols-[280px_1fr] lg:gap-6 lg:px-8">
              {/* Upload sidebar */}
              <div className="shrink-0 overflow-y-auto lg:border-r lg:border-white/[0.06] lg:pr-6">
                <UploadPanel />
              </div>

              {/* Chat fills all remaining space */}
              <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <ChatContainer />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
