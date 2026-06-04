import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useMotionValue, useTransform, AnimatePresence } from 'motion/react';
import { sounds } from '../../services/soundService';

interface PersonalPondProps {
  noise: number;
  clicks: number;
  shakingValue: number;
  shakingLevel: string;
  isMicActive: boolean;
  onStartMic: () => void;
  language?: 'zh' | 'en';
  onPopupActiveChange?: (active: boolean) => void;
  dragX?: any;
}

interface RippleGroupProps {
  speed: number;
  isFading: boolean;
  level: 'low' | 'medium' | 'high';
}

/**
 * RippleGroup animates the 5 layers of colorful dynamic ripples based on shakingLevel:
 * 1. Center Core Glow: #FFD69F
 * 2. Ring 1: #FFC6DF 
 * 3. Ring 2: #FFD3E9 
 * 4. Ring 3: #FFDEDB, opacity 60%
 * 5. Ring 4: #FFECEA, opacity 60%
 * 6. Ring 5: #FFECEA, opacity 60%
 */
const RippleGroup: React.FC<RippleGroupProps> = ({ speed, isFading, level }) => {
  // Map parameters beautifully based on shake level to satisfy "整体变宽一点" and "间距变大"
  const config = {
    high: {
      baseWidth: 230,
      scaleMax: 5.6,
      opacityMultiplier: 1.0,
      delayStep: 0.52, // wider spacing between ripples
      duration: 3.5,
      borderWidth: '2.5px',
      glowSize: 240,
    },
    medium: {
      baseWidth: 195,
      scaleMax: 4.4,
      opacityMultiplier: 0.72,
      delayStep: 0.40, // moderate spacing
      duration: 4.4,
      borderWidth: '2px',
      glowSize: 190,
    },
    low: {
      baseWidth: 160,
      scaleMax: 3.2,
      opacityMultiplier: 0.38, // quiet, slow, subtle
      delayStep: 0.30,
      duration: 5.4,
      borderWidth: '1.5px',
      glowSize: 140,
    }
  }[level] || {
    baseWidth: 160,
    scaleMax: 3.2,
    opacityMultiplier: 0.38,
    delayStep: 0.30,
    duration: 5.4,
    borderWidth: '1.5px',
    glowSize: 140,
  };

  const duration = config.duration / speed;

  const rings = [
    { color: '#FFC6DF', opacity: 0.95 * config.opacityMultiplier, delay: 0.0 * config.delayStep },
    { color: '#FFD3E9', opacity: 0.95 * config.opacityMultiplier, delay: 1.0 * config.delayStep },
    { color: '#FFDEDB', opacity: 0.60 * config.opacityMultiplier, delay: 2.0 * config.delayStep },
    { color: '#FFECEA', opacity: 0.60 * config.opacityMultiplier, delay: 3.0 * config.delayStep },
    { color: '#FFECEA', opacity: 0.60 * config.opacityMultiplier, delay: 4.0 * config.delayStep },
  ];

  return (
    <div 
      className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-1000 ${isFading ? 'opacity-0 scale-90' : 'opacity-100'}`}
      style={{ perspective: "800px", transformStyle: "preserve-3d" }}
    >
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ transform: "rotateX(65deg)", transformStyle: "preserve-3d" }}
      >
        {/* 1. Center Core Glow (#FFD69F, blurred emitter) */}
        <motion.div
          className="absolute rounded-full bg-[#FFD69F] blur-[36px] mix-blend-screen"
          style={{
            width: `${config.glowSize}px`,
            height: `${config.glowSize}px`
          }}
          animate={{
            scale: [0.85, 1.25, 0.85],
            opacity: [0.35 * config.opacityMultiplier, 0.75 * config.opacityMultiplier, 0.35 * config.opacityMultiplier]
          }}
          transition={{
            duration: 2.5 / speed,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* 2. Layered outer water waves spreading with precise delay */}
        {rings.map((ring, idx) => (
          <motion.div
            key={idx}
            className="absolute rounded-full border"
            style={{
              borderColor: ring.color,
              borderWidth: config.borderWidth,
              opacity: ring.opacity,
              width: `${config.baseWidth}px`,
              height: `${config.baseWidth}px`,
              boxShadow: `0 0 18px ${ring.color}25`,
            }}
            initial={{ scale: 0.25, opacity: ring.opacity }}
            animate={{
              scale: config.scaleMax,
              opacity: 0,
            }}
            transition={{
              duration: duration,
              ease: "easeOut",
              delay: ring.delay / speed,
            }}
          />
        ))}
      </div>
    </div>
  );
};

interface InteractiveLotusProps {
  noise: number;
  clicks: number;
  glowOpacityMultiplier?: number;
}

/**
 * InteractiveLotus: Smoothly renders a 6-frame continuous cross-fade animation of the blooming lotus.
 * Mapping Rules:
 * - Noise <= 70 dB: State 6 (completely open, Frame Index 5)
 * - Noise 71 - 78 dB: State 5 (Frame Index 4)
 * - Noise 79 - 86 dB: State 4 (Frame Index 3)
 * - Noise 87 - 94 dB: State 3 (Frame Index 2)
 * - Noise 95 - 102 dB: State 2 (Frame Index 1)
 * - Noise >= 103 dB: State 1 (completely closed bud, Frame Index 0)
 */
export const InteractiveLotus: React.FC<InteractiveLotusProps> = ({ noise, clicks, glowOpacityMultiplier = 1.0 }) => {
  // Glow opacity dims progressively when clicking/finger activity is high to maintain deep concentration
  const glowOpacity = Math.max(0.1, 1 - Math.min(1, clicks / 18)) * glowOpacityMultiplier;

  // Determine continuous index target (ranging smoothly from 5 down to 0)
  const ratio = Math.min(1, Math.max(0, (noise - 70) / 33));
  const targetIndex = 5 - ratio * 5;

  const motionIndex = useMotionValue<number>(targetIndex);
  
  // A spring config for smooth transitions with gentle catch-up
  const springIndex = useSpring(motionIndex, {
    stiffness: 35,
    damping: 18,
  }) as any;

  // Sync motion index whenever noise value changes
  useEffect(() => {
    motionIndex.set(targetIndex);
  }, [targetIndex, motionIndex]);

  // Compute fading opacities for each of the 6 layered images based on distance from the spring pointer
  const opacity0 = useTransform(springIndex, (p: any) => Math.max(0, 1 - Math.abs(Number(p) - 0)));
  const opacity1 = useTransform(springIndex, (p: any) => Math.max(0, 1 - Math.abs(Number(p) - 1)));
  const opacity2 = useTransform(springIndex, (p: any) => Math.max(0, 1 - Math.abs(Number(p) - 2)));
  const opacity3 = useTransform(springIndex, (p: any) => Math.max(0, 1 - Math.abs(Number(p) - 3)));
  const opacity4 = useTransform(springIndex, (p: any) => Math.max(0, 1 - Math.abs(Number(p) - 4)));
  const opacity5 = useTransform(springIndex, (p: any) => Math.max(0, 1 - Math.abs(Number(p) - 5)));

  const transitionConfig = {
    duration: 2.0,
    ease: [0.25, 1, 0.5, 1]
  };

  const openRatio = 1 - ratio; // 1 for fully open, 0 for closed

  return (
    <div className="relative w-[380px] h-[380px] flex items-center justify-center select-none pointer-events-none">
      {/* Soft golden/pink background ambient aura (glowing halo) */}
      <motion.div
        className="absolute w-[320px] h-[320px] rounded-full bg-gradient-to-tr from-[#FA4B98] via-[#FFEFAA] to-[#FFE066] blur-[52px] pointer-events-none z-0"
        animate={{
          opacity: glowOpacity * 0.45 * (0.6 + openRatio * 0.4),
          scale: 0.8 + openRatio * 0.35,
        }}
        transition={transitionConfig}
      />
      
      {/* Concentrated ultra-warm core pink spotlight */}
      <motion.div
        className="absolute w-[220px] h-[220px] rounded-full bg-[#FA709F] blur-[32px] pointer-events-none z-0"
        animate={{
          opacity: glowOpacity * 0.4 * (0.65 + openRatio * 0.35),
          scale: 0.85 + openRatio * 0.25,
        }}
        transition={transitionConfig}
      />

      {/* 6 beautiful original frame layers with cross-fade positioning and referrer policy safeguarding */}
      <div className="absolute w-[350px] h-[350px] flex items-center justify-center">
        {/* Frame index 0 (State 1: Fully closed bud) */}
        <motion.img
          src="https://pic1.imgdb.cn/item/6a1c38c66aa5b6be4f5d8e84.png"
          alt="Lotus State 1 - Closed Bud"
          referrerPolicy="no-referrer"
          className="absolute w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(250,112,159,0.06)]"
          style={{ opacity: opacity0, zIndex: 11 }}
        />

        {/* Frame index 1 (State 2: Slightly open) */}
        <motion.img
          src="https://pic1.imgdb.cn/item/6a1c38a16aa5b6be4f5d8e80.png"
          alt="Lotus State 2 - Opening"
          referrerPolicy="no-referrer"
          className="absolute w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(250,112,159,0.06)]"
          style={{ opacity: opacity1, zIndex: 12 }}
        />

        {/* Frame index 2 (State 3: Semi-open) */}
        <motion.img
          src="https://pic1.imgdb.cn/item/6a1c38a96aa5b6be4f5d8e81.png"
          alt="Lotus State 3 - Semi-open"
          referrerPolicy="no-referrer"
          className="absolute w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(250,112,159,0.06)]"
          style={{ opacity: opacity2, zIndex: 13 }}
        />

        {/* Frame index 3 (State 4: Blooming) */}
        <motion.img
          src="https://pic1.imgdb.cn/item/6a1c38b16aa5b6be4f5d8e82.png"
          alt="Lotus State 4 - Blooming"
          referrerPolicy="no-referrer"
          className="absolute w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(250,112,159,0.06)]"
          style={{ opacity: opacity3, zIndex: 14 }}
        />

        {/* Frame index 4 (State 5: Widely open) */}
        <motion.img
          src="https://pic1.imgdb.cn/item/6a1c38ba6aa5b6be4f5d8e83.png"
          alt="Lotus State 5 - Large"
          referrerPolicy="no-referrer"
          className="absolute w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(250,112,159,0.06)]"
          style={{ opacity: opacity4, zIndex: 15 }}
        />

        {/* Frame index 5 (State 6: Completely open) */}
        <motion.img
          src="https://pic1.imgdb.cn/item/6a1c38cb6aa5b6be4f5d8e85.png"
          alt="Lotus State 6 - Fully Blooming"
          referrerPolicy="no-referrer"
          className="absolute w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(250,112,159,0.06)]"
          style={{ opacity: opacity5, zIndex: 16 }}
        />
      </div>
    </div>
  );
};

export const PersonalPond: React.FC<PersonalPondProps> = ({ 
  noise, 
  clicks, 
  shakingValue, 
  shakingLevel, 
  isMicActive, 
  onStartMic,
  language = 'zh',
  onPopupActiveChange,
  dragX
}) => {
  const activeDragX = dragX || useMotionValue(0);
  const swipeHintOpacity = useTransform(activeDragX, [-100, 0, 100], [0, 0.45, 0]);

  const openRatio = Math.min(1, Math.max(0, 1 - (noise - 70) / 40));

  // clickIntensity ranges from 0 to 100 based on tap speed and frequency
  const [clickIntensity, setClickIntensity] = useState(0);
  const [popupActive, setPopupActive] = useState(false);

  // Trigger parent callback when popup state changes
  useEffect(() => {
    if (onPopupActiveChange) {
      onPopupActiveChange(popupActive);
    }
  }, [popupActive, onPopupActiveChange]);

  // Auto decay of clickIntensity in a high-fidelity rendering loop (smooth per frame decay)
  useEffect(() => {
    let active = true;
    let lastTime = performance.now();
    
    const tick = (now: number) => {
      if (!active) return;
      const delta = now - lastTime;
      lastTime = now;
      
      setClickIntensity(prev => {
        // Decay speed: subtract ~15 units per second
        const decayAmount = (15 / 1000) * delta;
        return Math.max(0, prev - decayAmount);
      });
      
      requestAnimationFrame(tick);
    };
    
    requestAnimationFrame(tick);
    return () => {
      active = false;
    };
  }, []);

  // Monitor clickIntensity to trigger the healing popup
  useEffect(() => {
    if (clickIntensity >= 95 && !popupActive) {
      setPopupActive(true);
    } else if (clickIntensity < 30 && popupActive) {
      setPopupActive(false);
    }
  }, [clickIntensity, popupActive]);

  // Synchronize with external sensor click frequency (like manual sliders or secondary triggers)
  const prevClicksRef = useRef(clicks);
  useEffect(() => {
    if (clicks > prevClicksRef.current) {
      if (!popupActive) {
        setClickIntensity(prev => Math.min(100, prev + 12));
      }
    }
    prevClicksRef.current = clicks;
  }, [clicks]);

  // Float offsets on shakes derived strictly from discrete shake levels
  const offsetX = shakingLevel === 'high' ? 12 : (shakingLevel === 'medium' ? 6 : 0);
  const offsetY = shakingLevel === 'high' ? 12 : (shakingLevel === 'medium' ? 6 : 2);

  // Active water-shaking triggered interactive ripples state
  const [ripples, setRipples] = useState<{ id: number; speed: number; level: 'low' | 'medium' | 'high' }[]>([]);

  // Periodically spawn beautiful 5-layer flat ellipse ripples based on the current shakingLevel
  useEffect(() => {
    if (popupActive) return;

    // Define interval duration based on shakingLevel
    const getIntervalTime = () => {
      if (shakingLevel === 'high') return 1100;    // Spawn rapidly
      if (shakingLevel === 'medium') return 2200;  // Spawn moderately
      return 5600;                                 // 'low' - Spawn extremely slowly as gentle background flow
    };

    const getRippleSpeed = () => {
      if (shakingLevel === 'high') return 1.5;
      if (shakingLevel === 'medium') return 1.0;
      return 0.55; // slow ripple motion for calm state
    };

    const intervalTime = getIntervalTime();

    const triggerPeriodicalRipple = () => {
      const level = (shakingLevel as 'low' | 'medium' | 'high') || 'low';
      const speed = getRippleSpeed();
      const id = Date.now() + Math.random();

      setRipples(prev => [...prev, { id, speed, level }]);

      // Clean up after the outward wave has completely finished expanding
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
      }, 7000);
    };

    // Trigger instantly once on mount/shake level change
    triggerPeriodicalRipple();

    const intervalId = setInterval(triggerPeriodicalRipple, intervalTime);
    return () => clearInterval(intervalId);
  }, [shakingLevel, popupActive]);

  // Handle direct touch/click on the pond (increment clickIntensity with sound, but NO ripples!)
  const handlePondClick = (e: React.MouseEvent) => {
    if (popupActive) return;

    // Play subtle tap sound
    sounds.playTap();

    // Increment click intensity
    setClickIntensity(prev => Math.min(100, prev + 10));
  };

  // Dynamic lotus image element brightness filter (gradually dims to minimum of 30%)
  const flowerBrightness = Math.max(0.3, 1.0 - (clickIntensity / 100) * 0.7);

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-pointer active:scale-[0.998] transition-transform duration-300 bg-[#FAF8F5]"
      onPointerDown={handlePondClick}
    >
      {/* Soft elegant vignette layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-[#F2EAE3]/30 pointer-events-none z-[1]" />

      {/* Horizon-Line Organic Wave Ripples */}
      <div className="absolute bottom-1/4 w-[300%] h-64 opacity-15 pointer-events-none z-10">
        <svg width="100%" height="100%" viewBox="0 0 1000 200" preserveAspectRatio="none">
          <motion.path 
            d="M0 100 Q 250 50 500 100 T 1000 100" 
            stroke="#DBCFC4" strokeWidth="0.5" fill="none"
            animate={{ d: ["M0 100 Q 250 150 500 100 T 1000 100", "M0 100 Q 250 50 500 100 T 1000 100"] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path 
            d="M0 120 Q 250 70 500 120 T 1000 120" 
            stroke="#DBCFC4" strokeWidth="0.3" fill="none" opacity="0.5"
            animate={{ d: ["M0 120 Q 250 170 500 120 T 1000 120", "M0 120 Q 250 70 500 120 T 1000 120"] }}
            transition={{ duration: 6.0, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </svg>
      </div>

      {/* Main interactive Lotus bundle with floating and shaking combinations */}
      <div className="lotus-position-wrapper relative z-20 flex flex-col items-center select-none translate-y-[90px]">
        <motion.div
          className="lotus-dynamic-container flex flex-col items-center"
          animate={{ 
            x: [ -offsetX, offsetX, -offsetX * 0.5, offsetX * 0.5, 0 ],
            y: [ offsetY, -offsetY * 0.5, 0 ],
            scale: 0.92 + openRatio * 0.08
          }}
          transition={{ 
            x: shakingLevel !== 'low' ? { repeat: Infinity, duration: 2.0, ease: "easeInOut" } : { duration: 2.0 },
            y: shakingLevel !== 'low' ? { repeat: Infinity, duration: 2.0, ease: "easeInOut" } : { duration: 2.0, ease: "easeInOut" },
            scale: { duration: 2.0, ease: "easeInOut" }
          }}
        >
        {/* CLICK FREQUENCY TRIGGERED MULTI-LAYER COLORED DYNAMIC RIPPLES */}
        {/* Placed behind the lotus (low z-index inside the bundle) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]" style={{ perspective: "800px", transformStyle: "preserve-3d" }}>
          {/* Constant ambient light breathing core glow (wrapped to keep it as elegant flat ellipse) */}
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ transform: "rotateX(65deg)", transformStyle: "preserve-3d" }}
          >
            <motion.div
              className={`absolute w-[180px] h-[180px] rounded-full bg-[#FFD69F] blur-[32px] transition-opacity duration-1000 ${
                popupActive ? 'opacity-0 scale-75' : 'opacity-[0.25]'
              }`}
              animate={{
                scale: [0.9, 1.15, 0.9],
              }}
              transition={{
                duration: 5.0,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>

          {/* Triggered layered waves, completely fading out when clicks frequency is locked high */}
          <div className="absolute inset-0 flex items-center justify-center">
            {ripples.map((rip) => (
              <RippleGroup key={rip.id} speed={rip.speed} isFading={popupActive} level={rip.level} />
            ))}
          </div>
        </div>

        {/* Continuous Floating Bobbing Effect mimicking water surface physics and brightness filter */}
        <motion.div
          animate={{
            y: [0, -12, 0],
            filter: `brightness(${flowerBrightness})`
          }}
          transition={{
            y: { duration: 4.8, repeat: Infinity, ease: "easeInOut" },
            filter: { duration: 0.15, ease: "easeOut" }
          }}
          className="flex items-center justify-center z-10 transition-all"
        >
          {/* Primary Interactive Flower element */}
          <InteractiveLotus noise={noise} clicks={clicks} glowOpacityMultiplier={1.0 - (clickIntensity / 100) * 0.6} />
        </motion.div>

      </motion.div>

      {/* Swipe hint text vertically aligned directly under the lotus image, only inside PersonalPond */}
      <motion.div 
        style={{ opacity: swipeHintOpacity }}
        className="swipe-hint mt-6 md:mt-8 text-[#8C7A66]/65 font-serif italic text-[11px] sm:text-xs tracking-[0.25em] text-center select-none pointer-events-none transition-all duration-300"
      >
        {language === 'zh' ? '← 左右滑动切换莲池 →' : '← Swipe horizontally to switch ponds →'}
      </motion.div>

      </div>

      {/* Elegant Solid Beige Quiet Alert Overlay Popup (NO transparent blur or glassmorphism) */}
      <AnimatePresence>
        {popupActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              transition: {
                opacity: { duration: 0.8, ease: "easeOut" },
                scale: { duration: 0.8, ease: "easeOut" }
              }
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.94,
              transition: {
                opacity: { duration: 1.2, ease: "easeInOut" },
                scale: { duration: 1.2, ease: "easeInOut" }
              }
            }}
            className="personal-pond-popup absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[150] px-12 py-10 bg-[#F0EAE3]/85 backdrop-blur-md rounded-[32px] shadow-none text-center flex flex-col items-center w-[350px] pointer-events-auto select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-serif text-[#4B4339] tracking-[0.18em] mb-3 font-medium">
              {language === 'zh' ? '清心观照' : 'Inner Peace'}
            </h3>
            <p className="text-[14px] font-serif text-[#8C7A66] leading-relaxed tracking-wide px-2">
              {language === 'zh' 
                ? '外面的世界很嘈杂，不妨先静下心来...' 
                : 'The world is noisy, please take a moment to look inward...'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
