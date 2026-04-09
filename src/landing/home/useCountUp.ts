import { useState, useEffect } from 'react';

export function useCountUp(target: number, duration: number, inView: boolean): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) {
      setCount(0);
      return;
    }

    let current = 0;
    const step = duration > 0 ? target / (duration / 16) : target;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return count;
}
