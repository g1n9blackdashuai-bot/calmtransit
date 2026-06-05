import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin } from "lucide-react";
import { sounds } from "../../services/soundService";
import tutorialHeaderLogo from "../../assets/images/tutorial_header_logo.png";
import tutorialLotus from "../../assets/images/tutorial_lotus.png";
import tutorialCouponLogo from "../../assets/images/tutorial_coupon_logo.png";

import noiseLotus from "../../assets/images/noise-lotus.png";
import clickLotus from "../../assets/images/click-lotus.png";
import shakeLotus from "../../assets/images/shake-lotus.png";

import noiseIcon from "../../assets/images/noise-icon.png";
import clickIcon from "../../assets/images/click-icon.png";
import shakeIcon from "../../assets/images/shake-icon.png";
import redPacketIcon from "../../assets/images/red-packet-icon.png";

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: "zh" | "en";
}

const getSteps = (language: "zh" | "en") => {
  const isZh = language === "zh";
  return [
    {
      title: isZh ? "线香代表旅程进度" : "Incense Tracks Progress",
      desc: isZh
        ? "线香会随着通勤站点推进慢慢燃烧，到站时燃尽。"
        : "The incense stick burns slowly down as your commute advances, burning out fully upon arrival.",
      stepNum: "1 / 4",
    },
    {
      title: isZh ? "状态栏显示当前状态" : "Real-time Status Bar",
      desc: isZh
        ? "噪音、点击次数和手机摇晃程度会影响莲花与水面的变化。在这个数字空间里，您的动作与环境共生，每一次呼吸与点击都将在池塘中留下轻柔的痕迹。"
        : "Ambient noise, screen clicks, and device shaking determine the peace of your lotus pond. Every subtle movement leaves a gentle trace on the water.",
      stepNum: "2 / 4",
      substeps: [
        {
          title: isZh ? "噪音分贝感应" : "Noise Sensing",
          desc: isZh
            ? "实时采集车厢内的环境噪音。分贝越高，水面波纹越剧烈，底部的涟漪也会由慢变快。保持环境安静能让莲花进入更平和的生长状态。"
            : "Real-time sensing of cabin noise. Higher decibels cause heavier waves in your pond. Keep it quiet to help the lotus grow.",
        },
        {
          title: isZh ? "点击屏幕频率" : "Click Frequency",
          desc: isZh
            ? "记录您点击屏幕的频率。过于频繁的交互会干扰池塘的宁静，让水面产生紊乱的碎波。克制交互次数，感受莲池缓慢舒展的律动。"
            : "Tracks your screen click frequency. Over-frequent clicks disturb the tranquility, causing choppy waves. Restrain clicks to feel the calm.",
        },
        {
          title: isZh ? "手机摇晃程度" : "Shaking Level",
          desc: isZh
            ? "感应手机的晃动与倾斜。车辆行驶的颠簸或您的大幅动作都会引起视觉上的起伏。需要身心合一的稳定，才能让莲花保持中心不偏不倚。"
            : "Measures phone shaking and tilting. Commute vibrations or large movements disturb the visuals. Keep steady to center the lotus.",
        },
      ],
    },
    {
      title: isZh ? "保持平静获得积分" : "Earn Merit Points",
      desc: isZh
        ? "旅程中保持安静和稳定，可获得积分并兑换乘车优惠。"
        : "Staying quiet and steady during transit rewards you with merit points to redeem for fare discount coupons.",
      stepNum: "3 / 4",
    },
    {
      title: isZh ? "让莲池保持清明" : "Let the Lotus Pond Bloom",
      desc: isZh
        ? "跟随音乐放松，减少噪音、点击和摇晃，让莲花盛开，水面平静。"
        : "Breathe with the ambient music; minimize noise, clicking, and shaking to let the sacred lotus fully open.",
      stepNum: "4 / 4",
    },
  ];
};

