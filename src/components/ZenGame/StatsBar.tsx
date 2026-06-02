import React from 'react';
import { motion } from 'motion/react';
import { Smartphone, Fingerprint, Volume2 } from 'lucide-react';

interface StatsBarProps {
  noise: number;
  clicks: number;
  shaking: string;
  onNoiseChange?: (noise: number) => void;
  onClicksChange?: (clicks: number) => void;
  onShakingChange?: (shaking: 'low' | 'medium' | 'high') => void;
  language?: 'zh' | 'en';
}

export const StatsBar: React.FC<StatsBarProps> = ({ 
  noise, 
  clicks, 
  shaking,
  onNoiseChange,
  onClicksChange,
  onShakingChange,
  language = 'zh'
}) => {
  const isZh = language === 'zh';

  // Convert shaking level string to internal slider values (0: low, 1: medium, 2: high)
  const getShakingVal = () => {
    if (shaking === 'high') return 2;
    if (shaking === 'medium') return 1;
    return 0;
  };

  const shakingVal = getShakingVal();

  // Compute responsive percentage representing current slider values for track styling
  const shakingPercent = (shakingVal / 2) * 100;
  const clicksPercent = Math.min((clicks / 40) * 100, 100);
  const noisePercent = Math.min(((noise - 70) / 40) * 100, 100);

  // Get matching display labels representing values exactly like in the picture
  const getShakingLabel = () => {
    if (shaking === 'high') return isZh ? '高' : 'High';
    if (shaking === 'medium') return isZh ? '中' : 'Med';
    return isZh ? '低' : 'Low';
  };

  const getClicksLabel = () => {
    if (clicks === 0) return isZh ? '无' : 'None';
    if (clicks <= 15) return isZh ? '低' : 'Low';
    if (clicks <= 28) return isZh ? '中' : 'Med';
    return isZh ? '高' : 'High';
  };

  const getNoiseLabel = () => {
    if (noise < 80) return isZh ? '低' : 'Low';
    if (noise <= 95) return isZh ? '中' : 'Med';
    return isZh ? '高' : 'High';
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-7 lg:gap-10 px-5 md:px-8 py-3.5 md:py-4.5 bg-[#F2EAE3]/95 backdrop-blur-md border border-[#BFB4A6]/35 rounded-[36px] font-serif mx-auto select-none max-w-full z-40">
      
      {/* 1. 噪音程度 (Mapped 70 to 110) */}
      <div className="flex items-center gap-2 md:gap-4 relative group h-12 w-36 md:w-40 lg:w-44 xl:w-48 pointer-events-auto">
        <div className="w-10 h-10 rounded-full bg-[#E5DDD2]/70 flex items-center justify-center text-[#5A5043] flex-shrink-0 transition-colors group-hover:bg-[#DACFBE]">
          <Volume2 size={16} />
        </div>
         
        <div className="flex-1 flex flex-col justify-center relative min-w-0">
          <div className="flex justify-between items-baseline mb-1.5 text-xs text-[#5A5043]">
            <span className="opacity-85 font-serif font-medium tracking-[0.08em]">{isZh ? '噪音程度' : 'Noise Level'}</span>
            <span className="font-serif font-semibold tracking-[0.04em] text-xs text-[#BF4F73]">{getNoiseLabel()}</span>
          </div>
          
          <div className="w-full h-[2px] bg-[#E2D6C6] rounded-full relative overflow-hidden">
            <motion.div 
              className="absolute left-0 top-0 h-full bg-[#5A5042]"
              animate={{ width: `${noisePercent}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            />
          </div>

          <input 
            type="range"
            min={70}
            max={110}
            value={noise}
            onChange={(e) => onNoiseChange?.(Number(e.target.value))}
            className="absolute inset-x-0 -top-2 -bottom-2 w-full opacity-0 cursor-ew-resize z-20"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="hidden md:block w-[1px] h-6 bg-[#DFD8CE]" />

      {/* 2. 手机摇晃程度 */}
      <div className="flex items-center gap-2 md:gap-4 relative group h-12 w-36 md:w-40 lg:w-44 xl:w-48 pointer-events-auto">
        {/* Rounded Icon Circle */}
        <div className="w-10 h-10 rounded-full bg-[#E5DDD2]/70 flex items-center justify-center text-[#5A5043] flex-shrink-0 transition-colors group-hover:bg-[#DACFBE]">
          <Smartphone size={16} />
        </div>
        
        {/* Info Column containing sliders */}
        <div className="flex-1 flex flex-col justify-center relative min-w-0">
          <div className="flex justify-between items-baseline mb-1.5 text-xs text-[#5A5043]">
            <span className="opacity-85 font-serif font-medium tracking-[0.08em]">{isZh ? '手机摇晃程度' : 'Phone Shake'}</span>
            <span className="font-serif font-semibold tracking-[0.04em] text-xs text-[#BF4F73]">{getShakingLabel()}</span>
          </div>
          
          {/* Custom Visual Range Track Line */}
          <div className="w-full h-[2px] bg-[#E2D6C6] rounded-full relative overflow-hidden">
            <motion.div 
              className="absolute left-0 top-0 h-full bg-[#5A5042]"
              animate={{ width: `${shakingPercent}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            />
          </div>

          {/* Overlying completely transparent range slider to capture mouse drags */}
          <input 
            type="range"
            min={0}
            max={2}
            value={shakingVal}
            onChange={(e) => {
              const val = Number(e.target.value);
              const mapped: 'low' | 'medium' | 'high' = val === 2 ? 'high' : (val === 1 ? 'medium' : 'low');
              onShakingChange?.(mapped);
            }}
            className="absolute inset-x-0 -top-2 -bottom-2 w-full opacity-0 cursor-ew-resize z-20"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="hidden md:block w-[1px] h-6 bg-[#DFD8CE]" />

      {/* 3. 点击屏幕频率 */}
      <div className="flex items-center gap-2 md:gap-4 relative group h-12 w-36 md:w-40 lg:w-44 xl:w-48 pointer-events-auto">
        <div className="w-10 h-10 rounded-full bg-[#E5DDD2]/70 flex items-center justify-center text-[#5A5043] flex-shrink-0 transition-colors group-hover:bg-[#DACFBE]">
          <Fingerprint size={16} />
        </div>
        
        <div className="flex-1 flex flex-col justify-center relative min-w-0">
          <div className="flex justify-between items-baseline mb-1.5 text-xs text-[#5A5043]">
            <span className="opacity-85 font-serif font-medium tracking-[0.08em]">{isZh ? '点击屏幕频率' : 'Click Frequency'}</span>
            <span className="font-serif font-semibold tracking-[0.04em] text-xs text-[#BF4F73]">{getClicksLabel()}</span>
          </div>
          
          <div className="w-full h-[2px] bg-[#E2D6C6] rounded-full relative overflow-hidden">
            <motion.div 
              className="absolute left-0 top-0 h-full bg-[#5A5042]"
              animate={{ width: `${clicksPercent}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            />
          </div>

          <input 
            type="range"
            min={0}
            max={40}
            value={clicks}
            onChange={(e) => onClicksChange?.(Number(e.target.value))}
            className="absolute inset-x-0 -top-2 -bottom-2 w-full opacity-0 cursor-ew-resize z-20"
          />
        </div>
      </div>

    </div>
  );
};
