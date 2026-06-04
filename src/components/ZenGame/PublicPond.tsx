import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Heart, MapPin } from 'lucide-react';

interface PublicPondProps {
  noiseAvg: number;
  clicksAvg: number;
  shakingAvg: number;
  language?: string;
}

interface OtherUserLotus {
  id: string;
  name: string;
  status: string;
  lineInfo: string;
  durationMin: number;
  left: number; // percentage
  top: number;  // percentage
  scale: number;
  zIndex: number;
  stage: number; // 0 to 5 (bloom stage indices)
  brightness: number; // 0.5 to 1.0 (some dimmed on active shakes)
  hasRipples: boolean;
  rippleDuration: number;
  floatDelay: number;
  floatDuration: number;
  expiryTime: number; // timestamp
}

// Simulated active zen meditators in metadata
const NICKNAMES_ZH = [
  'momo', '只想碎觉', '小陈不吃香菜', '今天早睡了吗', '想喝冰美式',
  '摸鱼大师', '阳光开朗大男孩', '芋泥啵啵', '快乐打工人', '爱吃烤红薯',
  '王大锤不加班', '大葱鸭', '风和日丽', '爱喝秋天的第一杯奶茶',
  '路过的咸鱼', '周五什么时候到', '小王要早起', '脆皮大学生'
];

const NICKNAMES_EN = [
  'momo_user', 'sleepy_koala99', 'no_coriander', 'early_sleeper', 'iced_americano_plz',
  'master_of_slacking', 'sunny_boy', 'boba_lover_01', 'happy_worker', 'roasted_potato',
  'hammer_no_overtime', 'leek_duck', 'nice_breeze', 'first_boba_of_autumn',
  'passing_salted_fish', 'is_it_friday_yet', 'early_bird_wang', 'fragile_college_student'
];

const STATUS_QUOTES_ZH = [
  '一念即静，万籁俱寂。',
  '清风拂面，莲意莹然。',
  '身在红尘，心如幽池。',
  '无垢无碍，物我两忘。',
  '虚室生白，心生妙香。',
  '不随喧嚣，且听水流。',
  '一池寂静，安度浮生。',
  '本无尘土，何须拂拭。'
];

const STATUS_QUOTES_EN = [
  'One quiet thought, all sounds stilled.',
  'Wind is clean, and the lotus is clear.',
  'In the noisy world, my heart is a pond.',
  'Free and light, boundaries dissolved.',
  'Pure stillness produces wonderful fragrance.',
  'Do not follow the noise, listen to the water.',
  'A pool of silence, crossing the floating life.',
  'Originally pure, where is the speck of dust?'
];

const STATIONS_ZH = ['呼家楼站', '国贸站', '东单站', '五棵松站', '中关村站', '朝阳门站', '西直门站', '三里屯站'];
const STATIONS_EN = ['Hujialou', 'Guomao', 'Dongdan', 'Wukesong', 'Zhongguancun', 'Chaoyangmen', 'Xizhimen', 'Sanlitun'];

const LOTUS_IMAGES = [
  "https://pic1.imgdb.cn/item/6a1c38c66aa5b6be4f5d8e84.png", // Stage 1 (bud)
  "https://pic1.imgdb.cn/item/6a1c38a16aa5b6be4f5d8e80.png", // Stage 2
  "https://pic1.imgdb.cn/item/6a1c38a96aa5b6be4f5d8e81.png", // Stage 3
  "https://pic1.imgdb.cn/item/6a1c38b16aa5b6be4f5d8e82.png", // Stage 4
  "https://pic1.imgdb.cn/item/6a1c38ba6aa5b6be4f5d8e83.png", // Stage 5
  "https://pic1.imgdb.cn/item/6a1c38cb6aa5b6be4f5d8e85.png", // Stage 6 (fully open)
];

/**
 * PublicLotusEllipticalRipples renders the wide, lateral flat elliptical ripples for other users' lotus flowers.
 * It is compressed vertically via scaleY or rotateX to adhere strictly to the 2.5D oblique perspective.
 */