const PreviewContent: React.FC<{
  step: number;
  activeSubTab: number;
  onTabChange: (i: number) => void;
  language?: "zh" | "en";
}> = ({ step, activeSubTab, onTabChange, language = "zh" }) => {
  const [fakeTime, setFakeTime] = React.useState(10);
  const isZh = language === "zh";

  React.useEffect(() => {
    if (step === 0) {
      const interval = setInterval(() => {
        setFakeTime((prev) => (prev > 1 ? prev - 1 : 10)); // Simple loop for the tutorial
      }, 1500); // Faster fake time for demonstration
      return () => clearInterval(interval);
    }
  }, [step]);

  switch (step) {
    case 0:
      return (
        <div className="flex flex-col items-center justify-center h-full relative">
          <div className="tutorial-incense-container relative w-[3px] h-32 sm:h-48 md:h-64 lg:h-72 flex flex-col items-center">
            {/* The burned part (ash) */}
            <motion.div
              className="w-full bg-[#CEC5BB]/40 rounded-t-full origin-top"
              animate={{ height: ["40%", "70%"] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />

            {/* Glowing tip */}
            <div className="relative z-10 w-3 h-3 sm:w-4 sm:h-4 -my-1.5 sm:-my-2 flex items-center justify-center">
              <div className="absolute inset-0 bg-red-500 rounded-full blur-[3px] animate-pulse" />
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#FF4D4D] rounded-full relative z-11 shadow-[0_0_8px_rgba(255,77,77,0.8)]" />
              <motion.div
                className="absolute -top-12 w-6 h-12 bg-white/10 blur-xl rounded-full"
                animate={{ opacity: [0.1, 0.3, 0.1], y: [-2, 2, -2] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </div>

            {/* The unburned stick */}
            <motion.div
              className="w-full bg-[#4B463E] rounded-b-full flex-1 origin-bottom"
              animate={{ height: ["60%", "30%"] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <div className="tutorial-incense-meta mt-4 sm:mt-8 md:mt-12 text-center space-y-1 sm:space-y-3 font-serif">
            <div className="flex items-center justify-center gap-2 text-[10px] sm:text-[11px] tracking-widest text-[#4B463E] uppercase">
              <MapPin size={13} className="opacity-40" />{" "}
              {isZh ? "国贸站" : "Guomao Station"}
            </div>
            <div className="text-[9px] sm:text-[10px] text-[#4B463E] tracking-[0.2em] opacity-60">
              {isZh ? "到达时间" : "Est. Time"} 16:42
            </div>
            <div className="text-[9px] sm:text-[10px] text-[#4B463E] tracking-[0.2em] opacity-60">
              {isZh
                ? `旅程还剩 ${fakeTime} 分钟`
                : `Remaining time: ${fakeTime} mins`}
            </div>
          </div>
        </div>
      );
    case 1:
      const images = [noiseLotus, clickLotus, shakeLotus];
      const statusLabels = isZh
        ? ["噪音程度", "点击频率", "摇晃程度"]
        : ["Noise Level", "Click Frequency", "Shake Level"];

      // Soft light color for font as requested
      const lightTextColor = "text-[#8A8276]";

      return (
        <div className="tutorial-preview-stage-2 flex flex-col sm:flex-row items-center justify-center h-full gap-4 sm:gap-8 md:gap-12">
          <div
            className="flex flex-col items-center justify-center gap-4 sm:gap-6 cursor-pointer group"
            onClick={() => {
              sounds.playTap();
              onTabChange((activeSubTab + 1) % 3);
            }}
          >
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 flex items-center justify-center">
              <div className="absolute inset-0 bg-white/40 blur-3xl rounded-full scale-110" />
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeSubTab}
                  src={images[activeSubTab]}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="tutorial-lotus-image w-full h-full object-contain relative z-10 mx-auto"
                  alt={statusLabels[activeSubTab]}
                />
              </AnimatePresence>
            </div>
            <div
              className={`text-[9px] sm:text-[10px] ${lightTextColor} tracking-[0.3em] sm:tracking-[0.4em] pl-[0.15em] sm:pl-[0.2em] uppercase opacity-60 font-serif text-center`}
            >
              {isZh ? "点击演示" : "Interactive Demo"}
            </div>
          </div>

          <div
            className={`w-full max-w-[200px] sm:max-w-xs space-y-3 sm:space-y-5 md:space-y-6 font-serif ${lightTextColor}`}
          >
            <div
              onClick={() => onTabChange(0)}
              className={`flex flex-col gap-1 sm:gap-2 transition-all duration-500 cursor-pointer ${activeSubTab === 0 ? "opacity-100" : "opacity-40"}`}
            >
              <div className="flex justify-between items-center text-[10px] sm:text-[12px] tracking-[0.2em] sm:tracking-[0.3em]">
                <div className="flex items-center gap-2 sm:gap-4">
                  <img
                    src={noiseIcon}
                    className={`w-[14px] h-[14px] sm:w-[18px] sm:h-[18px] object-contain ${activeSubTab === 0 ? "opacity-100" : "opacity-60"}`}
                    alt="Noise Icon"
                  />
                  <span className="font-medium">
                    {isZh ? "噪音程度" : "Noise Level"}
                  </span>
                </div>
                <div className="font-bold text-xs sm:text-sm tracking-tight text-[#4B463E]">
                  91DB
                </div>
              </div>
              <div className="w-full h-[3px] sm:h-1 bg-[#CEC5BB]/40 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "80%" }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="h-full bg-[#8A8276]"
                />
              </div>
            </div>

            <div
              onClick={() => onTabChange(1)}
              className={`flex flex-col gap-1 sm:gap-2 transition-all duration-500 cursor-pointer ${activeSubTab === 1 ? "opacity-100" : "opacity-40"}`}
            >
              <div className="flex justify-between items-center text-[10px] sm:text-[12px] tracking-[0.2em] sm:tracking-[0.3em]">
                <div className="flex items-center gap-2 sm:gap-4">
                  <img
                    src={clickIcon}
                    className={`w-[14px] h-[14px] sm:w-[18px] sm:h-[18px] object-contain ${activeSubTab === 1 ? "opacity-100" : "opacity-60"}`}
                    alt="Click Icon"
                  />
                  <span className="font-medium">
                    {isZh ? "点击屏幕" : "Click Freq"}
                  </span>
                </div>
                <div className="font-bold text-xs sm:text-sm text-[#4B463E]">
                  {isZh ? "低" : "Low"}
                </div>
              </div>
              <div className="w-full h-[3px] sm:h-1 bg-[#CEC5BB]/40 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "20%" }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="h-full bg-[#8A8276]"
                />
              </div>
            </div>

            <div
              onClick={() => onTabChange(2)}
              className={`flex flex-col gap-1 sm:gap-2 transition-all duration-500 cursor-pointer ${activeSubTab === 2 ? "opacity-100" : "opacity-40"}`}
            >
              <div className="flex justify-between items-center text-[10px] sm:text-[12px] tracking-[0.2em] sm:tracking-[0.3em]">
                <div className="flex items-center gap-2 sm:gap-4">
                  <img
                    src={shakeIcon}
                    className={`w-[14px] h-[14px] sm:w-[18px] sm:h-[18px] object-contain ${activeSubTab === 2 ? "opacity-100" : "opacity-60"}`}
                    alt="Shake Icon"
                  />
                  <span className="font-medium">
                    {isZh ? "手机摇晃" : "Shake Level"}
                  </span>
                </div>
                <div className="font-bold text-xs sm:text-sm text-[#4B463E]">
                  {isZh ? "低" : "Low"}
                </div>
              </div>
              <div className="w-full h-[3px] sm:h-1 bg-[#CEC5BB]/40 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "15%" }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="h-full bg-[#8A8276]"
                />
              </div>
            </div>
          </div>
        </div>
      );
    case 2:
      return (
        <div className="tutorial-preview-red-packet flex flex-col items-center justify-center h-full space-y-4 sm:space-y-8 md:space-y-12 font-serif scale-90 sm:scale-100">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 group">
            <div className="absolute inset-0 bg-white/40 blur-3xl rounded-full scale-110" />
            <motion.img
              src={redPacketIcon}
              className="w-full h-full object-contain relative z-10"
              initial={{ y: 20, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              alt="Red Packet"
            />
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-3 bg-black/5 blur-xl rounded-full scale-x-150" />
          </div>
          <div className="text-center space-y-1 sm:space-y-2">
            <div className="text-[10px] sm:text-xs text-[#4B463E] tracking-[0.3em] sm:tracking-[0.5em] uppercase opacity-60">
              {isZh ? "总积分" : "TOTAL POINTS"}
            </div>
            <div className="text-2xl sm:text-4xl md:text-5xl text-[#4B463E] font-bold tracking-tight">
              1,250
            </div>
          </div>
          <div className="bg-white/40 backdrop-blur-md p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border border-white/50 text-center space-y-2 md:space-y-3 shadow-sm max-w-[220px] sm:max-w-none">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto flex items-center justify-center rounded-full bg-white/60 shadow-sm border border-white/40">
              <img
                src={tutorialCouponLogo}
                className="tutorial-coupon-logo w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 object-contain opacity-80"
                alt="Coupon Icon"
              />
            </div>
            <div className="text-[10px] sm:text-xs text-[#4B463E] tracking-wider sm:tracking-widest">
              {isZh ? "500 积分 = 0.5 元乘车金" : "500 pt = 0.5 USD"}
            </div>
            <div className="text-[9px] sm:text-[10px] text-[#4B463E] tracking-wider sm:tracking-[0.2em] opacity-60">
              {isZh ? "兑换乘车优惠红包" : "Redeem Commute Discount Coupon"}
            </div>
          </div>
        </div>
      );
    case 3:
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="relative">
            <div className="absolute inset-0 bg-pink-200/30 blur-3xl rounded-full scale-110" />
            <img
              src={tutorialLotus}
              className="tutorial-lotus w-32 h-44 sm:w-40 sm:h-56 md:w-48 md:h-64 object-contain relative z-10"
              alt="Large Lotus"
            />
          </div>
        </div>
      );
    default:
      return null;
  }
};

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  onClose,
  language = "zh",
}) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [activeSubTab, setActiveSubTab] = React.useState(0); // For dynamic content in step 2
  const isZh = language === "zh";

  if (!isOpen) return null;

  const steps = getSteps(language === "en" ? "en" : "zh");

  const currentTitle =
    currentStep === 1 && steps[1].substeps
      ? steps[1].substeps[activeSubTab].title
      : steps[currentStep].title;

  const currentDesc =
    currentStep === 1 && steps[1].substeps
      ? steps[1].substeps[activeSubTab].desc
      : steps[currentStep].desc;

  return (
    <AnimatePresence>
      <motion.div
        className="tutorial-modal-overlay fixed inset-0 z-[2000] flex bg-zen-linen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="tutorial-left-col flex-[1.1] md:flex-[1.2] bg-[#E8E2D6] relative overflow-hidden flex items-center justify-center p-4 landscape:p-4 sm:p-8 md:p-12">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full h-full flex items-center justify-center"
          >
            <PreviewContent
              step={currentStep}
              activeSubTab={activeSubTab}
              language={language}
              onTabChange={(i) => {
                setActiveSubTab(i);
              }}
            />
          </motion.div>
        </div>

        <div className="tutorial-right-col flex-1 bg-[#F2EAE3] flex flex-col p-5 landscape:p-6 landscape:md:p-8 sm:p-12 md:p-16 lg:p-20 xl:p-24 justify-between relative overflow-y-auto">
          <div className="tutorial-right-header-and-content space-y-6 landscape:space-y-4 landscape:md:space-y-8 sm:space-y-12 md:space-y-20 lg:space-y-32">
            <div className="flex items-center gap-3">
              <img
                src={tutorialHeaderLogo}
                alt="Logo"
                className="tutorial-header-logo w-4 h-[32px] sm:w-[18px] sm:h-[34px] xl:w-[20px] xl:h-[38px] object-contain flex-shrink-0"
              />
              <div className="flex items-center gap-2 font-serif text-[#4B4339] select-none logo-font">
                <span className="text-[13px] sm:text-[15px] md:text-[17px] tracking-[0.15em] font-medium leading-none">宁行</span>
                <span className="text-[13px] sm:text-[15px] font-extralight text-[#A09586]/40 leading-none">|</span>
                <span className="text-[9.5px] sm:text-[11px] md:text-[12px] tracking-[0.2em] font-light text-[#8A8276]/90 leading-none uppercase font-serif">CALMTRANSIT</span>
              </div>
            </div>

            <motion.div
              key={`${currentStep}-${activeSubTab}`}
              className="space-y-3 landscape:space-y-2.5 sm:space-y-6 md:space-y-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex gap-4 mb-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-[1px] flex-1 transition-all duration-700 ${i === currentStep ? "bg-[#4B463E] z-10 scale-x-125" : "bg-[#CEC5BB]/40"}`}
                  />
                ))}
              </div>
              <div className="text-[9px] sm:text-[10px] text-[#4B463E] tracking-[0.3em] font-serif opacity-60">
                {steps[currentStep].stepNum}
              </div>

              <div className="space-y-2.5 landscape:space-y-2 sm:space-y-4 md:space-y-6">
                <h3 className="text-sm landscape:text-base sm:text-xl md:text-2xl font-serif text-[#4B463E] font-medium tracking-[0.1em] sm:tracking-[0.16em] leading-snug sm:leading-[1.6]">
                  {currentTitle}
                </h3>
                <p className="text-[9.5px] landscape:text-[10px] sm:text-xs text-[#4B463E] leading-normal sm:leading-[1.8] tracking-wider sm:tracking-[0.12em] max-w-xs sm:max-w-sm font-serif opacity-75">
                  {currentDesc}
                </p>
              </div>
            </motion.div>
          </div>

          <div className="tutorial-footer-actions mt-6 landscape:mt-4 md:mt-0 flex justify-between items-center text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] text-[#4B463E] font-serif uppercase">
            <button
              onClick={() => {
                sounds.playTap();
                onClose();
              }}
              className="hover:text-black transition-colors opacity-40 hover:opacity-100 underline underline-offset-4 cursor-pointer"
            >
              {isZh ? "跳过" : "Skip"}
            </button>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={() => {
                    sounds.playTap();
                    setCurrentStep((s) => s - 1);
                  }}
                  className="px-3 sm:px-4 py-1.5 bg-transparent border border-[#4B463E]/40 text-[#4B463E]/80 hover:bg-[#4B463E]/10 transition-all rounded-full flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer active:scale-95 shadow-none font-medium text-[9px] sm:text-[10px] font-serif"
                >
                  <span>←</span> {isZh ? "上一步" : "Back"}
                </button>
              )}

              <button
                onClick={() => {
                  sounds.playTap();
                  if (currentStep < steps.length - 1)
                    setCurrentStep((s) => s + 1);
                  else onClose();
                }}
                className="px-3 sm:px-4 py-1.5 bg-[#4B463E] border border-[#4B463E] text-[#F2EAE3] hover:bg-[#4B463E]/90 transition-all rounded-full flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer active:scale-95 shadow-none font-medium text-[9px] sm:text-[10px] font-serif tracking-wider"
              >
                {currentStep === steps.length - 1
                  ? isZh
                    ? "开启修行"
                    : "Start Transit"
                  : isZh
                    ? "下一步"
                    : "Next"}
                <span>→</span>
              </button>
            </div>
          </div>
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] zen-texture" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
