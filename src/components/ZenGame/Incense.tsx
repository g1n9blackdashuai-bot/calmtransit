import React from 'react';
import { motion } from 'motion/react';

interface IncenseProps {
  progress: number; // 0 to 1
}

export const Incense: React.FC<IncenseProps> = ({ progress }) => {
  return (
    <div className="flex flex-col items-center gap-2 md:gap-4">
      <div className="incense-inner-stick relative w-[5px] h-[140px] md:h-[360px] flex flex-col items-center bg-[#E5DDD2]/40 rounded-full">
        {/* The burned part (ash/ghostly path) */}
        <motion.div 
          className="w-full bg-[#CEC5BB]/40 rounded-t-full"
          animate={{ height: `${progress * 100}%` }}
          transition={{ duration: 1, ease: "linear" }}
        />
        
        {/* Glowing tip */}
        <motion.div 
          className="relative z-10 w-4 h-4 -my-2 flex items-center justify-center"
          animate={{ 
            y: 0, 
          }}
          transition={{ duration: 1, ease: "linear" }}
        >
          <div className="absolute inset-0 bg-red-500 rounded-full blur-[3px] animate-pulse" />
          <div className="w-2 h-2 bg-[#FF4D4D] rounded-full relative z-11 shadow-[0_0_8px_rgba(255,77,77,0.8)]" />
          <motion.div 
            className="absolute -top-12 w-6 h-12 bg-white/10 blur-xl rounded-full"
            animate={{ opacity: [0.1, 0.3, 0.1], y: [-2, 2, -2] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </motion.div>

        {/* The unburned stick */}
        <motion.div 
          className="w-full bg-[#4B463E] rounded-b-full flex-1"
        />
      </div>
      {/* Info label removed as it is now in the sidebar block */}
    </div>
  );
};
