import { useState, useEffect, useCallback, useRef } from 'react';

export interface SensorData {
  noiseLevel: number; // dB (75 to 110)
  clickFrequency: number; // clicks per minute
  shakingLevel: 'low' | 'medium' | 'high';
  shakingValue: number; // raw intensity 0 to 1
}

export function useSensors(isActive: boolean) {
  const [data, setData] = useState<SensorData>({
    noiseLevel: 75,
    clickFrequency: 0,
    shakingLevel: 'low',
    shakingValue: 0,
  });

  const [hasPermission, setHasPermission] = useState(false);
  const clickCount = useRef(0);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const microphone = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrame = useRef<number | null>(null);

  // Shaking tracking
  const lastAccel = useRef({ x: 0, y: 0, z: 0 });
  
  const requestPermissions = async () => {
    try {
      // Audio permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyser.current = audioContext.current.createAnalyser();
      microphone.current = audioContext.current.createMediaStreamSource(stream);
      microphone.current.connect(analyser.current);
      analyser.current.fftSize = 256;

      // Motion permission (must be user triggered on iOS)
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        const response = await (DeviceMotionEvent as any).requestPermission();
        if (response !== 'granted') setHasPermission(false);
        else setHasPermission(true);
      } else {
        setHasPermission(true);
      }
      return true;
    } catch (err) {
      console.warn('Sensor Permission access alert (using smart fallbacks):', err);
      // Fallback to simulated data if permission denied or unavailable
      setHasPermission(true); 
      return true;
    }
  };

  const recordClick = useCallback(() => {
    if (!isActive) return;
    clickCount.current += 1;
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    // Simulate/Sample noise and clicks every second
    const interval = setInterval(() => {
      // Noise logic
      let currentNoise = 75;
      if (analyser.current) {
        const bufferLength = analyser.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((src, val) => src + val, 0) / bufferLength;
        // Map average (0-255) to dB scale (75-110)
        currentNoise = 75 + (average / 255) * 35;
      } else {
        // Random drift if no mic
        currentNoise = 75 + Math.random() * 5;
      }

      // Click frequency projection (clicks in last 5s -> per minute)
      // We sample every 1s, but we'll use a sliding window logic for real app
      // For this prototype, we'll just use the current count * relative factor
      setData(prev => {
        const freq = clickCount.current * 12; // Simple math for prototype
        clickCount.current = Math.max(0, clickCount.current - 1); // Decay
        return {
          ...prev,
          noiseLevel: Math.round(currentNoise),
          clickFrequency: Math.round(freq)
        };
      });
    }, 1000);

    const handleMotion = (event: DeviceMotionEvent) => {
      const accel = event.accelerationIncludingGravity;
      if (!accel) return;

      const deltaX = Math.abs((accel.x || 0) - lastAccel.current.x);
      const deltaY = Math.abs((accel.y || 0) - lastAccel.current.y);
      const deltaZ = Math.abs((accel.z || 0) - lastAccel.current.z);

      const combined = deltaX + deltaY + deltaZ;
      let level: 'low' | 'medium' | 'high' = 'low';
      if (combined > 25) level = 'high';
      else if (combined > 10) level = 'medium';

      setData(prev => ({
        ...prev,
        shakingLevel: level,
        shakingValue: Math.min(combined / 40, 1),
      }));

      lastAccel.current = {
        x: accel.x || 0,
        y: accel.y || 0,
        z: accel.z || 0,
      };
    };

    window.addEventListener('devicemotion', handleMotion);

    return () => {
      clearInterval(interval);
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [isActive, hasPermission]);

  const [manualOverrides, setManualOverrides] = useState<Partial<SensorData>>({});

  const updateManualOverride = useCallback((key: keyof SensorData, value: any) => {
    setManualOverrides(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const mergedData = {
    noiseLevel: manualOverrides.noiseLevel !== undefined ? manualOverrides.noiseLevel : data.noiseLevel,
    clickFrequency: manualOverrides.clickFrequency !== undefined ? manualOverrides.clickFrequency : data.clickFrequency,
    shakingLevel: manualOverrides.shakingLevel !== undefined ? manualOverrides.shakingLevel : data.shakingLevel,
    shakingValue: manualOverrides.shakingValue !== undefined ? manualOverrides.shakingValue : (
      manualOverrides.shakingLevel !== undefined
        ? (manualOverrides.shakingLevel === 'high' ? 1.0 : manualOverrides.shakingLevel === 'medium' ? 0.6 : 0.2)
        : data.shakingValue
    ),
  };

  return { data: mergedData, requestPermissions, recordClick, hasPermission, updateManualOverride };
}
