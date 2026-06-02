import React from 'react';
import { motion } from 'motion/react';
import { Smartphone } from 'lucide-react';

interface LandscapePromptProps {
  language?: 'zh' | 'en';
}

export const LandscapePrompt: React.FC<LandscapePromptProps> = ({ language = 'zh' }) => {
  const isZh = language === 'zh';
  return (
    <div className="portrait-overlay fixed inset-0 z-[1000] bg-zen-linen flex flex-col items-center justify-center p-8 text-center">
      <motion.div
        animate={{ rotate: [0, 90, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="mb-8 text-zen-brown"
      >
        <Smartphone size={64} strokeWidth={1} />
      </motion.div>
      <h2 className="text-xl font-serif text-zen-dark tracking-widest mb-4">
        {isZh ? '请旋转手机至横屏' : 'Please rotate your phone to landscape'}
      </h2>
      <p className="text-sm text-zen-accent opacity-60">
        {isZh ? '为了获得最佳的沉浸式禅意体验' : 'For the best immersive meditation experience'}
      </p>
    </div>
  );
};
