/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'motion/react';
import { HelpCircle, Ticket, X, MapPin, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { useSensors } from './hooks/useSensors';
import inputCenterLogo from './assets/images/input_center_lotus.png';
import inputTopLogo from './assets/images/input_top_logo.png';
import loadingLogo from './assets/images/loading_lotus.png';
import playingHeaderLogo from './assets/images/tutorial_header_logo.png';
import { LandscapePrompt } from './components/ZenGame/LandscapePrompt';
import { Incense } from './components/ZenGame/Incense';
import { StatsBar } from './components/ZenGame/StatsBar';
import { TutorialModal } from './components/ZenGame/TutorialModal';
import { PersonalPond } from './components/ZenGame/PersonalPond';
import { PublicPond } from './components/ZenGame/PublicPond';
import { sounds } from './services/soundService';

import noiseIcon from './assets/images/noise-icon.png';
import clickIcon from './assets/images/click-icon.png';
import shakeIcon from './assets/images/shake-icon.png';
import redPacketIcon from './assets/images/red-packet-icon.png';
import tutorialCouponLogo from './assets/images/regenerated_image_1779512848807.png';

const TOTAL_JOURNEY_TIME = 600; // 10 minutes journey to make the incense burn significantly longer for a highly calming, slow meditative session!

const CARD_EVALUATIONS = {
  zh: {
    noiseTitle: '静谧度（噪音）',
    noiseValueGood: '平稳无扰',
    noiseValueBad: '偶有喧嚣',
    clickTitle: '专注度（点击）',
    clickValueGood: '心无旁骛',
    clickValueBad: '指尖微动',
    shakeTitle: '安定感（摇晃）',
    shakeValueGood: '泰然自若',
    shakeValueBad: '略有起伏',
    redeemSuccess: '500 积分已成功兑换 0.5 元乘车优惠券'
  },
  en: {
    noiseTitle: 'Silence (Noise)',
    noiseValueGood: 'Quiet & Calm',
    noiseValueBad: 'Slightly Noisy',
    clickTitle: 'Focus (Taps)',
    clickValueGood: 'One-Pointed',
    clickValueBad: 'Restless Taps',
    shakeTitle: 'Stability (Shake)',
    shakeValueGood: 'Rock-Steady',
    shakeValueBad: 'Slightly Shaky',
    redeemSuccess: '500 points successfully redeemed for 0.5 RMB rail coupon'
  }
};

type GameState = 'setup' | 'loading' | 'tutorial' | 'playing' | 'finished';
type Language = 'zh' | 'en';

const TRANSLATIONS = {
  zh: {
    title: '宁行 CalmTransit',
    inputTitle: '请输入您的目的地',
    inputPlaceholder: '输入目的地...',
    btnStart: '开始宁行',
    inputNote: '踏入片刻宁静，找寻通勤途中的莲池',
    loading: '正在开启宁静之旅...',
    personal: '个人莲池',
    public: '公共莲池',
    warning: '时时观照，莫失宁静。',
    destination: '目的地',
    merit: '累计功德',
    redeemTitle: '功德兑换',
    redeemNote: '累计功德可抵车费',
    redeemRateTitle: 'Rate / 汇率',
    redeemRate: '500 pt = 0.5 RMB',
    redeemBtn: '兑换乘车红包',
    aboutTitle: '修行纲要',
    about1: '静默：保持车厢静谧，噪音计维持在基准线。若得安静，莲池自清。',
    about2: '持戒：克制点击欲。放下频繁的刷新与滑动。指尖静，则心生明。',
    about3: '守正：躯干端正，减少摆动。手机的起伏即是心的波澜。',
    finished: '修行圆满',
    finishedNote: '山川异域，日月同天。\n此番旅程，功德无量。',
    result: 'Result / 结语',
    resultWord: '自在',
    reset: 'Reset Journey / 再入莲池',
    meritSymbol: '功德',
    swipeHint: '左右滑动切换莲池'
  },
  en: {
    title: '宁行 CalmTransit',
    inputTitle: 'Please enter your destination',
    inputPlaceholder: 'Enter your destination...',
    btnStart: 'Start Calm Transit',
    inputNote: 'Step into a moment of calm and find your lotus pond during transit',
    loading: 'Beginning your calm journey...',
    personal: 'Personal Pond',
    public: 'Public Pond',
    warning: 'Stay mindful, do not lose your peace.',
    destination: 'Destination',
    merit: 'Total Journey Merit',
    redeemTitle: 'Redeem Merit',
    redeemNote: 'Accumulated merit can offset fare',
    redeemRateTitle: 'Rate',
    redeemRate: '500 pt = 0.5 USD',
    redeemBtn: 'Redeem Reward',
    aboutTitle: 'Meditation Guide',
    about1: 'Silence: Keep the cabin quiet. If silence is attained, the pond stays clear.',
    about2: 'Restraint: Curb the urge to click. Still fingers lead to a clear mind.',
    about3: 'Uprightness: Keep your body steady. The phone\'s tilt reflects the heart\'s ripple.',
    finished: 'Journey Complete',
    finishedNote: 'Mountains and rivers are different, but we share the same sky.\nThis journey brings boundless merit.',
    result: 'Result',
    resultWord: 'Serenity',
    reset: 'Enter the Pond Again',
    meritSymbol: 'Merit',
    swipeHint: 'Swipe horizontally to switch ponds'
  }
};

const LotusIcon = () => (
  <img 
    src={playingHeaderLogo} 
    alt="宁行 logo" 
    className="w-[20px] h-[38px] object-contain flex-shrink-0 opacity-90"
    referrerPolicy="no-referrer"
  />
);

export default function App() {
  const [gameState, setGameState] = useState<GameState>('setup');
  const [language, setLanguage] = useState<Language>('zh');
  const t = TRANSLATIONS[language];
  const [destination, setDestination] = useState('');
  const [page, setPage] = useState<'personal' | 'public'>('personal');
  const personalDragX = useMotionValue(0);
  const [showInfo, setShowInfo] = useState(false);
  const [showRedeem, setShowRedeem] = useState(false);
  const [points, setPoints] = useState(1240);
  const [sessionMerit, setSessionMerit] = useState(0);
  const [couponRedeemed, setCouponRedeemed] = useState(false);
  const [journeyProgress, setJourneyProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_JOURNEY_TIME);
  const [warning, setWarning] = useState<string | null>(null);
  const [modalWarning, setModalWarning] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  // Background music states
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [isPondPopupActive, setIsPondPopupActive] = useState(false);
  const [isTransitioningPage, setIsTransitioningPage] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Temporarily dim background music during page switches to implement a beautiful fade out/in effect
  useEffect(() => {
    if (gameState === 'playing') {
      setIsTransitioningPage(true);
      const timer = setTimeout(() => {
        setIsTransitioningPage(false);
      }, 600); // 600ms transition time
      return () => clearTimeout(timer);
    }
  }, [page, gameState]);

  // States for Wooden Fish (Muyu) interactive tapping on the feedback screen
  const [feedbackMode, setFeedbackMode] = useState<'incense' | 'muyu'>('incense');
  const [muyuTaps, setMuyuTaps] = useState<{ id: number; text: string }[]>([]);
  const [isMalletHitting, setIsMalletHitting] = useState(false);
  const nextMuyuTapId = React.useRef(0);

  const { data, requestPermissions, recordClick, updateManualOverride, hasPermission } = useSensors(gameState === 'playing');

  // Use a ref to store sensor data to avoid restarting the timer interval on every data change
  const dataRef = React.useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Synchronize document lang attribute and stylesheet target classes
  useEffect(() => {
    document.documentElement.lang = language;
    if (language === 'zh') {
      document.documentElement.classList.add('lang-zh');
      document.documentElement.classList.remove('lang-en');
    } else {
      document.documentElement.classList.add('lang-en');
      document.documentElement.classList.remove('lang-zh');
    }
  }, [language]);

  // Sound effects on state change
  useEffect(() => {
    if (gameState === 'playing' || gameState === 'loading') {
      sounds.startAmbient();
    } else if (gameState === 'finished') {
       sounds.playChime();
       sounds.stopAmbient();
    } else if (gameState === 'setup') {
       sounds.stopAmbient();
    }
  }, [gameState]);

  // Background music smooth volume fade and autoplay control loop
  useEffect(() => {
    // Lazy-initialize audio element supporting both lowercase and uppercase casing
    if (!audioRef.current) {
      const audio = new Audio();
      
      // Let browser fetch bgm.mp3, fallback to BGM.mp3 if it errors or configure path directly
      // To bypass case sensitivity differences, we set the source to /bgm.mp3 and if loading fails, we fail gracefully.
      // Additionally, we can set up an error handler to try loading /BGM.mp3 if /bgm.mp3 fails!
      audio.src = '/bgm.mp3';
      audio.addEventListener('error', (e) => {
        const target = e.target as HTMLAudioElement;
        if (target && target.src.endsWith('/bgm.mp3')) {
          console.log('bgm.mp3 failed to load, trying BGM.mp3 fallback...');
          target.src = '/BGM.mp3';
          target.load();
        }
      });

      audio.loop = true;
      audio.volume = 0;
      audioRef.current = audio;
    }

    const audio = audioRef.current;

    // Detect target volume based on state
    let targetVolume = 0;
    const isUnderPlayingPond = gameState === 'playing' && (page === 'personal' || page === 'public') && musicEnabled;
    const isHighlyShaky = data.shakingValue >= 0.95 || data.shakingLevel === 'high';

    if (isUnderPlayingPond) {
      if (isTransitioningPage) {
        targetVolume = 0.01;
      } else if (isPondPopupActive || isHighlyShaky) {
        targetVolume = 0.05;
      } else {
        targetVolume = 0.3;
      }
    } else {
      targetVolume = 0;
    }

    let animationFrameId: number;
    let lastTime = performance.now();

    const updateVolumeInterpolation = (now: number) => {
      const dt = (now - lastTime) / 1000; // time delta in seconds
      lastTime = now;

      const currentVol = audio.volume;
      const isFadingIn = currentVol < targetVolume;

      // Snappy and beautiful high-fidelity fade speed curve
      // Fade-in speed (0 to 0.3 in 1.2s): 0.25 per second
      // Fade-out speed (0.3 to 0 in 0.6s): 0.50 per second
      const fadeSpeed = isFadingIn ? 0.25 : 0.50;

      let nextVol = currentVol;
      if (isFadingIn) {
        nextVol = Math.min(targetVolume, currentVol + fadeSpeed * dt);
      } else {
        nextVol = Math.max(targetVolume, currentVol - fadeSpeed * dt);
      }

      // Safeguard boundaries
      nextVol = Math.min(1, Math.max(0, nextVol));
      audio.volume = nextVol;

      // Manage audio play/pause states based on current volume
      if (audio.volume > 0) {
        if (audio.paused) {
          audio.play().catch(err => {
            console.log('BGM Play deferred or requires user gesture:', err);
          });
        }
      } else {
        if (!audio.paused && targetVolume === 0) {
          audio.pause();
        }
      }

      // Continue animating if there's a difference
      if (Math.abs(audio.volume - targetVolume) > 0.001) {
        animationFrameId = requestAnimationFrame(updateVolumeInterpolation);
      } else {
        audio.volume = targetVolume;
        if (targetVolume === 0 && !audio.paused) {
          audio.pause();
        }
      }
    };

    animationFrameId = requestAnimationFrame(updateVolumeInterpolation);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, page, musicEnabled, isPondPopupActive, data.shakingValue, data.shakingLevel, isTransitioningPage]);

  // Warning logic has been removed as per user request to hide quiet hints during play mode.

  // Points increment & Timer
  useEffect(() => {
    if (gameState === 'playing') {
       const timer = setInterval(() => {
          const sensorData = dataRef.current;
          const gain = sensorData.noiseLevel < 85 && sensorData.clickFrequency < 10 && sensorData.shakingLevel === 'low' ? 5 : 1;
          setPoints(p => p + gain);
          setSessionMerit(sm => sm + gain);
          
          setTimeLeft(prev => {
            const next = Math.max(0, prev - 1);
            if (next <= 0) {
              setGameState('finished');
            }
            return next;
          });
       }, 1000);
       return () => clearInterval(timer);
    }
  }, [gameState]);

  // Sync progress with timeLeft
  useEffect(() => {
    setJourneyProgress((TOTAL_JOURNEY_TIME - timeLeft) / TOTAL_JOURNEY_TIME);
  }, [timeLeft]);

  const handleStart = async () => {
    if (!destination) return;
    sounds.playTap();
    
    // Play BGM on user gesture to register browser user action release
    if (audioRef.current && musicEnabled) {
      audioRef.current.play().catch(() => {});
    }

    await requestPermissions();
    setGameState('loading');
    
    // Reset journey metrics
    setTimeLeft(TOTAL_JOURNEY_TIME);
    setSessionMerit(0);
    setCouponRedeemed(false);
    setJourneyProgress(0);
    
    setTimeout(() => {
      setGameState('tutorial');
    }, 3000);
  };

  const handleMuyuClick = () => {
    if (isMalletHitting) return;
    setIsMalletHitting(true);
    sounds.playMuyu();

    // Increment merit and points
    setPoints(p => p + 10);
    setSessionMerit(sm => sm + 10);

    // Dynamic floating text
    const phrases = [
      language === 'zh' ? '功德 +10' : 'Merit +10',
      language === 'zh' ? '静心 +10' : 'Calmness +10',
      language === 'zh' ? '安神 +10' : 'Serenity +10',
      language === 'zh' ? '喜乐 +10' : 'Joy +10',
      language === 'zh' ? '禅定 +10' : 'Zen +10',
      language === 'zh' ? '无忧 +10' : 'Carefree +10',
      language === 'zh' ? '顺遂 +10' : 'Smooth +10'
    ];
    const chosenPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    const tapId = nextMuyuTapId.current++;

    setMuyuTaps(taps => [...taps, { id: tapId, text: chosenPhrase }]);

    // Reset mallet strike state
    setTimeout(() => {
      setIsMalletHitting(false);
    }, 120);

    // Automatically remove floating tap item after animation
    setTimeout(() => {
      setMuyuTaps(taps => taps.filter(t => t.id !== tapId));
    }, 1000);
  };

  return (
    <div className={`h-full w-full relative zen-texture select-none touch-none overflow-hidden ${language === 'zh' ? 'lang-zh' : 'lang-en'}`} onClick={recordClick}>
      {/* Sensor/Mobile Landscape Logic */}
      <LandscapePrompt language={language} />

      {/* Language & BGM Control Overlay */}
      <div className="fixed-controls-container fixed top-8 right-16 z-[1001] flex items-center gap-3">
        <button
          onClick={() => {
            sounds.playTap();
            setMusicEnabled(prev => {
              const next = !prev;
              // If enabling, trigger play instantly to capture user action
              if (next && audioRef.current) {
                audioRef.current.play().catch(() => {});
              }
              return next;
            });
          }}
          className="px-4 py-1.5 bg-zen-linen/40 backdrop-blur-md border border-zen-dark/10 rounded-full text-[10px] tracking-[0.1em] text-zen-dark hover:bg-zen-beige/60 transition-colors font-serif cursor-pointer active:scale-95 shadow-none flex items-center gap-1.5"
        >
          {musicEnabled ? (
            <>
              <Volume2 size={12} className="text-zen-dark opacity-90" />
              <span>{language === 'zh' ? '背景音乐: 开' : 'BGM: On'}</span>
            </>
          ) : (
            <>
              <VolumeX size={12} className="text-zen-dark opacity-50" />
              <span>{language === 'zh' ? '背景音乐: 关' : 'BGM: Off'}</span>
            </>
          )}
        </button>

        <button 
          onClick={() => {
            sounds.playTap();
            setLanguage(l => l === 'zh' ? 'en' : 'zh');
          }}
          className="px-4 py-1.5 bg-zen-linen/40 backdrop-blur-md border border-zen-dark/10 rounded-full text-[10px] tracking-[0.2em] text-zen-dark hover:bg-zen-beige/60 transition-colors uppercase cursor-pointer active:scale-95 shadow-none"
        >
          {language === 'zh' ? 'EN / 中' : '中 / EN'}
        </button>
      </div>

      <main className="game-content h-full w-full bg-zen-linen flex flex-col items-center">
        <AnimatePresence mode="wait">
          {gameState === 'setup' && (
            <motion.div 
               key="setup"
               className="setup-screen fixed inset-0 z-50 flex items-center justify-center bg-zen-linen p-8 overflow-hidden"
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              {/* Background Ripples */}
              <div className="ripple-background">
                <div className="ripple" />
                <div className="ripple" />
                <div className="ripple" />
                <div className="ripple" />
                <div className="ripple" />
                <div className="ripple" />
              </div>

              {/* Logo Top Left */}
              <div className="absolute top-8 left-16 flex items-center gap-3.5 text-zen-dark">
                <img 
                  src={inputTopLogo} 
                  alt="宁行 logo" 
                  className="input-top-logo w-[20px] h-[38px] object-contain flex-shrink-0"
                  loading="eager"
                />
                <div className="flex items-center gap-2.5 logo-font font-serif text-[#4B4339] select-none">
                  <span className="text-[17px] tracking-[0.15em] font-medium leading-none">宁行</span>
                  <span className="text-[15px] font-extralight text-[#A09586]/40 leading-none">|</span>
                  <span className="text-[12px] tracking-[0.2em] font-light md:tracking-[0.25em] text-[#8A8276]/90 leading-none uppercase font-serif">CALMTRANSIT</span>
                </div>
                <HelpCircle size={15} className="opacity-45 cursor-pointer hover:opacity-100 transition-opacity ml-1.5" />
              </div>

              <div className="setup-card bg-zen-linen/60 backdrop-blur-sm w-[460px] p-12 rounded-3xl shadow-[0_20px_50px_-20px_rgba(140,122,102,0.15)] flex flex-col items-center border border-zen-beige relative z-10">
                 {/* Transit Icon - Now Lotus Logo */}
                 <div className="mb-8 p-4 bg-zen-beige/30 rounded-xl">
                    <img 
                      src={inputCenterLogo} 
                      alt="Logo" 
                      className="input-center-logo w-[32px] h-[60px] object-contain"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                    />
                 </div>

                 <h2 className="text-2xl font-serif tracking-[0.16em] mb-10 text-zen-dark font-medium">{t.inputTitle}</h2>
                 
                 <div className="w-full relative mb-10">
                    <input 
                        type="text" 
                        placeholder={t.inputPlaceholder}
                        className="w-full bg-[#E5DDD0]/25 border border-[#BFB4A6]/30 rounded-xl py-4 px-6 text-center text-sm font-serif outline-none transition-all focus:border-zen-brown/40 focus:bg-[#E5DDD0]/40"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                    />
                 </div>

                 <button 
                    onClick={handleStart}
                    className="w-full py-4 bg-transparent border-2 border-zen-brown text-zen-brown text-[11.5px] tracking-[0.35em] font-serif font-semibold rounded-xl hover:bg-zen-brown hover:text-[#FAF8F5] shadow-none transition-all duration-300 active:scale-[0.98] cursor-pointer"
                 >
                   {t.btnStart}
                 </button>

                 <p className="mt-8 text-[11.5px] text-[#8C7A66]/75 font-serif tracking-[0.14em] text-center px-4 leading-[1.8]">
                   {t.inputNote}
                 </p>
              </div>
            </motion.div>
          )}

          {gameState === 'loading' && (
            <motion.div 
               key="loading"
               className="loading-screen fixed inset-0 z-[1000] bg-zen-linen flex flex-col items-center justify-center p-8 text-center"
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <div className="relative flex items-center justify-center mb-16">
                 {/* Breathing Circle Ripples */}
                 <motion.div 
                    className="absolute loading-ripple-circle-1 border border-zen-brown/35 rounded-full"
                    animate={{
                      scale: [1, 1.45, 1],
                      opacity: [0.35, 0.75, 0.35]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                 />
                 <motion.div 
                    className="absolute loading-ripple-circle-2 border border-zen-brown/20 rounded-full"
                    animate={{
                      scale: [0.85, 1.85, 0.85],
                      opacity: [0.55, 0.22, 0.55]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1.5
                    }}
                 />
                 <div className="w-32 h-32 rounded-full border border-zen-brown/30 flex items-center justify-center bg-white/40 shadow-inner">
                     <img 
                       src={loadingLogo} 
                       alt="Logo" 
                       className="loading-logo w-[40px] h-[75px] object-contain"
                       referrerPolicy="no-referrer"
                       crossOrigin="anonymous"
                     />
                  </div>
               </div>
               <motion.p 
                 className="text-lg font-serif tracking-[0.4em] text-zen-dark opacity-60"
                 animate={{ opacity: [0.4, 0.8, 0.4] }}
                 transition={{ duration: 3, repeat: Infinity }}
               >
                 {t.loading}
               </motion.p>
             </motion.div>
           )}

           {gameState === 'tutorial' && (
              <TutorialModal isOpen={true} onClose={() => setGameState('playing')} language={language} />
           )}

           {(gameState === 'playing' || gameState === 'finished') && (
            <motion.div className="h-full w-full flex flex-col max-w-full bg-[#FAF8F5] relative overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              
              {/* Header: Fixed Top Overlay styled to perfectly match mockup */}
              <header className="playing-header flex justify-between items-center z-40 relative w-full pt-8 px-16 mb-2">
                {/* Left: Brand logo, title and help button next to each other */}
                <div className="flex items-center gap-3.5 cursor-pointer select-none" onClick={() => setGameState('setup')}>
                  <LotusIcon />
                  <div className="flex items-center gap-2 font-serif text-[#4B4339] logo-font select-none">
                    <span className="text-[18px] tracking-[0.15em] font-medium leading-none">宁行</span>
                    <span className="text-[15px] font-extralight text-[#A09586]/40 leading-none">|</span>
                    <span className="text-[12px] tracking-[0.2em] font-light md:tracking-[0.25em] text-[#8A8276]/90 leading-none uppercase font-serif">CALMTRANSIT</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      sounds.playTap();
                      setShowInfo(true);
                    }} 
                    className="text-[#8C7A66] opacity-60 hover:opacity-100 transition-opacity p-1 ml-1 hover:bg-zen-beige/30 rounded-full"
                    title={language === 'zh' ? '查看修行说明' : 'View Guidelines'}
                  >
                    <HelpCircle size={16} />
                  </button>
                </div>
                
                {/* Center: Tabs with elegant bullet separator, active marked with simple underline */}
                <div className="header-tabs-container flex items-center gap-5 text-[13px] tracking-[0.25em] font-serif select-none">
                  <span 
                    className={`cursor-pointer transition-all relative py-1 flex items-center ${page === 'personal' ? 'text-[#4B4339] font-medium' : 'text-[#8C7A66]/55 hover:text-[#4B4339]/80'}`} 
                    onClick={() => {
                      if (page !== 'personal') {
                         sounds.playDrop();
                         setPage('personal');
                      }
                    }}
                  >
                    {t.personal}
                    {page === 'personal' && (
                      <motion.div 
                        layoutId="header-tab-underline" 
                        className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#4B4339]"
                      />
                    )}
                  </span>
                  
                  <span className="text-[#8C7A66]/30 text-xs mt-[1px] select-none">•</span>
                  
                  <span 
                    className={`cursor-pointer transition-all relative py-1 flex items-center ${page === 'public' ? 'text-[#4B4339] font-medium' : 'text-[#8C7A66]/55 hover:text-[#4B4339]/80'}`} 
                    onClick={() => {
                      if (page !== 'public') {
                         sounds.playDrop();
                         setPage('public');
                      }
                    }}
                  >
                    {t.public}
                    {page === 'public' && (
                      <motion.div 
                        layoutId="header-tab-underline" 
                        className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#4B4339]"
                      />
                    )}
                  </span>
                </div>

                {/* Right: Balance spacer matching left branding width */}
                <div className="w-[180px] h-1" />
              </header>

              {/* Main Visualization Center */}
              <div className="flex-1 relative mt-2">
                
                {/* Sidebar: Progress Incense & Dynamic station layout on the left, matching mockup exactly */}
                <div className={`playing-sidebar absolute left-2 top-1/2 -translate-y-1/2 z-30 flex flex-col justify-between h-[480px] py-4 select-none transition-opacity duration-500 ${page === 'personal' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                  {/* Taller vertical burning stick */}
                  <div className="pl-4">
                    <Incense progress={journeyProgress} />
                  </div>
                  
                  {/* Station arrival metadata at the bottom left */}
                  <div className="text-left space-y-1 font-serif text-[#4B4339]">
                    <div className="flex items-center gap-1.5 text-sm font-medium tracking-wide">
                        <MapPin size={13} className="text-[#8C7A66] opacity-80" /> 
                        <span>{destination || (language === 'zh' ? '国贸站' : 'Guomao Station')}</span>
                    </div>
                    <div className="text-[11px] tracking-wide font-sans pl-5 text-[#8C7A66]/90 sidebar-est-arrival">
                      {language === 'zh' ? '到达时间' : 'Est. Arrival'}{' '}
                      {new Date(Date.now() + timeLeft * 1000).toLocaleTimeString(language === 'zh' ? 'zh-CN' : 'en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).replace(':', ': ')}
                    </div>
                    <div className="text-[11px] tracking-wide pl-5 text-[#8C7A66]/90 font-serif sidebar-remain-time">
                      {language === 'zh' ? `旅程还剩${Math.ceil(timeLeft / 60)}分钟` : `Remaining time: ${Math.ceil(timeLeft / 60)} mins`}
                    </div>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {page === 'personal' ? (
                     <motion.div 
                       key="personal" className="h-full w-full relative px-16 pb-10"
                       initial={{ x: -100, opacity: 0 }} 
                       animate={{ x: 0, opacity: 1 }} 
                       exit={{ x: -100, opacity: 0 }}
                       drag="x" dragConstraints={{ left: 0, right: 0 }} 
                       style={{ x: personalDragX }}
                       onDragEnd={(_, info) => info.offset.x < -100 && setPage('public')}
                     >
                        <PersonalPond 
                          noise={data.noiseLevel} 
                          clicks={data.clickFrequency} 
                          shakingValue={data.shakingValue} 
                          shakingLevel={data.shakingLevel}
                          isMicActive={hasPermission}
                          onStartMic={requestPermissions}
                          language={language}
                          onPopupActiveChange={setIsPondPopupActive}
                          dragX={personalDragX}
                        />
                        
                        {/* Direct destination arrival switch overlay */}
                        <div className="absolute top-3 right-4 z-40">
                          <motion.button
                            onClick={() => {
                              sounds.playTap();
                              setTimeLeft(0);
                              setJourneyProgress(1);
                              setGameState('finished');
                            }}
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(142, 126, 112, 0.15)' }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-1 px-2.5 py-1 bg-[#FAF6F0]/40 border border-[#8A7969]/25 rounded-full text-[#4B4339]/90 hover:text-[#4B4339] text-[10px] tracking-[0.05em] font-serif shadow-sm backdrop-blur-[4px] transition-all cursor-pointer select-none"
                          >
                            <Sparkles size={11} className="text-[#8A7969]" />
                            <span>{language === 'zh' ? '结束当前宁行' : 'End Transit'}</span>
                          </motion.button>
                        </div>
                     </motion.div>
                  ) : (
                     <motion.div 
                       key="public" className="fixed inset-0 w-screen h-screen z-10"
                       initial={{ x: 100, opacity: 0 }} 
                       animate={{ x: 0, opacity: 1 }} 
                       exit={{ x: 100, opacity: 0 }}
                       drag="x" dragConstraints={{ left: 0, right: 0 }} 
                       onDragEnd={(_, info) => info.offset.x > 100 && setPage('personal')}
                     >
                        <PublicPond noiseAvg={data.noiseLevel > 78 ? 95 : 80} clicksAvg={data.clickFrequency} shakingAvg={data.shakingValue} language={language} />
                     </motion.div>
                  )}
                </AnimatePresence>

              </div>

              {/* Highly-designed absolutely positioned family of cumulative points layout, matching mockup exactly and fully responsive */}
              <div 
                 className={`personal-points-container flex flex-col items-end gap-1 font-serif cursor-pointer group pr-4 transition-all duration-500 ${page === 'personal' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                 onClick={() => setShowRedeem(true)}
              >
                <span className="text-[11px] md:text-[12px] tracking-wide text-[#8C7A66] opacity-90 transition-opacity select-none">{language === 'zh' ? '个人累计积分' : 'Accumulated Points'}</span>
                <div className="text-xl md:text-2xl font-light font-sans tracking-wide tabular-nums text-[#4B4339] flex items-center gap-2">
                   <Ticket size={18} className="text-[#8C7A66] opacity-70 group-hover:opacity-100 transition-opacity" />
                   <span className="font-sans font-medium">{points}</span>
                </div>
              </div>

              {/* Absolutely centered StatsBar container - placed outside footer for robust viewport positioning */}
              <div className={`stats-bar-container transition-opacity duration-500 ${page === 'personal' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <StatsBar 
                   noise={data.noiseLevel} 
                   clicks={data.clickFrequency} 
                   shaking={data.shakingLevel} 
                   language={language}
                   onNoiseChange={(val) => updateManualOverride('noiseLevel', val)}
                   onClicksChange={(val) => updateManualOverride('clickFrequency', val)}
                   onShakingChange={(val) => updateManualOverride('shakingLevel', val)}
                />
              </div>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div 
               key="finished"
               className="finished-screen fixed inset-0 z-[200] bg-zen-linen flex flex-col items-center justify-between py-4 landscape:py-2.5 md:py-6 px-4 landscape:px-6 md:px-8 text-center overflow-y-auto"
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
             >
              {/* Top Row / Header */}
              <div className="w-full max-w-[900px] flex justify-start items-center px-4 select-none">
                <div 
                  className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity" 
                  onClick={() => { 
                    sounds.playTap(); 
                    setGameState('setup'); 
                    setJourneyProgress(0);
                    setTimeLeft(TOTAL_JOURNEY_TIME);
                    setFeedbackMode('incense');
                    setMuyuTaps([]);
                    setCouponRedeemed(false);
                    setWarning(null);
                  }}
                  title={language === 'zh' ? '返回首页' : 'Back to Home'}
                >
                  <img 
                    src={inputTopLogo} 
                    alt="宁行 logo" 
                    className="w-[18px] md:w-[20px] h-[34px] md:h-[38px] object-contain flex-shrink-0"
                    referrerPolicy="no-referrer"
                  ></img>
                  <div className="flex items-center gap-2 font-serif text-[#4B4339] select-none logo-font">
                    <span className="text-[15px] md:text-[17px] tracking-[0.15em] font-medium leading-none">宁行</span>
                    <span className="text-[15px] font-extralight text-[#A09586]/40 leading-none">|</span>
                    <span className="text-[11px] md:text-[12px] tracking-[0.2em] font-light text-[#8A8276]/90 leading-none uppercase font-serif">CALMTRANSIT</span>
                  </div>
                  <HelpCircle 
                    size={14} 
                    className="text-[#8A8276] opacity-75 hover:opacity-100 transition-opacity ml-1 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      sounds.playTap();
                      setShowInfo(true);
                    }}
                  />
                </div>
              </div>

              {/* Main Content Center Column */}
              <div className="flex-1 flex flex-col items-center justify-center max-w-[800px] w-full space-y-1.5 md:space-y-3.5 my-0.5 md:my-2">
                
                {/* Title and descriptions */}
                <div className="space-y-0.5 font-serif">
                  <h2 className="text-lg md:text-[21px] text-[#4B463E] tracking-[0.16em] font-serif font-semibold mb-0.5 leading-tight">
                    {language === 'zh' ? '已到达目的地' : 'Arrived at Destination'}
                  </h2>
                  <p className="text-[#8A8276] text-[10px] md:text-xs tracking-[0.12em] font-serif select-none leading-relaxed opacity-90">
                    {language === 'zh' ? '线香燃尽，莲池归于平静。' : 'Incense burned out, lotus pond returns to stillness.'}
                  </p>
                </div>

                {/* Central Oval / Autoplay Geometric Muyu Visual */}
                <div className="flex flex-col items-center w-full relative select-none">
                  <div 
                    className="muyu-interaction-container relative w-44 md:w-52 h-16 md:h-20 flex items-center justify-center overflow-visible pointer-events-none select-none bg-transparent border-0 border-none shadow-none"
                  >
                    {/* Seamless automatic simplified geometric vector animation matching reference image */}
                    <svg width="180" height="90" viewBox="0 0 180 90" className="w-[144px] md:w-[160px] h-[72px] md:h-[80px] overflow-visible">
                      {/* Quiet bottom shadow */}
                      <ellipse cx="85" cy="80" rx="42" ry="3.5" fill="#3D352B" opacity="0.06" />

                      {/* Main Wood Fish Capsule body - solid color block, no outline */}
                      <motion.rect
                        x="30"
                        y="18"
                        width="110"
                        height="70"
                        rx="35"
                        ry="35"
                        fill="#DFD2C4"
                        style={{ originX: '85px', originY: '53px' }}
                        animate={{ 
                          scaleX: [1, 0.94, 1.03, 1], 
                          scaleY: [1, 1.04, 0.96, 1] 
                        }}
                        transition={{
                          duration: 1.4,
                          repeat: Infinity,
                          ease: "easeInOut",
                          times: [0, 0.15, 0.32, 1]
                        }}
                      />

                      {/* Central slot line - clean solid bar */}
                      <motion.line
                        x1="55"
                        y1="53"
                        x2="115"
                        y2="53"
                        stroke="#A89B8C"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        style={{ originX: '85px', originY: '53px' }}
                        animate={{ 
                          scaleX: [1, 0.94, 1.03, 1], 
                          scaleY: [1, 1.04, 0.96, 1] 
                        }}
                        transition={{
                          duration: 1.4,
                          repeat: Infinity,
                          ease: "easeInOut",
                          times: [0, 0.15, 0.32, 1]
                        }}
                      />

                      {/* Moving Mallet stick and ball - solid color blocks, no line outlines */}
                      <motion.g
                        style={{ originX: '158px', originY: '51px' }}
                        animate={{ rotate: [-25, 0, -3, -25] }}
                        transition={{
                          duration: 1.4,
                          repeat: Infinity,
                          ease: "easeInOut",
                          times: [0, 0.15, 0.28, 1]
                        }}
                      >
                        {/* Stick handle bar - clean solid block */}
                        <line x1="114" y1="29" x2="158" y2="51" stroke="#75695C" strokeWidth="4" strokeLinecap="round" />
                        {/* Round mallet head block - clean solid block */}
                        <circle cx="114" cy="29" r="6.8" fill="#6E6052" />
                      </motion.g>
                    </svg>
                  </div>
                </div>

                {/* Merit / Rewards Pill & Subtext */}
                <div className="flex flex-col items-center space-y-0.5 select-none">
                  <div className="bg-[#F2EAE3] border border-[#BFB4A6]/30 px-5 py-1 rounded-full flex items-center justify-center text-[#4B4339] tracking-[0.15em] font-serif text-[11px] md:text-[13px] font-medium">
                    {language === 'zh' ? '本次旅程功德' : 'Journey Merit'}&nbsp;&nbsp;<span className="font-sans font-bold text-xs md:text-sm text-[#BF4F73]">+{sessionMerit || 150}</span>
                  </div>
                  <div className="text-[9px] md:text-[10px] text-[#8C7A66] tracking-[0.14em] font-serif font-medium">
                    {language === 'zh' ? '累计总积分 ' : 'Accumulated Total Points: '}<span className="font-sans font-bold text-xs">{points}</span>{language === 'zh' ? ' 积分' : ' pt'}
                  </div>
                </div>

                {/* Grid layout of evaluation cards (扁一半!) */}
                <div className="grid grid-cols-1 landscape:grid-cols-3 md:grid-cols-3 gap-1.5 landscape:gap-2 w-full max-w-[760px] px-4 font-serif select-none">
                  {/* Card 1: Noise */}
                  <div className="bg-[#F2EAE3]/70 backdrop-blur-sm border border-[#BFB4A6]/30 rounded-lg py-1.5 px-3 flex flex-col items-center justify-center space-y-0.5 hover:bg-[#F2EAE3]/95 transition-all duration-300 shadow-none">
                    <div className="w-5 h-5 mb-0.5 flex items-center justify-center animate-pulse">
                      <img src={noiseIcon} className="w-5 h-5 object-contain" alt="Noise" />
                    </div>
                    <span className="text-[10px] text-[#8C7A66] font-serif tracking-[0.1em] font-medium">{CARD_EVALUATIONS[language].noiseTitle}</span>
                    <span className="text-[13px] md:text-[14px] text-[#4B4339] font-bold tracking-[0.12em] font-serif leading-none">{data.noiseLevel < 85 ? CARD_EVALUATIONS[language].noiseValueGood : CARD_EVALUATIONS[language].noiseValueBad}</span>
                  </div>

                  {/* Card 2: Click */}
                  <div className="bg-[#F2EAE3]/70 backdrop-blur-sm border border-[#BFB4A6]/30 rounded-lg py-1.5 px-3 flex flex-col items-center justify-center space-y-0.5 hover:bg-[#F2EAE3]/95 transition-all duration-300 shadow-none">
                    <div className="w-5 h-5 mb-0.5 flex items-center justify-center animate-pulse">
                      <img src={clickIcon} className="w-5 h-5 object-contain" alt="Click" />
                    </div>
                    <span className="text-[10px] text-[#8C7A66] font-serif tracking-[0.1em] font-medium">{CARD_EVALUATIONS[language].clickTitle}</span>
                    <span className="text-[13px] md:text-[14px] text-[#4B4339] font-bold tracking-[0.12em] font-serif leading-none">{data.clickFrequency < 12 ? CARD_EVALUATIONS[language].clickValueGood : CARD_EVALUATIONS[language].clickValueBad}</span>
                  </div>

                  {/* Card 3: Shake */}
                  <div className="bg-[#F2EAE3]/70 backdrop-blur-sm border border-[#BFB4A6]/30 rounded-lg py-1.5 px-3 flex flex-col items-center justify-center space-y-0.5 hover:bg-[#F2EAE3]/95 transition-all duration-300 shadow-none">
                    <div className="w-5 h-5 mb-0.5 flex items-center justify-center animate-pulse">
                      <img src={shakeIcon} className="w-5 h-5 object-contain" alt="Shake" />
                    </div>
                    <span className="text-[10px] text-[#8C7A66] font-serif tracking-[0.1em] font-medium">{CARD_EVALUATIONS[language].shakeTitle}</span>
                    <span className="text-[13px] md:text-[14px] text-[#4B4339] font-bold tracking-[0.12em] font-serif leading-none">{data.shakingLevel === 'low' ? CARD_EVALUATIONS[language].shakeValueGood : CARD_EVALUATIONS[language].shakeValueBad}</span>
                  </div>
                </div>

                {/* Redeem Action Row with responsive warning/success status feedback */}
                <div className="flex flex-col items-center space-y-1.5 md:space-y-3 w-full">
                  <motion.button 
                    onClick={() => {
                      sounds.playDrop();
                      if (points >= 500) {
                        setPoints(p => Math.max(0, p - 500));
                        setCouponRedeemed(true);
                        setWarning(null);
                      } else {
                        // Notify points insufficiency
                        sounds.playTap();
                        setWarning(language === 'zh' ? '积分余额不足 500 积分以兑换红包' : 'Insufficient points (needs 500 pt)');
                        setTimeout(() => setWarning(null), 3500);
                      }
                    }}
                    whileTap={{ scale: 0.97 }}
                    className="px-6 md:px-12 py-1.5 md:py-2.5 bg-[#5D5447] text-[#EDE8E2] hover:bg-[#4E463A] transition-all rounded-full flex items-center justify-center gap-2 md:gap-3.5 text-[11px] md:text-[12px] tracking-[0.16em] md:tracking-[0.25em] font-serif shadow-md shadow-[#4B4339]/10 cursor-pointer"
                  >
                    <img 
                      src={tutorialCouponLogo} 
                      className="w-4.5 md:w-5.5 h-3.5 md:h-4 object-contain brightness-0 invert opacity-90 inline-block" 
                      alt="Coupon" 
                    />
                    <span>{language === 'zh' ? '兑换积分优惠' : 'Redeem Points Coupon'}</span>
                  </motion.button>

                  <AnimatePresence mode="wait">
                    {/* Redeemed Pill confirmation */}
                    {couponRedeemed && (
                      <motion.div 
                        key="redeem-success"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="bg-[#E5DFD6] border border-[#CEC4B8]/40 px-6 py-1.5 md:px-10 md:py-2.5 rounded-full text-[#4B4339] text-[11px] md:text-[12px] tracking-[0.1em] font-serif shadow-sm backdrop-blur-sm mt-1.5"
                      >
                        {CARD_EVALUATIONS[language].redeemSuccess}
                      </motion.div>
                    )}

                    {/* Insufficient Points warnings */}
                    {warning && (
                      <motion.div 
                        key="redeem-warning"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="bg-orange-50 border border-orange-200/50 px-6 py-1.5 rounded-full text-orange-900 text-[9.5px] md:text-[10px] tracking-[0.15em] font-serif shadow-sm mt-1"
                      >
                        {warning}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
              </div>

              {/* Home button footer, elegant and low-profile */}
              <div className="w-full pb-2 select-none">
                <button 
                  onClick={() => {
                    sounds.playTap();
                    setGameState('setup');
                    setJourneyProgress(0);
                    setTimeLeft(TOTAL_JOURNEY_TIME);
                    setFeedbackMode('incense');
                    setMuyuTaps([]);
                    setCouponRedeemed(false);
                    setWarning(null);
                  }}
                  className="text-[10px] uppercase tracking-[0.4em] text-zen-brown opacity-40 hover:opacity-100 transition-opacity underline underline-offset-4 font-serif"
                >
                  {language === 'zh' ? '开启全新行禅' : 'Start New Mindfulness'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal: Redeem */}
        <AnimatePresence>
          {showRedeem && (
            <motion.div 
              className="fixed inset-0 z-[500] flex items-center justify-center bg-zen-dark/40 backdrop-blur-sm p-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <div className="bg-[#F2EAE3] w-[380px] max-w-[90vw] max-h-[96vh] overflow-y-auto p-6 md:p-10 rounded-[24px] md:rounded-[28px] relative border border-[#E3D8CE]/60 shadow-2xl transition-all">
                <button onClick={() => {
                  sounds.playTap();
                  setShowRedeem(false);
                  setModalWarning(null);
                  setModalSuccess(null);
                }} className="absolute right-4 top-4 md:right-6 md:top-6 opacity-35 hover:opacity-100 transition-opacity cursor-pointer text-[#4B4339]"><X size={18}/></button>
                <h3 className="text-lg landscape:text-base md:text-2xl font-serif mb-4 landscape:mb-3 md:mb-8 tracking-[0.16em] text-center text-[#4B4339] font-medium">{t.redeemTitle}</h3>
                <div className="bg-[#E5DDD0]/30 p-4 landscape:p-3 md:p-8 rounded-2xl text-center mb-4 landscape:mb-3 md:mb-10 border border-[#BFB4A6]/30">
                   <p className="text-[10px] sm:text-xs text-[#8C7A66]/90 font-serif tracking-[0.12em] leading-relaxed mb-1.5 landscape:mb-1 md:mb-3">{t.redeemNote}</p>
                   <p className="text-2xl landscape:text-xl md:text-4xl font-semibold font-sans tracking-tight text-[#4B4339]">{language === 'zh' ? '¥' : '$'} {(points / 1000).toFixed(1)}</p>
                   <div className="w-full h-[0.5px] bg-[#BFB4A6]/20 my-3 landscape:my-2 md:my-5" />
                   <div className="flex justify-between text-[10px] md:text-[11px] font-sans tracking-[0.02em] text-[#8C7A66]/80">
                      <span className="font-medium">{t.redeemRateTitle}</span>
                      <span className="font-bold">{t.redeemRate}</span>
                   </div>
                </div>
                <button 
                  onClick={() => {
                    if (points >= 500) {
                      setPoints(p => Math.max(0, p - 500));
                      sounds.playDrop();
                      setModalSuccess(language === 'zh' ? '已成功兑换并放入卡包！' : 'Successfully redeemed and saved to your rewards!');
                      setModalWarning(null);
                      setTimeout(() => setModalSuccess(null), 4500);
                    } else {
                      sounds.playTap();
                      setModalWarning(language === 'zh' ? '您的积分余额不足 500 积分以兑换红包' : 'Insufficient points (needs 500 pt)');
                      setModalSuccess(null);
                      setTimeout(() => setModalWarning(null), 3500);
                    }
                  }}
                  className="w-full py-2.5 landscape:py-2 md:py-4 bg-transparent border border-zen-brown text-zen-brown hover:bg-zen-brown hover:text-[#FAF8F5] text-[10px] landscape:text-[9px] md:text-xs font-serif font-semibold tracking-[0.35em] uppercase rounded-xl transition-all duration-300 shadow-none cursor-pointer"
                >
                  {t.redeemBtn}
                </button>

                <AnimatePresence mode="wait">
                  {modalSuccess && (
                    <motion.div 
                      key="modal-success-feedback"
                      initial={{ opacity: 0, y: 12, scale: 0.95 }} 
                      animate={{ opacity: 1, y: 0, scale: 1 }} 
                      exit={{ opacity: 0, y: -12, scale: 0.95 }}
                      className="mt-3 landscape:mt-2 md:mt-5 p-2 landscape:p-1.5 md:p-3.5 bg-emerald-50/80 border border-emerald-100 rounded-xl text-center text-[10px] md:text-xs leading-relaxed text-emerald-800 tracking-wide font-serif flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Sparkles size={12} className="text-emerald-600 animate-pulse" />
                      <span>{modalSuccess}</span>
                    </motion.div>
                  )}

                  {modalWarning && (
                    <motion.div 
                      key="modal-warning-feedback"
                      initial={{ opacity: 0, y: 12, scale: 0.95 }} 
                      animate={{ opacity: 1, y: 0, scale: 1 }} 
                      exit={{ opacity: 0, y: -12, scale: 0.95 }}
                      className="mt-3 landscape:mt-2 md:mt-5 p-2 landscape:p-1.5 md:p-3.5 bg-red-50/85 border border-red-100 rounded-xl text-center text-[10px] md:text-xs leading-relaxed text-red-900 tracking-wide font-serif shadow-sm"
                    >
                      {modalWarning}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal: Info/About */}
        <AnimatePresence>
          {showInfo && (
            <motion.div 
              className="fixed inset-0 z-[500] flex items-center justify-center bg-zen-dark/40 backdrop-blur-sm p-6"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <div className="bg-[#F2EAE3] w-[500px] p-12 rounded-[28px] relative border border-[#E3D8CE]/50 shadow-2xl">
                <button onClick={() => {
                  sounds.playTap();
                  setShowInfo(false);
                }} className="absolute right-8 top-8 opacity-35 hover:opacity-100 transition-opacity cursor-pointer"><X size={22}/></button>
                <h3 className="text-2xl font-serif mb-10 tracking-[0.16em] text-[#4B4339] font-medium border-b border-[#BFB4A6]/25 pb-6 leading-snug">{t.aboutTitle}</h3>
                <div className="space-y-8 text-[13px] text-[#5D5447] leading-[1.8] tracking-[0.12em] font-serif">
                   <div className="flex gap-6 items-start">
                      <span className="text-[#8C7A66] font-semibold font-sans text-sm pt-0.5">01</span>
                      <p className="font-serif leading-[1.8]">{t.about1}</p>
                   </div>
                   <div className="flex gap-6 items-start">
                      <span className="text-[#8C7A66] font-semibold font-sans text-sm pt-0.5">02</span>
                      <p className="font-serif leading-[1.8]">{t.about2}</p>
                   </div>
                   <div className="flex gap-6 items-start">
                      <span className="text-[#8C7A66] font-semibold font-sans text-sm pt-0.5">03</span>
                      <p className="font-serif leading-[1.8]">{t.about3}</p>
                   </div>
                </div>
                <div className="mt-12 text-[10px] text-[#8C7A66]/50 italic text-center font-sans tracking-[0.2em] uppercase">
                  {t.title} · Aesthetic of Stillness
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
