import { useEffect, useState } from 'react';
import { secondsRemaining } from '../utils/booking';
export const useCountdown = (expiresAt, clockOffset = 0) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const timer = setInterval(tick, 500);
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', tick); };
  }, []);
  const timeLeft = secondsRemaining(expiresAt, now + clockOffset);
  return { timeLeft, isExpired: timeLeft <= 0, formattedTime: `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}` };
};
export default useCountdown;
