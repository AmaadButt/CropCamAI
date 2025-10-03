import { useEffect, useMemo, useState } from 'react';
import { Accelerometer } from 'expo-sensors';

const INTERVAL_MS = 100;

export const useAccelerometerLevel = () => {
  const [tiltDeg, setTiltDeg] = useState(0);

  useEffect(() => {
    let mounted = true;
    Accelerometer.setUpdateInterval(INTERVAL_MS);
    const subscription = Accelerometer.addListener(({ x, y }) => {
      if (!mounted) return;
      const pitch = Math.atan2(y, x) * (180 / Math.PI);
      setTiltDeg(prev => (Math.abs(prev - pitch) > 0.2 ? pitch : prev));
    });

    return () => {
      mounted = false;
      subscription && subscription.remove();
    };
  }, []);

  return useMemo(() => ({ tiltDeg }), [tiltDeg]);
};

export default useAccelerometerLevel;
