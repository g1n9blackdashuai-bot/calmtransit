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
    <div className="stats-bar-wrapper flex flex-col landscape:flex-row md:flex-row items-center gap-2.5 landscape:gap-3 md:gap-5 lg:gap-8 px-4 landscape:px-5 md:px-7 py-1.5 landscape:py-1.5 md:py-2.5 bg-[#F2EAE3]/95 backdrop-blur-md border border-[#BFB4A6]/35 rounded-[20px] landscape:rounded-[28px] md:rounded-[28px] font-serif mx-auto select-none max-w-full z-40">
      
      {/* 1. 噪音程度 (Mapped 70 to 110) */}
      <div className="flex items-center gap-1.5 md:gap-2.5 relative group h-8.5 landscape:h-8.5 md:h-10 w-32 landscape:w-36 md:w-38 lg:w-42 xl:w-46 pointer-events-auto">
        <div className="w-7 h-7 landscape:w-8.5 landscape:h-8.5 md:w-8.5 md:h-8.5 rounded-full bg-[#E5DDD2]/70 flex items-center justify-center text-[#5A5043] flex-shrink-0 transition-colors group-hover:bg-[#DACFBE]">
          <Volume2 size={13} />
        </div>
         
        <div className="flex-1 flex flex-col justify-center relative min-w-0">
          <div className="flex justify-between items-baseline mb-0.5 text-[10px] md:text-xs text-[#5A5043]">
            <span className="opacity-85 font-serif font-medium tracking-[0.08em] truncate">{isZh ? '噪音' : 'Noise'}</span>
            <span className="font-serif font-semibold tracking-[0.04em] text-[10px] md:text-xs text-[#BF4F73]">{noise} dB</span>
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
      <div className="hidden landscape:block md:block w-[1px] h-5 bg-[#DFD8CE]" />

      {/* 2. 手机摇晃程度 */}
      <div className="flex items-center gap-1.5 md:gap-2.5 relative group h-8.5 landscape:h-8.5 md:h-10 w-32 landscape:w-36 md:w-38 lg:w-42 xl:w-46 pointer-events-auto">
        {/* Rounded Icon Circle */}
        <div className="w-7 h-7 landscape:w-8.5 landscape:h-8.5 md:w-8.5 md:h-8.5 rounded-full bg-[#E5DDD2]/70 flex items-center justify-center text-[#5A5043] flex-shrink-0 transition-colors group-hover:bg-[#DACFBE]">
          <Smartphone size={13} />
        </div>
         
        {/* Info Column containing sliders */}
        <div className="flex-1 flex flex-col justify-center relative min-w-0">
          <div className="flex justify-between items-baseline mb-0.5 text-[10px] md:text-xs text-[#5A5043]">
            <span className="opacity-85 font-serif font-medium tracking-[0.08em] truncate">{isZh ? '摆动' : 'Shake'}</span>
            <span className="font-serif font-semibold tracking-[0.04em] text-[10px] md:text-xs text-[#BF4F73]">{getShakingLabel()}</span>
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
      <div className="hidden landscape:block md:block w-[1px] h-5 bg-[#DFD8CE]" />

      {/* 3. 点击屏幕频率 */}
      <div className="flex items-center gap-1.5 md:gap-2.5 relative group h-8.5 landscape:h-8.5 md:h-10 w-32 landscape:w-36 md:w-38 lg:w-42 xl:w-46 pointer-events-auto">
        <div className="w-7 h-7 landscape:w-8.5 landscape:h-8.5 md:w-8.5 md:h-8.5 rounded-full bg-[#E5DDD2]/70 flex items-center justify-center text-[#5A5043] flex-shrink-0 transition-colors group-hover:bg-[#DACFBE]">
          <Fingerprint size={13} />
        </div>
         
        <div className="flex-1 flex flex-col justify-center relative min-w-0">
          <div className="flex justify-between items-baseline mb-0.5 text-[10px] md:text-xs text-[#5A5043]">
            <span className="opacity-85 font-serif font-medium tracking-[0.08em] truncate">{isZh ? '点击' : 'Taps'}</span>
            <span className="font-serif font-semibold tracking-[0.04em] text-[10px] md:text-xs text-[#BF4F73]">{getClicksLabel()}</span>
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