const PublicLotusEllipticalRipples: React.FC<{ duration: number; scaleFactor: number }> = ({ duration, scaleFactor }) => {
  const rings = [
    { color: '#FFC6DF', opacity: 0.85, delay: 0.0 },
    { color: '#FFD3E9', opacity: 0.85, delay: duration * 0.2 },
    { color: '#FFDEDB', opacity: 0.55, delay: duration * 0.4 },
    { color: '#FFECEA', opacity: 0.55, delay: duration * 0.6 },
    { color: '#FFECEA', opacity: 0.55, delay: duration * 0.8 },
  ];

  return (
    <div 
      className="absolute pointer-events-none origin-center flex items-center justify-center"
      style={{
        width: '180px',
        height: '180px',
        // Rotate along X-axis to compress it into a wide perspective ellipse, scale dynamically
        transform: `rotateX(65deg) scaleY(0.4) scale(${1.8 * scaleFactor})`,
        transformStyle: 'preserve-3d',
        zIndex: 1,
      }}
    >
      {/* Center Core Glow Emitter (#FFD69F, blurred) */}
      <motion.div
        className="absolute w-14 h-14 rounded-full bg-[#FFD69F] blur-[15px] mix-blend-screen"
        animate={{
          scale: [0.85, 1.3, 0.85],
          opacity: [0.35, 0.75, 0.35]
        }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Five beautifully radiating wide-aspect concentric rings */}
      {rings.map((ring, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            borderColor: ring.color,
            borderWidth: '2px',
            opacity: ring.opacity,
            width: '60px',
            height: '60px',
            boxShadow: `0 0 12px ${ring.color}25`,
            transformStyle: 'preserve-3d',
          }}
          initial={{ scale: 0.25, opacity: ring.opacity }}
          animate={{
            scale: 3.8,
            opacity: 0,
          }}
          transition={{
            duration: duration,
            ease: "easeOut",
            repeat: Infinity,
            delay: ring.delay,
          }}
        />
      ))}
    </div>
  );
};

