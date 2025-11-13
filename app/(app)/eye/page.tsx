
'use client'
import { useRouter } from "@bprogress/next";
import { motion } from "framer-motion";

export default function EyePage() {
  const router = useRouter();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12">
      <h1 className="mb-6 text-4xl font-bold text-[#3a3947]">
        Eye Tracking Landing Page
      </h1>
      <p className="mb-8 text-lg text-[#5a5868]">
        Welcome to your eye tracking experiment Page. Here you can calibrate your eyes
        your progress and analyze your data.
      </p>
      {/* Add more components and functionality as needed */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="flex sm:flex-wrap sm:justify-center gap-6 "
      >
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/eye-experience")}
          className="rounded-[15px] bg-[#f4d03f] px-12 py-5 text-lg font-semibold text-[#3a3947] transition-all duration-300 hover:shadow-[0_10px_30px_rgba(244,208,63,0.3)]   sm:px-8 sm:py-4"
        >
          Experience Eye Tracking
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/calibration")}
          className="rounded-[15px] border-2 border-[#4a4856] bg-transparent px-12 py-5 text-lg font-semibold text-[#3a3947] transition-all duration-300 hover:bg-[#4a4856] hover:text-[#fefdfb]   sm:px-8 sm:py-4"
        >
          Calibrate My Eyes
        </motion.button>
      </motion.div>
    </div>
  );
}
