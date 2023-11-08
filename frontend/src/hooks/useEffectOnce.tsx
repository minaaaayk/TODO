import { useEffect, useRef } from "react";

export const useEffectOnce = (effect: () => void | (() => void)): void => {
  const isDevelopment = useRef(process.env.NODE_ENV === 'development');
  const hasRun = useRef(false);

  useEffect(() => {
    if (!isDevelopment.current || !hasRun.current) {
      effect();
      hasRun.current = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