export const PublicPond: React.FC<PublicPondProps> = ({ 
  noiseAvg, 
  clicksAvg, 
  shakingAvg, 
  language = 'zh' 
}) => {
  const isZh = language === 'zh';
  
  // State to hold the dynamic list of users' lotuses
  const [lotuses, setLotuses] = useState<OtherUserLotus[]>([]);
  // Selected companion for popover details
  const [selectedUser, setSelectedUser] = useState<OtherUserLotus | null>(null);

  // Helper to create a single new lotus with random dynamic properties and collision avoidance
  const createLotus = (existing: OtherUserLotus[], initialStagger = false): OtherUserLotus => {
    const minDistance = 14; // spacing threshold in percent to guarantee no overlapping clusters
    let left = 0;
    let top = 0;
    let placed = false;

    // Iterative collision detection & positioning optimization
    for (let attempt = 0; attempt < 100; attempt++) {
      left = 18 + Math.random() * 64; // keep inside pond boundary
      top = 22 + Math.random() * 54;  // perspective region grid
      
      let safe = true;
      for (const companion of existing) {
        const dx = companion.left - left;
        const dy = companion.top - top;
        const horizontalWeights = 1.35; // horizontal distance checked more heavily due to wide perspective
        const dist = Math.sqrt(dx * dx * horizontalWeights + dy * dy);
        if (dist < minDistance) {
          safe = false;
          break;
        }
      }
      
      if (safe) {
        placed = true;
        break;
      }
    }

    // Safe fallback coordinates if bounds are congested
    if (!placed) {
      left = 20 + Math.random() * 60;
      top = 25 + Math.random() * 50;
    }

    // Linear interpolation mapping for stereo depth sizing (Perspective Scale):
    // Farthest (top: 22%) has smaller size ~0.55
    // Nearest (top: 76%) has larger size ~1.05
    const depthRatio = (top - 22) / 54;
    const baseScale = 0.52 + depthRatio * 0.53;
    const scale = Number((baseScale + (Math.random() * 0.06 - 0.03)).toFixed(2));

    // Layer sequence (zIndex): Closer lotuses are placed in higher zIndex stacks
    const zIndex = Math.floor(top * 10) + 10;

    const stage = Math.floor(Math.random() * 6); // 0 to 5 frames
    // Brightness variation: simulating some users in active shaking stress (vibrating/dimmed state)
    const brightness = Math.random() > 0.45 ? 1.0 : Number((0.55 + Math.random() * 0.3).toFixed(2));
    const hasRipples = Math.random() > 0.30; // some users trigger active calming ripples
    // Random animation duration for ripples: 2s to 6s
    const rippleDuration = Number((2.0 + Math.random() * 4.0).toFixed(2));

    const nameIndex = Math.floor(Math.random() * NICKNAMES_ZH.length);
    const name = isZh ? NICKNAMES_ZH[nameIndex] : NICKNAMES_EN[nameIndex % NICKNAMES_EN.length];
    
    const quoteIndex = Math.floor(Math.random() * STATUS_QUOTES_ZH.length);
    const status = isZh ? STATUS_QUOTES_ZH[quoteIndex] : STATUS_QUOTES_EN[quoteIndex % STATUS_QUOTES_EN.length];
    
    const stationIndex = Math.floor(Math.random() * STATIONS_ZH.length);
    const station = isZh ? STATIONS_ZH[stationIndex] : STATIONS_EN[stationIndex % STATIONS_EN.length];
    
    const lineNum = [1, 2, 6, 10, 14][Math.floor(Math.random() * 5)];
    const lineInfo = isZh ? `${lineNum}号线 · ${station}` : `Line ${lineNum} · ${station}`;

    // Random lifetime between 10s and 25s for natural dynamic pond circulation
    const baseLifetime = 10000 + Math.random() * 15000;
    // Stagger initial lotuses so they don't expire all at the exact same moment on mount
    const lifetime = initialStagger ? (3000 + Math.random() * (baseLifetime - 3000)) : baseLifetime;

    return {
      id: `user_lotus_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name,
      status,
      lineInfo,
      durationMin: 5 + Math.floor(Math.random() * 18),
      left,
      top,
      scale,
      zIndex,
      stage,
      brightness,
      hasRipples,
      rippleDuration,
      floatDelay: Number((Math.random() * 2.5).toFixed(2)),
      floatDuration: Number((4.5 + Math.random() * 3).toFixed(2)),
      expiryTime: Date.now() + lifetime,
    };
  };

  // Synchronize dynamic initial list of 5 to 8 users with staggered lifetimes on mount / language switch
  useEffect(() => {
    const list: OtherUserLotus[] = [];
    const count = 5 + Math.floor(Math.random() * 4); // 5 to 8
    for (let i = 0; i < count; i++) {
      list.push(createLotus(list, true));
    }
    setLotuses(list);
  }, [language]);

  // Periodic ecosystem circulation check (runs every 1000ms)
  useEffect(() => {
    const timer = setInterval(() => {
      setLotuses((prev) => {
        const now = Date.now();
        // 1. Keep lotuses that have not expired yet
        let updated = prev.filter((lotus) => lotus.expiryTime > now);

        // 2. Ensure we have at least 5 lotuses in the pool
        while (updated.length < 5) {
          updated.push(createLotus(updated, false));
        }

        // 3. If count is between 5 and 7, make a small 15% chance to spawn a new lotus for organic visual change
        if (updated.length < 8 && Math.random() < 0.15) {
          updated.push(createLotus(updated, false));
        }

        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [language]);

  // Auto-dismiss popup after user idle or if the selected companion lotus expires and fades out
  useEffect(() => {
    if (!selectedUser) return;

    // If the selected lotus is no longer alive in the active set, dismiss the popup smoothly
    const stillAlive = lotuses.some(l => l.id === selectedUser.id);
    if (!stillAlive) {
      setSelectedUser(null);
      return;
    }

    const timer = setTimeout(() => {
      setSelectedUser(null);
    }, 4500);

    return () => clearTimeout(timer);
  }, [selectedUser, lotuses]);

  return (
    <div 
      className="relative w-full h-full overflow-hidden"
      onClick={() => setSelectedUser(null)}
    >
      {/* 1. Immersive Perspective Pond Background Photo (Cover and Centered) */}
      <div 
        className="absolute inset-0 select-none pointer-events-none transition-all duration-1000 bg-no-repeat"
        style={{
          backgroundImage: "url('https://pic1.imgdb.cn/item/6a1d1d95dd21e9856bd43441.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* 2. Soft Zen Vignette / Shading Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-[#4B4339]/10 pointer-events-none z-0" />

      {/* 3. Floating User Lotus Ecosystem */}
      <div className="absolute inset-x-[5%] top-[12%] bottom-[25%] z-10">
        <AnimatePresence>
          {lotuses.map((user) => {
            const isSelected = selectedUser?.id === user.id;

            return (
              <motion.div
                key={user.id}
                className="absolute select-none group flex items-center justify-center"
                style={{
                  left: `${user.left}%`,
                  top: `${user.top}%`,
                  zIndex: user.zIndex + (isSelected ? 50 : 0),
                  transform: 'translate(-50%, -50%)',
                  width: '0px',
                  height: '0px',
                }}
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.3, y: 15, transition: { duration: 1.5, ease: "easeIn" } }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              >
                {/* Optional elliptical water ripples rendered strictly beneath the lotus flower, perfectly centered */}
                {user.hasRipples && (
                  <div className="absolute pointer-events-none flex items-center justify-center w-0 h-0">
                    <PublicLotusEllipticalRipples duration={user.rippleDuration} scaleFactor={user.scale} />
                  </div>
                )}

                {/* Lotus flower bundle trigger with organic floating movement, perfectly centered */}
                <div className="absolute flex items-center justify-center pointer-events-auto w-0 h-0">
                  <motion.div
                    className="absolute cursor-pointer flex flex-col items-center justify-center p-4 origin-center"
                    style={{
                      transformStyle: 'preserve-3d',
                    }}
                    animate={{
                      y: [0, -6, 0],
                    }}
                    transition={{
                      duration: user.floatDuration,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: user.floatDelay,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedUser(user);
                    }}
                  >
                    {/* Visual Glow Spotlight beneath the lotus */}
                    <div 
                      className="absolute w-36 h-36 rounded-full bg-[#FA709F]/10 blur-[18px] pointer-events-none"
                      style={{
                        transform: 'scaleY(0.4)',
                      }}
                    />

                    {/* Sized and styled other users' lotus frame based on linear perspective - scaled up significantly */}
                    <img
                      src={LOTUS_IMAGES[user.stage]}
                      alt={`${user.name}'s Lotus`}
                      referrerPolicy="no-referrer"
                      className="object-contain drop-shadow-[0_4px_12px_rgba(140,110,120,0.15)] max-w-none transition-all duration-300 group-hover:scale-[1.04]"
                      style={{
                        width: `${175 * user.scale}px`,
                        height: `${175 * user.scale}px`,
                        filter: `brightness(${user.brightness})`,
                      }}
                    />

                    {/* Highly subtle hovering breathing nameplate indicator */}
                    <div className="mt-1 px-3 py-1 rounded-lg bg-[#FAF6F0]/85 backdrop-blur-[2px] border border-[#DDD5C7]/50 text-[9px] text-[#8C7A66] tracking-wide font-serif pointer-events-none select-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-0.5 shadow-sm min-w-[120px] text-center">
                      <span className="font-semibold text-xs leading-none text-[#5D5447]">{user.name}</span>
                      <span className="text-[8.5px] opacity-90 leading-none">{isZh ? '某个远方的灵魂：正在静心中...' : 'A distant soul: Finding inner peace...'}</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 4. Elegant User status Popover details (Fade-in / pop over) */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.32, ease: [0.19, 1, 0.22, 1] }}
            className="public-pond-popover absolute bottom-28 left-1/2 -translate-x-1/2 z-[100] w-[340px] pointer-events-none select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Elegant Solid Beige Quiet Popover (Matching overall container design) */}
            <div className="bg-[#F2EAE3]/95 backdrop-blur-md rounded-[28px] border border-[#E3D8CE]/50 px-8 py-6 flex flex-col pointer-events-auto shadow-xl">
              
              {/* Header profile title */}
              <div className="flex items-center justify-between mb-3 border-b border-[#CEC5BA]/35 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#BF4F73] opacity-85" />
                  <span className="text-[14px] font-serif text-[#4B4339] font-medium tracking-[0.15em]">
                    {selectedUser.name} {isZh ? '的莲花' : "'s Lotus"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[0.85rem] text-[#8C7A66] font-sans">
                  <MapPin size={11} className="opacity-80" />
                  <span className="font-sans font-medium tracking-[0.02em]">{selectedUser.lineInfo}</span>
                </div>
              </div>

              {/* Status text quote */}
              <p className="text-[13.5px] font-serif text-[#4B4339] leading-[1.8] tracking-[0.12em] my-1 text-center font-medium">
                「 {selectedUser.status} 」
              </p>

              {/* Footer status information */}
              <div className="flex items-center justify-between text-[10px] text-[#8C7A66] font-serif tracking-[0.15em] pt-2.5 border-t border-[#CEC5BA]/25 mt-1">
                <span className="font-sans font-medium">
                  {isZh ? `已宁游 ` : `Traveling `}
                  <span className="font-sans font-bold">{selectedUser.durationMin}</span>
                  {isZh ? ` 分钟` : ` mins`}
                </span>
                <span className="opacity-80 font-medium text-[9px]">
                  {selectedUser.brightness < 0.8 
                    ? (isZh ? '有微幅跌宕' : 'Wavering') 
                    : (isZh ? '心平气和' : 'Calm State')}
                </span>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Delicate Bottom Decorative Title */}
      <div className="public-pond-footer absolute inset-x-0 bottom-24 flex justify-center pointer-events-none z-10 select-none">
        <span className="text-zen-brown text-[11px] tracking-[0.8em] font-serif opacity-35 italic">
          {isZh ? '十里荷塘 · 众生共修' : 'Quiet Pond · Sharing One Joy'}
        </span>
      </div>

    </div>
  );
};
